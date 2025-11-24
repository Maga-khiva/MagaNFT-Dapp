// src/hooks/Web3Context.js
import { createContext } from "react";

const Web3Context = createContext({
  account: null,
  isConnected: false,
  loading: true,
  error: null,
  readOnlyContract: null,
  readWriteContract: null,
  connectWallet: () => {},
});

export default Web3Context;