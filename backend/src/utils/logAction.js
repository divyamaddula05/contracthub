const AuditLog = require("../models/AuditLog");

const logAction = async ({ action, user, contract, metadata }) => {
  try {
    await AuditLog.create({
      action,
      user,
      contract,
      metadata,
    });
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
};

module.exports = logAction;
