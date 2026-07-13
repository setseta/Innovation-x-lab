import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/innovationxlab';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'reader' },
});

const articleSchema = new mongoose.Schema({
  title: String,
  slug: String,
  category: String,
  description: String,
  content: String,
  image: String,
  author: String,
  date: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
});

const commentSchema = new mongoose.Schema({
  user: String,
  article: String,
  comment: String,
  date: { type: Date, default: Date.now },
});

const newsletterSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  subscribedDate: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Article = mongoose.model('Article', articleSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Newsletter = mongoose.model('Newsletter', newsletterSchema);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/articles', async (_req, res) => {
  const articles = await Article.find().lean();
  res.json(articles);
});

app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const existing = await Newsletter.findOne({ email });
  if (existing) return res.status(200).json({ message: 'Already subscribed' });
  await Newsletter.create({ email });
  res.status(201).json({ message: 'Subscribed' });
});

mongoose.connect(MONGO_URI).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((error) => {
  console.error('MongoDB connection error', error);
  app.listen(PORT, () => console.log(`Server running on port ${PORT} without DB`));
});
