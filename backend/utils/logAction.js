const AuditLog = require("../models/AuditLog");

const logAction = async ({
  user,
  action,
  targetType,
  targetId,
  description
}) => {
  try {
    await AuditLog.create({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action,
      targetType,
      targetId,
      description
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
};

module.exports = logAction;