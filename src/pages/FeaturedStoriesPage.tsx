import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
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
  content?: string;
  createdAt?: string;
};

const FeaturedStoriesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await fetch(buildApiUrl('/api/articles?published=true'));
        const data = await response.json();
        const list = Array.isArray(data) ? data : [];
        setArticles(list);
      } catch (error) {
        console.error(error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    void loadArticles();
  }, []);

  const featuredArticles = useMemo(() => [...articles].sort((left, right) => {
    const leftTime = new Date(left.createdAt || 0).getTime();
    const rightTime = new Date(right.createdAt || 0).getTime();
    return rightTime - leftTime;
  }), [articles]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <Helmet>
        <title>Featured Stories | Innovation X Lab</title>
        <meta name="description" content="Browse every featured technology story from Innovation X Lab in one polished newsroom archive." />
      </Helmet>

      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Featured Stories</p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Every highlighted story, gathered in one place</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">From labs and product reviews to AI breakthroughs and startup analysis, this archive keeps the best stories easy to browse.</p>
      </div>

      {loading ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`featured-skeleton-${index}`} className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/80">
              <div className="h-44 w-full animate-pulse bg-slate-800" />
              <div className="space-y-3 p-6">
                <div className="h-3 w-24 animate-pulse rounded-full bg-slate-800" />
                <div className="h-6 w-full animate-pulse rounded-full bg-slate-800" />
                <div className="h-4 w-full animate-pulse rounded-full bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredArticles.map((article) => (
            <Link key={article._id} to={`/articles/${article.slug}`} state={{ article }} className="group block">
              <article className="group h-full overflow-hidden rounded-[1.65rem] border border-white/10 bg-slate-950/80 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_0_35px_rgba(34,211,238,0.14)]">
                <div className="overflow-hidden">
                  <img loading="lazy" decoding="async" src={article.image || '/placeholder.jpg'} alt={article.title} className="h-48 w-full object-cover transition duration-500 group-hover:scale-110" />
                </div>
                <div className="p-7">
                  <div className="flex items-center justify-between gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1">{article.category}</span>
                    <span className="text-slate-500">{article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'Fresh'}</span>
                  </div>
                  <h3 className="mt-5 text-[1.2rem] font-semibold leading-tight text-white">{article.title}</h3>
                  <p className="mt-3 text-[0.95rem] leading-7 text-slate-400">{article.description}</p>
                  <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
                    <span>{article.author || 'Innovation X Lab'}</span>
                    <span className="inline-flex items-center gap-2 font-semibold text-cyan-300">Read story <ArrowRight size={14} /></span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedStoriesPage;
