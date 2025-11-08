// scripts/mintNFT.js
import "dotenv/config";
import { ethers } from "hardhat";

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; // kontrakt address
const RECIPIENT = process.env.RECIPIENT || "";         // qoyil: yoki yozib qo'y
const TOKEN_URI = process.env.TOKEN_URI || "";         // ipfs://... yoki boshqa URI

async function tryMintWithRecipient(contract, recipient, uri) {
  console.log("Trying mintNFT(recipient, uri) ...");
  const tx = await contract.mintNFT(recipient, uri);
  await tx.wait();
  return tx;
}

async function tryMintSelf(contract, uri) {
  console.log("Trying mintNFT(uri) (mint to msg.sender) ...");
  const tx = await contract.mintNFT(uri);
  await tx.wait();
  return tx;
}

async function main() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("CONTRACT_ADDRESS missing in .env");
  }
  if (!TOKEN_URI) {
    throw new Error("TOKEN_URI missing in .env");
  }

  const nft = await ethers.getContractAt("MagaNFT", CONTRACT_ADDRESS);
  console.log("Contract loaded at", CONTRACT_ADDRESS);

  // 1) agar RECIPIENT ko‘rsatilgan bo‘lsa avval uni uraymiz
  if (RECIPIENT) {
    try {
      const tx = await tryMintWithRecipient(nft, RECIPIENT, TOKEN_URI);
      console.log("✅ Minted (recipient variant). Tx hash:", tx.hash);
      return;
    } catch (err) {
      console.warn("mint(recipient,uri) failed:", err?.message || err);
      // davom etamiz — ehtimol funksiya boshqa imzoda
    }
  }

  // 2) keyin fallback sifatida mint(uri) ni uraymiz
  try {
    const tx = await tryMintSelf(nft, TOKEN_URI);
    console.log("✅ Minted (self variant). Tx hash:", tx.hash);
    return;
  } catch (err) {
    console.warn("mint(uri) failed:", err?.message || err);
  }

  console.error("Both mint attempts failed. Check contract ABI/signature and address.");
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exitCode = 1;
});
