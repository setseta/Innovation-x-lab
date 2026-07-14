import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { buildApiUrl } from '../config/api';

type Review = {
  _id: string;
  productName: string;
  category: string;
  rating: number;
  price?: string;
  specifications?: string[];
  pros?: string[];
  cons?: string[];
  verdict?: string;
  image?: string;
};

const ReviewEditorPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [token, setToken] = useState('');
  const [form, setForm] = useState({ productName: '', category: 'Review Lab', rating: 5, price: '', specifications: '', pros: '', cons: '', verdict: '', image: '' });
  const [status, setStatus] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
      setToken(storedToken);
      loadReviews(storedToken);
    }
  }, []);

  const loadReviews = async (currentToken: string) => {
    const response = await fetch(buildApiUrl('/api/reviews'), { headers: { Authorization: `Bearer ${currentToken}` } });
    if (response.ok) {
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    }
  };

  const handleCreateReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    const response = await fetch(buildApiUrl('/api/reviews'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        specifications: form.specifications.split(',').map((v) => v.trim()).filter(Boolean),
        pros: form.pros.split(',').map((v) => v.trim()).filter(Boolean),
        cons: form.cons.split(',').map((v) => v.trim()).filter(Boolean),
      }),
    });
    const data = await response.json();
    setStatus(response.ok ? 'Review saved.' : data.error || 'Unable to save review.');
    if (response.ok) {
      loadReviews(token);
      setForm({ productName: '', category: 'Review Lab', rating: 5, price: '', specifications: '', pros: '', cons: '', verdict: '', image: '' });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>Review Editor | Innovation X Lab</title>
      </Helmet>
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Review Management</p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Create and manage reviews</h1>
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleCreateReview} className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
          <div className="space-y-4">
            <input value={form.productName} onChange={(event) => setForm({ ...form, productName: event.target.value })} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Product name" />
            <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Category" />
            <input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Price" />
            <input value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })} type="number" min={0} max={5} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Rating" />
            <textarea value={form.specifications} onChange={(event) => setForm({ ...form, specifications: event.target.value })} className="w-full rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Specifications (comma separated)" />
            <textarea value={form.pros} onChange={(event) => setForm({ ...form, pros: event.target.value })} className="w-full rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Pros (comma separated)" />
            <textarea value={form.cons} onChange={(event) => setForm({ ...form, cons: event.target.value })} className="w-full rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Cons (comma separated)" />
            <textarea value={form.verdict} onChange={(event) => setForm({ ...form, verdict: event.target.value })} className="w-full rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Verdict" />
            <input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Image URL" />
          </div>
          {status ? <p className="mt-4 text-sm text-cyan-300">{status}</p> : null}
          <button type="submit" className="mt-6 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 font-semibold text-white">Save review</button>
        </form>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
          <h2 className="text-2xl font-semibold text-white">Published reviews</h2>
          <div className="mt-6 space-y-4">
            {reviews.length > 0 ? reviews.map((review) => (
              <div key={review._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">{review.productName}</div>
                <div className="mt-1 text-sm text-slate-400">{review.category} • {review.rating} stars</div>
                <div className="mt-2 text-sm text-slate-400">{review.verdict}</div>
              </div>
            )) : <p className="text-slate-400">No reviews published yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewEditorPage;
