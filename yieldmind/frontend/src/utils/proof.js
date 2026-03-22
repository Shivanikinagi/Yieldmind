export const BASESCAN_BASE_URL = 'https://sepolia.basescan.org';

export function getAddressUrl(address) {
  return `${BASESCAN_BASE_URL}/address/${address}`;
}

export function getTxUrl(txHash) {
  return `${BASESCAN_BASE_URL}/tx/${txHash}`;
}

export function getCidUrl(cid) {
  if (cid?.startsWith('local-proof-')) {
    return null;
  }

  return `https://w3s.link/ipfs/${cid}`;
}

export function shortHash(value, start = 6, end = 4) {
  if (!value) {
    return '';
  }

  return `${value.slice(0, start)}...${value.slice(-end)}`;
}
