import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import contractData from "../abi.json";

const abi = contractData.abi;
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export default function MintSection({ account }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mintedNFT, setMintedNFT] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📤 Upload image to Pinata
  async function uploadToPinata() {
    if (!file) return null;
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
          pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
        },
      });
      return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
    } catch (err) {
      console.error("❌ Pinata upload failed:", err);
      setStatus("❌ Upload failed! Check your Pinata keys.");
      return null;
    }
  }

  // 🪙 Mint NFT
  async function mintNFT() {
    try {
      if (!account) {
        alert("Please connect your wallet first.");
        return;
      }
      if (!file) {
        alert("Please select an image file to mint!");
        return;
      }
      if (!title.trim()) {
        alert("Please enter a title for your NFT.");
        return;
      }

      setLoading(true);
      setStatus("⏳ Uploading image to IPFS...");
      const imageURI = await uploadToPinata();
      if (!imageURI) {
        setLoading(false);
        return;
      }

      // 🧾 Upload metadata
      setStatus("📤 Uploading metadata...");
      const metadata = {
        name: title.trim(),
        description: description.trim() || "Minted via MagaNFT DApp",
        image: imageURI,
      };

      const metadataRes = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
          headers: {
            pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
            pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
          },
        }
      );

      const tokenURI = `https://gateway.pinata.cloud/ipfs/${metadataRes.data.IpfsHash}`;
      console.log("🆕 Token URI:", tokenURI);

      // 🔗 Contract interaction
      setStatus("🚀 Minting your NFT...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

      const tx = await contract.mintNFT(account, tokenURI);
      await tx.wait();

      // ✅ Success
      setStatus("✅ NFT successfully minted!");
      setMintedNFT({ title, image: imageURI, metadata: tokenURI });

      // 🧹 Reset form after successful mint
      setFile(null);
      setTitle("");
      setDescription("");
      setPreviewUrl(null);
    } catch (err) {
      console.error("❌ Mint failed:", err);
      setStatus("❌ Mint failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) {
      const preview = URL.createObjectURL(selected);
      setPreviewUrl(preview);
    } else {
      setPreviewUrl(null);
    }
  }

  return (
    <div className="p-6 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">Mint New NFT</h2>

      {/* Image Preview / Shimmer */}
      <div className="relative rounded-xl overflow-hidden mb-4 h-72 w-full bg-gray-900 border border-gray-700 shadow-inner">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-contain transition-all duration-500 hover:shadow-[0_0_15px_rgba(0,255,150,0.4)] hover:-translate-y-1"
          />
        ) : (
          <div className="w-full h-full shimmer rounded-xl"></div>
        )}
      </div>

      {/* File Input */}
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={handleFileChange}
        disabled={loading}
        className="mb-4 block w-full bg-gray-700 rounded-lg p-2 text-sm text-gray-200 cursor-pointer disabled:opacity-50"
      />

      {/* Title Input */}
      <input
        type="text"
        placeholder="NFT Title (e.g. Sunrise #1)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
        className="mb-3 block w-full bg-gray-700 rounded-lg p-2 text-sm text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50"
      />

      {/* Description Input */}
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        disabled={loading}
        className="mb-4 block w-full bg-gray-700 rounded-lg p-2 text-sm text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50"
      />

      {/* Mint Button */}
      <button
        onClick={mintNFT}
        disabled={loading}
        className={`w-full py-2 rounded-lg font-semibold text-gray-50 transition-all ${
          loading
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 hover:shadow-[0_0_12px_rgba(0,255,150,0.4)]"
        }`}
      >
        {loading ? "Minting..." : "Mint NFT"}
      </button>

      {/* Status Message */}
      {status && (
        <div
          className={`mt-4 text-sm text-gray-200 bg-gray-700 p-3 rounded-lg border border-gray-600 transition-all duration-300 ${
            status.startsWith("✅")
              ? "border-green-500 text-green-400 font-semibold"
              : status.startsWith("❌")
              ? "border-red-500 text-red-400 font-semibold"
              : "border-gray-600"
          }`}
        >
          {status}
        </div>
      )}

      {/* Minted NFT Confirmation */}
      {mintedNFT && (
        <div className="mt-4 p-4 bg-gray-700 rounded-xl border border-green-600 shadow-inner animate-fade-in">
          <h3 className="text-sm font-semibold mb-3 text-green-400 flex items-center gap-2">
            🎉 NFT Minted Successfully!
          </h3>
          <img
            src={mintedNFT.image}
            alt={mintedNFT.title}
            className="rounded-lg w-full h-48 object-contain mb-3 border border-gray-600"
          />
          <div className="space-y-1">
            <p className="text-gray-200 font-medium">{mintedNFT.title}</p>
            <a
              href={mintedNFT.image}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline block"
            >
              🖼 View Image on IPFS
            </a>
            <a
              href={mintedNFT.metadata}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline block"
            >
              📄 View Metadata on IPFS
            </a>
          </div>
        </div>
      )}

      {/* Shimmer effect */}
      <style>{`
        .shimmer {
          background: linear-gradient(110deg, #2a2a2a 8%, #3d3d3d 18%, #2a2a2a 33%);
          background-size: 200% 100%;
          animation: shimmer 1.6s linear infinite;
        }
        @keyframes shimmer {
          100% { background-position-x: -200%; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
