import { ethers } from "hardhat";
import "dotenv/config";

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("Set CONTRACT_ADDRESS in .env first");
  }

  const agentAddress = process.argv[2] || process.env.AGENT_ADDRESS;
  if (!agentAddress) {
    console.log("Usage: npx hardhat run scripts/verify.ts --network 0g-testnet -- <agent_address>");
    console.log("  Or set AGENT_ADDRESS in .env");
    process.exit(1);
  }

  const AgentCertifier = await ethers.getContractFactory("AgentCertifier");
  const contract = AgentCertifier.attach(contractAddress);

  console.log("Verifying agent:", agentAddress);
  console.log("");

  // Quick check
  const [certified, activeCertCount] = await contract.verify(agentAddress);

  if (!certified) {
    console.log("RESULT: NOT CERTIFIED");
    console.log("  No active certifications found for this agent.");
    return;
  }

  console.log("RESULT: CERTIFIED");
  console.log("  Active certifications:", activeCertCount.toString());
  console.log("");

  // Get full details
  const activeCerts = await contract.getActiveCertifications(agentAddress);
  const certTypeNames = ["IDENTITY", "CAPABILITY", "SAFETY", "COMPLIANCE"];

  for (const cert of activeCerts) {
    const expiresDate = new Date(Number(cert.expiresAt) * 1000);
    const issuedDate = new Date(Number(cert.issuedAt) * 1000);
    const daysLeft = Math.ceil((Number(cert.expiresAt) - Date.now() / 1000) / 86400);

    console.log(`  Certification #${cert.id}`);
    console.log(`    Type: ${certTypeNames[Number(cert.certType)]}`);
    console.log(`    Certifier: ${cert.certifier}`);
    console.log(`    Issued: ${issuedDate.toISOString()}`);
    console.log(`    Expires: ${expiresDate.toISOString()} (${daysLeft} days left)`);
    console.log(`    Report: ${cert.reportHash}`);
    console.log("");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
