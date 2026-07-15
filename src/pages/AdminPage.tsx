import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  subscriptionPlan?: string;
  subscribedAt: string;
};

type MemberRecord = {
  _id: string;
  name: string;
  email: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  planLabel?: string;
  paymentProvider?: string;
  billingCycle?: string;
  createdAt?: string;
};

type AdvertisingRequest = {
  _id: string;
  companyName: string;
  businessName: string;
  website?: string;
  industry?: string;
  email: string;
  phone?: string;
  country?: string;
  objective: string;
  advertisementType: string;
  campaignTitle: string;
  campaignDescription: string;
  targetAudience: string;
  startDate?: string;
  endDate?: string;
  budget: string;
  mediaFile?: string;
  additionalNotes?: string;
  status: string;
  submittedAt?: string;
};

type MembershipSummary = {
  totalMembers: number;
  freeSubscribers: number;
  premiumSubscribers: number;
  monthlyRecurringRevenue: number;
  annualSubscribers: number;
  paymentHistory: Array<{ _id: string; userId: string; amount: number; billingCycle: string; provider: string; status: string; createdAt: string }>;
  subscribers: Subscriber[];
  members: MemberRecord[];
};

type Advertisement = {
  _id: string;
  title: string;
  advertiserName: string;
  destinationUrl: string;
  placement: string;
  image?: string;
  active: boolean;
  startDate: string;
  endDate: string;
  description?: string;
  status?: string;
};

type Stats = {
  totalArticles: number;
  totalViews: number;
  totalSubscribers: number;
  totalMembers?: number;
  freeMembers?: number;
  premiumMembers?: number;
  totalReviews?: number;
  recentPosts: Article[];
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ totalArticles: 0, totalViews: 0, totalSubscribers: 0, totalReviews: 0, recentPosts: [] });
  const [membershipData, setMembershipData] = useState<MembershipSummary | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [advertisingRequests, setAdvertisingRequests] = useState<AdvertisingRequest[]>([]);
  const [form, setForm] = useState<AdminForm>({ title: '', slug: '', category: 'AI Lab', description: '', content: '', image: '', author: 'Innovation X Lab', tags: '', seoTitle: '', seoDescription: '', published: false });
  const [adForm, setAdForm] = useState({
    title: '',
    advertiserName: '',
    destinationUrl: '',
    placement: 'homepage-banner',
    image: '',
    active: true,
    startDate: '',
    endDate: '',
    description: '',
  });
  const [token, setToken] = useState('');
  const [authError, setAuthError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingAdImage, setUploadingAdImage] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
      setToken(storedToken);
      loadDashboard(storedToken);
      if (window.location.pathname === '/admin/login') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [navigate]);

  const loadDashboard = async (currentToken: string) => {
    const headers = { Authorization: `Bearer ${currentToken}` };
    const [statsResponse, articlesResponse, subscribersResponse, advertisementsResponse, membershipsResponse, advertisingRequestsResponse] = await Promise.all([
      fetch(buildApiUrl('/api/admin/stats'), { headers }),
      fetch(buildApiUrl('/api/admin/articles'), { headers }),
      fetch(buildApiUrl('/api/admin/newsletters'), { headers }),
      fetch(buildApiUrl('/api/admin/advertisements'), { headers }),
      fetch(buildApiUrl('/api/admin/memberships'), { headers }),
      fetch(buildApiUrl('/api/admin/advertising-requests'), { headers }),
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
    if (advertisementsResponse.ok) {
      const advertisementsData = await advertisementsResponse.json();
      setAdvertisements(Array.isArray(advertisementsData) ? advertisementsData : []);
    }
    if (membershipsResponse.ok) {
      const membershipsData = await membershipsResponse.json();
      setMembershipData(membershipsData);
    }
    if (advertisingRequestsResponse.ok) {
      const requestsData = await advertisingRequestsResponse.json();
      setAdvertisingRequests(Array.isArray(requestsData) ? requestsData : []);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError('');

    if (!email || !password) {
      setAuthError('Email and password are required');
      return;
    }

    try {
      const response = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.token) {
        setAuthError(data?.error || `Login failed (${response.status})`);
        return;
      }

      localStorage.setItem('adminToken', data.token);
      setToken(data.token);
      setAuthError('');
      loadDashboard(data.token);
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      setAuthError('Unable to sign in right now. Please verify the backend URL and admin credentials.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken('');
    setStats({ totalArticles: 0, totalViews: 0, totalSubscribers: 0, totalReviews: 0, recentPosts: [] });
    setArticles([]);
    setSubscribers([]);
    setAdvertisements([]);
    navigate('/admin/login', { replace: true });
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

  const handleAdvertisementSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;

    const response = await fetch(buildApiUrl('/api/admin/advertisements'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(adForm),
    });
    const data = await response.json();
    setStatus(response.ok ? 'Advertisement saved successfully.' : data.error || 'Unable to save advertisement.');
    if (response.ok) {
      loadDashboard(token);
      setAdForm({
        title: '',
        advertiserName: '',
        destinationUrl: '',
        placement: 'homepage-banner',
        image: '',
        active: true,
        startDate: '',
        endDate: '',
        description: '',
      });
    }
  };

  const handleToggleAdvertisement = async (advertisement: Advertisement) => {
    if (!token) return;
    const response = await fetch(buildApiUrl(`/api/admin/advertisements/${advertisement._id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ active: !advertisement.active }),
    });
    if (response.ok) {
      loadDashboard(token);
      setStatus('Advertisement status updated.');
    }
  };

  const handleDeleteAdvertisement = async (id: string) => {
    if (!token) return;
    const response = await fetch(buildApiUrl(`/api/admin/advertisements/${id}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      loadDashboard(token);
      setStatus('Advertisement removed.');
    }
  };

  const handleUploadAdvertisementImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) {
      return;
    }
    setUploadingAdImage(true);
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
        setAdForm((prev) => ({ ...prev, image: data.url }));
        setStatus('Advertisement banner uploaded successfully.');
      } else {
        setStatus(data.error || 'Failed to upload banner image.');
      }
    } catch (error) {
      setStatus('Advertisement banner upload failed.');
    } finally {
      setUploadingAdImage(false);
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

  const requestStatusCounts = useMemo(() => advertisingRequests.reduce((counts, request) => {
    counts[request.status] = (counts[request.status] || 0) + 1;
    return counts;
  }, {} as Record<string, number>), [advertisingRequests]);

  const handleAdvertisingRequestStatus = async (id: string, status: string) => {
    if (!token) return;
    const response = await fetch(buildApiUrl(`/api/admin/advertising-requests/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      loadDashboard(token);
      setStatus('Advertising request status updated.');
    }
  };

  const overviewCards = useMemo(() => [
    { label: 'Total articles', value: stats.totalArticles },
    { label: 'Total views', value: stats.totalViews },
    { label: 'Total members', value: stats.totalMembers ?? membershipData?.totalMembers ?? 0 },
    { label: 'Free subscribers', value: stats.freeMembers ?? membershipData?.freeSubscribers ?? 0 },
    { label: 'Premium subscribers', value: stats.premiumMembers ?? membershipData?.premiumSubscribers ?? 0 },
  ], [stats, membershipData]);

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
            <input
              id="admin-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none"
              placeholder="Email"
            />
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none"
              placeholder="Password"
            />
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
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
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
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-white">Membership management</h2>
              <div className="text-sm text-slate-400">Revenue visibility for monthly and annual plans</div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-slate-400">Total members</div>
                <div className="mt-3 text-3xl font-semibold text-white">{membershipData?.totalMembers ?? 0}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-slate-400">Free subscribers</div>
                <div className="mt-3 text-3xl font-semibold text-white">{membershipData?.freeSubscribers ?? 0}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-slate-400">Premium subscribers</div>
                <div className="mt-3 text-3xl font-semibold text-white">{membershipData?.premiumSubscribers ?? 0}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-slate-400">Monthly recurring revenue</div>
                <div className="mt-3 text-3xl font-semibold text-white">${membershipData?.monthlyRecurringRevenue ?? 0}</div>
              </div>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
                <h3 className="text-xl font-semibold text-white">Members</h3>
                <div className="mt-4 space-y-2">
                  {membershipData?.members?.length ? membershipData.members.slice(0, 8).map((member) => (
                    <div key={member._id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-400">
                      <div className="font-semibold text-white">{member.name || member.email}</div>
                      <div className="mt-1">{member.email}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2 py-1 text-cyan-200">{member.planLabel || member.subscriptionPlan}</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">{member.subscriptionStatus}</span>
                      </div>
                    </div>
                  )) : <p>No members yet.</p>}
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
                <h3 className="text-xl font-semibold text-white">Payment history</h3>
                <div className="mt-4 space-y-2">
                  {membershipData?.paymentHistory?.length ? membershipData.paymentHistory.slice(0, 8).map((entry) => (
                    <div key={entry._id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-400">
                      <div className="font-semibold text-white">${entry.amount} • {entry.billingCycle}</div>
                      <div className="mt-1">{entry.provider} • {entry.status}</div>
                      <div className="mt-1 text-xs">{new Date(entry.createdAt).toLocaleString()}</div>
                    </div>
                  )) : <p>No payment history yet.</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-2xl font-semibold text-white">Advertising Requests</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {['new', 'approved', 'rejected', 'contacted', 'live', 'completed'].map((statusKey) => (
                <div key={statusKey} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm uppercase tracking-[0.24em] text-slate-400">{statusKey.replace(/\b\w/g, (char) => char.toUpperCase())}</div>
                  <div className="mt-3 text-3xl font-semibold text-white">{requestStatusCounts[statusKey] || 0}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-4">
              {advertisingRequests.length === 0 ? (
                <p className="text-slate-400">No advertising requests have been submitted yet.</p>
              ) : advertisingRequests.map((request) => (
                <div key={request._id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-lg font-semibold text-white">{request.companyName}</div>
                      <div className="mt-1 text-sm text-slate-400">{request.campaignTitle}</div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-cyan-300">
                        <span>{request.advertisementType}</span>
                        <span>{request.budget}</span>
                        <span>{request.status}</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-right text-sm text-slate-400">
                      <div>{request.email}</div>
                      <div>{request.phone || 'No phone provided'}</div>
                      <div>{request.country}</div>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                      <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Objective</div>
                      <p className="mt-2 text-sm text-slate-200">{request.objective}</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                      <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Target Audience</div>
                      <p className="mt-2 text-sm text-slate-200">{request.targetAudience}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                      <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Dates</div>
                      <p className="mt-2 text-sm text-slate-200">{request.startDate ? new Date(request.startDate).toLocaleDateString() : '—'} - {request.endDate ? new Date(request.endDate).toLocaleDateString() : '—'}</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                      <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Website</div>
                      <p className="mt-2 text-sm text-cyan-300 break-all">{request.website || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-slate-300">{request.campaignDescription}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['approved', 'rejected', 'contacted', 'live', 'completed', 'archived'].map((statusKey) => (
                      <button key={statusKey} type="button" onClick={() => handleAdvertisingRequestStatus(request._id, statusKey)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200 transition hover:bg-cyan-500/10">
                        {statusKey.replace(/\b\w/g, (char) => char.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-2xl font-semibold text-white">Advertisements</h2>
            <form onSubmit={handleAdvertisementSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
              <input value={adForm.title} onChange={(event) => setAdForm({ ...adForm, title: event.target.value })} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Campaign title" />
              <input value={adForm.advertiserName} onChange={(event) => setAdForm({ ...adForm, advertiserName: event.target.value })} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Advertiser name" />
              <input value={adForm.destinationUrl} onChange={(event) => setAdForm({ ...adForm, destinationUrl: event.target.value })} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Destination URL" />
              <select value={adForm.placement} onChange={(event) => setAdForm({ ...adForm, placement: event.target.value })} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none">
                <option value="homepage-banner">Homepage banner</option>
                <option value="article-page">Article page</option>
                <option value="sidebar">Sidebar</option>
                <option value="newsletter-sponsorship">Newsletter sponsorship</option>
              </select>
              <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
                <input value={adForm.image} onChange={(event) => setAdForm({ ...adForm, image: event.target.value })} className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Banner image URL" />
                <label className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10">
                  <input type="file" accept="image/*" className="hidden" onChange={handleUploadAdvertisementImage} />
                  {uploadingAdImage ? 'Uploading…' : 'Upload banner'}
                </label>
              </div>
              <input type="date" value={adForm.startDate} onChange={(event) => setAdForm({ ...adForm, startDate: event.target.value })} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input type="date" value={adForm.endDate} onChange={(event) => setAdForm({ ...adForm, endDate: event.target.value })} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" />
              <label className="flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={adForm.active} onChange={(event) => setAdForm({ ...adForm, active: event.target.checked })} /> Active campaign</label>
              <textarea value={adForm.description} onChange={(event) => setAdForm({ ...adForm, description: event.target.value })} className="min-h-24 w-full rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none md:col-span-2" placeholder="Short promotional note" />
              <div className="md:col-span-2">
                <button type="submit" className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 font-semibold text-white">Create advertisement</button>
              </div>
            </form>
            <div className="mt-8 space-y-3">
              {advertisements.map((advertisement) => (
                <div key={advertisement._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-semibold text-white">{advertisement.title}</div>
                      <div className="mt-1 text-sm text-slate-400">{advertisement.advertiserName} • {advertisement.placement}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.2em] text-cyan-300">{advertisement.status}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-cyan-300">
                      <button type="button" onClick={() => handleToggleAdvertisement(advertisement)} className="rounded-full border border-white/10 px-3 py-1">{advertisement.active ? 'Deactivate' : 'Activate'}</button>
                      <button type="button" onClick={() => handleDeleteAdvertisement(advertisement._id)} className="rounded-full border border-rose-400/30 px-3 py-1 text-rose-300">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
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
