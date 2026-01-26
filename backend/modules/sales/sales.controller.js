/**
 * Sales Controller
 * 
 * Handles point-of-sale transactions and sales history
 * 
 * Key Features:
 * - Atomic transactions (MongoDB sessions)
 * - Real-time inventory updates
 * - Audit logging for compliance
 * - Pagination for performance
 */

const Sale = require('./sale.model');
const Product = require('../inventory/product.model');

/**
 * Create Sale Transaction
 * 
 * Processes a sale with automatic inventory deduction
 * 
 * @param {Array} req.body.items - Products being sold
 * @param {string} req.body.paymentMethod - cash/mobile_money/credit
 * @param {string} req.body.customerName - Customer name (optional)
 * @param {string} req.body.cashierId - Cashier processing sale
 * 
 * @returns {Object} 201 - Created sale with invoice number
 * @returns {Object} 400 - Insufficient stock or validation error
 * 
 * Why MongoDB Transactions:
 * - Ensures atomicity: Either all operations succeed or all fail
 * - Prevents race conditions in inventory updates
 * - Maintains data consistency between sales and inventory
 * - Critical for financial accuracy
 * 
 * Transaction Flow:
 * 1. Start session and transaction
 * 2. Verify stock availability for all items
 * 3. Deduct stock from inventory
 * 4. Create sale record
 * 5. Commit transaction (or rollback on error)
 */
const createSale = async (req, res) => {
    // Start MongoDB session for transaction support
    const session = await Sale.startSession();
    session.startTransaction();

    try {
        const { items, paymentMethod, customerName, cashierId } = req.body;

        // Calculate total and verify stock availability
        let totalAmount = 0;
        const enrichedItems = [];

        // Process each item in the sale
        for (const item of items) {
            // Lock product document within transaction
            const product = await Product.findById(item.product).session(session);

            // Verify stock availability before proceeding
            if (!product || product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${item.name}`);
            }

            // Deduct stock atomically within transaction
            product.stock -= item.quantity;
            await product.save({ session });

            // Calculate pricing and profit
            const itemPrice = item.price || product.price;
            const itemCost = product.costPrice || 0;
            const subtotal = itemPrice * item.quantity;

            enrichedItems.push({
                product: item.product,
                name: item.name || product.name,
                quantity: item.quantity,
                price: itemPrice,
                costPrice: itemCost, // For profit calculation
                subtotal: subtotal
            });

            totalAmount += subtotal;
        }

        // Create sale record within transaction
        const sale = await Sale.create([{
            items: enrichedItems,
            totalAmount,
            paymentMethod,
            customerName,
            type: req.body.type || 'OTC', // Over-the-counter by default
            cashier: cashierId || req.user.userId || req.user._id
        }], { session });

        // Commit transaction - all changes are now permanent
        await session.commitTransaction();
        session.endSession();

        // Log the sale activity for audit trail
        const { logActivity } = require('../audit/audit.service');
        logActivity({
            userId: req.user.userId || req.user._id,
            username: req.user.username,
            action: 'CREATE_SALE',
            resource: 'Sale',
            resourceId: sale[0]._id,
            details: `Created sale for ${customerName} - Total: ${totalAmount}`,
            ipAddress: req.ip
        });

        res.status(201).json({ success: true, data: sale[0] });
    } catch (error) {
        // Rollback transaction on any error
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Get Sales with Pagination
 * 
 * Retrieves sales history with pagination for performance
 * 
 * @param {number} req.query.page - Page number (default: 1)
 * @param {number} req.query.limit - Items per page (default: 20)
 * 
 * @returns {Object} Sales data with pagination metadata
 * 
 * Why Pagination:
 * - Prevents loading thousands of records at once
 * - Improves response time and reduces memory usage
 * - Better user experience (faster page loads)
 * - Reduces database load
 * 
 * Default limit of 20:
 * - Balance between data completeness and performance
 * - Typical screen can show 10-20 rows comfortably
 * - Allows for quick scrolling without overwhelming UI
 */
const getSales = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const sales = await Sale.find()
            .populate('cashier', 'fullName') // Include cashier name
            .sort({ date: -1 }) // Newest first
            .skip(skip)
            .limit(limit);

        const total = await Sale.countDocuments();

        res.json({
            success: true,
            data: sales,
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
 * Get Single Sale by ID
 * 
 * Retrieves detailed sale information for viewing/printing
 * 
 * @param {string} req.params.id - Sale ID
 * @returns {Object} Complete sale details with populated references
 */
const getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id)
            .populate('cashier', 'fullName username');

        if (!sale) {
            return res.status(404).json({ success: false, message: 'Sale not found' });
        }

        res.json({ success: true, data: sale });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete Sale (Soft Delete)
 * 
 * Marks sale as deleted without removing from database
 * 
 * Why soft delete:
 * - Maintains audit trail for accounting
 * - Allows recovery if deleted by mistake
 * - Preserves historical data for reports
 * - Regulatory compliance (7-year record retention)
 */
const deleteSale = async (req, res) => {
    try {
        const sale = await Sale.findByIdAndUpdate(
            req.params.id,
            { deleted: true },
            { new: true }
        );

        if (!sale) {
            return res.status(404).json({ success: false, message: 'Sale not found' });
        }

        res.json({ success: true, message: 'Sale deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createSale,
    getSales,
    getSaleById,
    deleteSale
};
