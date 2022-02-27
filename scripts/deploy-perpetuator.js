const hre = require("hardhat");
async function main() {
  const Perp = await hre.ethers.getContractFactory("Perpetuator");
  const perp = await Perp.deploy();
  await perp.deployed();
  console.log("Perpetuator deployed to:", perp.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
