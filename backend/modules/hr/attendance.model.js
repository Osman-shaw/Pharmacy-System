const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    checkIn: {
        type: Date
    },
    checkOut: {
        type: Date
    },
    breakDuration: {
        type: Number,
        default: 0, // in minutes
        min: 0
    },
    totalHours: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'half-day', 'on-leave'],
        default: 'present'
    },
    notes: {
        type: String,
        trim: true
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// Calculate total hours before save
attendanceSchema.pre('save', function () {
    if (this.checkIn && this.checkOut) {
        const diffMs = this.checkOut - this.checkIn;
        const diffHours = diffMs / (1000 * 60 * 60);
        this.totalHours = Math.max(0, diffHours - (this.breakDuration / 60));
    }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
