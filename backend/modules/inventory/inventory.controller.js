/**
 * Inventory Controller
 * 
 * Manages pharmacy inventory including medicines and products
 * 
 * Key Responsibilities:
 * - Stock level management
 * - Expiry date tracking
 * - Low stock alerts
 * - Product CRUD operations
 */

const Product = require('./product.model');

/**
 * Get Inventory with Pagination
 * 
 * Retrieves all products with pagination support
 * 
 * @param {number} req.query.page - Page number (default: 1)
 * @param {number} req.query.limit - Items per page (default: 50)
 * 
 * @returns {Object} Products with pagination metadata
 * 
 * Why higher default limit (50 vs 20):
 * - Medicines list is frequently scanned/searched
 * - Pharmacists need to see more options at once
 * - Reduces number of page loads during busy periods
 * - Still manageable for browser performance
 */
const getInventory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50; // Higher limit for medicines
        const skip = (page - 1) * limit;

        const products = await Product.find()
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments();

        res.json({
            success: true,
            data: products,
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
 * Get Low Stock Items
 * 
 * Returns products below their reorder threshold
 * 
 * @returns {Array} Products with stock <= lowStockThreshold
 * 
 * Why individual thresholds:
 * - Different medicines have different demand patterns
 * - Critical medicines need higher safety stock
 * - Expensive items may have lower thresholds
 * - Flexible per-product configuration
 */
const getLowStock = async (req, res) => {
    try {
        const products = await Product.find({ stock: { $lte: 10 } }); // Threshold 10
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Add New Product
 * 
 * Creates a new product/medicine in inventory
 * 
 * @param {Object} req.body - Product data
 * @returns {Object} 201 - Created product
 * 
 * Includes audit logging for inventory changes
 */
const addProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);

        // Log inventory addition for audit trail
        const { logActivity } = require('../audit/audit.service');
        logActivity({
            userId: req.user.userId || req.user._id,
            username: req.user.username,
            action: 'CREATE_PRODUCT',
            resource: 'Product',
            resourceId: product._id,
            details: `Added product: ${product.name}`,
            ipAddress: req.ip
        });

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Get Notification Data
 * 
 * Retrieves critical alerts for dashboard
 * 
 * @returns {Object} Expiring items, low stock, and out of stock
 * 
 * Alert Categories:
 * 1. Expiring Soon (30 days) - Allows time for returns/discounts
 * 2. Low Stock - Based on individual thresholds
 * 3. Out of Stock (Critical) - Immediate attention needed
 * 
 * Why 30-day expiry window:
 * - Gives time to return to supplier (if possible)
 * - Allows for promotional pricing to move stock
 * - Meets regulatory requirements for disposal planning
 * - Prevents last-minute scrambling
 */
const getNotificationData = async (req, res) => {
    try {
        const today = new Date();
        const thirtyDaysLater = new Date(today);
        thirtyDaysLater.setDate(today.getDate() + 30);

        const fourteenDaysLater = new Date(today);
        fourteenDaysLater.setDate(today.getDate() + 14);

        // 1. Expiring soon (all expiring within 30 days)
        const expiring = await Product.find({
            expiryDate: { $lte: thirtyDaysLater, $gt: today },
            deleted: { $ne: true }
        }).select('name expiryDate stock');

        // 2. Low Stock (based on individual thresholds)
        // Using $expr to compare two fields in the same document
        const lowStock = await Product.find({
            $expr: { $lte: ["$stock", "$lowStockThreshold"] },
            stock: { $gt: 0 },
            deleted: { $ne: true }
        }).select('name stock lowStockThreshold isCritical');

        // 3. Out of Stock (focus on critical items)
        const outOfStock = await Product.find({
            stock: 0,
            isCritical: true,
            deleted: { $ne: true }
        }).select('name isCritical');

        res.json({
            success: true,
            data: {
                expiring,
                lowStock,
                outOfStock
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Product by ID
 * 
 * Retrieves detailed product information
 * 
 * @param {string} req.params.id - Product ID
 * @returns {Object} Complete product details
 */
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Product
 * 
 * Updates product information
 * Logs changes for audit trail
 */
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Log inventory update
        const { logActivity } = require('../audit/audit.service');
        logActivity({
            userId: req.user.userId || req.user._id,
            username: req.user.username,
            action: 'UPDATE_PRODUCT',
            resource: 'Product',
            resourceId: product._id,
            details: `Updated product: ${product.name}`,
            ipAddress: req.ip
        });

        res.json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Delete Product (Soft Delete)
 * 
 * Marks product as deleted without removing from database
 * 
 * Why soft delete:
 * - Preserves sales history references
 * - Maintains audit trail
 * - Allows recovery if deleted by mistake
 * - Regulatory compliance
 */
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { deleted: true },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Available Medicines
 * 
 * Returns only in-stock, non-deleted products
 * Used for POS and prescription filling
 */
const getAvailableMedicines = async (req, res) => {
    try {
        const products = await Product.find({
            stock: { $gt: 0 },
            deleted: { $ne: true }
        }).select('name genericName category dosageForm strength price stock');

        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getInventory,
    getLowStock,
    addProduct,
    getNotificationData,
    getProductById,
    updateProduct,
    deleteProduct,
    getAvailableMedicines
};
