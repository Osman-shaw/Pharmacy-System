const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
        type: String,
        required: true,
        enum: [
            'Energy & Utilities',
            'Inventory & Supply Costs',
            'Regulatory & Compliance',
            'Human Resources',
            'Facility & Administrative'
        ]
    },
    subcategory: { type: String }, // fuel, salaries, rent, etc.
    date: { type: Date, default: Date.now },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
