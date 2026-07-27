import { motion } from 'framer-motion';
import { Activity, ArrowRight, Bot, Cpu, Orbit, Rocket, Share2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AdvertisementCard from '../components/AdvertisementCard';
import LazySection from '../components/LazySection';
import { buildApiUrl } from '../config/api';
import { getHomepageArticlesCacheKey, getHomepageArticlesRequestPromise, getStoredHomepageArticles, isHomepageArticlesCacheFresh, mergeHomepageArticles, optimizeImageUrl, type HomepageArticle } from '../utils/homepageArticles';

type Article = HomepageArticle;

type Advertisement = {
  _id: string;
  title: string;
  advertiserName: string;
  destinationUrl: string;
  placement: string;
  image?: string;
  description?: string;
};

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [articles, setArticles] = useState<Article[]>(() => getStoredHomepageArticles(getHomepageArticlesCacheKey('All')));
  const [isArticlesLoading, setIsArticlesLoading] = useState(articles.length === 0);
  const [heroAds, setHeroAds] = useState<Advertisement[]>([]);
  const [homepageAds, setHomepageAds] = useState<Advertisement[]>([]);
  const [storyAds, setStoryAds] = useState<Advertisement[]>([]);
  const [newsletterAds, setNewsletterAds] = useState<Advertisement[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const latestArticlesRequestRef = useRef<AbortController | null>(null);

  const categories = ['All', 'AI Lab', 'Gadget Lab', 'Software Lab', 'Code Lab', 'Startup Lab', 'Review Lab'];

  const experiments = [
    {
      title: 'AI Agents',
      description: 'Experiments with autonomous AI systems and intelligent workflows.',
      status: 'LIVE EXPERIMENT',
      icon: Bot,
      accent: 'from-cyan-500/25 to-cyan-500/5',
    },
    {
      title: 'Quantum Computing',
      description: 'Exploring next-generation computing possibilities with new architectures.',
      status: 'IN DEVELOPMENT',
      icon: Cpu,
      accent: 'from-violet-500/25 to-violet-500/5',
    },
    {
      title: 'Future Interfaces',
      description: 'Research into human-computer interaction and ambient computing.',
      status: 'COMING SOON',
      icon: Orbit,
      accent: 'from-fuchsia-500/25 to-fuchsia-500/5',
    },
    {
      title: 'Robotics',
      description: 'Testing automation and intelligent machines in real environments.',
      status: 'LIVE EXPERIMENT',
      icon: Rocket,
      accent: 'from-emerald-500/25 to-emerald-500/5',
    },
  ];

  // latest articles are loaded dynamically from the backend; no hardcoded data

  const activityAreas = [
    { name: 'Artificial Intelligence', level: 94, note: 'Autonomous systems, agent workflows, and model evaluation.' },
    { name: 'Quantum Computing', level: 72, note: 'Research into new architectures and hybrid computing models.' },
    { name: 'Robotics', level: 81, note: 'Field testing for adaptive machines and intelligent automation.' },
    { name: 'Future Interfaces', level: 88, note: 'Immersive interaction systems for next-generation products.' },
    { name: 'Emerging Software', level: 90, note: 'Developer tools and infrastructure shaping modern product teams.' },
  ];

  const fetchArticles = async (options?: { forceRefresh?: boolean }) => {
    const cacheKey = getHomepageArticlesCacheKey('All');
    const cachedArticles = getStoredHomepageArticles(cacheKey);
    const isCachedFresh = isHomepageArticlesCacheFresh(cacheKey);

    if (cachedArticles.length > 0 && isCachedFresh && !options?.forceRefresh) {
      setArticles(cachedArticles);
      setIsArticlesLoading(false);
      return;
    }

    if (cachedArticles.length > 0) {
      setArticles(cachedArticles);
      setIsArticlesLoading(false);
    } else {
      setIsArticlesLoading(true);
    }

    latestArticlesRequestRef.current?.abort();
    const requestController = new AbortController();
    latestArticlesRequestRef.current = requestController;

    const url = '/api/articles?published=true&limit=16';

    const requestPromise = getHomepageArticlesRequestPromise(cacheKey, async () => {
      const response = await fetch(buildApiUrl(url), { signal: requestController.signal });
      if (!response.ok) {
        throw new Error(`Unable to load articles (${response.status})`);
      }
      const data = await response.json();
      const normalizedArticles = Array.isArray(data) ? data : [];
      return mergeHomepageArticles(cachedArticles, normalizedArticles);
    });

    try {
      const nextArticles = await requestPromise;
      if (latestArticlesRequestRef.current?.signal === requestController.signal) {
        setArticles(nextArticles);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error(error);
        if (cachedArticles.length === 0) {
          setArticles([]);
        }
      }
    } finally {
      if (latestArticlesRequestRef.current?.signal === requestController.signal) {
        setIsArticlesLoading(false);
      }
    }
  };

  useEffect(() => {
    void fetchArticles({ forceRefresh: false });

    (async () => {
      try {
        const [heroResponse, homepageResponse, storyResponse, newsletterResponse] = await Promise.all([
          fetch(buildApiUrl('/api/advertisements?placement=hero-banner')),
          fetch(buildApiUrl('/api/advertisements?placement=homepage-banner')),
          fetch(buildApiUrl('/api/advertisements?placement=story-card')),
          fetch(buildApiUrl('/api/advertisements?placement=newsletter-sponsorship')),
        ]);
        const heroData = await heroResponse.json();
        const homepageData = await homepageResponse.json();
        const storyData = await storyResponse.json();
        const newsletterData = await newsletterResponse.json();
        setHeroAds(Array.isArray(heroData) ? heroData : []);
        setHomepageAds(Array.isArray(homepageData) ? homepageData : []);
        setStoryAds(Array.isArray(storyData) ? storyData : []);
        setNewsletterAds(Array.isArray(newsletterData) ? newsletterData : []);
      } catch (error) {
        console.error(error);
        setHomepageAds([]);
        setNewsletterAds([]);
      }
    })();

    return () => {
      latestArticlesRequestRef.current?.abort();
    };
  }, []);

  /*
    const fetchAds = async () => {
      try {
        const [heroResponse, homepageResponse, storyResponse, newsletterResponse] = await Promise.all([
          fetch(buildApiUrl('/api/advertisements?placement=hero-banner')),
          fetch(buildApiUrl('/api/advertisements?placement=homepage-banner')),
          fetch(buildApiUrl('/api/advertisements?placement=story-card')),
          fetch(buildApiUrl('/api/advertisements?placement=newsletter-sponsorship')),
        ]);
        const heroData = await heroResponse.json();
        const homepageData = await homepageResponse.json();
        const storyData = await storyResponse.json();
        const newsletterData = await newsletterResponse.json();
        setHeroAds(Array.isArray(heroData) ? heroData : []);
        setHomepageAds(Array.isArray(homepageData) ? homepageData : []);
        setStoryAds(Array.isArray(storyData) ? storyData : []);
        setNewsletterAds(Array.isArray(newsletterData) ? newsletterData : []);
      } catch (error) {
        console.error(error);
        setHomepageAds([]);
        setNewsletterAds([]);
      }
    };
    fetchAds();
  }, []);
*/

  const filteredStories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return articles.filter((story) => {
      const categoryMatches = activeCategory === 'All' || story.category === activeCategory;
      const matchesSearch = !term || story.title.toLowerCase().includes(term) || story.description.toLowerCase().includes(term) || (story.content?.toLowerCase().includes(term));
      return categoryMatches && matchesSearch;
    });
  }, [searchTerm, activeCategory, articles]);

  const latestReleases = useMemo(() => articles.slice(0, 4), [articles]);
  const heroArticle = latestReleases[0] ?? null;
  const compactLatestReleases = latestReleases.slice(1);
  const acrossLabStories = filteredStories.slice(3, 7);

  const getStoryExcerpt = (story: Article) => {
    const rawText = story.excerpt || story.description || story.content || '';
    const normalizedText = rawText.replace(/\s+/g, ' ').trim();
    if (!normalizedText) {
      return 'Read the full story for a deeper look at this latest development.';
    }
    if (normalizedText.length <= 220) {
      return normalizedText;
    }
    return `${normalizedText.slice(0, 217).trimEnd()}…`;
  };

  const getFeaturedExcerpt = (story: Article) => {
    const raw = story.content || story.excerpt || story.description || '';
    const blocks = raw.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
    const joined = blocks.slice(0, 3).join(' ');
    const trimmed = joined.replace(/\s+/g, ' ').trim();
    if (!trimmed) return 'Read the full story for a deeper look at this latest development.';
    return trimmed.length > 250 ? `${trimmed.slice(0, 250).trimEnd()}…` : trimmed;
  };

  useEffect(() => {
    if (!articles.length) {
      return;
    }

    const urls = articles.slice(0, 10).map((article) => optimizeImageUrl(article.image, 900));
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [articles]);

  const handleShare = async () => {
    if (!heroArticle) {
      return;
    }

    const shareUrl = `${window.location.origin}/articles/${heroArticle.slug}`;
    const shareText = `${heroArticle.title} — ${getFeaturedExcerpt(heroArticle)}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: heroArticle.title, text: shareText, url: shareUrl });
        setShareMessage('Article shared successfully.');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage('Link copied to clipboard.');
      }
    } catch (error) {
      setShareMessage('Unable to share right now.');
    }
  };

  useEffect(() => {
    if (!heroArticle?.slug) {
      return;
    }

    const controller = new AbortController();
    const prefetchUrl = buildApiUrl(`/api/articles/${encodeURIComponent(heroArticle.slug)}`);
    const prefetchArticle = async () => {
      try {
        await fetch(prefetchUrl, { signal: controller.signal });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Unable to prefetch article', error);
        }
      }
    };

    void prefetchArticle();
    return () => controller.abort();
  }, [heroArticle?.slug]);

  const shouldShowInitialSkeleton = isArticlesLoading && articles.length === 0;

  const trendingArticles = filteredStories.slice(0, 3);

  const handleNewsletterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch(buildApiUrl('/api/newsletter'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await response.json();
      setNewsletterStatus(data.message || data.error || 'Subscription received');
      setNewsletterEmail('');
    } catch (error) {
      setNewsletterStatus('Unable to subscribe right now.');
    }
  };

  return (
    <div>
      <Helmet>
        <title>Innovation X Lab | Future Technology Media</title>
        <meta name="description" content="Explore AI, gadgets, software, coding, and startup innovation at Innovation X Lab." />
        {heroArticle?.image ? <link rel="preload" as="image" href={heroArticle.image} /> : null}
      </Helmet>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.2),transparent_26%)]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="absolute left-10 top-20 h-24 w-24 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-16 right-12 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:gap-10 sm:px-6 sm:py-20 lg:grid-cols-1 lg:gap-12 lg:px-8 lg:py-32">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
            <h1 className="hero-heading mt-3 max-w-3xl font-semibold leading-tight text-white">
              Exploring The Technologies That Shape Tomorrow
            </h1>
            <p className="subhead mt-4 max-w-2xl text-slate-300 sm:mt-6">
              Discover AI breakthroughs, innovative gadgets, software, coding insights, and startups changing the world.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
              <Link to="/review" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 font-semibold text-white shadow-[0_0_35px_rgba(34,211,238,0.2)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(34,211,238,0.28)] sm:w-auto">
                Explore Technology <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="inline-flex w-full items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 font-semibold text-slate-100 transition duration-300 hover:bg-white/10 sm:w-auto">
                Join Newsletter
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-sm text-slate-400 sm:mt-8 sm:gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Global partnerships</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Emerging tech coverage</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Founder-led insights</span>
            </div>
          </motion.div>
        </div>
      </section>

      {heroAds.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pb-2 pt-4 sm:px-6 lg:px-8 lg:pb-4 lg:pt-6">
          <div className="overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-slate-900/75 p-3 shadow-[0_0_45px_rgba(34,211,238,0.08)] sm:p-4">
            {heroAds.map((ad) => (
              <AdvertisementCard key={ad._id} advertisement={ad} variant="hero" className="rounded-[1.6rem]" />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24 lg:pt-8">
        <div className="border-0 bg-transparent p-0 sm:p-0 lg:p-0">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
                Latest Releases
              </div>
              <h2 className="home-section-title mt-4 font-semibold text-white">The newest stories lead the newsroom</h2>
              <p className="home-article-body mt-3 max-w-2xl text-slate-400">A compact, publication-style stream keeps the homepage focused, while the full archive remains a tap away.</p>
            </div>
            <Link to="/latest-articles" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200">
              Browse all releases <ArrowRight size={16} />
            </Link>
          </div>



          {shouldShowInitialSkeleton ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/80">
                  <div className="h-48 w-full animate-pulse bg-slate-800" />
                  <div className="space-y-3 p-6">
                    <div className="h-3 w-24 animate-pulse rounded-full bg-slate-800" />
                    <div className="h-6 w-full animate-pulse rounded-full bg-slate-800" />
                    <div className="h-4 w-full animate-pulse rounded-full bg-slate-800" />
                    <div className="h-4 w-4/5 animate-pulse rounded-full bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-8 space-y-8">
            {shouldShowInitialSkeleton ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={`latest-skeleton-${index}`} className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/80">
                  <div className="h-48 w-full animate-pulse bg-slate-800" />
                  <div className="space-y-3 p-6">
                    <div className="h-3 w-24 animate-pulse rounded-full bg-slate-800" />
                    <div className="h-6 w-full animate-pulse rounded-full bg-slate-800" />
                    <div className="h-4 w-full animate-pulse rounded-full bg-slate-800" />
                    <div className="h-4 w-4/5 animate-pulse rounded-full bg-slate-800" />
                  </div>
                </div>
              ))
            ) : (
              <>
                {latestReleases[0] ? (
                  <motion.article initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.35 }} whileHover={{ y: -4, scale: 1.005 }} className="group overflow-hidden border-b border-cyan-400/20">
                    <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
                      <div className="overflow-hidden">
                        <img loading="eager" decoding="async" fetchPriority="high" sizes="(min-width: 1024px) 55vw, 100vw" src={optimizeImageUrl(latestReleases[0].image, 1400)} alt={latestReleases[0].title} className="h-72 w-full object-cover transition duration-500 group-hover:scale-105 lg:h-full" />
                      </div>
                      <div className="flex flex-col justify-between p-6 sm:p-8">
                        <div>
                          <div className="flex flex-wrap items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-cyan-300">
                            <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5">{heroArticle.category}</span>
                            <span className="text-slate-500">{heroArticle.createdAt ? new Date(heroArticle.createdAt).toLocaleDateString() : 'New'}</span>
                          </div>
                          <h3 className="home-article-title mt-4 text-white">{heroArticle.title}</h3>
                          <p className="home-article-body mt-4 text-slate-400">{getFeaturedExcerpt(heroArticle)}</p>
                        </div>
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm text-slate-400">
                          <span>{heroArticle.author || 'Innovation X Lab'}</span>
                          <span>{heroArticle.readingTime ?? Math.max(3, Math.ceil(((heroArticle.content || '') as string).split(/\s+/).length / 180))} min read</span>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <Link to={`/articles/${heroArticle.slug}`} state={{ article: heroArticle }} className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/15">
                            Continue Reading <ArrowRight size={14} />
                          </Link>
                          <button type="button" onClick={handleShare} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10">
                            <Share2 size={16} /> Share
                          </button>
                        </div>
                        {shareMessage ? <div className="mt-3 text-sm text-cyan-300">{shareMessage}</div> : null}
                      </div>
                    </div>
                  </motion.article>
                ) : null}

                {compactLatestReleases.length > 0 ? (
                  <div className="grid gap-6 lg:grid-cols-3">
                    {compactLatestReleases.map((release, idx) => {
                      const shouldShowAd = homepageAds[0] && (idx + 1) % 3 === 0;
                      return (
                        <div key={release.slug} className="space-y-4">
                          <motion.article initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.35, delay: idx * 0.03 }} whileHover={{ y: -4, scale: 1.005 }} className="group overflow-hidden border-b border-cyan-400/20">
                            <div className="overflow-hidden">
                              <img loading="lazy" decoding="async" sizes="(min-width: 1024px) 33vw, 100vw" src={optimizeImageUrl(release.image, 900)} alt={release.title} className="h-48 w-full object-cover transition duration-500 group-hover:scale-105" />
                            </div>
                            <div className="p-6">
                              <div className="flex flex-wrap items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-cyan-300">
                                <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5">{release.category}</span>
                                <span className="text-slate-500">{release.createdAt ? new Date(release.createdAt).toLocaleDateString() : 'New'}</span>
                              </div>
                              <h3 className="home-article-title mt-4 text-white">{release.title}</h3>
                              <p className="home-article-body mt-3 text-slate-400">{getStoryExcerpt(release)}</p>
                              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm text-slate-400">
                                <span>{release.readingTime ?? Math.max(3, Math.ceil(((release.content || '') as string).split(/\s+/).length / 180))} min read</span>
                                <Link to={`/articles/${release.slug}`} state={{ article: release }} className="inline-flex items-center gap-2 font-semibold text-cyan-300 transition hover:text-cyan-200">
                                  Continue Reading <ArrowRight size={14} />
                                </Link>
                              </div>
                            </div>
                          </motion.article>
                          {shouldShowAd ? <div className="pt-2"><AdvertisementCard advertisement={homepageAds[0]} variant="inline" className="border-0 bg-transparent shadow-none" /></div> : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <Link to="/latest-articles" className="inline-flex items-center justify-center rounded-full border border-cyan-400/20 bg-white/5 px-6 py-3 text-[0.95rem] font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:bg-cyan-500/10">
              Explore More Articles
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-16">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Featured Technology Stories</p>
            <h2 className="section-heading mt-2 font-semibold text-white">Across the Labs</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 outline-none" placeholder="Search stories" />
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button key={category} onClick={() => setActiveCategory(category)} className={`rounded-full px-3 py-2 text-sm ${activeCategory === category ? 'bg-cyan-500 text-white' : 'border border-white/10 bg-white/5 text-slate-300'}`}>
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {acrossLabStories.map((story, index) => {
            const shouldShowStoryAd = index === 1 && storyAds[0];
            return (
              <div key={story.slug} className="space-y-6">
                <Link to={`/articles/${story.slug}`} state={{ article: story }} onMouseEnter={() => void fetch(buildApiUrl(`/api/articles/${encodeURIComponent(story.slug)}`), { headers: { 'Cache-Control': 'max-age=300' } }).catch(() => undefined)} onFocus={() => void fetch(buildApiUrl(`/api/articles/${encodeURIComponent(story.slug)}`), { headers: { 'Cache-Control': 'max-age=300' } }).catch(() => undefined)} className="group block">
                  <motion.article whileHover={{ y: -4, scale: 1.005 }} className="group relative h-full overflow-hidden border-b border-cyan-400/20 transition-all duration-300">
                    <div className="overflow-hidden">
                      <img loading="lazy" decoding="async" sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" src={optimizeImageUrl(story.image, 900)} alt={story.title} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-64" />
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-cyan-300">
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5">{story.category}</span>
                        <span className="text-slate-500">{story.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'New'}</span>
                      </div>
                      <h3 className="home-article-title mt-4 text-white">{story.title}</h3>
                      <p className="home-article-body mt-3 text-slate-400">{getStoryExcerpt(story)}</p>
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm text-slate-400">
                        <span>{story.readingTime ?? Math.max(3, Math.ceil(((story.content || '') as string).split(/\s+/).length / 180))} min read</span>
                        <span className="inline-flex items-center gap-2 font-semibold text-cyan-300">Read Story <ArrowRight size={14} /></span>
                      </div>
                    </div>
                  </motion.article>
                </Link>
                {shouldShowStoryAd && storyAds[0] ? <div className="pt-2"><AdvertisementCard advertisement={storyAds[0]} variant="story" className="border-0 bg-transparent shadow-none" /></div> : null}
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex justify-center">
          <Link to="/featured-stories" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-[0.95rem] font-semibold text-white transition hover:-translate-y-0.5">
            Explore More Stories
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Innovation X Lab Experiments</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Research that feels like the next decade</h2>
          </div>
        </div>

        <div className="mb-8 rounded-[1.8rem] border border-cyan-400/20 bg-slate-900/80 p-6 shadow-[0_0_40px_rgba(34,211,238,0.08)] lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
                <Activity size={16} /> Innovation Activity Monitor
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-white">A research-lab view of our active coverage areas</h3>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-400">These indicators represent the rhythm of Innovation X Lab’s research and editorial focus, giving visitors a clearer sense of where the laboratory is investing its attention.</p>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {activityAreas.map((area) => (
              <div key={area.name} className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-100">{area.name}</span>
                  <span className="text-cyan-300">{area.level}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${area.level}%` }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600" />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{area.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {experiments.map((experiment, index) => {
            const Icon = experiment.icon;
            return (
              <motion.div key={experiment.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.35, delay: index * 0.06 }} className="group relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/80 p-6 shadow-[0_0_40px_rgba(15,23,42,0.4)] hover:-translate-y-1 hover:border-cyan-400/40">
                <div className={`absolute inset-0 bg-gradient-to-br ${experiment.accent}`} />
                <div className="relative">
                  <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/10 p-3 text-cyan-300">
                    <Icon size={22} />
                  </div>
                  <div className="text-[0.66rem] font-semibold uppercase tracking-[0.3em] text-cyan-300">{experiment.status}</div>
                  <h3 className="mt-3 text-xl font-semibold text-white">{experiment.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{experiment.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Trending Now</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">What the future is talking about</h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trendingArticles.map((article) => (
            <Link key={article.slug} to={`/articles/${article.slug}`} state={{ article }} className="group block">
              <div className="h-full rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_0_35px_rgba(34,211,238,0.14)]">
                <img loading="lazy" decoding="async" sizes="(min-width: 1024px) 33vw, 100vw" src={optimizeImageUrl(article.image, 900)} alt={article.title} className="mb-5 h-40 w-full rounded-2xl object-cover transition duration-500 group-hover:scale-105 sm:h-44" />
                <div className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">{article.category}</div>
                <h3 className="mt-3 text-xl font-semibold text-white">{article.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{article.description}</p>
                <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                  <span>{article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'Fresh'}</span>
                  <span className="text-cyan-300">Read more</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <LazySection fallback={null}>
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
          <div className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-8 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Innovation Showcase</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">A glimpse into the next decade of invention</h2>
                <p className="mt-4 max-w-2xl text-lg text-slate-300">From immersive AI interfaces to autonomous hardware and productivity platforms, our coverage highlights the technologies turning bold ideas into reality.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-300">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3"><span className="mt-1 text-cyan-400">•</span><span>Emerging AI experiences that feel conversational, adaptive, and intelligent.</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1 text-cyan-400">•</span><span>Next-gen gadget reviews grounded in real-world testing and performance data.</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1 text-cyan-400">•</span><span>Developer tools, startup stories, and software ecosystems ready for scale.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </LazySection>

      <LazySection fallback={null}>
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
          <div className="rounded-[2rem] border border-white/10 bg-[#070d1d] p-6 sm:p-8 lg:p-12">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Newsletter</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Stay Ahead Of The Future</h2>
              <p className="mt-4 text-lg text-slate-300">Join innovators, founders, and technology enthusiasts receiving thoughtful analysis each week.</p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <input value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Enter your email" />
              <button type="submit" className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 font-semibold text-white">Subscribe</button>
            </form>
            {newsletterAds.length > 0 ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {newsletterAds.map((ad) => (
                  <AdvertisementCard key={ad._id} advertisement={ad} variant="newsletter" className="border-white/10 bg-slate-950/70" />
                ))}
              </div>
            ) : null}
            {newsletterStatus ? <p className="mt-3 text-sm text-cyan-300">{newsletterStatus}</p> : null}
          </div>
        </section>
      </LazySection>
    </div>
  );
};

export default HomePage;
