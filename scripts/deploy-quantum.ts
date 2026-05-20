import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("🐋 Deploying Quantum Network on", network.name);
    console.log("Deployer:", deployer.address);

    const ownerAddress = "0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a";

    // Deploy QuantumDots
    console.log("Deploying QuantumDots...");
    const QuantumDots = await ethers.getContractFactory("QuantumDots");
    const qd = await QuantumDots.deploy(ownerAddress);
    await qd.waitForDeployment();
    const qdAddress = await qd.getAddress();
    console.log("✅ QuantumDots deployed at:", qdAddress);

    // Deploy QuantumLedger
    console.log("Deploying QuantumLedger...");
    const QuantumLedger = await ethers.getContractFactory("QuantumLedger");
    const ledger = await QuantumLedger.deploy(qdAddress);
    await ledger.waitForDeployment();
    const ledgerAddress = await ledger.getAddress();
    console.log("✅ QuantumLedger deployed at:", ledgerAddress);

    // Write to a local manifest for injection
    const manifest = {
        token: qdAddress,
        ledger: ledgerAddress,
        chainId: (await ethers.provider.getNetwork()).chainId.toString()
    };
    fs.writeFileSync("quantum-deployment.json", JSON.stringify(manifest, null, 2));
    console.log("💾 Manifest saved to quantum-deployment.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
