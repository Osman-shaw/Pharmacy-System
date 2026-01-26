/**
 * Prescription Model
 * 
 * Manages prescription records with patient details, doctor information,
 * medications, and AI audio notes support for Krio-to-English translation
 */

const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    // Patient Information
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    patientName: {
        type: String,
        required: true
    },

    // Prescription Dates
    writtenDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    issuedDate: {
        type: Date // When prescription was filled
    },

    // Doctor Information
    doctor: {
        name: {
            type: String,
            required: true
        },
        license: {
            type: String,
            required: true
        },
        contact: String,
        facility: String
    },

    // Prescription Status
    status: {
        type: String,
        enum: ['Pending', 'Filled', 'Cancelled', 'Expired'],
        default: 'Pending'
    },

    // Notes with AI Audio Support
    notes: {
        type: String
    },
    audioNotes: {
        krioText: String, // Original Krio transcription
        englishText: String, // Translated English text
        audioUrl: String, // Optional: stored audio file URL
        recordedAt: Date
    },

    // Medications List
    medications: [{
        medicine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        medicineName: {
            type: String,
            required: true
        },
        dosage: {
            type: String,
            required: true // e.g., "500mg", "10ml"
        },
        quantity: {
            type: Number,
            required: true
        },
        instructions: {
            type: String,
            required: true // e.g., "Take twice daily after meals"
        },
        duration: String // e.g., "7 days", "2 weeks"
    }],

    // Fulfillment Information
    filledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    filledByName: String,

    // Soft Delete
    deleted: {
        type: Boolean,
        default: false
    },

    // Audit Fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for performance
prescriptionSchema.index({ patient: 1, status: 1 });
prescriptionSchema.index({ writtenDate: -1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ deleted: 1 });

// Virtual for prescription age
prescriptionSchema.virtual('age').get(function () {
    const now = new Date();
    const written = new Date(this.writtenDate);
    const diffDays = Math.floor((now - written) / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Auto-expire old pending prescriptions (30 days)
prescriptionSchema.pre('save', function () {
    if (this.status === 'Pending' && this.age > 30) {
        this.status = 'Expired';
    }
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
