const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        quantity: Number,
        price: Number,
        costPrice: Number,
        subtotal: Number
    }],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'orange_money', 'afrimoney', 'bank_transfer'], default: 'cash' },
    paymentStatus: { type: String, enum: ['pending', 'processing', 'paid', 'failed'], default: 'paid' }, // Default paid for cash
    transactionId: { type: String },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    storeId: { type: String, required: true, default: 'main' },
    customerName: { type: String },
    type: { type: String, enum: ['OTC', 'Rx', 'Service'], default: 'OTC' },
    date: { type: Date, default: Date.now },
    deleted: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now },
    sync: { type: Boolean, default: false } // For offline sync tracking
});

module.exports = mongoose.model('Sale', saleSchema);
