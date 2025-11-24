// src/components/MintSection.jsx
import { useState } from "react";
import { useWeb3 } from "../hooks/useWeb3";
import axios from "axios";
export default function MintSection() {
  const { account, readWriteContract, isConnected } = useWeb3();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mintedNFT, setMintedNFT] = useState(null);
  const [loading, setLoading] = useState(false);
  // File change handler
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };
 
  // 1. Upload image via your backend (which pins to Pinata)
  async function uploadToBackend() {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    setStatus("⏳ Uploading image to IPFS via backend...");
    try {
      // NOTE: This endpoint failed with a 404 previously.
      // Ensure your server is running and the route is correct.
      const res = await axios.post("https://maganft-dapp.onrender.com/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.link; // Returns image URI
    } catch (err) {
      console.error("❌ Backend image upload failed:", err);
      // The error message now uses the failed URL for better debugging
      setStatus(`❌ Image upload failed! Check server endpoint: https://maganft-dapp.onrender.com/upload`);
      return null;
    }
  }
  // 2. Upload metadata to Pinata directly (using keys)
  async function uploadMetadata(imageURI) {
      setStatus("📤 Creating and uploading metadata JSON to IPFS...");
      const metadata = {
          name: title.trim(),
          description: description.trim() || "Minted via MagaNFT DApp",
          image: imageURI,
      };
      try {
          const metadataRes = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", metadata, {
              headers: {
                  pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
                  pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
              },
          });
         
          // Pinata returns the hash, we construct the gateway URL
          const tokenURI = `https://gateway.pinata.cloud/ipfs/${metadataRes.data.IpfsHash}`;
          return tokenURI;
      } catch (err) {
          console.error("❌ Pinata metadata upload failed:", err);
          setStatus("❌ Metadata upload failed! Check VITE_PINATA_API_KEY/VITE_PINATA_SECRET_KEY.");
          return null;
      }
  }
  // 3. Mint NFT function
  async function mintNFT() {
    try {
      if (!isConnected || !readWriteContract) {
        setStatus("Connect your wallet first.");
        return;
      }
      if (!file || !title.trim()) {
        setStatus("Please fill out the title and select an image file.");
        return;
      }
      setLoading(true);
      setMintedNFT(null);
      setStatus("");
     
      // Step 1: Upload Image
      const imageURI = await uploadToBackend();
      if (!imageURI) {
        setLoading(false);
        return;
      }
      // Step 2: Upload Metadata
      const tokenURI = await uploadMetadata(imageURI);
      if (!tokenURI) {
        setLoading(false);
        return;
      }
     
      // Step 3: Contract Interaction
      setStatus("🚀 Minting your NFT...");
      const tx = await readWriteContract.mintNFT(account, tokenURI);
      await tx.wait(); // ← Clean: no unused variable

      setStatus("✅ NFT successfully minted!");
         
      setMintedNFT({ title, image: imageURI, metadata: tokenURI });
         
      // Clear inputs after successful mint
      setFile(null);
      setTitle("");
      setDescription("");
      setPreviewUrl(null);
    } catch (err) {
      console.error("Minting Error:", err);
      if (err.code === 4001) {
          setStatus("Transaction rejected by user in MetaMask.");
      } else {
          // Provide a generic, helpful error message
          setStatus(`❌ Mint failed. Check console for details.`);
      }
    } finally {
      setLoading(false);
    }
  }
  const isMintingDisabled = loading || !isConnected;
  const statusClass = status.startsWith('✅') 
    ? 'bg-green-700/40 text-green-300' 
    : status.startsWith('❌') 
    ? 'bg-red-700/40 text-red-300' 
    : 'bg-[#23272f] text-gray-300';
  return (
    <div className="p-8 bg-[#1c212a] rounded-2xl shadow-xl max-w-lg mx-auto mt-12">
      <h2 className="text-3xl font-extrabold text-white mb-6 border-b border-gray-700 pb-3">Mint New NFT</h2>
     
      <div className="space-y-4">
        {/* Title Input */}
        <input
          type="text"
          placeholder="NFT Title (e.g., Maga Cap #1)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[#23272f] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          disabled={loading}
        />
        {/* Description Input */}
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          className="w-full px-4 py-3 rounded-lg bg-[#23272f] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
          disabled={loading}
        />
        {/* File Upload */}
        <label className="block text-sm font-medium text-gray-300">
          Upload Image (JPG/PNG)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:transition cursor-pointer"
          disabled={loading}
          key={previewUrl} // Force re-render input to clear selected file
        />
      </div>
      {/* Preview */}
      {previewUrl && (
        <div className="mt-4 p-4 bg-[#23272f] rounded-xl border border-gray-700/50">
          <h3 className="text-sm font-semibold mb-3 text-white">Image Preview:</h3>
          <img
            src={previewUrl}
            alt="NFT Preview"
            className="rounded-lg w-full h-48 object-contain mb-2 border border-gray-600"
          />
        </div>
      )}
      {/* Mint Button */}
      <button
        onClick={mintNFT}
        disabled={isMintingDisabled}
        className={`w-full mt-6 px-6 py-3 rounded-lg text-lg font-bold transition duration-200 shadow-xl
          ${isMintingDisabled
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 text-white shadow-green-500/50"
          }`}
      >
        {loading ? (
            <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Minting...
            </span>
        ) : isConnected ? "Mint NFT Now" : "Connect Wallet to Mint"}
      </button>
      {/* Status/Error/Success Message */}
      {status && (
        <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${statusClass}`}>
          {status}
        </div>
      )}
      {/* Minted NFT Display */}
      {mintedNFT && (
        <div className="mt-4 p-4 bg-gray-700 rounded-xl border border-green-600 shadow-inner">
          <h3 className="text-sm font-semibold mb-3 text-green-400 flex items-center gap-2">
            🎉 NFT Minted Successfully!
          </h3>
          <img
            src={mintedNFT.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")} // Display image using Pinata gateway
            alt={mintedNFT.title}
            className="rounded-lg w-full h-48 object-contain mb-3 border border-gray-600"
          />
          <div className="space-y-1">
            <p className="text-gray-200 font-medium">{mintedNFT.title}</p>
            <a href={mintedNFT.image} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline block">
              🖼 View Image URI
            </a>
            <a href={mintedNFT.metadata} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline block">
              📄 View Metadata URI
            </a>
          </div>
        </div>
      )}
    </div>
  );
}