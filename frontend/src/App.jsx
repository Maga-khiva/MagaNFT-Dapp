import { useState, useEffect } from "react";
import MintSection from "./components/MintSection";
import GallerySection from "./components/GallerySection";

export default function App() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  async function connectWallet() {
    try {
      if (!window.ethereum) return alert("Please install MetaMask!");
      setLoading(true);
      const [address] = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(address);
    } catch (err) {
      console.error("Wallet connect error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (acc) => setAccount(acc[0]);
      const handleChainChanged = () => window.location.reload();

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // Auto-check on load
      window.ethereum.request({ method: "eth_accounts" }).then((acc) => {
        if (acc.length > 0) setAccount(acc[0]);
      });

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-sans">
      <header className="flex justify-between items-center p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold tracking-wide">🎨 MagaNFT DApp</h1>
        <button
          onClick={connectWallet}
          disabled={loading}
          className={`px-4 py-2 rounded-lg transition ${
            account
              ? "bg-green-600"
              : loading
              ? "bg-gray-600 cursor-wait"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {account
            ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
            : loading
            ? "Connecting..."
            : "Connect Wallet"}
        </button>
      </header>

      <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <MintSection account={account} />
        <GallerySection account={account}/>
      </main>
    </div>
  );
}
