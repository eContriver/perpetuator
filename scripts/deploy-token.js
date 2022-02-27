const hre = require("hardhat");
async function main() {
  const Perp = await hre.ethers.getContractFactory("Token");
  const perp = await Perp.deploy("Perpetuator", "PRP");
  await perp.deployed();
  console.log("Token deployed to:", perp.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
