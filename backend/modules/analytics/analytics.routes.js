const express = require('express');
const router = express.Router();
const controller = require('./analytics.controller');
const { auth } = require('../../middleware/auth.middleware');

router.use(auth);

router.get('/heatmap', controller.getSalesHeatmap);
router.get('/velocity', controller.getHourlyVelocity);
router.get('/top-sellers', controller.getTopSellers);
router.get('/margins', controller.getMarginAnalysis);
router.get('/stock-velocity', controller.getStockVelocity);
router.get('/purchase-ratio', controller.getPurchaseSalesRatio);
router.get('/basket', controller.getBasketAnalysis);
router.get('/customer-behavior', controller.getCustomerBehavoir);
router.get('/performance', controller.getProductPerformance);

module.exports = router;
