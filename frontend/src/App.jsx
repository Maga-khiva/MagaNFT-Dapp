// src/App.jsx (Hypothetical Main App File)
import Navbar from "./components/Navbar";
import MintSection from "./components/MintSection";
import GallerySection from "./components/GallerySection";

export default function App() {
  return (
    <div className="min-h-screen bg-charcoal-900 pt-32 pb-16 px-4 md:px-8 relative">
      <Navbar />

      {/* Header Info Banner */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold maga-gradient mb-4 leading-snug">
          MAKE ART GREAT AGAIN
        </h1>
        <p className="text-lg text-gray-300">
          Limited Edition • Sepolia Testnet • Trump Energy Only
        </p>
      </div>

      {/* Main Two-Column Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Mint Section (1/3 width) */}
        <div className="lg:col-span-1 bg-charcoal-900 p-6 rounded-xl shadow-2xl border border-gray-800 min-h-[500px]">
          <MintSection />
        </div>

        {/* Right Column: Gallery Section (2/3 width) */}
        <div className="lg:col-span-2">
          <GallerySection />
        </div>
      </div>
    </div>
  );
}