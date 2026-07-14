import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/innovationxlab';
const JWT_SECRET = process.env.JWT_SECRET || 'innovationxlab-secret';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@innovationxlab.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123456';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'e4cjpp5k',
  api_key: process.env.CLOUDINARY_API_KEY || '487174522247335',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'hOdi_Gf__tSbe6T22egIihrekcI',
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
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
  subscribedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Article = mongoose.model('Article', articleSchema);
const Review = mongoose.model('Review', reviewSchema);
const Newsletter = mongoose.model('Newsletter', newsletterSchema);

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

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(String(password), user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ message: 'Logged out' });
});

app.get('/api/articles', async (req, res) => {
  const { category, published, limit } = req.query;
  const query = {};

  if (category) {
    query.category = String(category);
  }

  if (published === 'true') {
    query.published = true;
  } else if (published === 'false') {
    query.published = false;
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
  res.json(article);
});

app.post('/api/articles', authenticate, requireAdmin, async (req, res) => {
  const { title, category, description, content, image, author, tags, seoTitle, seoDescription, published } = req.body;
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
  });

  res.status(201).json(article);
});

app.put('/api/articles/:id', authenticate, requireAdmin, async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }

  const { title, category, description, content, image, author, tags, seoTitle, seoDescription, published, slug } = req.body;
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

app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const existing = await Newsletter.findOne({ email: String(email).toLowerCase() });
  if (existing) return res.status(200).json({ message: 'Already subscribed' });

  await Newsletter.create({ email: String(email).toLowerCase() });
  res.status(201).json({ message: 'Subscribed' });
});

app.get('/api/admin/stats', authenticate, requireAdmin, async (_req, res) => {
  const [articles, subscribers, recentArticles] = await Promise.all([
    Article.find().lean(),
    Newsletter.find().lean(),
    Article.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
  res.json({
    totalArticles: articles.length,
    totalViews,
    totalSubscribers: subscribers.length,
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
