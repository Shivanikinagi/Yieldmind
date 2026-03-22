// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IWstETH {
    function wrap(uint256 stETHAmount) external returns (uint256);
    function unwrap(uint256 wstETHAmount) external returns (uint256);
    function getStETHByWstETH(uint256 wstETHAmount) external view returns (uint256);
}

interface ILido {
    function submit(address referral) external payable returns (uint256);
}

contract YieldTreasury {
    address public owner;
    address public agent;
    address public wstETH;
    address public lido;
    
    uint256 public principalWstETH;  // NEVER touched
    uint256 public depositedStETH;   // original deposit value
    uint256 public yieldSpent;       // total the agent has spent
    uint256 public inferenceCount;   // how many LLM calls funded
    uint256 public lastDepositTime;
    
    event Deposited(address indexed user, uint256 ethAmount, uint256 wstETHReceived);
    event InferencePaid(uint256 amount, string provider, uint256 inferenceId);
    event YieldWithdrawn(address indexed to, uint256 amount);
    
    modifier onlyAgent() {
        require(msg.sender == agent, "Only agent");
        _;
    }
    
    constructor(address _agent, address _wstETH, address _lido) {
        owner = msg.sender;
        agent = _agent;
        wstETH = _wstETH;
        lido = _lido;
        lastDepositTime = block.timestamp;
    }
    
    // Step 1 of the  : user deposits ETH
    function deposit() external payable {
        require(msg.value >= 0.001 ether, "Min 0.001 ETH");
        
        // For testnet  : simplified principal tracking
        // On mainnet: submit to Lido → wrap to wstETH
        depositedStETH += msg.value;
        principalWstETH += msg.value;
        lastDepositTime = block.timestamp;
        
        emit Deposited(msg.sender, msg.value, msg.value);
    }
    
    // Returns only yield above principal (wstETH appreciates over time)
    function availableYield() public view returns (uint256) {
        if (principalWstETH == 0) return 0;
        
        // On mainnet: wstETH currentValue > depositedStETH as staking rewards accrue
        // On testnet  : simulate yield accrual at 4% APY
        uint256 elapsed = block.timestamp - lastDepositTime;
        uint256 simulatedYield = (principalWstETH * 4 * elapsed) / (365 days * 100);
        
        if (simulatedYield <= yieldSpent) return 0;
        return simulatedYield - yieldSpent;
    }
    
    // Agent calls this to pay for LLM inference
    // This is the core of "agent funds itself from yield"
    function payForInference(
        uint256 amount,
        string calldata provider,
        uint256 inferenceId
    ) external onlyAgent {
        require(amount <= availableYield(), "Insufficient yield");
        require(amount <= 0.005 ether, "Exceeds per-call cap");
        
        yieldSpent += amount;
        inferenceCount++;
        
        // In production: transfer to Venice/Zyfai payment address
        // For  : emit event as proof
        emit InferencePaid(amount, provider, inferenceId);
    }
    
    function setAgent(address _agent) external {
        require(msg.sender == owner, "Only owner");
        agent = _agent;
    }
    
    // Owner can retrieve principal (never the agent)
    function withdrawPrincipal() external {
        require(msg.sender == owner, "Only owner");
        // unwrap wstETH → stETH → ETH
        payable(owner).transfer(address(this).balance);
    }
    
    receive() external payable {}
}
