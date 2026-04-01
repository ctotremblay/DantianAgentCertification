import { ethers } from "hardhat";
import "dotenv/config";

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("Set CONTRACT_ADDRESS in .env first");
  }

  const certId = process.argv[2];
  if (!certId) {
    console.log("Usage: npx hardhat run scripts/revoke.ts --network 0g-testnet -- <cert_id>");
    process.exit(1);
  }

  const [signer] = await ethers.getSigners();
  console.log("Revoking as:", signer.address);

  const AgentCertifier = await ethers.getContractFactory("AgentCertifier");
  const contract = AgentCertifier.attach(contractAddress);

  // Get cert details before revoking
  const cert = await contract.getCertification(certId);
  console.log("");
  console.log("Revoking certification #" + certId);
  console.log("  Agent:", cert.agent);
  console.log("  Type:", ["IDENTITY", "CAPABILITY", "SAFETY", "COMPLIANCE"][Number(cert.certType)]);
  console.log("");

  const tx = await contract.revoke(certId);
  const receipt = await tx.wait();

  console.log("Revoked! Tx:", receipt!.hash);

  // Verify it's revoked
  const updated = await contract.getCertification(certId);
  console.log("Revoked status:", updated.revoked);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
