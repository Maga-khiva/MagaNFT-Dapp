// src/components/NFTCard.jsx
// Helper constants (derived from GallerySection for self-containment)
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
const CONTRACT_ADDRESS = "0x09BbF5B25095B83FAa1E86C415b4CC8a7027aa8f"; 

function ipfsToHttp(uri) {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) return uri.replace("ipfs://", IPFS_GATEWAY);
  if (!/^https?:\/\//.test(uri)) return `${IPFS_GATEWAY}${uri}`;
  return uri;
}

export default function NFTCard({ nft, onCardClick }) {
  const { tokenId, uri, owner, metadata } = nft;
  // Fixed: Convert ipfs:// to https gateway for image display
  const imageUrl = metadata.image
    ? ipfsToHttp(metadata.image)
    : "https://via.placeholder.com/300?text=No+Image";
  const formattedOwner = owner.substring(0, 6) + "..." + owner.substring(owner.length - 4);

  return (
    <div
      tabIndex={0}
      onClick={() => onCardClick(nft)}
      onKeyDown={e => e.key === "Enter" && onCardClick(nft)}
      // 🎨 DESIGN IMPROVEMENT: New card background, subtle shadow/glow on hover
      className="bg-[#1c212a] rounded-2xl shadow-lg flex flex-col cursor-pointer p-4
        transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-blue-500/30
        outline-none focus:ring-2 focus:ring-blue-500 h-[440px] relative"
      title="Click to view details"
      style={{ minWidth: 0 }}
    >
      {/* Image Container */}
      <div className="w-full h-64 rounded-xl bg-gray-700 overflow-hidden flex items-center justify-center mb-3">
        <img
          src={imageUrl}
          alt={metadata.name}
          loading="lazy"
          className="object-cover w-full h-full"
          onError={e => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300?text=No+Image"; }}
        />
      </div>
      
      {/* Metadata */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-xl font-extrabold truncate text-white mb-1">{metadata.name}</h3>
        {/* 🎨 DESIGN IMPROVEMENT: Clearer Token ID display */}
        <p className="text-sm text-blue-400 mb-1 font-mono">Token ID: <span className="font-bold">\#{tokenId}</span></p>
        <p className="text-xs text-gray-500 break-all mb-2 truncate">
          Owner: {formattedOwner}
        </p>

        {/* Action Links */}
        <div className="flex gap-2 mt-auto pt-1 w-full">
          <a
            href={`https://etherscan.io/token/${CONTRACT_ADDRESS}?a=${tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-2 py-2 text-center rounded-lg text-sm bg-gray-700 hover:bg-gray-600 text-white transition font-semibold"
            onClick={e => e.stopPropagation()}
          >
            Etherscan
          </a>
          <a
            href={uri ? ipfsToHttp(uri) : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-2 py-2 text-center rounded-lg text-sm bg-green-700 hover:bg-green-800 text-white transition font-semibold"
            onClick={e => e.stopPropagation()}
          >
            Metadata
          </a>
        </div>
      </div>
    </div>
  );
}