const mongoose = require('mongoose');

const payrollItemSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['basic', 'allowance', 'bonus', 'overtime', 'deduction', 'tax', 'other'],
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true
    },
    isDeduction: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const payrollSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    payPeriod: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        }
    },
    items: [payrollItemSchema],
    totalEarnings: {
        type: Number,
        required: true,
        min: 0
    },
    totalDeductions: {
        type: Number,
        required: true,
        min: 0
    },
    netPay: {
        type: Number,
        required: true,
        min: 0
    },
    paymentDate: {
        type: Date,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank_transfer', 'check', 'orange_money', 'afrimoney', 'other'],
        default: 'bank_transfer'
    },
    paymentDetails: {
        phoneNumber: String,
        transactionId: String,
        providerReference: String,
        status: String
    },
    status: {
        type: String,
        enum: ['pending', 'processed', 'paid', 'cancelled'],
        default: 'pending'
    },
    notes: {
        type: String,
        trim: true
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Calculate totals before save
payrollSchema.pre('save', function () {
    this.totalEarnings = this.items
        .filter(item => !item.isDeduction)
        .reduce((sum, item) => sum + item.amount, 0);

    this.totalDeductions = this.items
        .filter(item => item.isDeduction)
        .reduce((sum, item) => sum + item.amount, 0);

    this.netPay = this.totalEarnings - this.totalDeductions;
});

module.exports = mongoose.model('Payroll', payrollSchema);
