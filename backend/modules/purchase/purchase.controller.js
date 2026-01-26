const Purchase = require('./purchase.model');
const Product = require('../inventory/product.model');

const createPurchase = async (req, res) => {
    try {
        const purchase = await Purchase.create(req.body);
        res.status(201).json({ success: true, data: purchase });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getPurchases = async (req, res) => {
    try {
        const { search, sort, order } = req.query;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { purchaseId: { $regex: search, $options: 'i' } },
                    { supplierName: { $regex: search, $options: 'i' } }
                ]
            };
        }

        let sortOption = { createdAt: -1 };
        if (sort) {
            sortOption = { [sort]: order === 'desc' ? -1 : 1 };
        }

        const purchases = await Purchase.find(query).sort(sortOption);
        res.json({ success: true, data: purchases });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getPurchaseById = async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id).populate('items.product');
        if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found' });
        res.json({ success: true, data: purchase });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updatePurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found' });
        res.json({ success: true, data: purchase });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deletePurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findByIdAndDelete(req.params.id);
        if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found' });
        res.json({ success: true, message: 'Purchase deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const receivePurchase = async (req, res) => {
    const session = await Purchase.startSession();
    session.startTransaction();
    try {
        const purchase = await Purchase.findById(req.params.id).session(session);
        if (!purchase) throw new Error('Purchase not found');
        if (purchase.status === 'received') throw new Error('Already received');

        for (const item of purchase.items) {
            const product = await Product.findById(item.product).session(session);
            if (product) {
                product.stock += item.quantity;
                product.costPrice = item.unitPrice;
                product.batchNumber = item.batchNumber; // Update current batch? Or track batches separate?
                // In this unified model, we update the main fields.
                await product.save({ session });
            }
        }

        purchase.status = 'received';
        await purchase.save({ session });
        await session.commitTransaction();
        res.json({ success: true, message: 'Stock updated and purchase received' });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};

module.exports = {
    createPurchase,
    getPurchases,
    getPurchaseById,
    updatePurchase,
    deletePurchase,
    receivePurchase
};
