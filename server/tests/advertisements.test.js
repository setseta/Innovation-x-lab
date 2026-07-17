import test from 'node:test';
import assert from 'node:assert/strict';
import { getAdvertisementStatus, isAdvertisementActive } from '../advertisementUtils.js';

test('returns true for active advertisements within the date window', () => {
  const now = new Date('2026-07-15T12:00:00.000Z');
  const ad = {
    active: true,
    startDate: '2026-07-01T00:00:00.000Z',
    endDate: '2026-07-31T00:00:00.000Z',
  };

  assert.equal(isAdvertisementActive(ad, now), true);
});

test('returns scheduled status for campaigns that have not started yet', () => {
  const now = new Date('2026-06-20T12:00:00.000Z');
  const ad = {
    active: true,
    startDate: '2026-07-01T00:00:00.000Z',
    endDate: '2026-07-31T00:00:00.000Z',
  };

  assert.equal(getAdvertisementStatus(ad, now), 'Scheduled');
  assert.equal(isAdvertisementActive(ad, now), false);
});

test('returns false for inactive or expired advertisements', () => {
  const now = new Date('2026-08-01T12:00:00.000Z');
  const inactiveAd = {
    active: false,
    startDate: '2026-07-01T00:00:00.000Z',
    endDate: '2026-07-31T00:00:00.000Z',
  };
  const expiredAd = {
    active: true,
    startDate: '2026-07-01T00:00:00.000Z',
    endDate: '2026-07-31T00:00:00.000Z',
  };

  assert.equal(isAdvertisementActive(inactiveAd, now), false);
  assert.equal(isAdvertisementActive(expiredAd, now), false);
});
