// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: "0.8.20" },
      { version: "0.8.22" },
      { version: "0.8.24" }
    ]
  },
  networks: {
    arbitrum: {
      url: process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc",
      accounts: process.env.SOVEREIGN_AUTHORITY_PK ? [process.env.SOVEREIGN_AUTHORITY_PK] : [],
    },
    base: {
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      accounts: process.env.SOVEREIGN_AUTHORITY_PK ? [process.env.SOVEREIGN_AUTHORITY_PK] : [],
    }
  },
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ARBISCAN_API_KEY || "",
      base: process.env.BASESCAN_API_KEY || ""
    }
  }
};

export default config;

// scripts/deployValidator.ts (Included in the exact same view for architecture visibility)
/*
import { ethers } from "hardhat";

async function main() {
  console.log("Preparing SovereignValidator Deployment...");
  
  const Validator = await ethers.getContractFactory("SovereignValidator");
  const validator = await Validator.deploy();

  await validator.waitForDeployment();
  const address = await validator.getAddress();

  console.log(\`SovereignValidator firmly deployed to L2 at \${address}\`);
  console.log("Sovereign Authority Context Binded to:", await validator.sovereignAuthority());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
*/
