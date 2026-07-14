export const PLAN_PRICES = {
  free: { monthly: 0, annual: 0 },
  premium: { monthly: 2, annual: 20 },
};

export const PAYMENT_PROVIDERS = [
  'Stripe',
  'PayPal',
  'PayFast',
  'Yoco',
  'Peach Payments',
  'Paystack',
];

export const SUBSCRIPTION_STATUSES = ['active', 'cancelled', 'expired', 'pending'];

export const calculateSubscriptionPrice = (plan, billingCycle) => {
  if (plan === 'premium') {
    return billingCycle === 'annual' ? PLAN_PRICES.premium.annual : PLAN_PRICES.premium.monthly;
  }
  return 0;
};

export const getSubscriptionStatus = (subscriptionStatus, startDate, endDate, currentDate = new Date()) => {
  const normalizedStatus = subscriptionStatus || 'pending';
  if (normalizedStatus === 'cancelled') {
    return 'cancelled';
  }
  if (normalizedStatus === 'expired' || (endDate && new Date(endDate) <= currentDate)) {
    return 'expired';
  }
  if (normalizedStatus === 'active') {
    return 'active';
  }
  if (normalizedStatus === 'pending') {
    return 'pending';
  }
  return normalizedStatus;
};

export const isPremiumAccessAllowed = (plan, status) => plan === 'premium' && status === 'active';

export const getPlanLabel = (plan) => (plan === 'premium' ? 'Premium' : 'Free');

export const getSubscriptionSummary = (user) => {
  const plan = user?.membershipPlan || user?.subscriptionPlan || 'free';
  const status = getSubscriptionStatus(user?.subscriptionStatus, user?.subscriptionStartDate, user?.subscriptionEndDate);
  const billingCycle = user?.billingCycle || 'monthly';
  return {
    plan,
    status,
    price: calculateSubscriptionPrice(plan, billingCycle),
    billingCycle,
  };
};
