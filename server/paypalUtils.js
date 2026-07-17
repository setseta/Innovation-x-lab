const normalizeAmount = (value) => Number(value || 0).toFixed(2);

export const getPayPalConfig = (env = process.env) => {
  const clientId = env.PAYPAL_CLIENT_ID || env.CLIENT_ID || '';
  const clientSecret = env.PAYPAL_CLIENT_SECRET || env.CLIENT_SECRET || '';
  const mode = env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox';
  const baseUrl = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

  return {
    clientId,
    clientSecret,
    mode,
    baseUrl,
  };
};

export const buildPayPalOrderPayload = ({
  plan,
  billingCycle,
  amount,
  currency = 'USD',
  returnUrl,
  cancelUrl,
}) => ({
  intent: 'CAPTURE',
  purchase_units: [
    {
      reference_id: `${plan}-${billingCycle}`,
      description: `Innovation X Premium ${billingCycle} membership`,
      amount: {
        currency_code: currency,
        value: normalizeAmount(amount),
      },
    },
  ],
  application_context: {
    brand_name: 'Innovation X Lab',
    landing_page: 'LOGIN',
    user_action: 'PAY_NOW',
    return_url: returnUrl,
    cancel_url: cancelUrl,
  },
});
