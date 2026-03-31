import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

export async function createPaymentIntent(orderId: string, currency: string = 'mxn'): Promise<{ clientSecret: string }> {
    const response = await axios.post(`${API_URL}/stripe/create-payment-intent`, {
        orderId,
        currency,
    });
    return response.data;
}
