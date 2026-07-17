export const getAdvertisementStatus = (advertisement, now = new Date()) => {
  if (!advertisement?.active) {
    return 'Paused';
  }

  const startDate = advertisement.startDate ? new Date(advertisement.startDate) : null;
  const endDate = advertisement.endDate ? new Date(advertisement.endDate) : null;
  const currentTime = new Date(now);

  if (startDate && currentTime < startDate) {
    return 'Scheduled';
  }

  if (endDate && currentTime > endDate) {
    return 'Expired';
  }

  return 'Active';
};

export const isAdvertisementActive = (advertisement, now = new Date()) => {
  return getAdvertisementStatus(advertisement, now) === 'Active';
};
