// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AgentCertifier
 * @notice Time-bound certification registry for AI agents on 0G.
 *         Certifications expire, forcing re-verification.
 *         Anyone can verify any agent from any chain by querying this contract.
 */
contract AgentCertifier {
    // ── Types ──────────────────────────────────────────────────────────

    enum CertType {
        IDENTITY,    // Agent is who it claims to be
        CAPABILITY,  // Agent can do what it claims
        SAFETY,      // Agent passed safety checks
        COMPLIANCE   // Agent meets regulatory requirements
    }

    struct Certification {
        uint256 id;
        address agent;
        address certifier;
        CertType certType;
        uint256 issuedAt;
        uint256 expiresAt;
        bytes32 reportHash;   // 0G Storage root hash of full report
        string uri;           // Human-readable link or IPFS/0G URI
        bool revoked;
    }

    // ── State ──────────────────────────────────────────────────────────

    address public owner;

    /// All certifications ever issued
    Certification[] public certifications;

    /// agent address => array of certification IDs
    mapping(address => uint256[]) public agentCertIds;

    /// Authorized certifiers
    mapping(address => bool) public isCertifier;

    /// Total certifications issued
    uint256 public totalCertifications;

    // ── Events ─────────────────────────────────────────────────────────

    event CertificationIssued(
        uint256 indexed certId,
        address indexed agent,
        address indexed certifier,
        CertType certType,
        uint256 expiresAt,
        bytes32 reportHash
    );

    event CertificationRevoked(
        uint256 indexed certId,
        address indexed agent,
        address indexed certifier
    );

    event CertifierAdded(address indexed certifier);
    event CertifierRemoved(address indexed certifier);

    // ── Modifiers ──────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyCertifier() {
        require(isCertifier[msg.sender], "Not authorized certifier");
        _;
    }

    // ── Constructor ────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
        isCertifier[msg.sender] = true;
        emit CertifierAdded(msg.sender);
    }

    // ── Admin ──────────────────────────────────────────────────────────

    function addCertifier(address _certifier) external onlyOwner {
        require(!isCertifier[_certifier], "Already certifier");
        isCertifier[_certifier] = true;
        emit CertifierAdded(_certifier);
    }

    function removeCertifier(address _certifier) external onlyOwner {
        require(isCertifier[_certifier], "Not certifier");
        require(_certifier != owner, "Cannot remove owner");
        isCertifier[_certifier] = false;
        emit CertifierRemoved(_certifier);
    }

    // ── Core: Certify ──────────────────────────────────────────────────

    /**
     * @notice Issue a time-bound certification to an agent.
     * @param _agent      The agent's address (can be any address, any chain origin)
     * @param _certType   Type of certification
     * @param _expiresAt  Unix timestamp when certification expires
     * @param _reportHash 0G Storage root hash of the full certification report
     * @param _uri        Human-readable URI for the report
     */
    function certify(
        address _agent,
        CertType _certType,
        uint256 _expiresAt,
        bytes32 _reportHash,
        string calldata _uri
    ) external onlyCertifier returns (uint256) {
        require(_agent != address(0), "Invalid agent address");
        require(_expiresAt > block.timestamp, "Expiry must be in the future");
        require(_reportHash != bytes32(0), "Report hash required");

        uint256 certId = certifications.length;

        certifications.push(Certification({
            id: certId,
            agent: _agent,
            certifier: msg.sender,
            certType: _certType,
            issuedAt: block.timestamp,
            expiresAt: _expiresAt,
            reportHash: _reportHash,
            uri: _uri,
            revoked: false
        }));

        agentCertIds[_agent].push(certId);
        totalCertifications++;

        emit CertificationIssued(
            certId, _agent, msg.sender, _certType, _expiresAt, _reportHash
        );

        return certId;
    }

    // ── Core: Revoke ───────────────────────────────────────────────────

    /**
     * @notice Revoke a certification early. Only the original certifier or owner can revoke.
     */
    function revoke(uint256 _certId) external {
        require(_certId < certifications.length, "Invalid cert ID");
        Certification storage cert = certifications[_certId];
        require(
            msg.sender == cert.certifier || msg.sender == owner,
            "Not authorized to revoke"
        );
        require(!cert.revoked, "Already revoked");

        cert.revoked = true;

        emit CertificationRevoked(_certId, cert.agent, msg.sender);
    }

    // ── Core: Verify ───────────────────────────────────────────────────

    /**
     * @notice Check if an agent has ANY valid (non-expired, non-revoked) certification.
     * @return certified  Whether the agent has at least one active certification
     * @return activeCertCount Number of active certifications
     */
    function verify(address _agent) external view returns (
        bool certified,
        uint256 activeCertCount
    ) {
        uint256[] memory ids = agentCertIds[_agent];
        for (uint256 i = 0; i < ids.length; i++) {
            Certification memory cert = certifications[ids[i]];
            if (!cert.revoked && cert.expiresAt > block.timestamp) {
                activeCertCount++;
            }
        }
        certified = activeCertCount > 0;
    }

    /**
     * @notice Check if an agent has a valid certification of a specific type.
     */
    function verifyByType(address _agent, CertType _certType) external view returns (
        bool certified,
        uint256 latestCertId,
        uint256 expiresAt
    ) {
        uint256[] memory ids = agentCertIds[_agent];
        for (uint256 i = ids.length; i > 0; i--) {
            Certification memory cert = certifications[ids[i - 1]];
            if (
                cert.certType == _certType &&
                !cert.revoked &&
                cert.expiresAt > block.timestamp
            ) {
                return (true, cert.id, cert.expiresAt);
            }
        }
        return (false, 0, 0);
    }

    // ── Views ──────────────────────────────────────────────────────────

    /**
     * @notice Get all certification IDs for an agent.
     */
    function getAgentCertIds(address _agent) external view returns (uint256[] memory) {
        return agentCertIds[_agent];
    }

    /**
     * @notice Get full certification details.
     */
    function getCertification(uint256 _certId) external view returns (Certification memory) {
        require(_certId < certifications.length, "Invalid cert ID");
        return certifications[_certId];
    }

    /**
     * @notice Get all active (non-expired, non-revoked) certifications for an agent.
     */
    function getActiveCertifications(address _agent) external view returns (Certification[] memory) {
        uint256[] memory ids = agentCertIds[_agent];
        uint256 activeCount = 0;

        // Count active
        for (uint256 i = 0; i < ids.length; i++) {
            Certification memory cert = certifications[ids[i]];
            if (!cert.revoked && cert.expiresAt > block.timestamp) {
                activeCount++;
            }
        }

        // Build array
        Certification[] memory active = new Certification[](activeCount);
        uint256 idx = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            Certification memory cert = certifications[ids[i]];
            if (!cert.revoked && cert.expiresAt > block.timestamp) {
                active[idx] = cert;
                idx++;
            }
        }

        return active;
    }
}
