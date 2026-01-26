const PaymentService = require('../../modules/payment/payment.service');

describe('PaymentService', () => {
    // Mock axios to avoid real network calls if PaymentService uses it directly, 
    // but based on previous view, it had commented out axios calls and returned mock data.
    // So we can test the mock logic directly for now.

    it('initiates orange_money payment correctly', async () => {
        const result = await PaymentService.initiatePayment({
            amount: 100,
            method: 'orange_money',
            phoneNumber: '+23277123456'
        });
        expect(result.status).toBe('pending');
        expect(result.transactionId).toBeDefined();
    });

    it('initiates afrimoney payment correctly', async () => {
        const result = await PaymentService.initiatePayment({
            amount: 200,
            method: 'afrimoney',
            phoneNumber: '+23288123456'
        });
        expect(result.status).toBe('pending');
        expect(result.transactionId).toBeDefined();
    });

    it('throws error for unsupported method', async () => {
        await expect(PaymentService.initiatePayment({
            amount: 100,
            method: 'bitcoin',
            phoneNumber: '123'
        })).rejects.toThrow('Unsupported payment method');
    });
});
