const AuditLog = require('./audit.model');

const logActivity = async (data) => {
    try {
        await AuditLog.create({
            user: data.userId,
            username: data.username,
            action: data.action,
            resource: data.resource,
            resourceId: data.resourceId,
            details: data.details,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent
        });
    } catch (error) {
        // We don't want to crash the main process if logging fails
        console.error('Audit Log Error:', error);
    }
};

module.exports = { logActivity };
