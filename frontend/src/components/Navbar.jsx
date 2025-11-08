import { useState, useEffect } from "react";

export default function Navbar() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
      });
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
  };

  return (
    <nav className="flex justify-between items-center py-4 px-8 bg-black/50 backdrop-blur-md shadow-lg">
      <h1 className="text-2xl font-bold">MagaNFT</h1>
      {account ? (
        <span className="bg-gray-800 px-4 py-2 rounded-xl text-sm">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
      ) : (
        <button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-semibold">
          Connect Wallet
        </button>
      )}
    </nav>
  );
}
