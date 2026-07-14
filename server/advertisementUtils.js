export const isAdvertisementActive = (advertisement, now = new Date()) => {
  if (!advertisement?.active) {
    return false;
  }

  const startDate = advertisement.startDate ? new Date(advertisement.startDate) : null;
  const endDate = advertisement.endDate ? new Date(advertisement.endDate) : null;
  const currentTime = new Date(now);

  if (startDate && currentTime < startDate) {
    return false;
  }

  if (endDate && currentTime > endDate) {
    return false;
  }

  return true;
};
