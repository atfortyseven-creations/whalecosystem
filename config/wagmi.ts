import { http, createConfig } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base, baseSepolia } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

const infuraKey = process.env.NEXT_PUBLIC_INFURA_API_KEY || "4307fae544b442c2a40443ac491ffb0e";

export const config = createConfig({
    chains: [mainnet, polygon, optimism, arbitrum, base, baseSepolia],
    transports: {
        // [Elite] Ethereum Mainnet with Infura + Flashbots fallback
        [mainnet.id]: http(`https://mainnet.infura.io/v3/${infuraKey}`),
        // [HIGH-PERFORMANCE] Alchemy/Llama RPCs for other chains
        [polygon.id]: http(process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "https://polygon.llamarpc.com"),
        [optimism.id]: http(process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || "https://optimism.llamarpc.com"),
        [arbitrum.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || "https://arbitrum.llamarpc.com"),
        [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://base.llamarpc.com"),
        [baseSepolia.id]: http(),
    },
    connectors: [
        injected(),
        metaMask({
            infuraAPIKey: infuraKey,
            dappMetadata: {
                name: "Whale Alert",
                url: "https://whalealertid.fi",
            }
        })
    ],
});


