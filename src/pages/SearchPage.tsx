import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { buildApiUrl } from '../config/api';

type Article = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  image?: string;
  author?: string;
};

type Review = {
  _id: string;
  productName: string;
  category: string;
  rating: number;
  verdict?: string;
  image?: string;
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [term, setTerm] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<{ articles: Article[]; reviews: Review[] }>({ articles: [], reviews: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = searchParams.get('q');
    if (!query) return;
    setTerm(query);
    setLoading(true);

    const loadSearch = async () => {
      try {
        const response = await fetch(buildApiUrl(`/api/search?term=${encodeURIComponent(query)}`));
        const data = await response.json();
        setResults({ articles: Array.isArray(data.articles) ? data.articles : [], reviews: Array.isArray(data.reviews) ? data.reviews : [] });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadSearch();
  }, [searchParams]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchParams({ q: term });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>Search | Innovation X Lab</title>
        <meta name="description" content="Search articles and reviews across Innovation X Lab content." />
      </Helmet>

      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Search</p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Find articles, reviews, and categories</h1>
        <p className="mt-6 text-lg text-slate-300">Search the latest published articles and reviews from the Innovation X Lab content platform.</p>
      </div>

      <form onSubmit={handleSearch} className="mt-10 flex flex-col gap-3 sm:flex-row">
        <input value={term} onChange={(event) => setTerm(event.target.value)} className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Search articles or reviews" />
        <button type="submit" className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 font-semibold text-white">Search</button>
      </form>

      {loading ? <p className="mt-8 text-slate-400">Searching…</p> : null}

      {!loading && (
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-white">Articles</h2>
            <div className="mt-6 space-y-4">
              {results.articles.length > 0 ? results.articles.map((article) => (
                <Link key={article._id} to={`/articles/${article.slug}`} state={{ article }} className="block rounded-2xl border border-white/10 bg-slate-900/70 p-5 transition hover:border-cyan-400/40">
                  <div className="text-sm uppercase tracking-[0.25em] text-cyan-400">{article.category}</div>
                  <h3 className="mt-2 text-xl font-semibold text-white">{article.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{article.description}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-cyan-300">
                    <span>{article.author || 'Innovation X Lab'}</span>
                    <span className="inline-flex items-center gap-2">Read <ArrowRight size={14} /></span>
                  </div>
                </Link>
              )) : <p className="text-slate-400">No matching articles found.</p>}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Reviews</h2>
            <div className="mt-6 space-y-4">
              {results.reviews.length > 0 ? results.reviews.map((review) => (
                <div key={review._id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                  <div className="text-sm uppercase tracking-[0.25em] text-cyan-400">{review.category}</div>
                  <h3 className="mt-2 text-xl font-semibold text-white">{review.productName}</h3>
                  <p className="mt-2 text-sm text-slate-400">{review.verdict || 'Review content available in the admin dashboard.'}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-cyan-300">
                    <span>{review.rating} / 5 stars</span>
                    <span className="inline-flex items-center gap-2">View details <ArrowRight size={14} /></span>
                  </div>
                </div>
              )) : <p className="text-slate-400">No matching reviews found.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
