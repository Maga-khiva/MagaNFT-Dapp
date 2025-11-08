import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../abi/MagaNFT.json";

// Your deployed contract address and gateway
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

function ipfsToHttp(uri) {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) return uri.replace("ipfs://", IPFS_GATEWAY);
  if (!/^https?:\/\//.test(uri)) return `${IPFS_GATEWAY}${uri}`;
  return uri;
}

// Modal for viewing NFT details
function NFTModal({ open, onClose, nft }) {
  if (!open || !nft) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#191e24] rounded-2xl p-6 shadow-lg relative max-w-lg w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-300 hover:text-white text-2xl"
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex flex-col items-center">
          <div className="w-full flex justify-center bg-[#23272f] rounded-lg p-2 mb-4">
            <img
              src={nft.metadata.image || "https://via.placeholder.com/400?text=No+Image"}
              alt={nft.metadata.name}
              className="max-h-72 rounded-lg"
              style={{ objectFit: "contain" }}
              onError={e => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400?text=No+Image"; }}
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{nft.metadata.name}</h2>
          <p className="text-gray-300 mb-2">{nft.metadata.description}</p>
          <div className="flex gap-3 mb-2 text-xs flex-wrap">
            <span className="text-gray-400">Token ID: <span className="text-white">{nft.tokenId}</span></span>
            <span className="text-gray-400 break-all">Owner: <span className="text-white">{nft.owner}</span></span>
          </div>
          <div className="flex gap-2 mt-2 w-full">
            {nft.metadata.image && (
              <a
                href={nft.metadata.image}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-block text-center px-0 py-2 bg-blue-700 text-sm rounded-lg hover:bg-blue-800 text-white duration-150"
              >
                View Image
              </a>
            )}
            {nft.uri && (
              <a
                href={ipfsToHttp(nft.uri)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-block text-center px-0 py-2 bg-green-700 text-sm rounded-lg hover:bg-green-800 text-white duration-150"
              >
                Metadata
              </a>
            )}
            <a
              href={`https://etherscan.io/token/${CONTRACT_ADDRESS}?a=${nft.tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-block text-center px-0 py-2 bg-gray-700 text-sm rounded-lg hover:bg-gray-800 text-white duration-150"
            >
              Etherscan
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GallerySection({ account }) {
  const [allNFTs, setAllNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showMine, setShowMine] = useState(false);
  const [contract, setContract] = useState(null);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Setup ethers.Contract (read-only)
  useEffect(() => {
    async function setup() {
      try {
        if (!window.ethereum) throw new Error("Please install MetaMask.");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, provider);
        setContract(contract);
      } catch (e) {
        console.error(e);
        setError("Failed to connect to contract. Check web3 wallet.");
      }
    }
    setup();
  }, []);

  // Load all NFTs (metadata + owners)
  const loadAllNFTs = useCallback(async () => {
    if (!contract) return;
    setLoading(true);
    setError("");
    try {
      const allTokens = await contract.getAllTokens();
      if (!Array.isArray(allTokens) || !allTokens.length) {
        setAllNFTs([]);
        setLoading(false);
        return;
      }
      const results = await Promise.all(
        allTokens.map(async ({ tokenId, tokenURI }) => {
          let metadata = null;
          try {
            const metaRes = await fetch(ipfsToHttp(tokenURI));
            metadata = await metaRes.json();
          } catch {
            metadata = { name: `NFT #${tokenId}`, description: "No metadata found.", image: "" };
          }
          let owner = "";
          try {
            owner = await contract.ownerOf(tokenId);
          } catch {
            owner = "";
          }
          return {
            tokenId: Number(tokenId),
            uri: tokenURI,
            owner: owner ? owner.toLowerCase() : "",
            metadata: {
              name: metadata?.name || `NFT #${tokenId}`,
              description: metadata?.description || "",
              image: ipfsToHttp(metadata?.image),
            },
          };
        })
      );
      setAllNFTs(results);
    } catch (e) {
      console.error(e);
      setError("Failed to load NFTs. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    if (contract) loadAllNFTs();
  }, [contract, account, loadAllNFTs]);

  const nftsToShow = useMemo(() => {
    let nfts = allNFTs;
    if (showMine && account) nfts = nfts.filter((nft) => nft.owner === account.toLowerCase());
    if (search) {
      const term = search.toLowerCase();
      nfts = nfts.filter(
        (nft) =>
          nft.metadata.name.toLowerCase().includes(term) ||
          nft.metadata.description.toLowerCase().includes(term)
      );
    }
    return nfts;
  }, [allNFTs, showMine, account, search]);

  useEffect(() => {
    if (!contract) return;
    const update = () => loadAllNFTs();
    contract.on("Minted", update);
    return () => {
      contract.off("Minted", update);
    };
  }, [contract, loadAllNFTs]);

  const onToggleMine = () => {
    if (!account) {
      alert("Connect your wallet to view your NFTs.");
      return;
    }
    setShowMine((v) => !v);
  };
  const onRefresh = () => loadAllNFTs();
  const onCardClick = (nft) => {
    setSelectedNFT(nft);
    setModalOpen(true);
  };

  return (
    <section className="p-8 bg-[#191e24] rounded-2xl shadow-xl min-h-screen">
      <NFTModal open={modalOpen} nft={selectedNFT} onClose={() => setModalOpen(false)} />
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <span role="img" aria-label="gallery">🖼️</span> Maga NFT Gallery
        </h2>
        <div className="flex gap-3 items-center flex-wrap">
          <input
            type="text"
            placeholder="Search NFTs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#23272f] text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ minWidth: 180 }}
          />
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white font-semibold transition flex items-center"
            disabled={loading}
            type="button"
          >
            <span className="material-icons mr-1" style={{ fontSize: 18 }}></span>
            Refresh
          </button>
          <button
            onClick={onToggleMine}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center
              ${showMine ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-gray-700 hover:bg-gray-800 text-white"}`}
            disabled={loading}
            type="button"
          >
            {showMine ? "🌍 Show All NFTs" : "👛 Show My NFTs"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-700/40 text-red-200 rounded-lg mb-6 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={onRefresh}
            className="ml-3 underline hover:text-white text-sm"
            type="button"
          >
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 mt-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[440px] rounded-2xl bg-[#23272f] animate-pulse" />
          ))}
        </div>
      )}

      {!loading && nftsToShow.length === 0 && (
        <p className="text-gray-400 text-center mt-10 text-lg">
          {showMine
            ? account
              ? "You haven’t minted any NFTs yet."
              : "Connect your wallet to see your NFTs."
            : "No NFTs found or minted yet."}
        </p>
      )}

      {!loading && nftsToShow.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 mt-6">
          {nftsToShow.map(nft => (
            <div
              key={nft.tokenId}
              tabIndex={0}
              onClick={() => onCardClick(nft)}
              onKeyDown={e => e.key === "Enter" && onCardClick(nft)}
              className="bg-[#23272f] rounded-2xl shadow-md flex flex-col cursor-pointer
                         transition-transform hover:scale-[1.03] hover:shadow-xl outline-none focus:ring-2 focus:ring-blue-500
                         h-[440px]"
              title="Click to view details"
              style={{ minWidth: 0 }}
            >
              <div className="w-full h-64 rounded-t-2xl bg-gray-700 overflow-hidden flex items-center justify-center">
                <img
                  src={nft.metadata.image || "https://via.placeholder.com/300?text=No+Image"}
                  alt={nft.metadata.name}
                  loading="lazy"
                  className="object-cover w-full h-full"
                  onError={e => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300?text=No+Image"; }}
                />
              </div>
              <div className="flex-1 flex flex-col px-4 py-3">
                <h3 className="text-lg font-bold truncate text-white">{nft.metadata.name}</h3>
                <p className="text-xs text-gray-400 leading-tight mb-1">
                  Minted via MagaNFT DApp
                </p>
                <p className="text-xs text-blue-300 mb-1">Token ID: {nft.tokenId}</p>
                <p className="text-xs text-gray-500 break-all mb-2">
                  {nft.owner}
                </p>
                <div className="flex gap-2 mt-auto pt-1 w-full">
                  <a
                    href={nft.metadata.image || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-0 py-2 text-center rounded-lg text-sm bg-blue-700 hover:bg-blue-800 text-white transition font-semibold"
                    onClick={e => e.stopPropagation()}
                  >
                    View
                    NFT
                  </a>
                  <a
                    href={nft.uri ? ipfsToHttp(nft.uri) : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-0 py-2 text-center rounded-lg text-sm bg-green-700 hover:bg-green-800 text-white transition font-semibold"
                    onClick={e => e.stopPropagation()}
                  >
                    Meta
                    data
                  </a>
                  <a
                    href={`https://etherscan.io/token/${CONTRACT_ADDRESS}?a=${nft.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-0 py-2 text-center rounded-lg text-sm bg-gray-700 hover:bg-gray-800 text-white transition font-semibold"
                    onClick={e => e.stopPropagation()}
                  >
                    Ether
                    scan
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}