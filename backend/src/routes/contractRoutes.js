const express = require("express");
const router = express.Router();

const Contract = require("../models/Contract");
const ContractVersion = require("../models/ContractVersion");
const AuditLog = require("../models/AuditLog");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../config/upload");
const { logAction } = require("../utils/auditLogger");


// ===============================
// ROLE CHECK MIDDLEWARE
// ===============================
const isAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

const isClient = (req, res, next) => {
  if (req.user.role !== "CLIENT") {
    return res.status(403).json({ message: "Client access only" });
  }
  next();
};


// ===============================
// CREATE CONTRACT (ADMIN)
// ===============================
router.post("/", protect, isAdmin, async (req, res) => {
  try {
    const contract = await Contract.create({
      title: req.body.title,
      owner: req.user._id,
      reviewer: req.body.reviewer || null,
      status: "DRAFT",
    });

    // Log the action
    await logAction("CONTRACT_CREATED", req.user._id, contract._id, {
      title: contract.title,
      reviewer: contract.reviewer,
    });

    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ===============================
// GET ALL CONTRACTS (ADMIN sees all, CLIENT sees only assigned to them)
// ===============================
router.get("/", protect, async (req, res) => {
  try {
    let query = {};
    // If client, only show contracts where they are the reviewer
    if (req.user.role === "CLIENT") {
      query.reviewer = req.user._id;
    }
    const contracts = await Contract.find(query)
      .populate("owner", "name email")
      .populate("reviewer", "name email")
      .sort({ createdAt: -1 });

    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ===============================
// UPLOAD NEW CONTRACT VERSION (ADMIN)
// ===============================
router.post(
  "/:id/upload",
  protect,
  isAdmin,
  upload.single("file"),
  async (req, res) => {
    try {
      const contract = await Contract.findById(req.params.id);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const versionCount = await ContractVersion.countDocuments({
        contract: contract._id,
      });

      const newVersion = await ContractVersion.create({
        contract: contract._id,
        filePath: req.file.path,
        version: versionCount + 1,
        uploadedBy: req.user._id,
      });

      // When admin uploads → waiting for client review
      contract.status = "SUBMITTED";
      await contract.save();

      // Log the action
      await logAction("FILE_UPLOADED", req.user._id, contract._id, {
        version: newVersion.version,
        filename: req.file.filename,
      });

      res.status(201).json(newVersion);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);


// ===============================
// GET ALL VERSIONS OF A CONTRACT
// ===============================
router.get("/:id/versions", protect, async (req, res) => {
  try {
    const versions = await ContractVersion.find({
      contract: req.params.id,
    })
      .populate("uploadedBy", "name email")
      .sort({ version: -1 });

    res.json(versions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ===============================
// VERSION-LEVEL ACTIONS (CLIENT)
// ===============================
// Approve a specific version
router.put(
  "/:id/versions/:versionId/approve",
  protect,
  isClient,
  async (req, res) => {
    try {
      const contract = await Contract.findById(req.params.id);
      if (!contract) return res.status(404).json({ message: "Contract not found" });

      const version = await ContractVersion.findById(req.params.versionId);
      if (!version || version.contract.toString() !== contract._id.toString()) {
        return res.status(404).json({ message: "Version not found for this contract" });
      }

      // Set version status to APPROVED
      version.status = "APPROVED";
      version.approvedBy = req.user._id;
      await version.save();

      // If all versions are approved, mark contract as APPROVED
      const allVersions = await ContractVersion.find({ contract: contract._id });
      const allApproved = allVersions.every(v => v.status === "APPROVED");
      if (allApproved) {
        contract.status = "APPROVED";
        contract.rejectionReason = undefined;
      }
      await contract.save();

      await logAction("CONTRACT_APPROVED", req.user._id, contract._id, {
        version: version.version,
        versionId: version._id,
      });

      res.json({ message: "Version approved", version });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Reject a specific version with reason
router.put(
  "/:id/versions/:versionId/reject",
  protect,
  isClient,
  async (req, res) => {
    try {
      const contract = await Contract.findById(req.params.id);
      if (!contract) return res.status(404).json({ message: "Contract not found" });

      const version = await ContractVersion.findById(req.params.versionId);
      if (!version || version.contract.toString() !== contract._id.toString()) {
        return res.status(404).json({ message: "Version not found for this contract" });
      }

      const reason = req.body.reason || "No reason provided";
      // Set version status to REJECTED
      version.status = "REJECTED";
      version.rejectionReason = reason;
      await version.save();

      // Mark contract as REJECTED if any version is rejected
      contract.status = "REJECTED";
      contract.rejectionReason = reason;
      await contract.save();

      await logAction("CONTRACT_REJECTED", req.user._id, contract._id, {
        version: version.version,
        versionId: version._id,
        reason,
      });

      res.json({ message: "Version rejected", version });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Add feedback/comment to a specific version (stored in audit logs)
router.post(
  "/:id/versions/:versionId/feedback",
  protect,
  async (req, res) => {
    try {
      const contract = await Contract.findById(req.params.id);
      if (!contract) return res.status(404).json({ message: "Contract not found" });

      const version = await ContractVersion.findById(req.params.versionId);
      if (!version || version.contract.toString() !== contract._id.toString()) {
        return res.status(404).json({ message: "Version not found for this contract" });
      }

      const { comment } = req.body;
      if (!comment) return res.status(400).json({ message: "Comment required" });

      await logAction("VERSION_FEEDBACK", req.user._id, contract._id, {
        version: version.version,
        versionId: version._id,
        comment,
      });

      res.status(201).json({ message: "Feedback submitted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get logs for a specific version (any authenticated user)
router.get(
  "/:id/versions/:versionId/logs",
  protect,
  async (req, res) => {
    try {
      const logs = await AuditLog.find({
        contract: req.params.id,
        $or: [
          { 'metadata.versionId': req.params.versionId },
          { 'metadata.version': { $exists: true } },
        ],
      })
        .populate('user', 'name email role')
        .sort({ createdAt: -1 });

      res.json(logs.filter((l) => (l.metadata && (l.metadata.versionId == req.params.versionId || l.metadata.version)) || l.action === 'VERSION_FEEDBACK'));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);


// ===============================
// CLIENT APPROVES CONTRACT
// ===============================
router.put("/:id/approve", protect, isClient, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    contract.status = "APPROVED";
    contract.rejectionReason = undefined;
    await contract.save();

    // Log the action
    await logAction("CONTRACT_APPROVED", req.user._id, contract._id, {
      status: "APPROVED",
    });

    res.json({ message: "Contract approved", contract });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ===============================
// CLIENT REJECTS CONTRACT
// ===============================
router.put("/:id/reject", protect, isClient, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    contract.status = "REJECTED";
    contract.rejectionReason = req.body.reason || "No reason provided";
    await contract.save();

    // Log the action
    await logAction("CONTRACT_REJECTED", req.user._id, contract._id, {
      reason: contract.rejectionReason,
    });

    res.json({ message: "Contract rejected", contract });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ===============================
// GET AUDIT LOGS FOR A CONTRACT (ADMIN ONLY)
// ===============================
router.get("/:id/logs", protect, isAdmin, async (req, res) => {
  try {
    const logs = await AuditLog.find({ contract: req.params.id })
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ===============================
// DELETE CONTRACT (ADMIN)
// ===============================
router.delete("/:id", protect, isAdmin, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: "Contract not found" });

    // Log deletion
    await logAction("CONTRACT_DELETED", req.user._id, contract._id, {
      title: contract.title,
    });

    // Remove versions and audit logs
    await ContractVersion.deleteMany({ contract: contract._id });
    await AuditLog.deleteMany({ contract: contract._id });

    // Use Model.deleteOne to remove the contract document
    await Contract.deleteOne({ _id: contract._id });

    res.json({ message: "Contract deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ===============================
module.exports = router;
