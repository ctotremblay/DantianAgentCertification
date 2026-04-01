import { ethers } from "ethers";

/**
 * Universal agent identifier resolution.
 *
 * Any agent can be certified, whether it has a wallet or not.
 * Non-address identifiers are hashed into a deterministic address:
 *
 *   "0x1234..."                    -> used directly (on-chain agent)
 *   "github:owner/repo"            -> keccak256("github:owner/repo") -> address
 *   "api:https://agent.example.com"-> keccak256("api:https://...") -> address
 *   "myagent-v2"                   -> keccak256("id:myagent-v2") -> address
 *
 * The same identifier always resolves to the same address,
 * so anyone can look up an agent by its original identifier.
 */

export type AgentIdType = "address" | "github" | "api" | "id";

export interface ResolvedAgent {
  /** Original input as provided */
  original: string;
  /** Normalized canonical form (e.g., "github:owner/repo") */
  canonical: string;
  /** Deterministic on-chain address */
  address: string;
  /** Detected identifier type */
  type: AgentIdType;
}

/**
 * Detect the type of an agent identifier.
 */
export function detectAgentIdType(input: string): AgentIdType {
  const trimmed = input.trim();

  // Ethereum address
  if (/^0x[0-9a-fA-F]{40}$/.test(trimmed)) return "address";

  // GitHub: accept "github:owner/repo", "https://github.com/owner/repo", or "owner/repo"
  if (
    trimmed.startsWith("github:") ||
    trimmed.startsWith("https://github.com/") ||
    trimmed.startsWith("http://github.com/") ||
    /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(trimmed)
  ) {
    return "github";
  }

  // API endpoint
  if (
    trimmed.startsWith("api:") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://")
  ) {
    return "api";
  }

  // Generic ID
  return "id";
}

/**
 * Normalize an identifier to its canonical form.
 */
function normalize(input: string, type: AgentIdType): string {
  const trimmed = input.trim();

  switch (type) {
    case "address":
      return trimmed.toLowerCase();

    case "github": {
      // Extract "owner/repo" from various formats
      let ownerRepo = trimmed;
      if (ownerRepo.startsWith("github:")) {
        ownerRepo = ownerRepo.slice(7);
      } else if (ownerRepo.includes("github.com/")) {
        ownerRepo = ownerRepo.split("github.com/")[1];
      }
      // Remove trailing slashes, .git suffix, extra path segments
      ownerRepo = ownerRepo.replace(/\.git$/, "").replace(/\/+$/, "");
      // Only keep owner/repo (first two segments)
      const parts = ownerRepo.split("/").filter(Boolean);
      if (parts.length >= 2) {
        ownerRepo = parts[0] + "/" + parts[1];
      }
      return "github:" + ownerRepo.toLowerCase();
    }

    case "api": {
      let url = trimmed;
      if (url.startsWith("api:")) url = url.slice(4);
      // Remove trailing slash
      url = url.replace(/\/+$/, "");
      return "api:" + url.toLowerCase();
    }

    case "id":
      return "id:" + trimmed.toLowerCase();
  }
}

/**
 * Derive a deterministic Ethereum address from a canonical identifier.
 * keccak256(canonical) -> take first 20 bytes -> checksum address.
 */
function deriveAddress(canonical: string): string {
  const hash = ethers.keccak256(ethers.toUtf8Bytes(canonical));
  // Take first 20 bytes (40 hex chars after "0x")
  const raw = "0x" + hash.slice(2, 42);
  return ethers.getAddress(raw);
}

/**
 * Resolve any agent identifier to a deterministic on-chain address.
 */
export function resolveAgentId(input: string): ResolvedAgent {
  const type = detectAgentIdType(input);
  const canonical = normalize(input, type);

  if (type === "address") {
    return {
      original: input.trim(),
      canonical,
      address: ethers.getAddress(input.trim()),
      type,
    };
  }

  return {
    original: input.trim(),
    canonical,
    address: deriveAddress(canonical),
    type,
  };
}
