const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Can be null for failed login attempts where user isn't found
    },
    username: String,
    action: {
        type: String,
        required: true,
        enum: ['LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'CREATE_SALE', 'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT', 'UPDATE_STOCK', 'CREATE_CUSTOMER', 'UPDATE_CUSTOMER', 'DELETE_CUSTOMER', 'HR_ACTION']
    },
    resource: String, // e.g., 'Product', 'Sale', 'Customer'
    resourceId: String,
    details: String, // JSON string or descriptive text
    ipAddress: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for better performance on logs
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
