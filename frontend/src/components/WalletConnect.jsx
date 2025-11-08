import { useState, useEffect } from "react";

export default function WalletConnect({ onConnect }) {
  const [account, setAccount] = useState(null);

  async function connectWallet() {
    if (!window.ethereum) return alert("Metamask kerak!");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
    onConnect(accounts[0]);
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => setAccount(accounts[0]));
    }
  }, []);

  return (
    <div className="p-4 bg-gray-900 text-white rounded-2xl shadow-lg flex justify-between items-center">
      <h1 className="text-xl font-bold">🔥 MagaNFT DApp</h1>
      {account ? (
        <span className="bg-green-700 px-3 py-1 rounded-lg text-sm">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-semibold"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
