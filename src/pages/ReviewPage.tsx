import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Star } from 'lucide-react';
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

const ReviewPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await fetch(buildApiUrl('/api/reviews'));
        const data = await response.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      }
    };

    loadReviews();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>Review Lab | Innovation X Lab</title>
        <meta name="description" content="Read detailed product reviews, comparisons, ratings, and testing reports." />
      </Helmet>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Review Page</p>
          <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Premium reviews built on testing, context, and clarity</h1>
          <p className="mt-5 text-lg text-slate-300">Detailed product reviews, comparisons, and testing reports designed to help readers choose with confidence.</p>

          {reviews.length > 0 ? reviews.map((review) => (
            <div key={review._id} className="mt-8 rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
              <div className="flex items-center gap-2 text-amber-400">
                {[...Array(5)].map((_, index) => (<Star key={index} size={18} fill={index < review.rating ? 'currentColor' : 'none'} />))}
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-white">{review.productName}</h2>
              <p className="mt-3 text-slate-400">{review.verdict}</p>
              <div className="mt-4 text-sm text-cyan-300">{review.category} • {review.price || 'Price available on request'}</div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-white">Pros</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-400">
                    {(review.pros || []).map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Cons</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-400">
                    {(review.cons || []).map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )) : <p className="mt-8 text-slate-400">No reviews published yet.</p>}
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-6">
          <h3 className="text-xl font-semibold text-white">Specifications</h3>
          <ul className="mt-5 space-y-3 text-sm text-slate-400">
            {reviews.length > 0 ? reviews[0].specifications?.map((spec) => <li key={spec}><span className="text-white">•</span> {spec}</li>) : <li>No specifications available yet.</li>}
          </ul>
          <h3 className="mt-8 text-xl font-semibold text-white">Latest Verdict</h3>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
            {reviews.length > 0 ? reviews[0].verdict : 'Reviews will appear here as soon as they are published.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
