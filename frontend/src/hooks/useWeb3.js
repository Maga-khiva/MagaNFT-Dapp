// src/hooks/useWeb3.js
import { useContext } from "react";
import Web3Context from "./Web3Context.js";

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) throw new Error("useWeb3 must be inside Web3Provider");

  const {
    account,
    isConnected,
    loading,
    error,
    readOnlyContract,
    readWriteContract,
    connectWallet,
  } = context;

  return {
    account,
    isConnected,
    isLoading: loading,
    error,
    contract: readOnlyContract,
    readOnlyContract,
    readWriteContract,
    connectWallet,
  };
}