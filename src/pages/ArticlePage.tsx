import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Crown, Facebook, Linkedin, Share2, Twitter } from 'lucide-react';
import { buildApiUrl } from '../config/api';

type Article = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  content: string;
  image?: string;
  author?: string;
  premium?: boolean;
  createdAt?: string;
};

type Advertisement = {
  _id: string;
  title: string;
  advertiserName: string;
  destinationUrl: string;
  placement: string;
  image?: string;
  description?: string;
};

const ArticlePage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [articleAds, setArticleAds] = useState<Advertisement[]>([]);
  const [sidebarAds, setSidebarAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [premiumMessage, setPremiumMessage] = useState('');
  const [token] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem('authToken');
  });

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const response = await fetch(buildApiUrl(`/api/articles/${slug}`), headers ? { headers } : undefined);
        const data = await response.json();
        if (response.ok && data && !data.error) {
          setArticle(data);
          setPremiumMessage('');
        } else if (data?.premiumRequired) {
          setPremiumMessage(data.error || 'Unlock this article with Innovation X Premium.');
          setArticle(null);
        }
        if (data && !data.error) {
          const relatedResponse = await fetch(buildApiUrl(`/api/articles?published=true&limit=4`));
          const relatedData = await relatedResponse.json();
          setRelatedArticles((Array.isArray(relatedData) ? relatedData : []).filter((entry: Article) => entry.slug !== slug).slice(0, 3));

          const [articleAdsResponse, sidebarAdsResponse] = await Promise.all([
            fetch(buildApiUrl('/api/advertisements?placement=article-page')),
            fetch(buildApiUrl('/api/advertisements?placement=sidebar')),
          ]);
          const articleAdsData = await articleAdsResponse.json();
          const sidebarAdsData = await sidebarAdsResponse.json();
          setArticleAds(Array.isArray(articleAdsData) ? articleAdsData : []);
          setSidebarAds(Array.isArray(sidebarAdsData) ? sidebarAdsData : []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug, token]);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-slate-400">Loading article…</div>;
  }

  if (!article && premiumMessage) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300"><Crown size={24} /></div>
          <h1 className="mt-6 text-3xl font-semibold text-white">Unlock this article with Innovation X Premium.</h1>
          <p className="mt-4 text-lg text-slate-300">Premium members get deeper reporting, exclusive research, and member-only content.</p>
          <Link to="/membership" className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 font-semibold text-white">View premium plans</Link>
        </div>
      </div>
    );
  }

  if (!article) {
    return <Navigate to="/" replace />;
  }

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
            <span>By {article.author || 'Innovation X Lab'}</span>
            <span>•</span>
            <span>{article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'Recently published'}</span>
            <span>•</span>
            <span>{Math.max(3, Math.ceil((article.content || '').split(/\s+/).length / 180))} min read</span>
          </div>
          {article.image ? <img src={article.image} alt={article.title} className="mt-8 h-72 w-full rounded-[1.5rem] object-cover" /> : null}
          <p className="mt-8 text-lg leading-8 text-slate-300">{article.description}</p>
          <div className="mt-6 whitespace-pre-line text-lg leading-8 text-slate-300">{article.content}</div>
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
          {articleAds.length > 0 ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-6">
              <h3 className="text-xl font-semibold text-white">Sponsored</h3>
              <div className="mt-4 space-y-3">
                {articleAds.map((ad) => (
                  <a key={ad._id} href={ad.destinationUrl} target="_blank" rel="noreferrer" className="block rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    {ad.image ? <img src={ad.image} alt={ad.title} className="h-24 w-full rounded-xl object-cover" /> : null}
                    <div className="mt-3">
                      <div className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-cyan-300">Partner</div>
                      <h4 className="mt-2 text-base font-semibold text-white">{ad.title}</h4>
                      {ad.description ? <p className="mt-2 text-sm text-slate-400">{ad.description}</p> : null}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
          {sidebarAds.length > 0 ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
              <h3 className="text-xl font-semibold text-white">Featured Partner</h3>
              <div className="mt-4 space-y-3">
                {sidebarAds.map((ad) => (
                  <a key={ad._id} href={ad.destinationUrl} target="_blank" rel="noreferrer" className="block rounded-2xl border border-white/10 bg-white/5 p-4">
                    {ad.image ? <img src={ad.image} alt={ad.title} className="h-20 w-full rounded-xl object-cover" /> : null}
                    <div className="mt-3">
                      <div className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-cyan-300">Sidebar</div>
                      <h4 className="mt-2 text-base font-semibold text-white">{ad.title}</h4>
                      {ad.description ? <p className="mt-2 text-sm text-slate-400">{ad.description}</p> : null}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
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
