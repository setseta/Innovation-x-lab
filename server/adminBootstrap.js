import bcrypt from 'bcryptjs';

export const syncAdminAccount = async ({ User, adminEmail, adminPassword, logger = console }) => {
  const normalizedEmail = String(adminEmail || '').toLowerCase().trim();
  if (!normalizedEmail) {
    return null;
  }

  const password = String(adminPassword || '');
  const passwordHash = await bcrypt.hash(password, 10);
  const existingAdmin = await User.findOne({ email: normalizedEmail });

  if (!existingAdmin) {
    await User.create({
      name: 'Admin',
      email: normalizedEmail,
      password: passwordHash,
      role: 'admin',
      membershipPlan: 'free',
      subscriptionPlan: 'free',
      subscriptionStatus: 'active',
      newsletterPreference: 'free',
      billingCycle: 'monthly',
      paymentProvider: '',
    });
    logger.log('Admin account created');
    return;
  }

  const passwordNeedsRefresh = !(await bcrypt.compare(password, existingAdmin.password));
  const roleNeedsRefresh = existingAdmin.role !== 'admin';
  const nameNeedsRefresh = existingAdmin.name !== 'Admin';

  if (passwordNeedsRefresh || roleNeedsRefresh || nameNeedsRefresh) {
    await User.findByIdAndUpdate(existingAdmin._id, {
      name: 'Admin',
      email: normalizedEmail,
      password: passwordHash,
      role: 'admin',
    }, { new: true });
    logger.log('Admin account synced');
  }
};
