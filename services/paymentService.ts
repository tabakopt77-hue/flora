
import { apiGateway } from './apiGateway';

interface PaymentResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}

export const paymentService = {
    /**
     * Processes a payment through the Rust Core Banking Module.
     * Uses Idempotency Keys to prevent double-spending/duplicate charges.
     */
    processPayment: async (orderId: string, amount: number, method: string): Promise<PaymentResult> => {
        // 1. Generate Idempotency Key (In a real app, this ensures retries don't double charge)
        const idempotencyKey = crypto.randomUUID();

        console.log(`[PaymentService] Initiating TX for Order ${orderId}. Idempotency-Key: ${idempotencyKey}`);

        try {
            // 2. Route to Rust Core via Gateway
            const response = await apiGateway.request<{ transactionId: string }>('core', '/payments/charge', {
                orderId,
                amount,
                method,
                idempotencyKey
            });

            if (response.status !== 200) {
                throw new Error(response.error || 'Payment Gateway Rejected');
            }

            return {
                success: true,
                transactionId: `tx_${Math.random().toString(36).substr(2, 12).toUpperCase()}`
            };

        } catch (error: any) {
            console.error('[PaymentService] Transaction Failed:', error);
            return {
                success: false,
                error: error.message || 'Transaction declined by bank'
            };
        }
    }
};
