import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Crown } from 'lucide-react';
import AdvertisementCard from '../components/AdvertisementCard';
import ArticleShare from '../components/ArticleShare';
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
  seoTitle?: string;
  seoDescription?: string;
};

type Advertisement = {
  _id: string;
  title: string;
  advertiserName: string;
  destinationUrl: string;
  placement: string;
  image?: string;
  videoUrl?: string;
  gifUrl?: string;
  description?: string;
  htmlContent?: string;
  html?: string;
  mediaType?: string;
};

const SITE_NAME = 'Innovation X Lab';
const DEFAULT_ARTICLE_DESCRIPTION = 'Read this article on Innovation X Lab.';
const DEFAULT_ARTICLE_IMAGE = '/favicon.svg';

const getSiteUrl = () => {
  const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim();
  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }

  return 'https://innovationxlab.com';
};

const resolveAbsoluteUrl = (value: string | undefined, baseUrl = getSiteUrl()) => {
  if (!value) {
    return `${baseUrl}${baseUrl.endsWith('/') ? '' : '/'}${DEFAULT_ARTICLE_IMAGE.replace(/^\//, '')}`;
  }

  if (/^https?:\/\//i.test(value) || /^\/\//.test(value)) {
    return value;
  }

  try {
    return new URL(value, baseUrl).toString();
  } catch (error) {
    console.error('Unable to resolve article image URL', error);
    return `${baseUrl}${value.startsWith('/') ? value : `/${value}`}`;
  }
};

const ArticlePage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const fallbackArticle = (location.state as { article?: Article } | null)?.article ?? null;
  const [article, setArticle] = useState<Article | null>(fallbackArticle);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [betweenParagraphAds, setBetweenParagraphAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [premiumMessage, setPremiumMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [token] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem('authToken');
  });

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, nextProgress)));
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

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
          setRelatedArticles(scored.slice(0, 6).map(({ entry }) => entry));

          const [betweenAdsResponse] = await Promise.all([
            fetch(buildApiUrl('/api/advertisements?placement=between-articles')),
          ]);
          const betweenAdsData = await betweenAdsResponse.json();
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
  const readingTime = Math.max(3, Math.ceil((article?.content || '').split(/\s+/).filter(Boolean).length / 180));
  const currentIndex = allArticles.findIndex((entry) => entry.slug === article?.slug);
  const previousArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex >= 0 && currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;
  const siteUrl = getSiteUrl();
  const articleSlug = article?.slug || slug;
  const articleUrl = articleSlug ? `${siteUrl}/articles/${encodeURIComponent(articleSlug)}` : `${siteUrl}/`;
  const metadataTitle = article ? `${article.seoTitle?.trim() || article.title} | ${SITE_NAME}` : `${slug ? `Article: ${slug}` : 'Article'} | ${SITE_NAME}`;
  const metadataDescription = article?.seoDescription?.trim() || article?.description?.trim() || DEFAULT_ARTICLE_DESCRIPTION;
  const shareDescription = metadataDescription.replace(/\s+/g, ' ').trim().slice(0, 160);
  const metadataImage = resolveAbsoluteUrl(article?.image || DEFAULT_ARTICLE_IMAGE, siteUrl);
  const contentWithAds = useMemo(() => paragraphs.flatMap((paragraph, index) => {
    const contentNode = <p key={`paragraph-${index}`} className="mb-6 text-[1.02rem] leading-[1.95] text-slate-300 sm:text-[1.12rem]">{paragraph}</p>;
    const adToShow = betweenParagraphAds[(Math.floor(index / 4)) % Math.max(1, betweenParagraphAds.length)];
    const insertion = index > 0 && index % 4 === 0 && adToShow ? [contentNode, <div key={`ad-${index}`} className="my-8"><AdvertisementCard advertisement={adToShow} variant="inline" className="border-white/10 bg-slate-900/80" /></div>] : [contentNode];
    return insertion;
  }), [paragraphs, betweenParagraphAds]);

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-20 text-slate-400 sm:px-6 lg:px-8 lg:py-24">Loading article…</div>;
  }

  if (!article && premiumMessage) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="fixed inset-x-0 top-0 z-50 h-[2px] bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-600 transition-[width] duration-200" style={{ width: `${scrollProgress}%` }} />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Helmet>
          <title>{metadataTitle}</title>
          <meta name="description" content={metadataDescription} />
          <link rel="canonical" href={articleUrl} />
          <meta property="og:type" content="article" />
          <meta property="og:title" content={metadataTitle} />
          <meta property="og:description" content={metadataDescription} />
          <meta property="og:image" content={metadataImage} />
          <meta property="og:url" content={articleUrl} />
          <meta property="og:site_name" content={SITE_NAME} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={metadataTitle} />
          <meta name="twitter:description" content={metadataDescription} />
          <meta name="twitter:image" content={metadataImage} />
          <meta name="twitter:image:alt" content={article.title} />
        </Helmet>

        <article className="mx-auto max-w-[860px]">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-cyan-300">
            {article.category}
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {article.title}
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
            {article.description}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span>By {article.author || 'Innovation X Lab'}</span>
            <span>•</span>
            <span>{article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'Recently published'}</span>
            <span>•</span>
            <span>{readingTime} min read</span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ArticleShare title={article.title} description={shareDescription} url={articleUrl} className="gap-3" />
          </div>

          {article.image ? (
            <img src={article.image} alt={article.title} className="mt-10 w-full rounded-[1.25rem] border border-white/10 object-cover shadow-[0_24px_80px_rgba(2,8,23,0.35)] sm:h-[420px]" />
          ) : null}

          <div className="mt-10 space-y-6">{contentWithAds}</div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
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

          {relatedArticles.length > 0 ? (
            <section className="mt-16 border-t border-white/10 pt-10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-cyan-300">More from Innovation X Lab</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Related reading</h2>
                </div>
                <Link to="/" className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200">Browse all stories</Link>
              </div>
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {relatedArticles.map((related) => (
                  <Link key={related.slug} to={`/articles/${related.slug}`} state={{ article: related }} className="group rounded-[1.35rem] border border-white/10 bg-slate-900/70 p-5 transition hover:border-cyan-400/30 hover:bg-slate-900">
                    <div className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-cyan-300">{related.category}</div>
                    <h3 className="mt-3 text-lg font-semibold text-white transition group-hover:text-cyan-300">{related.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">{related.description}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">Read story <ArrowRight size={14} /></div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-16 rounded-[1.75rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-slate-900/70 to-violet-500/10 p-8 sm:p-10">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-cyan-300">Newsletter</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Subscribe for a sharper view of global technology.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">Get the most important stories, product launches, and analysis from Innovation X Lab delivered to your inbox.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/membership" className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 font-semibold text-slate-950">Join the community</Link>
              <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-slate-950/70 px-5 py-3 font-semibold text-white">Contact us</Link>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
};

export default ArticlePage;
