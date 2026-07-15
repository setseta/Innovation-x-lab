import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import { isAdvertisementActive } from './advertisementUtils.js';
import {
  PAYMENT_PROVIDERS,
  SUBSCRIPTION_STATUSES,
  calculateSubscriptionPrice,
  getPlanLabel,
  getSubscriptionStatus,
  getSubscriptionSummary,
  isPremiumAccessAllowed,
} from './subscriptionUtils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/innovationxlab';
const JWT_SECRET = process.env.JWT_SECRET || 'innovationxlab-secret';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@innovationxlab.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123456';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'e4cjpp5k',
  api_key: process.env.CLOUDINARY_API_KEY || '487174522247335',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'hOdi_Gf__tSbe6T22egIihrekcI',
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const normalizeEmail = (email) => String(email || '').toLowerCase().trim();

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  membershipPlan: { type: String, enum: ['free', 'premium'], default: 'free' },
  subscriptionPlan: { type: String, enum: ['free', 'premium'], default: 'free' },
  subscriptionStatus: { type: String, enum: SUBSCRIPTION_STATUSES, default: 'active' },
  subscriptionStartDate: { type: Date, default: Date.now },
  subscriptionEndDate: { type: Date, default: null },
  paymentProvider: { type: String, default: '' },
  billingCycle: { type: String, enum: ['monthly', 'annual'], default: 'monthly' },
  newsletterPreference: { type: String, enum: ['free', 'premium'], default: 'free' },
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

const advertisementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  advertiserName: { type: String, required: true },
  destinationUrl: { type: String, required: true },
  placement: {
    type: String,
    required: true,
    enum: ['homepage-banner', 'article-page', 'sidebar', 'newsletter-sponsorship'],
  },
  image: { type: String, default: '' },
  active: { type: Boolean, default: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  description: { type: String, default: '' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Article = mongoose.model('Article', articleSchema);
const Review = mongoose.model('Review', reviewSchema);
const Newsletter = mongoose.model('Newsletter', newsletterSchema);
const PaymentHistory = mongoose.model('PaymentHistory', paymentHistorySchema);
const Advertisement = mongoose.model('Advertisement', advertisementSchema);
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
  const { name, email, password, membershipPlan = 'free', billingCycle = 'monthly' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({ error: 'A user with that email already exists' });
  }

  const normalizedPlan = membershipPlan === 'premium' ? 'premium' : 'free';
  const normalizedBillingCycle = billingCycle === 'annual' ? 'annual' : 'monthly';
  const hashedPassword = await bcrypt.hash(String(password), 10);
  const createdUser = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role: 'user',
    membershipPlan: normalizedPlan,
    subscriptionPlan: normalizedPlan,
    subscriptionStatus: normalizedPlan === 'premium' ? 'pending' : 'active',
    subscriptionStartDate: new Date(),
    subscriptionEndDate: normalizedPlan === 'premium' ? null : null,
    newsletterPreference: normalizedPlan === 'premium' ? 'premium' : 'free',
    paymentProvider: '',
    billingCycle: normalizedBillingCycle,
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

  const token = jwt.sign({ id: createdUser._id, role: createdUser.role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({
    token,
    user: {
      id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      membershipPlan: createdUser.membershipPlan,
      subscriptionPlan: createdUser.subscriptionPlan,
      subscriptionStatus: createdUser.subscriptionStatus,
      billingCycle: createdUser.billingCycle,
    },
  });
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
    published: Boolean(published),
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

  const advertisements = await Advertisement.find(query).sort({ createdAt: -1 }).lean();
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
    active,
    startDate,
    endDate,
    description,
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
    active: Boolean(active),
    startDate: startDate ? new Date(startDate) : new Date(),
    endDate: new Date(endDate),
    description: description || '',
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
    active,
    startDate,
    endDate,
    description,
  } = req.body;

  if (title !== undefined) advertisement.title = title;
  if (advertiserName !== undefined) advertisement.advertiserName = advertiserName;
  if (destinationUrl !== undefined) advertisement.destinationUrl = destinationUrl;
  if (placement !== undefined) advertisement.placement = placement;
  if (image !== undefined) advertisement.image = image;
  if (active !== undefined) advertisement.active = Boolean(active);
  if (startDate !== undefined) advertisement.startDate = startDate ? new Date(startDate) : new Date();
  if (endDate !== undefined) advertisement.endDate = new Date(endDate);
  if (description !== undefined) advertisement.description = description;

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
  const { plan, billingCycle = 'monthly', provider = 'Stripe' } = req.body;
  if (plan !== 'premium') {
    return res.status(400).json({ error: 'Only premium subscriptions are available' });
  }

  const amount = calculateSubscriptionPrice(plan, billingCycle);
  const startDate = new Date();
  const endDate = billingCycle === 'annual'
    ? new Date(new Date(startDate).setFullYear(startDate.getFullYear() + 1))
    : new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));

  const user = await User.findById(req.user._id);
  user.membershipPlan = 'premium';
  user.subscriptionPlan = 'premium';
  user.subscriptionStatus = 'pending';
  user.subscriptionStartDate = new Date();
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
    startDate: user.subscriptionStartDate,
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

app.post('/api/subscriptions/confirm', authenticate, async (req, res) => {
  const { status = 'active', paymentId, provider } = req.body;
  const user = await User.findById(req.user._id);
  const normalizedStatus = status === 'succeeded' ? 'active' : status;

  const subscription = await Subscription.findOne({ userId: user._id, status: 'pending' }).sort({ createdAt: -1 });
  if (subscription) {
    subscription.status = normalizedStatus;
    subscription.paymentProvider = provider || subscription.paymentProvider;
    if (paymentId) subscription.paymentProvider = provider || subscription.paymentProvider;
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
  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({ name: 'Admin', email: ADMIN_EMAIL.toLowerCase(), password: passwordHash, role: 'admin' });
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((error) => {
  console.error('MongoDB connection error', error);
  app.listen(PORT, () => console.log(`Server running on port ${PORT} without DB`));
});
