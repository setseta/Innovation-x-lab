import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSubscriptionPrice,
  getSubscriptionStatus,
  getPlanLabel,
  isPremiumAccessAllowed,
} from '../subscriptionUtils.js';

test('monthly and annual pricing are calculated correctly', () => {
  assert.equal(calculateSubscriptionPrice('free', 'monthly'), 0);
  assert.equal(calculateSubscriptionPrice('premium', 'monthly'), 2);
  assert.equal(calculateSubscriptionPrice('premium', 'annual'), 20);
});

test('status is derived from dates and cancellation state', () => {
  const now = new Date('2026-07-15T12:00:00.000Z');
  const active = getSubscriptionStatus('active', new Date('2026-06-01T00:00:00.000Z'), new Date('2026-08-01T00:00:00.000Z'), now);
  const cancelled = getSubscriptionStatus('cancelled', new Date('2026-06-01T00:00:00.000Z'), new Date('2026-07-10T00:00:00.000Z'), now);
  const expired = getSubscriptionStatus('active', new Date('2026-05-01T00:00:00.000Z'), new Date('2026-06-01T00:00:00.000Z'), now);

  assert.equal(active, 'active');
  assert.equal(cancelled, 'cancelled');
  assert.equal(expired, 'expired');
});

test('premium access is allowed only for active premium memberships', () => {
  assert.equal(isPremiumAccessAllowed('free', 'active'), false);
  assert.equal(isPremiumAccessAllowed('premium', 'active'), true);
  assert.equal(isPremiumAccessAllowed('premium', 'cancelled'), false);
});

test('plan labels are consistent for admin reporting', () => {
  assert.equal(getPlanLabel('premium'), 'Premium');
  assert.equal(getPlanLabel('free'), 'Free');
});
