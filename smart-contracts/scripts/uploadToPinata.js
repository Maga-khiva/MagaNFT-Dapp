// scripts/uploadToPinata.js
import fs from "fs";
import path from "path";
import pinataSDK from "@pinata/sdk";
import dotenv from "dotenv";

dotenv.config();

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
const ASSETS_DIR = path.join(process.cwd(), "assets");
const OUTPUT_FILE = path.join(process.cwd(), "metadataList.json");

async function uploadToPinata() {
  try {
    console.log("🚀 Starting bulk upload to Pinata...");

    const files = fs.readdirSync(ASSETS_DIR).filter(
      (file) => file.endsWith(".png") || file.endsWith(".jpg") || file.endsWith(".jpeg")
    );

    if (files.length === 0) {
      console.log("⚠️ No image files found in /assets");
      return;
    }

    const metadataList = [];

    for (const [index, fileName] of files.entries()) {
      console.log(`\n📦 Uploading image ${index + 1}/${files.length}: ${fileName}`);

      const filePath = path.join(ASSETS_DIR, fileName);
      const readableStreamForFile = fs.createReadStream(filePath);

      const imageOptions = {
        pinataMetadata: { name: `MagaNFT Image ${index + 1}` },
        pinataOptions: { cidVersion: 0 },
      };

      const imageResult = await pinata.pinFileToIPFS(readableStreamForFile, imageOptions);
      const imageIPFS = `https://gateway.pinata.cloud/ipfs/${imageResult.IpfsHash}`;
      console.log(`✅ Image uploaded: ${imageIPFS}`);

      const metadata = {
        name: `MagaNFT #${index + 1}`,
        description: `Exclusive MagaNFT collection piece #${index + 1}`,
        image: imageIPFS,
      };

      const metadataOptions = {
        pinataMetadata: { name: `MagaNFT Metadata ${index + 1}` },
      };

      const metadataResult = await pinata.pinJSONToIPFS(metadata, metadataOptions);
      const metadataURL = `https://gateway.pinata.cloud/ipfs/${metadataResult.IpfsHash}`;
      console.log(`🧩 Metadata uploaded: ${metadataURL}`);

      metadataList.push({
        id: index + 1,
        image: imageIPFS,
        metadata: metadataURL,
      });
    }

    // Save all metadata URLs to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(metadataList, null, 2));
    console.log(`\n💾 Saved metadata list to: ${OUTPUT_FILE}`);
    console.log("🎉 All uploads complete!");

  } catch (error) {
    console.error("❌ Error during Pinata upload:", error);
  }
}

uploadToPinata();
