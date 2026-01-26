const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    legalName: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String },
    country: { type: String, default: 'Sierra Leone' },
    tin: { type: String }, // Taxpayer Identification Number
    pharmacyBoardReg: { type: String }, // Registration with Pharmacy Board
    storeId: { type: String, default: 'main' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    deleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
