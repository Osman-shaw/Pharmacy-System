const Supplier = require('./supplier.model');
const Purchase = require('../purchase/purchase.model');

const createSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.create(req.body);
        res.status(201).json({ success: true, data: supplier });
    } catch (error) {
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: `Validation failed: ${errors.join(', ')}`
            });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

const getSuppliers = async (req, res) => {
    try {
        const { search, sort } = req.query;
        let query = { deleted: false };
        if (search) {
            query.$or = [
                { legalName: { $regex: search, $options: 'i' } },
                { contact: { $regex: search, $options: 'i' } },
                { tin: { $regex: search, $options: 'i' } }
            ];
        }

        let sortOption = { updatedAt: -1 };
        if (sort === 'name') sortOption = { legalName: 1 };
        if (sort === 'newest') sortOption = { createdAt: -1 };

        const suppliers = await Supplier.find(query).sort(sortOption);
        res.json({ success: true, data: suppliers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier || supplier.deleted) {
            return res.status(404).json({ success: false, message: 'Supplier not found' });
        }
        res.json({ success: true, data: supplier });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Supplier not found' });
        }
        res.json({ success: true, data: supplier });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(req.params.id, { deleted: true });
        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Supplier not found' });
        }
        res.json({ success: true, message: 'Supplier deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSupplierStats = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

        const purchases = await Purchase.find({
            $or: [
                { supplierName: supplier.legalName },
                { supplier: supplier._id } // In case we link them by ID later
            ]
        });

        const totalAmount = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
        const totalItems = purchases.reduce((sum, p) => sum + p.items.reduce((iSum, item) => iSum + item.quantity, 0), 0);

        res.json({
            success: true,
            data: {
                purchaseCount: purchases.length,
                totalAmount,
                totalItems,
                history: purchases
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createSupplier,
    getSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
    getSupplierStats
};
