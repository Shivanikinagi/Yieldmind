// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IYieldTreasury {
    function availableYield() external view returns (uint256);
    function payForInference(uint256, string calldata, uint256) external;
    function inferenceCount() external view returns (uint256);
}

contract YieldMindAgent {
    address public owner;
    IYieldTreasury public treasury;
    
    uint256 public taskCount;
    uint256 public constant INFERENCE_COST = 0.0001 ether; // ~$0.25
    
    struct Task {
        uint256 id;
        string prompt;
        string result; // stored off-chain on Filecoin, CID here
        uint256 yieldUsed;
        uint256 timestamp;
        bool completed;
    }
    
    mapping(uint256 => Task) public tasks;
    
    event TaskRequested(uint256 indexed id, string prompt);
    event TaskCompleted(uint256 indexed id, string filecoinCID, uint256 yieldUsed);
    event InsufficientYield(uint256 available, uint256 required);
    
    constructor(address _treasury) {
        owner = msg.sender;
        treasury = IYieldTreasury(_treasury);
    }
    
    // Off-chain agent calls this to start a task
    function requestTask(string calldata prompt) external returns (uint256) {
        uint256 yield = treasury.availableYield();
        
        if (yield < INFERENCE_COST) {
            emit InsufficientYield(yield, INFERENCE_COST);
            revert("Not enough yield -- agent must wait for more staking rewards");
        }
        
        taskCount++;
        tasks[taskCount] = Task({
            id: taskCount,
            prompt: prompt,
            result: "",
            yieldUsed: INFERENCE_COST,
            timestamp: block.timestamp,
            completed: false
        });
        
        // Pay for inference from yield
        treasury.payForInference(
            INFERENCE_COST,
            "venice-ai",
            taskCount
        );
        
        emit TaskRequested(taskCount, prompt);
        return taskCount;
    }
    
    // Agent writes result back (with Filecoin CID)
    function completeTask(uint256 taskId, string calldata filecoinCID) external {
        require(msg.sender == owner || msg.sender == address(this), "Unauthorized");
        Task storage t = tasks[taskId];
        require(!t.completed, "Already done");
        t.result = filecoinCID;
        t.completed = true;
        emit TaskCompleted(taskId, filecoinCID, t.yieldUsed);
    }
}
