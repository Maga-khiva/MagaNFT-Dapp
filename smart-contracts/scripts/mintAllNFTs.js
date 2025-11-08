// scripts/mintAllNFTs.js
import fs from "fs";
import dotenv from "dotenv";
import { ethers } from "ethers";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const abi = require("../artifacts/contracts/NFTMint.sol/MagaNFT.json");
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


dotenv.config();

const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const provider = new ethers.JsonRpcProvider(API_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, wallet);

async function mintAll() {
  try {
    console.log("🚀 Starting NFT minting process...");

    const metadataList = JSON.parse(fs.readFileSync("metadataList.json", "utf8"));

    for (const nft of metadataList) {
      console.log(`\n🎨 Minting NFT #${nft.id}...`);
      console.log(`🔗 Metadata: ${nft.metadata}`);

      const tx = await contract.mintNFT(wallet.address, nft.metadata);
      console.log("⏳ Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log(`✅ NFT #${nft.id} minted successfully in block ${receipt.blockNumber}`);
      await delay(2000); // wait 2 seconds before minting next
    }

    console.log("\n🎉 All NFTs minted successfully!");
  } catch (err) {
    console.error("❌ Error minting NFTs:", err);
  }
}

mintAll();
