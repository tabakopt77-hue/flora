interface PaymentResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}

export const paymentService = {
    processPayment: async (orderId: string, amount: number, method: string): Promise<PaymentResult> => {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate bank processing

        // Simulate success for demo
        return {
            success: true,
            transactionId: `tx_${Math.random().toString(36).substr(2, 12).toUpperCase()}`
        };
    }
};
