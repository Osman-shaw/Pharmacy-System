const PaymentService = require('./payment.service');
const Sale = require('../sales/sale.model');

const processPayment = async (req, res) => {
    try {
        const { saleId, method, phoneNumber, amount } = req.body;

        // 1. Initiate Payment
        const paymentResponse = await PaymentService.initiatePayment({
            amount,
            method,
            phoneNumber
        });

        // 2. Update Sale record if saleId is provided
        if (saleId) {
            await Sale.findByIdAndUpdate(saleId, {
                paymentStatus: 'processing',
                transactionId: paymentResponse.transactionId,
                paymentMethod: method
            });
        }

        res.json({ success: true, data: paymentResponse });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const verifyPaymentHook = async (req, res) => { // Webhook or manual verify
    try {
        const { transactionId } = req.params;
        const status = await PaymentService.verifyPayment(transactionId);

        if (status.status === 'successful') {
            await Sale.findOneAndUpdate({ transactionId }, { paymentStatus: 'paid', synced: false }); // synced: false triggers RxDB push
        }

        res.json({ success: true, data: status });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { processPayment, verifyPaymentHook };
