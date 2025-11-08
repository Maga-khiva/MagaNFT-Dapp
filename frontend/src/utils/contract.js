import { ethers } from "ethers";

// Load from .env (Vite uses import.meta.env)
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// ✅ Full ABI — includes all required methods from MagaNFT.sol
export const abi = [
  "function mintNFT(address recipient, string tokenURI) public returns (uint256)",
  "function totalMinted() public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function getAllTokens() public view returns (string[] memory)"
];

/**
 * Returns a connected contract instance
 * @param {ethers.BrowserProvider | ethers.Signer} providerOrSigner
 */
export async function getContract(providerOrSigner) {
  if (!CONTRACT_ADDRESS) {
    throw new Error("❌ VITE_CONTRACT_ADDRESS not set in .env");
  }

  // For Ethers v6, we don't need 'await' for new Contract
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, providerOrSigner);
  return contract;
}

/**
 * Connects to MetaMask and returns provider + signer + contract
 */
export async function connectToContract() {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask to interact with the DApp.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = await getContract(signer);

  return { provider, signer, contract };
}
