require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [
            { version: "0.8.22" },
            { version: "0.8.20" },
            { version: "0.5.17" },
            { version: "0.6.12" },
        ],
    },
    networks: {
        hardhat: {
            forking: {
                url: process.env.BASE_MAINNET_RPC || "https://mainnet.base.org",
                blockNumber: 9000000,
            },
            chainId: 8453,
        },
        optimismSepolia: {
            url: "https://sepolia.optimism.io",
            accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length >= 64) ? [process.env.PRIVATE_KEY] : [],
        },
        baseSepolia: {
            url: `https://base-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length >= 64) ? [process.env.PRIVATE_KEY] : [],
        },
        base: {
            url: process.env.BASE_MAINNET_RPC || "https://mainnet.base.org",
            accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length >= 64) ? [process.env.PRIVATE_KEY] : [],
        },
        worldChain: {
            url: "https://worldchain-mainnet.g.alchemy.com/public",
            chainId: 480,
            accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length >= 64) ? [process.env.PRIVATE_KEY] : [],
        },
        optimism: {
             url: process.env.OPTIMISM_MAINNET_RPC || "https://mainnet.optimism.io",
             accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length >= 64) ? [process.env.PRIVATE_KEY] : [],
        },
    },
    gasReporter: {
        enabled: false,
    },
};
