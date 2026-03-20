import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

export async function createPaymentIntent(amount: number, currency: string, orderId?: string): Promise<{ clientSecret: string }> {
    const response = await axios.post(`${API_URL}/stripe/create-payment-intent`, {
        amount,
        currency,
        orderId,
    });
    return response.data;
}
