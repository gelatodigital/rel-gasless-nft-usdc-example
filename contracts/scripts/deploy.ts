import { ethers } from "hardhat";

async function main() {
  const USDC = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
  const price = 10n ** 3n;

  const Contract = await ethers.getContractFactory("GaslessNFT");
  const contract = await Contract.deploy(USDC, price);

  await contract.deployed();
  console.log('GaslessNFT:', contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
