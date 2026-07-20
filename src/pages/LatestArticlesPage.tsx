import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Search as SearchIcon } from 'lucide-react';
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

const categories = ['All', 'AI Lab', 'Gadget Lab', 'Software Lab', 'Code Lab', 'Startup Lab', 'Review Lab'];
const PAGE_SIZE = 9;

const LatestArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortMode, setSortMode] = useState<'newest' | 'oldest'>('newest');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, activeCategory, sortMode]);

  const filteredArticles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const nextArticles = [...articles]
      .filter((article) => {
        const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
        const haystack = `${article.title} ${article.description} ${article.category}`.toLowerCase();
        const matchesSearch = !term || haystack.includes(term);
        return matchesCategory && matchesSearch;
      })
      .sort((left, right) => {
        const leftTime = new Date(left.createdAt || 0).getTime();
        const rightTime = new Date(right.createdAt || 0).getTime();
        return sortMode === 'newest' ? rightTime - leftTime : leftTime - rightTime;
      });

    return nextArticles;
  }, [activeCategory, articles, searchTerm, sortMode]);

  const visibleArticles = filteredArticles.slice(0, visibleCount);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <Helmet>
        <title>Latest Articles | Innovation X Lab</title>
        <meta name="description" content="Browse the latest published stories, sort them by date, and explore every article in one polished archive." />
      </Helmet>

      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Latest Articles</p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">The complete archive, curated for faster reading</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">Search by keyword, filter by lab, and sort by newest or oldest to quickly find the stories that matter to you.</p>
      </div>

      <div className="mt-10 rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-[0_0_35px_rgba(14,165,233,0.08)] sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-slate-300">
            <SearchIcon size={18} className="text-cyan-300" />
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500" placeholder="Search titles, topics, or categories" />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <span className="text-slate-400">Sort</span>
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value as 'newest' | 'oldest')} className="bg-transparent outline-none">
                <option value="newest" className="bg-slate-900">Newest first</option>
                <option value="oldest" className="bg-slate-900">Oldest first</option>
              </select>
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`rounded-full px-3 py-2 text-sm transition ${activeCategory === category ? 'bg-cyan-500 text-white' : 'border border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/40'}`}>
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`latest-skeleton-${index}`} className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/80">
              <div className="h-44 w-full animate-pulse bg-slate-800" />
              <div className="space-y-3 p-6">
                <div className="h-3 w-24 animate-pulse rounded-full bg-slate-800" />
                <div className="h-6 w-full animate-pulse rounded-full bg-slate-800" />
                <div className="h-4 w-full animate-pulse rounded-full bg-slate-800" />
                <div className="h-4 w-4/5 animate-pulse rounded-full bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {visibleArticles.map((article) => (
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

          {filteredArticles.length === 0 ? (
            <div className="mt-10 rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-8 text-center text-slate-400">
              No articles match that combination yet. Try a different keyword or lab.
            </div>
          ) : null}

          {visibleCount < filteredArticles.length ? (
            <div className="mt-10 text-center">
              <button type="button" onClick={() => setVisibleCount((current) => current + PAGE_SIZE)} className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-[0.95rem] font-semibold text-white transition hover:-translate-y-0.5">
                Load more articles
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default LatestArticlesPage;
