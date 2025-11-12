const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contract with account:", deployer.address);

  const MagaNFT = await hre.ethers.getContractFactory("MagaNFT");
  const nft = await MagaNFT.deploy(deployer.address); // pass your wallet address as constructor argument

  await nft.waitForDeployment();

  console.log("Contract deployed to:", await nft.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
