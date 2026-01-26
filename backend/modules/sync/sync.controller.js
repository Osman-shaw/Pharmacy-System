const mongoose = require('mongoose');

// Helper to get model by collection name
const getModel = (collection) => {
    switch (collection) {
        case 'products': return require('../inventory/product.model');
        case 'sales': return require('../sales/sale.model');
        case 'customers': return require('../customer/customer.model');
        case 'users': return require('../user/user.model');
        // Add others as needed
        default: throw new Error(`Unknown collection: ${collection}`);
    }
};

const SyncController = {
    pull: async (req, res) => {
        try {
            const { lastPulledAt, collection, storeId } = req.query; // e.g. ?lastPulledAt=0&collection=products&storeId=store_1

            if (!collection) return res.status(400).json({ success: false, message: 'Collection required' });

            const Model = getModel(collection);
            const query = {
                updatedAt: { $gt: new Date(parseInt(lastPulledAt) || 0) }
            };

            // If storeId is provided, filter by it (or 'main' for global data like products)
            // Strategy: Products might be global 'main', Sales are store-specific.
            // For now, simple logic: if model has storeId, match it OR return 'main' if it's shared data.
            // Let's assume Products are shared (storeId='main') mostly, but local stock updates might differ.
            // Simplified: return everything newer than timestamp.

            const documents = await Model.find(query);

            res.json({
                documents: documents.map(doc => ({
                    ...doc.toObject(),
                    _deleted: doc.deleted // RxDB expects _deleted boolean
                })),
                hasMoreDocuments: false // Pagination could be added here
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    push: async (req, res) => {
        try {
            const { collection } = req.body; // { collection: 'products', documents: [...] }
            const documents = req.body.documents || [];

            if (!collection) return res.status(400).json({ success: false, message: 'Collection required' });

            const Model = getModel(collection);
            const conflicts = [];

            for (const doc of documents) {
                try {
                    // Check for conflict
                    const existing = await Model.findById(doc._id); // RxDB uses _id string usually, MongoDB ObjectId. Ensure Frontend generates conformant IDs.

                    if (existing && existing.updatedAt > new Date(doc.updatedAt)) {
                        conflicts.push(existing);
                    } else {
                        // Upsert
                        await Model.findByIdAndUpdate(doc._id, {
                            ...doc,
                            updatedAt: new Date() // Server time is truth
                        }, { upsert: true, new: true });
                    }
                } catch (err) {
                    console.error('Sync Error on doc:', doc, err);
                }
            }

            res.json({ conflicts });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = SyncController;
