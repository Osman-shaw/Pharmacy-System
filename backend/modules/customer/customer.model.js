const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
    address: { type: String },
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    allergies: { type: String },
    chronicCondition: { type: String },
    totalPurchases: { type: Number, default: 0 },
    lastVisit: { type: Date },
    storeId: { type: String, required: true, default: 'main' },
    sync: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
