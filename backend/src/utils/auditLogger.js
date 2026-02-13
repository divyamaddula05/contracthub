const AuditLog = require("../models/AuditLog");

const logAction = async (action, userId, contractId, metadata = {}) => {
  try {
    await AuditLog.create({
      action,
      user: userId,
      contract: contractId,
      metadata,
    });
  } catch (error) {
    console.error("Error logging action:", error.message);
  }
};

module.exports = { logAction };
