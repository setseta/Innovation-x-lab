import { useEffect, useState } from 'react';
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
  published?: boolean;
  createdAt?: string;
};

const CategoryPage = ({ category }: { category: string }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await fetch(buildApiUrl(`/api/articles?category=${encodeURIComponent(category)}&published=true`));
        const data = await response.json();
        setArticles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [category]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>{category} | Innovation X Lab</title>
        <meta name="description" content={`Explore ${category} content from Innovation X Lab.`} />
      </Helmet>
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">{category}</p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Stories curated for {category}</h1>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {loading ? (
          <p className="text-slate-400">Loading articles…</p>
        ) : articles.length === 0 ? (
          <p className="text-slate-400">No articles published in this category yet.</p>
        ) : articles.map((article) => (
          <Link key={article._id} to={`/articles/${article.slug}`} className="block rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
            {article.image ? <img src={article.image} alt={article.title} className="mb-4 h-40 w-full rounded-2xl object-cover" /> : null}
            <h3 className="text-xl font-semibold text-white">{article.title}</h3>
            <p className="mt-3 text-sm text-slate-400">{article.description}</p>
            <div className="mt-5 flex items-center justify-between text-sm text-cyan-300">
              <span>{article.author || 'Innovation X Lab'}</span>
              <span className="inline-flex items-center gap-2">Read article <ArrowRight size={14} /></span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
