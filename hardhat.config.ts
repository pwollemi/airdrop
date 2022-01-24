import { HardhatUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-typechain";
import "hardhat-deploy";
import "hardhat-contract-sizer";
import "solidity-coverage";
import { config as dotEnvConfig } from "dotenv";

dotEnvConfig();

const { ETHERSCAN_API_KEY, WORKER_SEED } = process.env;

const defaultConfig = {
  accounts: {
    mnemonic: WORKER_SEED,
  },  
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545/",
    },
    matic_mainnet: {
      url: `https://polygon-rpc.com`,
      chainId: 137,
      ...defaultConfig
    },
    coverage: {
      url: "http://127.0.0.1:8555",
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  mocha: {
    timeout: 1000000,
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: false,
    disambiguatePaths: false,
  },
};

export default config;
