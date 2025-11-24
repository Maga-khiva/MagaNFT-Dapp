// src/components/Navbar.jsx
import ConnectWalletButton from "./ConnectWalletButton";

export default function Navbar() {
  return (
    // 🎨 DESIGN IMPROVEMENT: Fixed position, centered
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div 
        // 🎨 DESIGN IMPROVEMENT: Cleaner 'glass' effect using a subtle dark background and backdrop-blur
        className="
          bg-[#1c212a]/90 
          px-6 py-3 rounded-full 
          border border-white/10 
          shadow-2xl shadow-black/70 
          flex items-center gap-6 
          backdrop-blur-xl
        "
      >
        <div className="flex items-center gap-3">
          {/* 🎨 DESIGN IMPROVEMENT: Logo size and solid accent color for branding */}
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg">
            M
          </div>
          {/* 🎨 DESIGN IMPROVEMENT: Stronger brand name using accent color */}
          <span className="text-2xl font-extrabold text-blue-400 tracking-wider">MagaNFT</span>
        </div>
        <ConnectWalletButton />
      </div>
    </nav>
  );
}