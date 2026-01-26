const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'pharmacist', 'cashier', 'store Manager'], default: 'cashier' },
    fullName: { type: String },
    storeId: { type: String, required: true, default: 'main' },
    sync: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    image: { type: String }, // Base64 avatar
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Middleware to update updatedAt
userSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('User', userSchema);
