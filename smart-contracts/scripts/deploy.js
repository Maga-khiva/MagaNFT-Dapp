const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const MagaNFT = await hre.ethers.getContractFactory("MagaNFT");
  const maga = await MagaNFT.deploy(deployer.address);

  await maga.waitForDeployment();

  console.log("✅ Contract deployed to:", await maga.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
