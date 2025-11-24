// src/components/ConnectWalletButton.jsx
import { useWeb3 } from "../hooks/useWeb3";

// Helper function to format address (e.g., 0x1234...abcd)
const formatAddress = (address) => {
  if (!address) return '';
  const start = address.substring(0, 6);
  const end = address.substring(address.length - 4);
  return `${start}...${end}`;
};

export default function ConnectWalletButton() {
  // Destructure all necessary state and functions
  const { connectWallet, loading, error, isConnected, account } = useWeb3();

  // Determine button state and styling
  // 🎨 DESIGN IMPROVEMENT: Added flex for centering and full-rounded corners
  let buttonContent;
  let buttonClass = "px-4 py-2 rounded-full font-semibold transition duration-200 shadow-md flex items-center justify-center";

  if (loading) {
    buttonContent = (
        <>
            <span role="img" aria-label="Clock" className="text-xl mr-2 animate-spin">⏳</span>
            Connecting...
        </>
    );
    buttonClass += " bg-yellow-600 text-white cursor-not-allowed";
  } else if (isConnected && account) {
    // 🎨 DESIGN IMPROVEMENT: Added Wallet Icon and cleaner styling
    buttonContent = (
        <>
            <span role="img" aria-label="Wallet" className="text-xl mr-2">👛</span>
            {formatAddress(account)}
        </>
    );
    // Use a cleaner, connected state style with border accent
    buttonClass += " bg-[#1c212a] text-blue-300 hover:bg-[#23272f] border border-blue-600/50 hover:border-blue-600";
  } else {
    // 🎨 DESIGN IMPROVEMENT: Used accent color (blue) for primary action
    buttonContent = "Connect Wallet";
    buttonClass += " bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/50";
  }

  // Display error message below the button
  const errorMessage = error ? (
    <p className="text-red-400 text-xs mt-1 absolute bottom-[-20px] left-0 right-0 text-center bg-black/50 p-0.5 rounded z-10">
      {error}
    </p>
  ) : null;

  return (
    <div className="relative inline-block">
      <button
        // Only call connectWallet if not connected
        onClick={isConnected ? undefined : connectWallet} 
        disabled={loading}
        className={buttonClass}
      >
        {buttonContent}
      </button>
      {errorMessage}
    </div>
  );
}