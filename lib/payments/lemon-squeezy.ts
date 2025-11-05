// Lemon Squeezy integration
// Note: Using webhook-based approach as there's no official npm package

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
}

export const PLANS = {
  MONTHLY: {
    id: 'monthly',
    name: 'Monthly Subscription',
    price: 39,
    interval: 'month' as const,
  },
  RED_BUTTON: {
    id: 'red-button',
    name: 'Red Button (One-time)',
    price: 299,
    interval: 'month' as const, // One-time but stored as monthly for compatibility
  },
};

export async function createCheckout(planId: string, userId: string) {
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID!;
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY!;
  
  const plan = planId === 'monthly' ? PLANS.MONTHLY : PLANS.RED_BUTTON;
  
  // Create checkout via Lemon Squeezy API
  const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          product_options: {
            name: plan.name,
            description: `SoloLawyerOS ${plan.name}`,
            price: plan.price * 100, // Price in cents
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
            receipt_button_text: 'Return to Dashboard',
            receipt_link_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
            receipt_thank_you_note: 'Thank you for subscribing!',
          },
          checkout_options: {
            embed: false,
            media: false,
            logo: true,
            desc: true,
            discount: true,
            dark: false,
            subscription_preview: true,
            button_color: '#000000',
          },
          checkout_data: {
            email: userId, // Will be replaced with actual email
            custom: {
              user_id: userId,
              plan_id: planId,
            },
          },
          expires_at: null,
          preview: false,
          test_mode: process.env.NODE_ENV !== 'production',
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: storeId,
            },
          },
        },
      },
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create checkout');
  }
  
  const data = await response.json();
  return data.data.attributes.url;
}

export async function verifyWebhook(signature: string, body: string): Promise<boolean> {
  const secret = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_WEBHOOK_SECRET!;
  const crypto = await import('crypto');
  
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  const calculated = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculated)
  );
}

