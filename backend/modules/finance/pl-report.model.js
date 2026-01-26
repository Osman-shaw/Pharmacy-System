const mongoose = require('mongoose');

const plReportSchema = new mongoose.Schema({
    period: {
        type: String,
        required: true,
        unique: true // Format: "MM-YYYY" or "YYYY"
    },
    revenue: {
        rx: { type: Number, default: 0 },
        otc: { type: Number, default: 0 },
        service: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    cogs: {
        purchaseCost: { type: Number, default: 0 },
        inventoryAdjustment: { type: Number, default: 0 },
        rebates: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    opex: {
        energy: { type: Number, default: 0 },
        inventorySupply: { type: Number, default: 0 },
        regulatory: { type: Number, default: 0 },
        hr: { type: Number, default: 0 },
        facility: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    adjustments: {
        dirFees: { type: Number, default: 0 },
        payerAdjustments: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    grossProfit: { type: Number, default: 0 },
    netIncome: { type: Number, default: 0 },
    margins: {
        rx: { type: Number, default: 0 },
        otc: { type: Number, default: 0 },
        overall: { type: Number, default: 0 }
    },
    isLocked: { type: Boolean, default: false },
    lockedAt: { type: Date },
    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('PLReport', plReportSchema);
