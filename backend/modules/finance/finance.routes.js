const express = require('express');
const router = express.Router();
const FinanceController = require('./finance.controller');
const { auth } = require('../../middleware/auth.middleware');

router.use(auth);

router.post('/expenses', FinanceController.addExpense);
router.get('/expenses', FinanceController.getExpenses);
router.get('/expenses/:id', FinanceController.getExpenseById);
router.put('/expenses/:id', FinanceController.updateExpense);
router.delete('/expenses/:id', FinanceController.deleteExpense);
router.get('/pnl', FinanceController.getPnLReport);
router.post('/pnl/lock', FinanceController.lockPeriod);
router.get('/pnl/trends', FinanceController.getHistoricalTrends);
router.get('/report', FinanceController.getFinancialReport);

module.exports = router;
