import hre from "hardhat";

async function main() {
  const USDC = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
  const price = 10n ** 3n;
  const contract = '0x7398c4e96b1ca342691a198739A21572C67Eebf9';

  await hre.run('verify:verify', {
    address: contract,
    constructorArguments: [USDC, price]
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
