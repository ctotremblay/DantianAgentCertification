import { ethers } from "hardhat";
import "dotenv/config";

async function main() {
  const contract = (await ethers.getContractFactory("AgentCertifier"))
    .attach(process.env.CONTRACT_ADDRESS!);

  const total = await contract.totalCertifications();
  console.log("Total certifications on-chain:", total.toString());

  const types = ["IDENTITY", "CAPABILITY", "SAFETY", "COMPLIANCE"];

  for (let i = 0; i < Number(total); i++) {
    const cert = await contract.getCertification(i);
    const now = Math.floor(Date.now() / 1000);
    const active = !cert.revoked && Number(cert.expiresAt) > now;

    console.log(`\n--- Cert #${i} ---`);
    console.log("  Type:    ", types[Number(cert.certType)]);
    console.log("  Agent:   ", cert.agent);
    console.log("  Certifier:", cert.certifier);
    console.log("  Issued:  ", new Date(Number(cert.issuedAt) * 1000).toISOString());
    console.log("  Expires: ", new Date(Number(cert.expiresAt) * 1000).toISOString());
    console.log("  Active:  ", active ? "YES" : "NO");
    console.log("  Revoked: ", cert.revoked);
    console.log("  URI:     ", cert.uri);
    console.log("  Report:  ", cert.reportHash);
  }
}

main().catch(console.error);
