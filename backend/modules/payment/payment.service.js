const axios = require('axios');

// Mock Monime API URL - User should update this in .env
const MONIME_API_URL = process.env.MONIME_API_URL || 'https://api.monime.com/v1';
const MONIME_API_KEY = process.env.MONIME_API_KEY || 'your-api-key';

const PaymentService = {
    /**
     * Initiate a payment request
     * @param {Object} paymentDetails { amount, currency, method, phoneNumber, payerName }
     */
    async initiatePayment(paymentDetails) {
        const { amount, method, phoneNumber } = paymentDetails;

        let endpoint = '';
        let payload = {};

        switch (method) {
            case 'orange_money':
                endpoint = '/orange-money/payment';
                payload = { amount, phone: phoneNumber, provider: 'orange' };
                break;
            case 'afrimoney':
                endpoint = '/afrimoney/payment';
                payload = { amount, phone: phoneNumber, provider: 'africell' };
                break;
            case 'bank_transfer':
                endpoint = '/bank/transfer';
                // For bank transfer, we might just generate a reference code for the user
                return {
                    status: 'pending',
                    instruction: 'Please transfer to Account X using Reference Y',
                    transactionId: `BANK-${Date.now()}`
                };
            default:
                throw new Error('Unsupported payment method');
        }

        try {
            // Uncomment execution when real API is available
            /* 
            const response = await axios.post(`${MONIME_API_URL}${endpoint}`, payload, {
                headers: { 'Authorization': `Bearer ${MONIME_API_KEY}` }
            });
            return response.data;
            */

            // Mock Response for Demo
            return {
                transactionId: `TXN-${Date.now()}`,
                status: 'pending',
                gatewayReference: `MONIME-${Math.floor(Math.random() * 10000)}`,
                message: `Payment initiated on ${method} for ${phoneNumber}`
            };

        } catch (error) {
            throw new Error(`Payment Gateway Error: ${error.message}`);
        }
    },

    /**
     * Verify payment status
     * @param {String} transactionId 
     */
    async verifyPayment(transactionId) {
        try {
            // const response = await axios.get(`${MONIME_API_URL}/transactions/${transactionId}`);
            // return response.data;

            // Mock Success
            return {
                transactionId,
                status: 'successful',
                amount: 100,
                currency: 'SLE'
            };
        } catch (error) {
            throw new Error(`Verification Error: ${error.message}`);
        }
    }
};

module.exports = PaymentService;
