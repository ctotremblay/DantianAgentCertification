import { ethers } from "hardhat";
import "dotenv/config";

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("Set CONTRACT_ADDRESS in .env first");
  }

  const [signer] = await ethers.getSigners();
  console.log("Certifying as:", signer.address);

  const AgentCertifier = await ethers.getContractFactory("AgentCertifier");
  const contract = AgentCertifier.attach(contractAddress);

  // Demo: certify a sample agent address
  // In production, this would be the agent's wallet address
  const agentAddress = process.env.AGENT_ADDRESS || signer.address;

  // Certification expires in 30 days
  const now = Math.floor(Date.now() / 1000);
  const thirtyDays = 30 * 24 * 60 * 60;
  const expiresAt = now + thirtyDays;

  // Demo report hash (in production, this comes from 0G Storage upload)
  const reportData = JSON.stringify({
    agent: agentAddress,
    certType: "IDENTITY",
    inspectionDate: new Date().toISOString(),
    findings: "Agent verified as operational and responsive.",
    score: 92,
    inspector: signer.address,
  });
  const reportHash = ethers.keccak256(ethers.toUtf8Bytes(reportData));

  const uri = `0g-certify://report/${reportHash}`;

  console.log("");
  console.log("Issuing certification:");
  console.log("  Agent:", agentAddress);
  console.log("  Type: IDENTITY (0)");
  console.log("  Expires:", new Date(expiresAt * 1000).toISOString());
  console.log("  Report hash:", reportHash);
  console.log("");

  const tx = await contract.certify(
    agentAddress,
    0, // CertType.IDENTITY
    expiresAt,
    reportHash,
    uri
  );

  const receipt = await tx.wait();
  console.log("Certification issued! Tx:", receipt!.hash);

  // Read back the certification
  const certIds = await contract.getAgentCertIds(agentAddress);
  const latestCertId = certIds[certIds.length - 1];
  const cert = await contract.getCertification(latestCertId);

  console.log("");
  console.log("Certification #" + cert.id.toString() + " details:");
  console.log("  Agent:", cert.agent);
  console.log("  Certifier:", cert.certifier);
  console.log("  Type:", ["IDENTITY", "CAPABILITY", "SAFETY", "COMPLIANCE"][Number(cert.certType)]);
  console.log("  Issued:", new Date(Number(cert.issuedAt) * 1000).toISOString());
  console.log("  Expires:", new Date(Number(cert.expiresAt) * 1000).toISOString());
  console.log("  Report hash:", cert.reportHash);
  console.log("  Revoked:", cert.revoked);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
