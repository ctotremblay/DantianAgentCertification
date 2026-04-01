import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying AgentCertifier with:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "0G");

  const AgentCertifier = await ethers.getContractFactory("AgentCertifier");
  const contract = await AgentCertifier.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("AgentCertifier deployed to:", address);
  console.log("");
  console.log("Next steps:");
  console.log(`  1. Add CONTRACT_ADDRESS=${address} to your .env`);
  console.log("  2. Run: npx hardhat run scripts/certify.ts --network 0g-testnet");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
