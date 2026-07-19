import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import nodemailer from 'nodemailer';
import { v2 as cloudinary } from 'cloudinary';
import { isAdvertisementActive } from './advertisementUtils.js';
import { syncAdminAccount } from './adminBootstrap.js';
import {
  PAYMENT_PROVIDERS,
  SUBSCRIPTION_STATUSES,
  calculateSubscriptionPrice,
  getPlanLabel,
  getSubscriptionStatus,
  getSubscriptionSummary,
  isPremiumAccessAllowed,
} from './subscriptionUtils.js';
import { buildPayPalOrderPayload, getPayPalConfig } from './paypalUtils.js';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/innovationxlab';
const JWT_SECRET = process.env.JWT_SECRET || 'innovationxlab-secret';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@innovationxlab.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123456';
const EMAIL_FROM = process.env.EMAIL_FROM || ADMIN_EMAIL;
const EMAIL_HOST = process.env.EMAIL_HOST || '';
const EMAIL_PORT = Number(process.env.EMAIL_PORT || 587);
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const FRONTEND_BASE_URL = (process.env.CLIENT_URL || process.env.FRONTEND_URL || process.env.PUBLIC_URL || 'http://localhost:5173').replace(/\/$/, '');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'e4cjpp5k',
  api_key: process.env.CLOUDINARY_API_KEY || '487174522247335',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'hOdi_Gf__tSbe6T22egIihrekcI',
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const normalizeEmail = (email) => String(email || '').toLowerCase().trim();
const requireDatabase = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database temporarily unavailable. Please try again later.' });
  }
  next();
};

app.use('/api', (req, res, next) => {
  if (req.path === '/health') {
    return next();
  }
  return requireDatabase(req, res, next);
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  country: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'user', 'FREE_MEMBER', 'PREMIUM_MEMBER'], default: 'user' },
  membershipPlan: { type: String, enum: ['free', 'premium'], default: 'free' },
  membershipType: { type: String, enum: ['FREE', 'PREMIUM'], default: 'FREE' },
  membershipStatus: { type: String, enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'CANCELLED', 'SUSPENDED'], default: 'ACTIVE' },
  subscriptionPlan: { type: String, enum: ['free', 'premium'], default: 'free' },
  subscriptionStatus: { type: String, enum: SUBSCRIPTION_STATUSES, default: 'active' },
  subscriptionStartDate: { type: Date, default: Date.now },
  subscriptionEndDate: { type: Date, default: null },
  paymentProvider: { type: String, default: '' },
  billingCycle: { type: String, enum: ['monthly', 'annual'], default: 'monthly' },
  newsletterPreference: { type: String, enum: ['free', 'premium'], default: 'free' },
  emailVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: '' },
  registrationDate: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: null },
}, { timestamps: true });

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['free', 'premium'], required: true },
  billingCycle: { type: String, enum: ['monthly', 'annual'], default: 'monthly' },
  price: { type: Number, required: true },
  paymentProvider: { type: String, default: '' },
  status: { type: String, enum: SUBSCRIPTION_STATUSES, default: 'pending' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: null },
}, { timestamps: true });

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, default: '' },
  author: { type: String, default: 'Innovation X Lab' },
  tags: [{ type: String }],
  seoTitle: String,
  seoDescription: String,
  published: { type: Boolean, default: false },
  premium: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  category: { type: String, required: true },
  rating: { type: Number, default: 5 },
  price: String,
  specifications: [{ type: String }],
  pros: [{ type: String }],
  cons: [{ type: String }],
  verdict: String,
  image: String,
}, { timestamps: true });

const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  subscriptionPlan: { type: String, enum: ['free', 'premium'], default: 'free' },
  subscribedAt: { type: Date, default: Date.now },
});

const paymentHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  billingCycle: { type: String, enum: ['monthly', 'annual'], default: 'monthly' },
  provider: { type: String, default: '' },
  status: { type: String, enum: ['succeeded', 'pending', 'failed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['free', 'premium'], default: 'free' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  billingCycle: { type: String, enum: ['monthly', 'annual'], default: 'monthly' },
  provider: { type: String, default: 'PayPal' },
  paypalOrderId: { type: String, default: '' },
  paypalTransactionId: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['pending', 'created', 'succeeded', 'failed', 'cancelled'], default: 'pending' },
  paymentDate: { type: Date, default: null },
  expiryDate: { type: Date, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true, collection: 'payments' });

const advertisementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  advertiserName: { type: String, required: true },
  destinationUrl: { type: String, required: true },
  placement: {
    type: String,
    required: true,
    enum: ['hero-banner', 'homepage-banner', 'article-page', 'sidebar', 'newsletter-sponsorship', 'story-card', 'between-articles'],
  },
  image: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  gifUrl: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  active: { type: Boolean, default: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  description: { type: String, default: '' },
  ctaText: { type: String, default: 'Learn more' },
  contactPerson: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  mediaType: { type: String, default: 'image' },
  priority: { type: Number, default: 0 },
  maxImpressions: { type: Number, default: 0 },
  maxClicks: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  uniqueViews: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  countries: [{ type: String }],
  devices: [{ type: String }],
  status: { type: String, enum: ['Draft', 'Scheduled', 'Active', 'Paused', 'Expired'], default: 'Active' },
}, { timestamps: true });

const advertisingRequestSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  businessName: { type: String, required: true },
  website: { type: String, default: '' },
  industry: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, default: '' },
  country: { type: String, required: true },
  objective: { type: String, required: true },
  advertisementType: { type: String, required: true },
  campaignTitle: { type: String, required: true },
  campaignDescription: { type: String, required: true },
  targetAudience: { type: String, required: true },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  budget: { type: String, default: '' },
  mediaFile: { type: String, default: '' },
  additionalNotes: { type: String, default: '' },
  status: { type: String, enum: ['new', 'approved', 'rejected', 'contacted', 'campaign-live', 'completed', 'archived'], default: 'new' },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true, collection: 'advertisingRequests' });

const User = mongoose.model('User', userSchema);
const Article = mongoose.model('Article', articleSchema);
const Review = mongoose.model('Review', reviewSchema);
const Newsletter = mongoose.model('Newsletter', newsletterSchema);
const PaymentHistory = mongoose.model('PaymentHistory', paymentHistorySchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Advertisement = mongoose.model('Advertisement', advertisementSchema);
const AdvertisingRequest = mongoose.model('AdvertisingRequest', advertisingRequestSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access only' });
  }
  next();
};

const slugify = (value) => value
  .toString()
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-');

const sendVerificationEmail = async ({ user, token }) => {
  if (!user?.email) {
    return;
  }

  const verificationUrl = `${FRONTEND_BASE_URL}/verify-email?token=${encodeURIComponent(token)}`;
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    console.log(`[verification-email] To: ${user.email}\nSubject: Verify your Innovation X Lab account\n${verificationUrl}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: user.email,
    subject: 'Verify your Innovation X Lab account',
    text: `Hi ${user.name || 'there'},\n\nPlease verify your email address to activate your account.\n\n${verificationUrl}\n\nThanks,\nInnovation X Lab`,
  });
};

const sendAdvertisingRequestEmails = async (requestRecord) => {
  const confirmationSubject = "We've Received Your Advertising Request";
  const confirmationMessage = [
    'Thank you for your interest in advertising with Innovation X Lab.',
    '',
    'Our team will review your request and contact you shortly to discuss the campaign.',
  ].join('\n');

  const adminMessage = [
    `New advertising request received from ${requestRecord.companyName}.`,
    `Campaign: ${requestRecord.campaignTitle}`,
    `Contact: ${requestRecord.email}`,
    `Budget: ${requestRecord.budget}`,
    `Type: ${requestRecord.advertisementType}`,
  ].join('\n');

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    console.log(`[advertising-request] To: ${requestRecord.email}\nSubject: ${confirmationSubject}\n${confirmationMessage}`);
    console.log(`[advertising-request] Admin notification to ${ADMIN_EMAIL}\n${adminMessage}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: requestRecord.email,
    subject: confirmationSubject,
    text: confirmationMessage,
  });

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: ADMIN_EMAIL,
    subject: 'New Advertising Request Received',
    text: adminMessage,
  });
};

const getFrontendBaseUrl = (req) => {
  const originValue = req.headers.origin || req.headers.referer || '';
  if (originValue) {
    return String(originValue).replace(/\/$/, '');
  }
  return FRONTEND_BASE_URL;
};

const getSubscriptionExpiryDate = (billingCycle, startDate = new Date()) => {
  const normalizedStartDate = new Date(startDate);
  if (billingCycle === 'annual') {
    return new Date(new Date(normalizedStartDate).setFullYear(normalizedStartDate.getFullYear() + 1));
  }
  return new Date(new Date(normalizedStartDate).setMonth(normalizedStartDate.getMonth() + 1));
};

const getPayPalAccessToken = async (config) => {
  const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
  const response = await fetch(`${config.baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error_description || 'Unable to authenticate with PayPal.');
  }

  return data.access_token;
};

const activatePremiumMembership = async ({ user, billingCycle, paymentRecord, provider = 'PayPal', paymentStatus = 'succeeded', paymentDate = new Date(), transactionId = '', expiryDate = null, metadata = {} }) => {
  const normalizedBillingCycle = billingCycle === 'annual' ? 'annual' : 'monthly';
  const startDate = paymentDate instanceof Date ? paymentDate : new Date(paymentDate || new Date());
  const nextExpiryDate = expiryDate || getSubscriptionExpiryDate(normalizedBillingCycle, startDate);

  user.membershipPlan = 'premium';
  user.subscriptionPlan = 'premium';
  user.subscriptionStatus = 'active';
  user.subscriptionStartDate = startDate;
  user.subscriptionEndDate = nextExpiryDate;
  user.paymentProvider = provider;
  user.billingCycle = normalizedBillingCycle;
  user.newsletterPreference = 'premium';
  await user.save();

  const subscription = await Subscription.findOne({ userId: user._id, status: { $in: ['pending', 'active'] } }).sort({ createdAt: -1 });
  if (subscription) {
    subscription.plan = 'premium';
    subscription.billingCycle = normalizedBillingCycle;
    subscription.price = paymentRecord?.amount || calculateSubscriptionPrice('premium', normalizedBillingCycle);
    subscription.paymentProvider = provider;
    subscription.status = 'active';
    subscription.startDate = startDate;
    subscription.endDate = nextExpiryDate;
    await subscription.save();
  } else {
    await Subscription.create({
      userId: user._id,
      plan: 'premium',
      billingCycle: normalizedBillingCycle,
      price: paymentRecord?.amount || calculateSubscriptionPrice('premium', normalizedBillingCycle),
      paymentProvider: provider,
      status: 'active',
      startDate,
      endDate: nextExpiryDate,
    });
  }

  if (paymentRecord) {
    paymentRecord.plan = 'premium';
    paymentRecord.amount = paymentRecord.amount || calculateSubscriptionPrice('premium', normalizedBillingCycle);
    paymentRecord.currency = paymentRecord.currency || 'USD';
    paymentRecord.billingCycle = normalizedBillingCycle;
    paymentRecord.provider = provider;
    paymentRecord.paymentStatus = paymentStatus;
    paymentRecord.paymentDate = startDate;
    paymentRecord.expiryDate = nextExpiryDate;
    paymentRecord.paypalTransactionId = paymentRecord.paypalTransactionId || transactionId;
    paymentRecord.metadata = { ...paymentRecord.metadata, ...metadata };
    await paymentRecord.save();
  }

  await PaymentHistory.create({
    userId: user._id,
    amount: paymentRecord?.amount || calculateSubscriptionPrice('premium', normalizedBillingCycle),
    currency: paymentRecord?.currency || 'USD',
    billingCycle: normalizedBillingCycle,
    provider,
    status: paymentStatus === 'succeeded' ? 'succeeded' : 'pending',
  });

  return { user, subscription, paymentRecord };
};

const sendPaymentReceiptEmail = async ({ user, paymentRecord }) => {
  if (!user?.email) {
    return;
  }

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    console.log(`[payment-receipt] To: ${user.email}\nSubject: Innovation X Lab payment receipt`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  const amountText = `${paymentRecord.amount} ${paymentRecord.currency || 'USD'}`;
  await transporter.sendMail({
    from: EMAIL_FROM,
    to: user.email,
    subject: 'Innovation X Lab payment receipt',
    text: `Hi ${user.name || 'there'},\n\nYour payment of ${amountText} for your Innovation X Premium membership was successful.\n\nPlan: ${paymentRecord.plan || 'premium'}\nStatus: ${paymentRecord.paymentStatus || 'succeeded'}\nPayment date: ${new Date(paymentRecord.paymentDate || new Date()).toISOString()}\n\nThanks for supporting Innovation X Lab.`,
  });
};

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(String(password), user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const normalizedStatus = getSubscriptionStatus(user.subscriptionStatus, user.subscriptionStartDate, user.subscriptionEndDate);
  user.lastLogin = new Date();
  await user.save();
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      membershipPlan: user.membershipPlan,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: normalizedStatus,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      paymentProvider: user.paymentProvider,
      billingCycle: user.billingCycle,
      newsletterPreference: user.newsletterPreference,
    },
  });
});

app.post('/api/auth/register', async (req, res) => {
  const {
    name,
    username = '',
    email,
    password,
    confirmPassword,
    country = '',
    newsletterPreference = 'free',
    membershipPlan = 'free',
    billingCycle = 'monthly',
  } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (confirmPassword && String(password) !== String(confirmPassword)) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({ error: 'A user with that email already exists' });
  }

  const normalizedPlan = membershipPlan === 'premium' ? 'premium' : 'free';
  const normalizedBillingCycle = billingCycle === 'annual' ? 'annual' : 'monthly';
  const normalizedNewsletterPreference = newsletterPreference === 'premium' ? 'premium' : 'free';
  const normalizedRole = normalizedPlan === 'premium' ? 'PREMIUM_MEMBER' : 'FREE_MEMBER';
  const normalizedMembershipStatus = normalizedPlan === 'premium' ? 'PENDING' : 'ACTIVE';
  const normalizedMembershipType = normalizedPlan === 'premium' ? 'PREMIUM' : 'FREE';
  const verificationToken = randomBytes(20).toString('hex');
  const hashedPassword = await bcrypt.hash(String(password), 10);
  const createdUser = await User.create({
    name,
    username: String(username || '').trim(),
    email: normalizedEmail,
    password: hashedPassword,
    country: String(country || '').trim(),
    role: normalizedRole,
    membershipPlan: normalizedPlan,
    membershipType: normalizedMembershipType,
    membershipStatus: normalizedMembershipStatus,
    subscriptionPlan: normalizedPlan,
    subscriptionStatus: normalizedPlan === 'premium' ? 'pending' : 'active',
    subscriptionStartDate: new Date(),
    subscriptionEndDate: normalizedPlan === 'premium' ? null : null,
    newsletterPreference: normalizedNewsletterPreference,
    paymentProvider: '',
    billingCycle: normalizedBillingCycle,
    emailVerified: false,
    verificationToken,
    registrationDate: new Date(),
    lastLogin: new Date(),
  });

  if (normalizedPlan === 'free') {
    await Subscription.create({
      userId: createdUser._id,
      plan: 'free',
      billingCycle: 'monthly',
      price: 0,
      paymentProvider: '',
      status: 'active',
      startDate: createdUser.subscriptionStartDate,
      endDate: null,
    });
  }

  await sendVerificationEmail({ user: createdUser, token: verificationToken });

  const token = jwt.sign({ id: createdUser._id, role: createdUser.role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({
    token,
    verificationToken,
    user: {
      id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      membershipPlan: createdUser.membershipPlan,
      subscriptionPlan: createdUser.subscriptionPlan,
      subscriptionStatus: createdUser.subscriptionStatus,
      billingCycle: createdUser.billingCycle,
      emailVerified: createdUser.emailVerified,
    },
  });
});

app.post('/api/auth/verify-email', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Verification token is required' });
  }

  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    return res.status(404).json({ error: 'Verification token not found' });
  }

  user.emailVerified = true;
  user.verificationToken = '';
  await user.save();

  res.json({ success: true, message: 'Email verified successfully' });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ message: 'Logged out' });
});

app.get('/api/articles', async (req, res) => {
  const { category, published, limit, premium } = req.query;
  const query = {};

  if (category) {
    query.category = String(category);
  }

  if (published === 'true') {
    query.published = true;
  } else if (published === 'false') {
    query.published = false;
  }

  if (premium === 'true') {
    query.premium = true;
  } else if (premium === 'false') {
    query.premium = false;
  }

  const articles = await Article.find(query).sort({ createdAt: -1 }).lean();
  const limited = limit ? articles.slice(0, Number(limit)) : articles;
  res.json(limited);
});

app.get('/api/articles/:slug', async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug }).lean();
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  if (!article.published && req.headers.authorization?.startsWith('Bearer ') === false) {
    return res.status(404).json({ error: 'Article not found' });
  }

  const authHeader = req.headers.authorization;
  if (article.premium) {
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(403).json({ error: 'Unlock this article with Innovation X Premium.', premiumRequired: true });
    }

    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).lean();
      const status = getSubscriptionStatus(user?.subscriptionStatus, user?.subscriptionStartDate, user?.subscriptionEndDate);
      if (!isPremiumAccessAllowed(user?.subscriptionPlan, status)) {
        return res.status(403).json({ error: 'Unlock this article with Innovation X Premium.', premiumRequired: true });
      }
    } catch (error) {
      return res.status(403).json({ error: 'Unlock this article with Innovation X Premium.', premiumRequired: true });
    }
  }

  res.json(article);
});

app.post('/api/articles', authenticate, requireAdmin, async (req, res) => {
  const { title, category, description, content, image, author, tags, seoTitle, seoDescription, published, premium } = req.body;
  if (!title || !category || !description || !content) {
    return res.status(400).json({ error: 'Title, category, description, and content are required' });
  }

  const baseSlug = slugify(title);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;
  const article = await Article.create({
    title,
    slug,
    category,
    description,
    content,
    image: image || '',
    author: author || 'Innovation X Lab',
    tags: Array.isArray(tags) ? tags : String(tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
    seoTitle: seoTitle || title,
    seoDescription: seoDescription || description,
    published: published === undefined ? true : Boolean(published),
    premium: Boolean(premium),
  });

  res.status(201).json(article);
});

app.put('/api/articles/:id', authenticate, requireAdmin, async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }

  const { title, category, description, content, image, author, tags, seoTitle, seoDescription, published, premium, slug } = req.body;
  if (title) article.title = title;
  if (category) article.category = category;
  if (description) article.description = description;
  if (content) article.content = content;
  if (image !== undefined) article.image = image;
  if (author !== undefined) article.author = author;
  if (tags !== undefined) article.tags = Array.isArray(tags) ? tags : String(tags).split(',').map((tag) => tag.trim()).filter(Boolean);
  if (seoTitle !== undefined) article.seoTitle = seoTitle;
  if (seoDescription !== undefined) article.seoDescription = seoDescription;
  if (published !== undefined) article.published = Boolean(published);
  if (premium !== undefined) article.premium = Boolean(premium);
  if (slug) article.slug = slugify(slug);
  article.updatedAt = new Date();
  await article.save();

  res.json(article);
});

app.delete('/api/articles/:id', authenticate, requireAdmin, async (req, res) => {
  const article = await Article.findByIdAndDelete(req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  res.json({ success: true });
});

app.post('/api/upload', authenticate, requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder: 'innovation-x-lab' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
      uploadStream.end(req.file.buffer);
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: 'Image upload failed' });
  }
});

app.post('/api/upload-advertising-media', upload.single('mediaFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Media file is required' });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder: 'innovation-x-lab/advertising' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
      uploadStream.end(req.file.buffer);
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: 'Media upload failed' });
  }
});

const escapeRegExp = (value) => value.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

app.get('/api/reviews', async (_req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 }).lean();
  res.json(reviews);
});

app.get('/api/search', async (req, res) => {
  const term = String(req.query.term || '').trim();
  const category = String(req.query.category || '').trim();
  const articleQuery = { published: true };
  const reviewQuery = {};

  if (category) {
    articleQuery.category = category;
    reviewQuery.category = category;
  }

  if (term) {
    const regex = new RegExp(escapeRegExp(term), 'i');
    articleQuery.$or = [
      { title: regex },
      { description: regex },
      { content: regex },
      { tags: regex },
      { category: regex },
    ];
    reviewQuery.$or = [
      { productName: regex },
      { category: regex },
      { verdict: regex },
      { price: regex },
      { specifications: regex },
      { pros: regex },
      { cons: regex },
    ];
  }

  const [articles, reviews] = await Promise.all([
    Article.find(articleQuery).sort({ createdAt: -1 }).lean(),
    Review.find(reviewQuery).sort({ createdAt: -1 }).lean(),
  ]);

  res.json({ articles, reviews });
});

app.post('/api/reviews', authenticate, requireAdmin, async (req, res) => {
  const review = await Review.create(req.body);
  res.status(201).json(review);
});

app.put('/api/reviews/:id', authenticate, requireAdmin, async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }
  res.json(review);
});

app.delete('/api/reviews/:id', authenticate, requireAdmin, async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }
  res.json({ success: true });
});

app.get('/api/advertisements', async (req, res) => {
  const { placement } = req.query;
  const query = { active: true };

  if (placement) {
    query.placement = String(placement);
  }

  const advertisements = await Advertisement.find(query).sort({ priority: -1, createdAt: -1 }).lean();
  const visibleAdvertisements = advertisements.filter((advertisement) => isAdvertisementActive(advertisement));
  res.json(visibleAdvertisements);
});

app.get('/api/admin/advertisements', authenticate, requireAdmin, async (_req, res) => {
  const advertisements = await Advertisement.find().sort({ createdAt: -1 }).lean();
  res.json(advertisements.map((advertisement) => ({
    ...advertisement,
    status: isAdvertisementActive(advertisement) ? 'Active' : 'Expired or inactive',
  })));
});

app.post('/api/admin/advertisements', authenticate, requireAdmin, async (req, res) => {
  const {
    title,
    advertiserName,
    destinationUrl,
    placement,
    image,
    videoUrl,
    gifUrl,
    logoUrl,
    active,
    startDate,
    endDate,
    description,
    ctaText,
    contactPerson,
    email,
    phone,
    mediaType,
    priority,
    maxImpressions,
    maxClicks,
    status,
  } = req.body;

  if (!title || !advertiserName || !destinationUrl || !placement || !endDate) {
    return res.status(400).json({ error: 'Title, advertiser name, destination URL, placement, and expiry date are required' });
  }

  const advertisement = await Advertisement.create({
    title,
    advertiserName,
    destinationUrl,
    placement,
    image: image || '',
    videoUrl: videoUrl || '',
    gifUrl: gifUrl || '',
    logoUrl: logoUrl || '',
    active: Boolean(active),
    startDate: startDate ? new Date(startDate) : new Date(),
    endDate: new Date(endDate),
    description: description || '',
    ctaText: ctaText || 'Learn more',
    contactPerson: contactPerson || '',
    email: email || '',
    phone: phone || '',
    mediaType: mediaType || 'image',
    priority: Number(priority) || 0,
    maxImpressions: Number(maxImpressions) || 0,
    maxClicks: Number(maxClicks) || 0,
    status: status || 'Active',
  });

  res.status(201).json(advertisement);
});

app.put('/api/admin/advertisements/:id', authenticate, requireAdmin, async (req, res) => {
  const advertisement = await Advertisement.findById(req.params.id);
  if (!advertisement) {
    return res.status(404).json({ error: 'Advertisement not found' });
  }

  const {
    title,
    advertiserName,
    destinationUrl,
    placement,
    image,
    videoUrl,
    gifUrl,
    logoUrl,
    active,
    startDate,
    endDate,
    description,
    ctaText,
    contactPerson,
    email,
    phone,
    mediaType,
    priority,
    maxImpressions,
    maxClicks,
    status,
  } = req.body;

  if (title !== undefined) advertisement.title = title;
  if (advertiserName !== undefined) advertisement.advertiserName = advertiserName;
  if (destinationUrl !== undefined) advertisement.destinationUrl = destinationUrl;
  if (placement !== undefined) advertisement.placement = placement;
  if (image !== undefined) advertisement.image = image;
  if (videoUrl !== undefined) advertisement.videoUrl = videoUrl;
  if (gifUrl !== undefined) advertisement.gifUrl = gifUrl;
  if (logoUrl !== undefined) advertisement.logoUrl = logoUrl;
  if (active !== undefined) advertisement.active = Boolean(active);
  if (startDate !== undefined) advertisement.startDate = startDate ? new Date(startDate) : new Date();
  if (endDate !== undefined) advertisement.endDate = new Date(endDate);
  if (description !== undefined) advertisement.description = description;
  if (ctaText !== undefined) advertisement.ctaText = ctaText;
  if (contactPerson !== undefined) advertisement.contactPerson = contactPerson;
  if (email !== undefined) advertisement.email = email;
  if (phone !== undefined) advertisement.phone = phone;
  if (mediaType !== undefined) advertisement.mediaType = mediaType;
  if (priority !== undefined) advertisement.priority = Number(priority) || 0;
  if (maxImpressions !== undefined) advertisement.maxImpressions = Number(maxImpressions) || 0;
  if (maxClicks !== undefined) advertisement.maxClicks = Number(maxClicks) || 0;
  if (status !== undefined) advertisement.status = status;

  await advertisement.save();
  res.json(advertisement);
});

app.delete('/api/admin/advertisements/:id', authenticate, requireAdmin, async (req, res) => {
  const advertisement = await Advertisement.findByIdAndDelete(req.params.id);
  if (!advertisement) {
    return res.status(404).json({ error: 'Advertisement not found' });
  }
  res.json({ success: true });
});

app.post('/api/advertisements/:id/track', async (req, res) => {
  const advertisement = await Advertisement.findById(req.params.id);
  if (!advertisement) {
    return res.status(404).json({ error: 'Advertisement not found' });
  }

  const { event = 'impression' } = req.body || {};
  if (event === 'click') {
    advertisement.clicks += 1;
  } else {
    advertisement.impressions += 1;
  }

  if (advertisement.maxImpressions && advertisement.impressions >= advertisement.maxImpressions) {
    advertisement.active = false;
    advertisement.status = 'Expired';
  }

  if (advertisement.maxClicks && advertisement.clicks >= advertisement.maxClicks) {
    advertisement.active = false;
    advertisement.status = 'Expired';
  }

  await advertisement.save();
  res.json({ success: true });
});

app.post('/api/advertising-requests', async (req, res) => {
  const payload = req.body || {};
  const requiredFields = [
    'companyName',
    'businessName',
    'industry',
    'email',
    'country',
    'objective',
    'advertisementType',
    'campaignTitle',
    'campaignDescription',
    'targetAudience',
    'startDate',
    'endDate',
    'budget',
  ];

  const missingField = requiredFields.find((field) => !String(payload[field] || '').trim());
  if (missingField) {
    return res.status(400).json({ error: `Missing required field: ${missingField}` });
  }

  const requestRecord = await AdvertisingRequest.create({
    companyName: String(payload.companyName).trim(),
    businessName: String(payload.businessName).trim(),
    website: String(payload.website || '').trim(),
    industry: String(payload.industry).trim(),
    email: normalizeEmail(payload.email),
    phone: String(payload.phone || '').trim(),
    country: String(payload.country).trim(),
    objective: String(payload.objective).trim(),
    advertisementType: String(payload.advertisementType).trim(),
    campaignTitle: String(payload.campaignTitle).trim(),
    campaignDescription: String(payload.campaignDescription).trim(),
    targetAudience: String(payload.targetAudience).trim(),
    startDate: payload.startDate ? new Date(payload.startDate) : null,
    endDate: payload.endDate ? new Date(payload.endDate) : null,
    budget: String(payload.budget).trim(),
    mediaFile: String(payload.mediaFile || '').trim(),
    additionalNotes: String(payload.additionalNotes || '').trim(),
    status: 'new',
    submittedAt: new Date(),
  });

  await sendAdvertisingRequestEmails(requestRecord);

  res.status(201).json({ success: true, request: requestRecord });
});

app.get('/api/admin/advertising-requests', authenticate, requireAdmin, async (_req, res) => {
  const requests = await AdvertisingRequest.find().sort({ submittedAt: -1 }).lean();
  res.json(requests.map((request) => ({
    ...request,
    status: request.status || 'new',
  })));
});

app.put('/api/admin/advertising-requests/:id', authenticate, requireAdmin, async (req, res) => {
  const requestRecord = await AdvertisingRequest.findById(req.params.id);
  if (!requestRecord) {
    return res.status(404).json({ error: 'Advertising request not found' });
  }

  const allowedStatuses = ['new', 'approved', 'rejected', 'contacted', 'campaign-live', 'completed', 'archived'];
  const { status } = req.body;
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid advertising request status' });
  }

  requestRecord.status = status;
  await requestRecord.save();
  res.json(requestRecord);
});

app.post('/api/newsletter', async (req, res) => {
  const { email, plan = 'free' } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const normalizedPlan = plan === 'premium' ? 'premium' : 'free';
  const existing = await Newsletter.findOne({ email: String(email).toLowerCase() });
  if (existing) {
    existing.subscriptionPlan = normalizedPlan;
    await existing.save();
    return res.status(200).json({ message: 'Already subscribed' });
  }

  await Newsletter.create({ email: String(email).toLowerCase(), subscriptionPlan: normalizedPlan });
  res.status(201).json({ message: 'Subscribed' });
});

app.get('/api/subscriptions/plans', (_req, res) => {
  res.json({
    plans: [
      {
        id: 'free',
        name: 'Innovation X Free',
        price: 0,
        billingCycle: 'monthly',
        buttonLabel: 'Get Started',
        benefits: [
          'Access to free technology articles',
          'Latest AI breakthroughs',
          'Gadget and software updates',
          'Coding insights',
          'Startup news',
          'Weekly technology newsletter',
          'Access to public reviews',
        ],
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 2,
        annualPrice: 20,
        billingCycle: 'monthly',
        annualBillingCycle: 'annual',
        buttonLabel: 'Upgrade Now',
        benefits: [
          'Everything included in Free plan',
          'Premium technology reports',
          'Exclusive AI research and analysis',
          'Deep-dive technology articles',
          'Startup intelligence reports',
          'Early access to selected content',
          'Ad-free reading experience',
          'Premium newsletter editions',
          'Downloadable technology guides',
          'Exclusive member-only content',
        ],
      },
    ],
    paymentProviders: PAYMENT_PROVIDERS,
  });
});

app.get('/api/subscriptions/me', authenticate, async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  const summary = getSubscriptionSummary(user);
  res.json({ user, summary });
});

app.post('/api/subscriptions/checkout', authenticate, async (req, res) => {
  const { plan, billingCycle = 'monthly', provider = 'PayPal' } = req.body;
  if (plan !== 'premium') {
    return res.status(400).json({ error: 'Only premium subscriptions are available' });
  }

  const amount = calculateSubscriptionPrice(plan, billingCycle);
  const startDate = new Date();
  const endDate = getSubscriptionExpiryDate(billingCycle, startDate);
  const user = await User.findById(req.user._id);

  const pendingPayment = await Payment.findOne({ userId: user._id, provider, paymentStatus: { $in: ['pending', 'created'] } }).sort({ createdAt: -1 });
  if (pendingPayment && pendingPayment.paypalOrderId) {
    return res.json({
      message: 'Checkout already in progress',
      plan,
      billingCycle,
      amount,
      provider,
      status: pendingPayment.paymentStatus,
      paypalOrderId: pendingPayment.paypalOrderId,
      approvalUrl: pendingPayment.metadata?.approvalUrl || '',
      nextRenewal: endDate,
    });
  }

  const paymentRecord = await Payment.create({
    userId: user._id,
    plan,
    amount,
    currency: 'USD',
    billingCycle,
    provider,
    paymentStatus: 'pending',
    expiryDate: endDate,
  });

  if (provider === 'PayPal') {
    const paypalConfig = getPayPalConfig(process.env);
    console.log('[paypal-order] mode loaded', paypalConfig.mode);
    console.log('[paypal-order] client id detected', paypalConfig.clientId ? `${paypalConfig.clientId.slice(0, 6)}...` : 'missing');
    console.log('[paypal-order] request received', { plan, billingCycle, provider, amount });

    if (!paypalConfig.clientId || !paypalConfig.clientSecret) {
      paymentRecord.paymentStatus = 'failed';
      paymentRecord.metadata = { error: 'PayPal credentials are not configured.' };
      await paymentRecord.save();
      console.error('[paypal-order] missing credentials', { mode: paypalConfig.mode });
      return res.status(500).json({ error: 'PayPal credentials are not configured.' });
    }

    try {
      const accessToken = await getPayPalAccessToken(paypalConfig);
      const orderPayload = buildPayPalOrderPayload({
        plan,
        billingCycle,
        amount,
        currency: 'USD',
        returnUrl: `${getFrontendBaseUrl(req)}/payment/success`,
        cancelUrl: `${getFrontendBaseUrl(req)}/payment/cancel`,
      });

      const response = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await response.json();
      console.log('[paypal-order] api response', { status: response.status, orderId: orderData?.id, statusText: orderData?.status, links: orderData?.links?.length || 0 });
      if (!response.ok) {
        const backendError = orderData?.error_description || orderData?.message || 'Unable to create PayPal order.';
        paymentRecord.paymentStatus = 'failed';
        paymentRecord.metadata = { error: backendError };
        await paymentRecord.save();
        console.error('[paypal-order] create failed', { status: response.status, error: backendError, orderData });
        return res.status(502).json({ error: backendError });
      }

      const approvalUrl = orderData.links?.find((link) => link.rel === 'approve')?.href || '';
      paymentRecord.paypalOrderId = orderData.id;
      paymentRecord.paymentStatus = 'created';
      paymentRecord.metadata = { approvalUrl, paypalOrderStatus: orderData.status };
      await paymentRecord.save();

      user.membershipPlan = 'premium';
      user.subscriptionPlan = 'premium';
      user.subscriptionStatus = 'pending';
      user.subscriptionStartDate = startDate;
      user.subscriptionEndDate = endDate;
      user.paymentProvider = provider;
      user.billingCycle = billingCycle;
      user.newsletterPreference = 'premium';
      await user.save();

      await Subscription.create({
        userId: user._id,
        plan: 'premium',
        billingCycle,
        price: amount,
        paymentProvider: provider,
        status: 'pending',
        startDate,
        endDate,
      });

      return res.json({
        message: 'Checkout initiated',
        plan,
        billingCycle,
        amount,
        provider,
        status: 'created',
        paypalOrderId: orderData.id,
        approvalUrl,
        nextRenewal: endDate,
      });
    } catch (error) {
      const errorMessage = error?.message || 'PayPal checkout failed.';
      console.error('[paypal-order] setup failed', { error: errorMessage, stack: error?.stack });
      paymentRecord.paymentStatus = 'failed';
      paymentRecord.metadata = { error: errorMessage };
      await paymentRecord.save();
      return res.status(500).json({ error: errorMessage });
    }
  }

  user.membershipPlan = 'premium';
  user.subscriptionPlan = 'premium';
  user.subscriptionStatus = 'pending';
  user.subscriptionStartDate = startDate;
  user.subscriptionEndDate = endDate;
  user.paymentProvider = provider;
  user.billingCycle = billingCycle;
  user.newsletterPreference = 'premium';
  await user.save();

  await Subscription.create({
    userId: user._id,
    plan: 'premium',
    billingCycle,
    price: amount,
    paymentProvider: provider,
    status: 'pending',
    startDate,
    endDate,
  });

  await PaymentHistory.create({
    userId: user._id,
    amount,
    currency: 'USD',
    billingCycle,
    provider,
    status: 'pending',
  });

  res.json({
    message: 'Checkout initiated',
    plan,
    billingCycle,
    amount,
    provider,
    status: 'pending',
    nextRenewal: endDate,
  });
});

app.post('/api/subscriptions/paypal/complete', authenticate, async (req, res) => {
  const { orderId, payerId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: 'PayPal order ID is required.' });
  }

  const user = await User.findById(req.user._id);
  const paymentRecord = await Payment.findOne({ paypalOrderId: orderId, userId: user._id }).sort({ createdAt: -1 });
  if (!paymentRecord) {
    return res.status(404).json({ error: 'Payment record not found.' });
  }

  if (paymentRecord.paymentStatus === 'succeeded') {
    return res.json({ success: true, message: 'Premium membership already active.', user: { subscriptionPlan: user.subscriptionPlan, subscriptionStatus: user.subscriptionStatus, paymentProvider: user.paymentProvider } });
  }

  const paypalConfig = getPayPalConfig(process.env);
  if (!paypalConfig.clientId || !paypalConfig.clientSecret) {
    return res.status(500).json({ error: 'PayPal credentials are not configured.' });
  }

  try {
    const accessToken = await getPayPalAccessToken(paypalConfig);
    const captureResponse = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const captureData = await captureResponse.json();
    if (!captureResponse.ok) {
      paymentRecord.paymentStatus = 'failed';
      paymentRecord.metadata = { ...paymentRecord.metadata, payerId, paypalOrderStatus: captureData?.status || 'failed' };
      await paymentRecord.save();
      console.error('[paypal-capture] failed', captureData);
      return res.status(402).json({ error: captureData?.message || 'Payment could not be captured.', paymentStatus: paymentRecord.paymentStatus });
    }

    const capture = captureData?.purchase_units?.[0]?.payments?.captures?.[0] || {};
    const paypalStatus = capture.status || captureData.status;
    const transactionId = capture.id || '';

    if (paypalStatus === 'COMPLETED') {
      const paymentDate = new Date();
      await activatePremiumMembership({
        user,
        billingCycle: paymentRecord.billingCycle || 'monthly',
        paymentRecord,
        provider: 'PayPal',
        paymentStatus: 'succeeded',
        paymentDate,
        transactionId,
        expiryDate: paymentRecord.expiryDate || getSubscriptionExpiryDate(paymentRecord.billingCycle || 'monthly', paymentDate),
        metadata: { payerId, paypalOrderStatus: paypalStatus },
      });
      await sendPaymentReceiptEmail({ user, paymentRecord });
      return res.json({ success: true, message: 'Premium membership activated.', user: { subscriptionPlan: user.subscriptionPlan, subscriptionStatus: user.subscriptionStatus, paymentProvider: user.paymentProvider } });
    }

    paymentRecord.paymentStatus = paypalStatus === 'VOIDED' ? 'cancelled' : 'failed';
    paymentRecord.metadata = { ...paymentRecord.metadata, payerId, paypalOrderStatus: paypalStatus };
    await paymentRecord.save();
    return res.status(402).json({ error: 'Payment was not completed.', paymentStatus: paymentRecord.paymentStatus });
  } catch (error) {
    console.error('[paypal-capture] error', error);
    paymentRecord.paymentStatus = 'failed';
    paymentRecord.metadata = { ...paymentRecord.metadata, payerId, error: error.message || 'Payment verification failed.' };
    await paymentRecord.save();
    return res.status(500).json({ error: 'Payment could not be verified.' });
  }
});

app.post('/api/subscriptions/confirm', authenticate, async (req, res) => {
  const { status = 'active', paymentId, provider = 'Stripe' } = req.body;
  const user = await User.findById(req.user._id);
  const normalizedStatus = status === 'succeeded' ? 'active' : status;

  if (normalizedStatus === 'active') {
    const paymentRecord = await Payment.create({
      userId: user._id,
      plan: 'premium',
      amount: calculateSubscriptionPrice('premium', user.billingCycle || 'monthly'),
      currency: 'USD',
      billingCycle: user.billingCycle || 'monthly',
      provider,
      paymentStatus: 'succeeded',
      paymentDate: new Date(),
    });
    await activatePremiumMembership({ user, billingCycle: user.billingCycle || 'monthly', paymentRecord, provider, paymentStatus: 'succeeded', paymentDate: new Date(), metadata: { paymentId } });
    return res.json({ message: 'Subscription updated', user: { subscriptionPlan: user.subscriptionPlan, subscriptionStatus: user.subscriptionStatus, paymentProvider: user.paymentProvider } });
  }

  const subscription = await Subscription.findOne({ userId: user._id, status: 'pending' }).sort({ createdAt: -1 });
  if (subscription) {
    subscription.status = normalizedStatus;
    subscription.paymentProvider = provider || subscription.paymentProvider;
    await subscription.save();
  }

  user.subscriptionStatus = normalizedStatus;
  user.paymentProvider = provider || user.paymentProvider;
  await user.save();

  await PaymentHistory.create({
    userId: user._id,
    amount: calculateSubscriptionPrice(user.subscriptionPlan, user.billingCycle),
    currency: 'USD',
    billingCycle: user.billingCycle,
    provider: provider || user.paymentProvider,
    status: status === 'succeeded' ? 'succeeded' : 'pending',
  });

  res.json({ message: 'Subscription updated', user: { subscriptionPlan: user.subscriptionPlan, subscriptionStatus: user.subscriptionStatus, paymentProvider: user.paymentProvider } });
});

app.post('/api/subscriptions/cancel', authenticate, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.subscriptionStatus = 'cancelled';
  user.subscriptionEndDate = new Date();
  await user.save();

  const subscription = await Subscription.findOne({ userId: user._id, status: { $in: ['active', 'pending'] } }).sort({ createdAt: -1 });
  if (subscription) {
    subscription.status = 'cancelled';
    subscription.endDate = user.subscriptionEndDate;
    await subscription.save();
  }

  res.json({ message: 'Subscription cancelled', status: user.subscriptionStatus });
});

app.get('/api/admin/memberships', authenticate, requireAdmin, async (_req, res) => {
  const [users, paymentHistory, newsletters] = await Promise.all([
    User.find().sort({ createdAt: -1 }).lean(),
    PaymentHistory.find().sort({ createdAt: -1 }).lean(),
    Newsletter.find().sort({ subscribedAt: -1 }).lean(),
  ]);

  const totalMembers = users.length;
  const freeSubscribers = users.filter((entry) => entry.subscriptionPlan === 'free').length;
  const premiumSubscribers = users.filter((entry) => entry.subscriptionPlan === 'premium').length;
  const monthlyRecurringRevenue = paymentHistory.filter((entry) => entry.billingCycle === 'monthly' && entry.status === 'succeeded').reduce((sum, entry) => sum + entry.amount, 0);
  const annualSubscribers = users.filter((entry) => entry.billingCycle === 'annual').length;

  res.json({
    totalMembers,
    freeSubscribers,
    premiumSubscribers,
    monthlyRecurringRevenue,
    annualSubscribers,
    paymentHistory,
    subscribers: newsletters,
    members: users.map((user) => ({
      ...user,
      planLabel: getPlanLabel(user.subscriptionPlan),
      subscriptionStatus: getSubscriptionStatus(user.subscriptionStatus, user.subscriptionStartDate, user.subscriptionEndDate),
    })),
  });
});

app.get('/api/admin/stats', authenticate, requireAdmin, async (_req, res) => {
  const [articles, subscribers, recentArticles, users] = await Promise.all([
    Article.find().lean(),
    Newsletter.find().lean(),
    Article.find().sort({ createdAt: -1 }).limit(5).lean(),
    User.find().lean(),
  ]);

  const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
  const premiumMembers = users.filter((entry) => entry.subscriptionPlan === 'premium').length;
  const freeMembers = users.filter((entry) => entry.subscriptionPlan === 'free').length;
  res.json({
    totalArticles: articles.length,
    totalViews,
    totalSubscribers: subscribers.length,
    totalMembers: users.length,
    freeMembers,
    premiumMembers,
    recentPosts: recentArticles,
    recentActivity: recentArticles.map((article) => ({
      title: article.title,
      createdAt: article.createdAt,
      published: article.published,
    })),
  });
});

app.get('/api/admin/newsletters', authenticate, requireAdmin, async (_req, res) => {
  const subscribers = await Newsletter.find().sort({ subscribedAt: -1 }).lean();
  res.json(subscribers);
});

app.get('/api/admin/articles', authenticate, requireAdmin, async (_req, res) => {
  const articles = await Article.find().sort({ createdAt: -1 }).lean();
  res.json(articles);
});

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 }).then(async () => {
  console.log('MongoDB connected');
  await syncAdminAccount({ User, adminEmail: ADMIN_EMAIL, adminPassword: ADMIN_PASSWORD, logger: console });
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((error) => {
  console.error('MongoDB connection error', error);
  app.listen(PORT, () => console.log(`Server running on port ${PORT} (database unavailable)`));
});
