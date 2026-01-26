const Medicine = require('./medicine.model');

// Create a new medicine
const createMedicine = async (req, res) => {
    try {
        const { name } = req.body;
        // Basic validation
        if (!name) {
            return res.status(400).json({ success: false, message: 'Medicine name is required' });
        }

        // Check for duplicates
        const exists = await Medicine.findOne({
            name: new RegExp('^' + name + '$', 'i'),
            deleted: { $ne: true }
        });
        if (exists) {
            return res.status(409).json({ success: false, message: 'Medicine with this name already exists' });
        }

        const medicine = await Medicine.create(req.body);

        // Audit Log
        const { logActivity } = require('../audit/audit.service');
        if (req.user) {
            logActivity({
                userId: req.user.userId || req.user._id,
                username: req.user.username,
                action: 'CREATE_MEDICINE',
                resource: 'Medicine',
                resourceId: medicine._id,
                details: `Created medicine: ${medicine.name}`,
                ipAddress: req.ip
            });
        }

        res.status(201).json({ success: true, message: 'Medicine created successfully', data: medicine });
    } catch (error) {
        console.error('Create Medicine Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to create medicine' });
    }
};

// Get all medicines
const getMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find({ deleted: { $ne: true } }).sort({ createdAt: -1 });
        res.json({ success: true, data: medicines });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single medicine
const getMedicineById = async (req, res) => {
    try {
        const medicine = await Medicine.findOne({ _id: req.params.id, deleted: { $ne: true } });
        if (!medicine) {
            return res.status(404).json({ success: false, message: 'Medicine not found' });
        }
        res.json({ success: true, data: medicine });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update medicine
const updateMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findOneAndUpdate(
            { _id: req.params.id, deleted: { $ne: true } },
            req.body,
            { new: true }
        );

        if (!medicine) {
            return res.status(404).json({ success: false, message: 'Medicine not found' });
        }

        const { logActivity } = require('../audit/audit.service');
        if (req.user) {
            logActivity({
                userId: req.user.userId || req.user._id,
                username: req.user.username,
                action: 'UPDATE_MEDICINE',
                resource: 'Medicine',
                resourceId: medicine._id,
                details: `Updated medicine: ${medicine.name}`,
                ipAddress: req.ip
            });
        }

        res.json({ success: true, message: 'Medicine updated successfully', data: medicine });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete medicine (Soft delete)
const deleteMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findOneAndUpdate(
            { _id: req.params.id },
            { deleted: true },
            { new: true }
        );

        if (!medicine) {
            return res.status(404).json({ success: false, message: 'Medicine not found' });
        }

        const { logActivity } = require('../audit/audit.service');
        if (req.user) {
            logActivity({
                userId: req.user.userId || req.user._id,
                username: req.user.username,
                action: 'DELETE_MEDICINE',
                resource: 'Medicine',
                resourceId: medicine._id,
                details: `Deleted medicine: ${medicine.name}`,
                ipAddress: req.ip
            });
        }

        res.json({ success: true, message: 'Medicine deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createMedicine,
    getMedicines,
    getMedicineById,
    updateMedicine,
    deleteMedicine
};
