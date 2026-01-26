const Sale = require('../sales/sale.model');
const Product = require('../inventory/product.model');
const Purchase = require('../purchase/purchase.model'); // For Purchase to Sales ratio

// 1. Customer Analysis (Simplified - just list unique customers or top spenders)
exports.getCustomerBehavoir = async (req, res) => {
    try {
        const behavior = await Sale.aggregate([
            {
                $group: {
                    _id: "$customerName",
                    totalSpent: { $sum: "$totalAmount" },
                    transactionCount: { $sum: 1 },
                    avgBasketSize: { $avg: { $size: "$items" } }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 100 }
        ]);
        res.json(behavior);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Heatmap: Day of Week & Hour
exports.getSalesHeatmap = async (req, res) => {
    try {
        const heatmap = await Sale.aggregate([
            {
                $project: {
                    dayOfWeek: { $dayOfWeek: "$date" },
                    hour: { $hour: "$date" },
                    totalAmount: 1
                }
            },
            {
                $group: {
                    _id: { day: "$dayOfWeek", hour: "$hour" },
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            }
        ]);
        res.json(heatmap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Hourly Sales Velocity (Recent trend)
exports.getHourlyVelocity = async (req, res) => {
    try {
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const velocity = await Sale.aggregate([
            { $match: { date: { $gte: last24Hours } } },
            {
                $project: {
                    hour: { $hour: "$date" },
                    totalAmount: 1
                }
            },
            {
                $group: {
                    _id: "$hour",
                    revenue: { $sum: "$totalAmount" },
                    salesCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.json(velocity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Top Sellers (20-50 products)
exports.getTopSellers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const topSellers = await Sale.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    name: { $first: "$items.name" },
                    totalQuantity: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: "$items.subtotal" },
                    totalProfit: { $sum: { $subtract: ["$items.subtotal", { $multiply: ["$items.costPrice", "$items.quantity"] }] } }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: limit }
        ]);
        res.json(topSellers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Profit Margin Analysis
exports.getMarginAnalysis = async (req, res) => {
    try {
        const margins = await Sale.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.name",
                    revenue: { $sum: "$items.subtotal" },
                    cost: { $sum: { $multiply: ["$items.costPrice", "$items.quantity"] } }
                }
            },
            {
                $project: {
                    name: "$_id",
                    revenue: 1,
                    cost: 1,
                    profit: { $subtract: ["$revenue", "$cost"] },
                    margin: {
                        $cond: [
                            { $eq: ["$revenue", 0] },
                            0,
                            { $multiply: [{ $divide: [{ $subtract: ["$revenue", "$cost"] }, "$revenue"] }, 100] }
                        ]
                    }
                }
            },
            { $sort: { margin: -1 } }
        ]);
        res.json(margins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. Dead & Slow Stocks (30, 60, 90 days)
exports.getStockVelocity = async (req, res) => {
    try {
        const now = new Date();
        const days30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const days60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        const days90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

        const products = await Product.find({ deleted: false });

        const saleMetrics = await Sale.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    lastSale: { $max: "$date" },
                    totalQty30: { $sum: { $cond: [{ $gte: ["$date", days30] }, "$items.quantity", 0] } },
                    totalQty60: { $sum: { $cond: [{ $gte: ["$date", days60] }, "$items.quantity", 0] } },
                    totalQty90: { $sum: { $cond: [{ $gte: ["$date", days90] }, "$items.quantity", 0] } }
                }
            }
        ]);

        const metricsMap = new Map(saleMetrics.map(m => [m._id.toString(), m]));

        const results = products.map(p => {
            const m = metricsMap.get(p._id.toString());
            return {
                id: p._id,
                name: p.name,
                stock: p.stock,
                lastSale: m ? m.lastSale : null,
                sales30: m ? m.totalQty30 : 0,
                sales60: m ? m.totalQty60 : 0,
                sales90: m ? m.totalQty90 : 0,
                status: !m || m.lastSale < days90 ? 'dead' : (m.totalQty30 === 0 ? 'slow' : 'active')
            };
        });

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 7. Purchase to Sales Ratio
exports.getPurchaseSalesRatio = async (req, res) => {
    try {
        const sales = await Sale.aggregate([
            { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$date" } }, total: { $sum: "$totalAmount" } } }
        ]);
        const purchases = await Purchase.aggregate([
            { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$date" } }, total: { $sum: "$totalAmount" } } }
        ]);

        res.json({ sales, purchases });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 8. Basket Analysis (Co-occurrence)
exports.getBasketAnalysis = async (req, res) => {
    try {
        const transactions = await Sale.find({ deleted: false }).select('items.name');
        const pairs = {};

        transactions.forEach(tx => {
            const items = tx.items.map(i => i.name);
            for (let i = 0; i < items.length; i++) {
                for (let j = i + 1; j < items.length; j++) {
                    const pair = [items[i], items[j]].sort().join(' + ');
                    pairs[pair] = (pairs[pair] || 0) + 1;
                }
            }
        });

        const sortedPairs = Object.entries(pairs)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 50)
            .map(([pair, count]) => ({ pair, count }));

        res.json(sortedPairs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 9. Product Performance Metrics (Complex scorecard)
exports.getProductPerformance = async (req, res) => {
    try {
        const performance = await Sale.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    name: { $first: "$items.name" },
                    revenue: { $sum: "$items.subtotal" },
                    quantity: { $sum: "$items.quantity" },
                    transactions: { $addToSet: "$_id" }
                }
            },
            {
                $project: {
                    name: 1,
                    revenue: 1,
                    quantity: 1,
                    transactionCount: { $size: "$transactions" },
                    avgValuePerSale: { $divide: ["$revenue", { $size: "$transactions" }] }
                }
            },
            { $sort: { revenue: -1 } }
        ]);
        res.json(performance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
