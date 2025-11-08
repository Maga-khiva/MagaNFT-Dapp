export default function NFTCard({ image, name, tokenId }) {
  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-4 hover:scale-105 transition">
      <img src={image} alt={name} className="rounded-xl mb-3" />
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-gray-400 text-sm">ID: #{tokenId}</p>
    </div>
  );
}
