import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    polygon: {
      url: 'https://polygon-mainnet.g.alchemy.com/v2/YOUR KEY',
      accounts: ['PK']
    }
  },
  etherscan: {
    apiKey: 'YOUR KEY'
  }
};

export default config;
