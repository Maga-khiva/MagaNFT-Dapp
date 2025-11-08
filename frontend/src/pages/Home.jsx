import MintSection from "../components/MintSection";

export default function Home() {
  return (
    <div className="text-center mt-12">
      <h1 className="text-5xl font-bold mb-4">Welcome to MagaNFT Collection</h1>
      <p className="text-gray-400 mb-10">Mint your unique NFT on blockchain today.</p>
      <MintSection />
    </div>
  );
}
