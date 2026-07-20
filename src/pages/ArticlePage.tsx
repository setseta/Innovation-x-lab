import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Crown } from 'lucide-react';
import AdvertisementCard from '../components/AdvertisementCard';
import SocialIcons from '../components/SocialIcons';
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
  tags?: string[];
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
  const location = useLocation();
  const fallbackArticle = (location.state as { article?: Article } | null)?.article ?? null;
  const [article, setArticle] = useState<Article | null>(fallbackArticle);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [articleAds, setArticleAds] = useState<Advertisement[]>([]);
  const [sidebarAds, setSidebarAds] = useState<Advertisement[]>([]);
  const [betweenParagraphAds, setBetweenParagraphAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [premiumMessage, setPremiumMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [token] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem('authToken');
  });

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) {
        setArticle(null);
        setPremiumMessage('');
        setErrorMessage('');
        setLoading(false);
        return;
      }

      if (fallbackArticle && fallbackArticle.slug === slug) {
        setArticle(fallbackArticle);
        setLoading(false);
        setPremiumMessage('');
        setErrorMessage('');
      } else {
        setLoading(true);
        setArticle(null);
        setPremiumMessage('');
        setErrorMessage('');
      }

      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const response = await fetch(buildApiUrl(`/api/articles/${encodeURIComponent(slug)}`), headers ? { headers } : undefined);
        const data = await response.json();

        if (response.ok && data && !data.error) {
          setArticle(data);
          setPremiumMessage('');
          setErrorMessage('');

          const relatedResponse = await fetch(buildApiUrl('/api/articles?published=true&limit=12'));
          const relatedData = await relatedResponse.json();
          const list = Array.isArray(relatedData) ? relatedData : [];
          setAllArticles(list);
          const baseRelated = list.filter((entry: Article) => entry.slug !== slug);
          const currentCategory = data.category || '';
          const currentTags = Array.isArray(data.tags) ? data.tags : [];
          const scored = baseRelated.map((entry: Article) => {
            const categoryScore = entry.category === currentCategory ? 3 : 0;
            const tagScore = (entry.tags || []).reduce<number>((sum, tag) => sum + (currentTags.includes(tag) ? 1 : 0), 0);
            return { entry, score: categoryScore + tagScore };
          }).sort((left, right) => right.score - left.score || (new Date(right.entry.createdAt || 0).getTime() - new Date(left.entry.createdAt || 0).getTime()));
          setRelatedArticles(scored.slice(0, 4).map(({ entry }) => entry));

          const [articleAdsResponse, sidebarAdsResponse, betweenAdsResponse] = await Promise.all([
            fetch(buildApiUrl('/api/advertisements?placement=article-page')),
            fetch(buildApiUrl('/api/advertisements?placement=sidebar')),
            fetch(buildApiUrl('/api/advertisements?placement=between-articles')),
          ]);
          const articleAdsData = await articleAdsResponse.json();
          const sidebarAdsData = await sidebarAdsResponse.json();
          const betweenAdsData = await betweenAdsResponse.json();
          setArticleAds(Array.isArray(articleAdsData) ? articleAdsData : []);
          setSidebarAds(Array.isArray(sidebarAdsData) ? sidebarAdsData : []);
          setBetweenParagraphAds(Array.isArray(betweenAdsData) ? betweenAdsData : []);
        } else if (data?.premiumRequired) {
          setPremiumMessage(data.error || 'Unlock this article with Innovation X Premium.');
          setArticle(fallbackArticle ?? null);
          setErrorMessage('');
        } else {
          setErrorMessage(data?.error || 'This article could not be loaded right now.');
          setArticle(fallbackArticle ?? null);
          setPremiumMessage('');
        }
      } catch (error) {
        console.error(error);
        setArticle(fallbackArticle ?? null);
        setPremiumMessage('');
        setErrorMessage(fallbackArticle ? 'The article preview is available, but the live content could not be refreshed right now.' : 'Unable to load this article right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [fallbackArticle, slug, token]);

  const paragraphs = useMemo(() => (article?.content || '').split(/\n{2,}/).filter(Boolean), [article?.content]);
  const currentIndex = allArticles.findIndex((entry) => entry.slug === article?.slug);
  const previousArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex >= 0 && currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;
  const contentWithAds = useMemo(() => paragraphs.flatMap((paragraph, index) => {
    const contentNode = <p key={`paragraph-${index}`} className="mb-5 text-lg leading-8 text-slate-300">{paragraph}</p>;
    const insertion = index > 0 && index % 3 === 0 && betweenParagraphAds[0] ? [contentNode, <div key={`ad-${index}`} className="my-6"><AdvertisementCard advertisement={betweenParagraphAds[0]} variant="inline" className="border-cyan-400/20" /></div>] : [contentNode];
    return insertion;
  }), [paragraphs, betweenParagraphAds]);

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
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-10 text-center shadow-[0_0_35px_rgba(14,165,233,0.1)]">
          <h1 className="text-3xl font-semibold text-white">Article unavailable</h1>
          <p className="mt-4 text-lg text-slate-300">{errorMessage || 'This story could not be loaded right now.'}</p>
          <Link to="/" className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 font-semibold text-white">Return home</Link>
        </div>
      </div>
    );
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
          <p className="mt-8 text-[1.125rem] leading-8 text-slate-300">{article.description}</p>
          <div className="mt-6">{contentWithAds}</div>
          <div className="mt-8 flex flex-wrap gap-3">
            <SocialIcons className="gap-3" />
          </div>
          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {previousArticle ? (
              <Link to={`/articles/${previousArticle.slug}`} state={{ article: previousArticle }} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:text-cyan-300">
                <ArrowRight size={14} className="rotate-180" /> Previous Article
              </Link>
            ) : <span className="text-sm text-slate-500">You’re at the newest story.</span>}
            {nextArticle ? (
              <Link to={`/articles/${nextArticle.slug}`} state={{ article: nextArticle }} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-3 font-semibold text-white">
                Next Article <ArrowRight size={14} />
              </Link>
            ) : <span className="text-sm text-slate-500">This is the latest story in the feed.</span>}
          </div>
        </article>

        <aside className="space-y-6">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-xl font-semibold text-white">Related Articles</h3>
            <div className="mt-4 space-y-3">
              {relatedArticles.map((related) => (
                <Link key={related.slug} to={`/articles/${related.slug}`} state={{ article: related }} className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-400/30 hover:bg-cyan-500/10">
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
            <div className="hidden lg:block">
              <div className="sticky top-24 rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_0_30px_rgba(34,211,238,0.08)]">
                <h3 className="text-xl font-semibold text-white">Featured Partner</h3>
                <div className="mt-4 space-y-3">
                  {sidebarAds.map((ad) => (
                    <AdvertisementCard key={ad._id} advertisement={ad} variant="sidebar" className="border-white/10 bg-slate-950/70" />
                  ))}
                </div>
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
