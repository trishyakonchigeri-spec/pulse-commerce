import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';

export const isStripeConfigured =
  process.env.STRIPE_SECRET_KEY &&
  process.env.STRIPE_SECRET_KEY.startsWith('sk_') &&
  process.env.STRIPE_SECRET_KEY !== 'sk_test_mock_pulse_commerce_key';

export const stripe = isStripeConfigured
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  : null;

export interface CreateCheckoutParams {
  orderId: string;
  orderNumber: string;
  items: {
    title: string;
    price: number;
    quantity: number;
    image?: string | null;
  }[];
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey?: string;
}

export async function createCheckoutSession(params: CreateCheckoutParams): Promise<{
  sessionId: string;
  url: string;
  isMock: boolean;
}> {
  if (isStripeConfigured && stripe) {
    const lineItems = params.items.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.title,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        customer_email: params.customerEmail,
        metadata: {
          orderId: params.orderId,
          orderNumber: params.orderNumber,
        },
      },
      params.idempotencyKey ? { idempotencyKey: params.idempotencyKey } : undefined
    );

    return {
      sessionId: session.id,
      url: session.url || params.successUrl,
      isMock: false,
    };
  }

  // Resilient Simulator Mode (For offline testing, local demo & interview presentations)
  const mockSessionId = `cs_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const mockSuccessUrl = `${params.successUrl}&mock_session=${mockSessionId}&order_id=${params.orderId}`;

  return {
    sessionId: mockSessionId,
    url: mockSuccessUrl,
    isMock: true,
  };
}
