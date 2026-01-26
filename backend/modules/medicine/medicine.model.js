const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    // Core Identity
    name: { type: String, required: true },
    genericName: { type: String },
    description: { type: String },

    // Categorization
    category: { type: String, required: true },
    isCritical: { type: Boolean, default: false },

    // Product Details
    dosageForm: { type: String }, // Tablet, Syrup, etc.
    strength: { type: String }, // 500mg
    packSize: { type: String }, // 1x10
    manufacturer: { type: String },

    // Inventory & Pricing (Shared with Inventory logic)
    stock: { type: Number, default: 0 },
    unit: { type: String }, // Box, Strip
    price: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    lowStockThreshold: { type: Number, default: 10 },

    // Batch Tracking
    batchNumber: { type: String },
    manufacturingDate: { type: Date },
    expiryDate: { type: Date },

    // System
    storeId: { type: String, required: true, default: 'main' },
    deleted: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
});

medicineSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

// Explicitly map to 'products' collection to share data with Inventory/Sales
module.exports = mongoose.model('Medicine', medicineSchema, 'products');
