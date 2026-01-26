const Expense = require('./expense.model');
const Sale = require('../sales/sale.model');
const Purchase = require('../purchase/purchase.model');
const PLReport = require('./pl-report.model');
const mongoose = require('mongoose');

const addExpense = async (req, res) => {
    try {
        const expense = await Expense.create({
            ...req.body,
            recordedBy: req.user._id
        });
        res.status(201).json({ success: true, data: expense });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getExpenses = async (req, res) => {
    try {
        const { search, category, startDate, endDate } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { subcategory: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = category;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const expenses = await Expense.find(query)
            .populate('recordedBy', 'fullName username')
            .sort({ date: -1 });

        res.json({ success: true, data: expenses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id).populate('recordedBy', 'fullName username');
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        res.json({ success: true, data: expense });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        res.json({ success: true, data: expense });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        res.json({ success: true, message: 'Expense deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getFinancialReport = async (req, res) => {
    try {
        // ... (Revenue logic stays the same or can be enhanced later)
        const sales = await Sale.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }]);
        const expenses = await Expense.aggregate([{ $group: { _id: null, totalExpenses: { $sum: '$amount' } } }]);

        res.json({
            success: true,
            data: {
                revenue: sales[0]?.totalRevenue || 0,
                expenses: expenses[0]?.totalExpenses || 0,
                profit: (sales[0]?.totalRevenue || 0) - (expenses[0]?.totalExpenses || 0)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getPnLReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) return res.status(400).json({ success: false, message: 'Month and Year are required' });

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // check if a locked report exists
        const periodKey = `${month.padStart(2, '0')}-${year}`;
        const lockedReport = await PLReport.findOne({ period: periodKey, isLocked: true })
            .populate('lockedBy', 'fullName username');

        if (lockedReport) return res.json({ success: true, data: lockedReport, isHistorical: true });

        // Aggregate Revenue
        const revenueData = await Sale.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate }, deleted: false, paymentStatus: 'paid' } },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        const rxRevenue = revenueData.find(r => r._id === 'Rx')?.total || 0;
        const otcRevenue = revenueData.find(r => r._id === 'OTC')?.total || 0;
        const serviceRevenue = revenueData.find(r => r._id === 'Service')?.total || 0;
        const totalRevenue = rxRevenue + otcRevenue + serviceRevenue;

        // Aggregate OpEx
        const opexData = await Expense.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const opex = {
            energy: opexData.find(o => o._id === 'Energy & Utilities')?.total || 0,
            inventorySupply: opexData.find(o => o._id === 'Inventory & Supply Costs')?.total || 0,
            regulatory: opexData.find(o => o._id === 'Regulatory & Compliance')?.total || 0,
            hr: opexData.find(o => o._id === 'Human Resources')?.total || 0,
            facility: opexData.find(o => o._id === 'Facility & Administrative')?.total || 0
        };
        opex.total = Object.values(opex).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);

        // Aggregate COGS (Simplified for now based on purchases in period)
        const purchasesInPeriod = await Purchase.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate }, status: 'received' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' }, discount: { $sum: '$discount' } } }
        ]);

        const purchaseCost = purchasesInPeriod[0]?.total || 0;
        const rebates = purchasesInPeriod[0]?.discount || 0;
        const cogsTotal = purchaseCost - rebates;

        // Gap Adjustments (DIR Fees provision ~5% of Rx revenue as placeholder)
        const dirFees = rxRevenue * 0.05;
        const adjustmentsTotal = dirFees;

        const grossProfit = totalRevenue - cogsTotal;
        const netIncome = grossProfit - opex.total - adjustmentsTotal;

        const reportData = {
            period: periodKey,
            revenue: { rx: rxRevenue, otc: otcRevenue, service: serviceRevenue, total: totalRevenue },
            cogs: { purchaseCost, rebates, total: cogsTotal },
            opex,
            adjustments: { dirFees, total: adjustmentsTotal },
            grossProfit,
            netIncome,
            margins: {
                rx: rxRevenue ? ((rxRevenue - (cogsTotal * 0.7)) / rxRevenue) * 100 : 0,
                otc: otcRevenue ? ((otcRevenue - (cogsTotal * 0.3)) / otcRevenue) * 100 : 0,
                overall: totalRevenue ? (grossProfit / totalRevenue) * 100 : 0
            }
        };

        res.json({ success: true, data: reportData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const lockPeriod = async (req, res) => {
    try {
        const { period, data } = req.body;
        const report = await PLReport.findOneAndUpdate(
            { period },
            {
                ...data,
                isLocked: true,
                lockedAt: new Date(),
                lockedBy: req.user._id
            },
            { upsert: true, new: true }
        );
        res.json({ success: true, data: report });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getHistoricalTrends = async (req, res) => {
    try {
        // Fetch last 12-24 months of data
        const trends = await PLReport.find({ isLocked: true })
            .sort({ period: -1 })
            .limit(24);
        res.json({ success: true, data: trends });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    addExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getFinancialReport,
    getPnLReport,
    lockPeriod,
    getHistoricalTrends
};
