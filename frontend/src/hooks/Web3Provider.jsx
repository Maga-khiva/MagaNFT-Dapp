// src/hooks/Web3Provider.jsx
import { useEffect, useState, useCallback } from "react";
import Web3Context from "./Web3Context";
import { ethers } from "ethers";

// === FULL CORRECT ABI FOR YOUR MagaNFT CONTRACT ===
const FULL_CONTRACT_ABI = [
  {"inputs": [{"internalType": "address", "name": "initialOwner", "type": "address"}], "stateMutability": "nonpayable", "type": "constructor"},
  {"inputs": [{"internalType": "address", "name": "sender", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"internalType": "address", "name": "owner", "type": "address"}], "name": "ERC721IncorrectOwner", "type": "error"},
  {"inputs": [{"internalType": "address", "name": "operator", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "ERC721InsufficientApproval", "type": "error"},
  {"inputs": [{"internalType": "address", "name": "approver", "type": "address"}], "name": "ERC721InvalidApprover", "type": "error"},
  {"inputs": [{"internalType": "address", "name": "operator", "type": "address"}], "name": "ERC721InvalidOperator", "type": "error"},
  {"inputs": [{"internalType": "address", "name": "owner", "type": "address"}], "name": "ERC721InvalidOwner", "type": "error"},
  {"inputs": [{"internalType": "address", "name": "receiver", "type": "address"}], "name": "ERC721InvalidReceiver", "type": "error"},
  {"inputs": [{"internalType": "address", "name": "sender", "type": "address"}], "name": "ERC721InvalidSender", "type": "error"},
  {"inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "ERC721NonexistentToken", "type": "error"},
  {"inputs": [{"internalType": "address", "name": "owner", "type": "address"}], "name": "OwnableInvalidOwner", "type": "error"},
  {"inputs": [{"internalType": "address", "name": "account", "type": "address"}], "name": "OwnableUnauthorizedAccount", "type": "error"},
  {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {"indexed": true, "internalType": "address", "name": "approved", "type": "address"}, {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "Approval", "type": "event"},
  {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {"indexed": true, "internalType": "address", "name": "operator", "type": "address"}, {"indexed": false, "internalType": "bool", "name": "approved", "type": "bool"}], "name": "ApprovalForAll", "type": "event"},
  {"anonymous": false, "inputs": [{"indexed": false, "internalType": "uint256", "name": "_fromTokenId", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "_toTokenId", "type": "uint256"}], "name": "BatchMetadataUpdate", "type": "event"},
  {"anonymous": false, "inputs": [{"indexed": false, "internalType": "uint256", "name": "_tokenId", "type": "uint256"}], "name": "MetadataUpdate", "type": "event"},
  {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "to", "type": "address"}, {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"indexed": false, "internalType": "string", "name": "uri", "type": "string"}], "name": "Minted", "type": "event"},
  {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"}, {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}], "name": "OwnershipTransferred", "type": "event"},
  {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "from", "type": "address"}, {"indexed": true, "internalType": "address", "name": "to", "type": "address"}, {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "Transfer", "type": "event"},
  {"inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "owner", "type": "address"}], "name": "balanceOf", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "getAllTokens", "outputs": [{"components": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"internalType": "string", "name": "tokenURI", "type": "string"}], "internalType": "struct MagaNFT.NFTData[]", "name": "", "type": "tuple[]"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "getApproved", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "address", "name": "operator", "type": "address"}], "name": "isApprovedForAll", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "recipient", "type": "address"}, {"internalType": "string", "name": "tokenURI", "type": "string"}], "name": "mintNFT", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [], "name": "name", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "owner", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "ownerOf", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "from", "type": "address"}, {"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "from", "type": "address"}, {"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"internalType": "bytes", "name": "data", "type": "bytes"}], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "operator", "type": "address"}, {"internalType": "bool", "name": "approved", "type": "bool"}], "name": "setApprovalForAll", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [{"internalType": "bytes4", "name": "interfaceId", "type": "bytes4"}], "name": "supportsInterface", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "symbol", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "tokenURI", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "totalMinted", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "from", "type": "address"}, {"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function"}
];

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const TARGET_CHAIN_ID = Number(import.meta.env.VITE_TARGET_CHAIN_ID);
const READ_ONLY_RPC_URL = import.meta.env.VITE_READ_ONLY_RPC_URL;

export default function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readOnlyContract, setReadOnlyContract] = useState(null);
  const [readWriteContract, setReadWriteContract] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false); 
  
  const isConnected = !!account;

  // 1. Connection logic (triggers MetaMask prompt)
  const connectWallet = useCallback(async () => {
    if (isConnected || isConnecting) {
        console.warn("Connection already established or attempt pending.");
        return;
    }
    
    setIsConnecting(true); // Set connecting flag
    setLoading(true);
    setError(null);

    if (!window.ethereum) {
      setError("MetaMask not found. Please install MetaMask.");
      setIsConnecting(false);
      setLoading(false);
      return;
    }

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      await browserProvider.send("eth_requestAccounts", []); // Triggers prompt
      
      const signerInstance = await browserProvider.getSigner();
      const address = await signerInstance.getAddress();
      const network = await browserProvider.getNetwork();

      if (Number(network.chainId) !== TARGET_CHAIN_ID) {
        setError(`Wrong network! Please switch to the correct Chain ID: ${TARGET_CHAIN_ID}`);
        // Keep isConnecting true until user responds to switch prompt
        return; 
      }

      setProvider(browserProvider);
      setSigner(signerInstance);
      setAccount(address.toLowerCase());

      const rwContract = new ethers.Contract(CONTRACT_ADDRESS, FULL_CONTRACT_ABI, signerInstance);
      setReadWriteContract(rwContract);
      setError(null);

    } catch (err) {
      if (err.code === -32002 || err.message?.includes('already pending')) {
         console.warn("Wallet connection request already pending. Please respond to the prompt.");
         setError("Wallet connection request already pending. Please respond to the MetaMask prompt.");
      } else if (err.code === 4001) {
         setError("Connection rejected by user.");
      } else {
         setError("Connection failed. Check console for details.");
      }
      console.error("Wallet connect error:", err);
    } finally {
      setIsConnecting(false); 
      setLoading(false);
    }
  }, [ isConnected, isConnecting]); 

  // 2. Initialization: Sets up the read-only provider and checks for existing connections.
  useEffect(() => {
    if (!CONTRACT_ADDRESS || !READ_ONLY_RPC_URL) {
      setError("Missing contract configuration in .env");
      setLoading(false);
      return;
    }

    const initProvider = async () => {
      try {
        // Use JsonRpcProvider for views
        const readProvider = new ethers.JsonRpcProvider(READ_ONLY_RPC_URL);
        
        const contract = new ethers.Contract(CONTRACT_ADDRESS, FULL_CONTRACT_ABI, readProvider); 

        setReadOnlyContract(contract);
        setProvider(readProvider); // Set RPC provider as default/fallback
        
        // Check for existing connection without triggering a prompt
        if (window.ethereum) {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await browserProvider.listAccounts(); 

          if (accounts.length > 0) {
            const address = accounts[0].address.toLowerCase();
            const signerInstance = await browserProvider.getSigner(address);
            
            const network = await browserProvider.getNetwork();

            if (Number(network.chainId) === TARGET_CHAIN_ID) {
                // If connected, overwrite provider with the browserProvider
                const rwContract = new ethers.Contract(CONTRACT_ADDRESS, FULL_CONTRACT_ABI, signerInstance);
                setReadWriteContract(rwContract);
                setSigner(signerInstance);
                setAccount(address);
                setProvider(browserProvider);
                setError(null);
            } else {
                setError(`Wrong network! Switch to Chain ID: ${TARGET_CHAIN_ID}`);
                setProvider(browserProvider); 
            }
          } 
        } 
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to initialize Web3 connections.");
      } finally {
        setLoading(false);
      }
    };

    initProvider();

  }, []); 
  
  // 3. Auto-reconnect/cleanup on account/network change
  useEffect(() => {
    if (!window.ethereum) return;

    // Use a full page reload to safely reset Ethers state on change
    const handleAccountsChanged = () => window.location.reload();
    const handleChainChanged = () => window.location.reload();

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []); 

  const contextValue = {
    provider,
    signer,
    account,
    isConnected,
    // Expose a combined loading state for UI
    loading: loading || isConnecting, 
    error,
    readOnlyContract,
    readWriteContract,
    connectWallet,
  };

  return <Web3Context.Provider value={contextValue}>{children}</Web3Context.Provider>;
}