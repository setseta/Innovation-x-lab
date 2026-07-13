import { Link, Navigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Facebook, Linkedin, Share2, Twitter } from 'lucide-react';
import { allArticles } from '../data/content';

const ArticlePage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const article = allArticles.find((entry) => entry.slug === slug) ?? allArticles[0];

  if (!article) {
    return <Navigate to="/" replace />;
  }

  const relatedArticles = allArticles.filter((entry) => entry.slug !== article.slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <Helmet>
        <title>{`${article.title} | Innovation X Lab`}</title>
        <meta name="description" content={article.description} />
      </Helmet>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-[0_0_35px_rgba(14,165,233,0.1)] sm:p-10">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-cyan-300">
            {article.category}
          </div>
          <h1 className="mt-5 text-4xl font-semibold text-white sm:text-5xl">{article.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <span>By {article.author}</span>
            <span>•</span>
            <span>{article.publishedAt}</span>
            <span>•</span>
            <span>{article.readingTime}</span>
          </div>
          <img src={article.image} alt={article.title} className="mt-8 h-72 w-full rounded-[1.5rem] object-cover" />
          <p className="mt-8 text-lg leading-8 text-slate-300">{article.description}</p>
          {article.content.map((paragraph) => (
            <p key={paragraph} className="mt-6 text-lg leading-8 text-slate-300">
              {paragraph}
            </p>
          ))}
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="rounded-full border border-white/10 bg-white/5 p-3 text-slate-200 transition hover:border-cyan-400/30 hover:text-cyan-300"><Twitter size={16} /></button>
            <button className="rounded-full border border-white/10 bg-white/5 p-3 text-slate-200 transition hover:border-cyan-400/30 hover:text-cyan-300"><Facebook size={16} /></button>
            <button className="rounded-full border border-white/10 bg-white/5 p-3 text-slate-200 transition hover:border-cyan-400/30 hover:text-cyan-300"><Linkedin size={16} /></button>
            <button className="rounded-full border border-white/10 bg-white/5 p-3 text-slate-200 transition hover:border-cyan-400/30 hover:text-cyan-300"><Share2 size={16} /></button>
          </div>
        </article>

        <aside className="space-y-6">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-xl font-semibold text-white">Related Articles</h3>
            <div className="mt-4 space-y-3">
              {relatedArticles.map((related) => (
                <Link key={related.slug} to={`/articles/${related.slug}`} className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-400/30 hover:bg-cyan-500/10">
                  <div className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-cyan-300">{related.category}</div>
                  <h4 className="mt-2 text-base font-semibold text-white">{related.title}</h4>
                  <p className="mt-2 text-sm text-slate-400">{related.description}</p>
                  <div className="mt-3 inline-flex items-center gap-2 text-sm text-cyan-300">Read article <ArrowRight size={14} /></div>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-6">
            <h3 className="text-xl font-semibold text-white">Global Perspective</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">Join the conversation around the future of intelligent technology and the companies shaping it worldwide.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ArticlePage;
