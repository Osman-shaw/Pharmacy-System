const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    purchaseId: { type: String, required: true, unique: true },
    supplierName: { type: String, required: true },
    date: { type: Date, default: Date.now },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        batchNumber: String,
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true }, // Cost of product
        boxPattern: String,
        subtotal: { type: Number, required: true }
    }],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, enum: ['pending', 'received', 'cancelled'], default: 'pending' },
    notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
