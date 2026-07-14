import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { buildApiUrl } from '../config/api';

type AdminForm = {
  title: string;
  slug: string;
  category: string;
  description: string;
  content: string;
  image: string;
  author: string;
  tags: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
};

type Article = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  content: string;
  image?: string;
  published?: boolean;
  createdAt?: string;
};

type Subscriber = {
  _id: string;
  email: string;
  subscribedAt: string;
};

type Stats = {
  totalArticles: number;
  totalViews: number;
  totalSubscribers: number;
  totalReviews: number;
  recentPosts: Article[];
};

const AdminPage = () => {
  const [stats, setStats] = useState<Stats>({ totalArticles: 0, totalViews: 0, totalSubscribers: 0, totalReviews: 0, recentPosts: [] });
  const [articles, setArticles] = useState<Article[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [form, setForm] = useState<AdminForm>({ title: '', slug: '', category: 'AI Lab', description: '', content: '', image: '', author: 'Innovation X Lab', tags: '', seoTitle: '', seoDescription: '', published: false });
  const [token, setToken] = useState('');
  const [authError, setAuthError] = useState('');
  const [status, setStatus] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
      setToken(storedToken);
      loadDashboard(storedToken);
    }
  }, []);

  const loadDashboard = async (currentToken: string) => {
    const headers = { Authorization: `Bearer ${currentToken}` };
    const [statsResponse, articlesResponse, subscribersResponse] = await Promise.all([
      fetch(buildApiUrl('/api/admin/stats'), { headers }),
      fetch(buildApiUrl('/api/admin/articles'), { headers }),
      fetch(buildApiUrl('/api/admin/newsletters'), { headers }),
    ]);
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      setStats(statsData);
    }
    if (articlesResponse.ok) {
      const articlesData = await articlesResponse.json();
      setArticles(articlesData);
    }
    if (subscribersResponse.ok) {
      const subscribersData = await subscribersResponse.json();
      setSubscribers(Array.isArray(subscribersData) ? subscribersData : []);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const email = (document.getElementById('admin-email') as HTMLInputElement)?.value || '';
    const password = (document.getElementById('admin-password') as HTMLInputElement)?.value || '';

    try {
      const response = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setAuthError(data.error || 'Login failed');
        return;
      }
      localStorage.setItem('adminToken', data.token);
      setToken(data.token);
      setAuthError('');
      loadDashboard(data.token);
    } catch (error) {
      setAuthError('Unable to sign in right now.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken('');
    setStats({ totalArticles: 0, totalViews: 0, totalSubscribers: 0, totalReviews: 0, recentPosts: [] });
    setArticles([]);
    setSubscribers([]);
  };

  const handleCreateArticle = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;

    const response = await fetch(buildApiUrl(editingId ? `/api/articles/${editingId}` : '/api/articles'), {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean), published: form.published }),
    });
    const data = await response.json();
    setStatus(response.ok ? (editingId ? 'Article updated successfully.' : 'Article saved successfully.') : data.error || 'Unable to save article.');
    if (response.ok) {
      loadDashboard(token);
      setForm({ title: '', slug: '', category: 'AI Lab', description: '', content: '', image: '', author: 'Innovation X Lab', tags: '', seoTitle: '', seoDescription: '', published: false });
      setEditingId(null);
    }
  };

  const handleEditArticle = (article: Article) => {
    setEditingId(article._id);
    setForm({
      title: article.title,
      slug: article.slug,
      category: article.category,
      description: article.description,
      content: article.content,
      image: article.image || '',
      author: 'Innovation X Lab',
      tags: '',
      seoTitle: '',
      seoDescription: '',
      published: Boolean(article.published),
    });
  };

  const handleDeleteArticle = async (id: string) => {
    if (!token) return;
    const response = await fetch(buildApiUrl(`/api/articles/${id}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      loadDashboard(token);
      setStatus('Article deleted.');
    }
  };

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) {
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(buildApiUrl('/api/upload'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok && data.url) {
        setForm((prev) => ({ ...prev, image: data.url }));
        setStatus('Image uploaded successfully.');
      } else {
        setStatus(data.error || 'Failed to upload image.');
      }
    } catch (error) {
      setStatus('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const overviewCards = useMemo(() => [
    { label: 'Total articles', value: stats.totalArticles },
    { label: 'Total views', value: stats.totalViews },
    { label: 'Total subscribers', value: stats.totalSubscribers },
  ], [stats]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>Admin | Innovation X Lab</title>
        <meta name="description" content="Administrative dashboard for managing articles, uploads, subscribers, and content operations." />
      </Helmet>
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Admin Dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Content operations for the next publication cycle</h1>
        <p className="mt-6 text-lg text-slate-300">Create and publish editorial content, manage subscribers, and update your website from one secure dashboard.</p>
      </div>

      {!token ? (
        <form onSubmit={handleLogin} className="mt-10 max-w-xl rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-8">
          <h2 className="text-2xl font-semibold text-white">Admin Login</h2>
          <p className="mt-3 text-sm text-slate-400">Sign in to manage articles, reviews, and newsletter subscribers.</p>
          <div className="mt-6 space-y-4">
            <input id="admin-email" className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Email" />
            <input id="admin-password" type="password" className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Password" />
          </div>
          {authError ? <p className="mt-4 text-sm text-rose-400">{authError}</p> : null}
          <button type="submit" className="mt-6 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 font-semibold text-white">Login</button>
        </form>
      ) : (
        <>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-slate-400">Signed in securely as admin.</div>
            <button onClick={handleLogout} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">Logout</button>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {overviewCards.map((card) => (
              <div key={card.label} className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
                <div className="text-sm text-slate-400">{card.label}</div>
                <div className="mt-3 text-3xl font-semibold text-white">{card.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <form onSubmit={handleCreateArticle} className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
              <h2 className="text-2xl font-semibold text-white">{editingId ? 'Edit article' : 'Create article'}</h2>
              <div className="mt-6 space-y-4">
                <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Title" />
                <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Slug" />
                <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none">
                  {['AI Lab', 'Gadget Lab', 'Software Lab', 'Code Lab', 'Startup Lab', 'Review Lab'].map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Image URL" />
                  <label className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10">
                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
                    {uploading ? 'Uploading…' : 'Upload image'}
                  </label>
                </div>
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="min-h-24 w-full rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Short description" />
                <textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} className="min-h-40 w-full rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Full content" />
                <input value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Author" />
                <input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Tags (comma separated)" />
                <label className="flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /> Publish immediately</label>
              </div>
              {status ? <p className="mt-4 text-sm text-cyan-300">{status}</p> : null}
              <button type="submit" className="mt-6 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 font-semibold text-white">{editingId ? 'Update article' : 'Save article'}</button>
            </form>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
              <h2 className="text-2xl font-semibold text-white">Recent posts</h2>
              <div className="mt-6 space-y-3">
                {stats.recentPosts.length > 0 ? stats.recentPosts.map((article) => (
                  <div key={article._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-semibold text-white">{article.title}</div>
                    <div className="mt-2 text-sm text-slate-400">{article.category} • {article.published ? 'Published' : 'Draft'}</div>
                  </div>
                )) : <p className="text-sm text-slate-400">No posts yet.</p>}
              </div>
              <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
                <h3 className="text-xl font-semibold text-white">Subscribers</h3>
                <div className="mt-4 space-y-2 text-sm text-slate-400">
                  {subscribers.length > 0 ? subscribers.slice(0, 6).map((subscriber) => (
                    <div key={subscriber._id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div>{subscriber.email}</div>
                      <div className="text-xs text-slate-500">{new Date(subscriber.subscribedAt).toLocaleString()}</div>
                    </div>
                  )) : <p>No subscribers yet.</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-2xl font-semibold text-white">Existing articles</h2>
            <div className="mt-6 space-y-3">
              {articles.map((article) => (
                <div key={article._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{article.title}</div>
                      <div className="mt-1 text-sm text-slate-400">{article.category}</div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-cyan-300">
                      <button type="button" onClick={() => handleEditArticle(article)} className="rounded-full border border-white/10 px-3 py-1">Edit</button>
                      <button type="button" onClick={() => handleDeleteArticle(article._id)} className="rounded-full border border-rose-400/30 px-3 py-1 text-rose-300">Delete</button>
                      <span>{article.published ? 'Published' : 'Draft'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPage;
