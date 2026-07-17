import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPayPalOrderPayload, getPayPalConfig } from '../paypalUtils.js';

test('buildPayPalOrderPayload includes approval details for premium checkout', () => {
  const payload = buildPayPalOrderPayload({
    plan: 'premium',
    billingCycle: 'monthly',
    amount: 2,
    currency: 'USD',
    returnUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel',
  });

  assert.equal(payload.intent, 'CAPTURE');
  assert.equal(payload.purchase_units[0].amount.value, '2.00');
  assert.equal(payload.application_context.return_url, 'https://example.com/success');
  assert.equal(payload.application_context.cancel_url, 'https://example.com/cancel');
});

test('getPayPalConfig falls back to sandbox settings when no explicit mode is provided', () => {
  const config = getPayPalConfig({ PAYPAL_CLIENT_ID: 'client', PAYPAL_CLIENT_SECRET: 'secret' });

  assert.equal(config.mode, 'sandbox');
  assert.equal(config.clientId, 'client');
  assert.equal(config.clientSecret, 'secret');
});
