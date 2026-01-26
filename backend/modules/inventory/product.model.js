const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    batchNumber: { type: String },
    expiryDate: { type: Date },
    lowStockThreshold: { type: Number, default: 10 },

    // Medicine specific fields
    genericName: { type: String },
    dosageForm: { type: String },
    strength: { type: String },
    packSize: { type: String },
    manufacturingDate: { type: Date },
    unit: { type: String },
    manufacturer: { type: String },
    isCritical: { type: Boolean, default: false },

    image: { type: String }, // Base64 or URL
    storeId: { type: String, required: true, default: 'main' },
    sync: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
});

productSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Product', productSchema);
