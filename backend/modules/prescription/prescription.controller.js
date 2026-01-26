
const Prescription = require('./prescription.model');
const { logActivity } = require('../audit/audit.service');

/**
 * Create New Prescription
 * 
 * Records a new prescription entry with optional audio notes
 */
const createPrescription = async (req, res) => {
    try {
        const prescription = await Prescription.create({
            ...req.body,
            createdBy: req.user.userId || req.user._id
        });

        await logActivity({
            userId: req.user.userId || req.user._id,
            username: req.user.username,
            action: 'CREATE_PRESCRIPTION',
            resource: 'Prescription',
            resourceId: prescription._id,
            details: `Created prescription for ${req.body.patientName}`,
            ipAddress: req.ip
        });

        res.status(201).json({ success: true, data: prescription });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Get All Prescriptions
 * 
 * Retrieves prescriptions with pagination and filtering
 */
const getPrescriptions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = { deleted: false };
        if (req.query.status) query.status = req.query.status;
        if (req.query.patient) query.patient = req.query.patient;

        const prescriptions = await Prescription.find(query)
            .populate('patient', 'name phone email')
            .populate('medications.medicine', 'name price stock')
            .sort({ writtenDate: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Prescription.countDocuments(query);

        res.json({
            success: true,
            data: prescriptions,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Prescription by ID
 */
const getPrescriptionById = async (req, res) => {
    try {
        const prescription = await Prescription.findOne({ _id: req.params.id, deleted: false })
            .populate('patient')
            .populate('medications.medicine')
            .populate('createdBy', 'username');

        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }
        res.json({ success: true, data: prescription });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Prescription
 */
const updatePrescription = async (req, res) => {
    try {
        const prescription = await Prescription.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedBy: req.user.userId || req.user._id },
            { new: true }
        );

        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        await logActivity({
            userId: req.user.userId || req.user._id,
            username: req.user.username,
            action: 'UPDATE_PRESCRIPTION',
            resource: 'Prescription',
            resourceId: prescription._id,
            details: `Updated prescription status to ${prescription.status}`,
            ipAddress: req.ip
        });

        res.json({ success: true, data: prescription });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Delete Prescription (Soft Delete)
 */
const deletePrescription = async (req, res) => {
    try {
        const prescription = await Prescription.findByIdAndUpdate(
            req.params.id,
            { deleted: true, updatedBy: req.user.userId || req.user._id },
            { new: true }
        );

        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        await logActivity({
            userId: req.user.userId || req.user._id,
            username: req.user.username,
            action: 'DELETE_PRESCRIPTION',
            resource: 'Prescription',
            resourceId: prescription._id,
            details: 'Soft deleted prescription',
            ipAddress: req.ip
        });

        res.json({ success: true, message: 'Prescription deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createPrescription,
    getPrescriptions,
    getPrescriptionById,
    updatePrescription,
    deletePrescription
};
