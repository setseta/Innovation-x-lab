export type HomepageArticle = {
  _id?: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  excerpt?: string;
  image?: string;
  author?: string;
  content?: string;
  published?: boolean;
  createdAt?: string;
  date?: string;
  readingTime?: number;
};

export const HOME_ARTICLES_CACHE_KEY = 'ixl-homepage-articles';

const inMemoryHomepageArticleCache = new Map<string, HomepageArticle[]>();
const inFlightHomepageRequests = new Map<string, Promise<HomepageArticle[]>>();
const homepageArticleTimestamps = new Map<string, number>();
const homepageArticlesMaxAgeMs = 60_000;

export const getHomepageArticlesCacheKey = (category?: string) => {
  if (!category || category === 'All') {
    return HOME_ARTICLES_CACHE_KEY;
  }

  return `${HOME_ARTICLES_CACHE_KEY}:${category}`;
};

export const normalizeHomepageArticles = (value: unknown): HomepageArticle[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((article): article is HomepageArticle => {
    if (!article || typeof article !== 'object') {
      return false;
    }

    const candidate = article as Record<string, unknown>;
    return typeof candidate.slug === 'string' && typeof candidate.title === 'string';
  });
};

export const getStoredHomepageArticles = (cacheKey = HOME_ARTICLES_CACHE_KEY): HomepageArticle[] => {
  const memoryCached = inMemoryHomepageArticleCache.get(cacheKey);
  if (memoryCached) {
    return memoryCached;
  }

  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const cached = window.sessionStorage.getItem(cacheKey);
    if (!cached) {
      return [];
    }

    const parsed = normalizeHomepageArticles(JSON.parse(cached));
    inMemoryHomepageArticleCache.set(cacheKey, parsed);
    return parsed;
  } catch (error) {
    console.error('Unable to restore homepage articles from cache', error);
    return [];
  }
};

export const setStoredHomepageArticles = (articles: HomepageArticle[], cacheKey = HOME_ARTICLES_CACHE_KEY) => {
  inMemoryHomepageArticleCache.set(cacheKey, articles);
  homepageArticleTimestamps.set(cacheKey, Date.now());

  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(cacheKey, JSON.stringify(articles));
  } catch (error) {
    console.error('Unable to persist homepage articles to cache', error);
  }
};

export const isHomepageArticlesCacheFresh = (cacheKey = HOME_ARTICLES_CACHE_KEY) => {
  const cachedAt = homepageArticleTimestamps.get(cacheKey);
  if (!cachedAt) {
    return false;
  }

  return Date.now() - cachedAt < homepageArticlesMaxAgeMs;
};

export const getHomepageArticlesRequestPromise = (cacheKey: string, request: () => Promise<HomepageArticle[]>) => {
  const existing = inFlightHomepageRequests.get(cacheKey);
  if (existing) {
    return existing;
  }

  const nextPromise = request().then((articles) => {
    setStoredHomepageArticles(articles, cacheKey);
    return articles;
  }).finally(() => {
    inFlightHomepageRequests.delete(cacheKey);
  });

  inFlightHomepageRequests.set(cacheKey, nextPromise);
  return nextPromise;
};

export const optimizeImageUrl = (value?: string, width = 1200) => {
  if (!value) {
    return '/placeholder.jpg';
  }

  if (value.startsWith('data:') || value.startsWith('/') || value.startsWith('blob:')) {
    return value;
  }

  if (typeof window === 'undefined') {
    return value;
  }

  try {
    const parsed = new URL(value, window.location.origin);
    const host = parsed.hostname.toLowerCase();
    if (host.includes('cloudinary.com')) {
      parsed.searchParams.set('q', '80');
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fit', 'max');
      parsed.searchParams.set('w', String(width));
      return parsed.toString();
    }

    if (host.includes('unsplash.com') || host.includes('images.unsplash.com')) {
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('q', '80');
      parsed.searchParams.set('w', String(width));
      return parsed.toString();
    }
  } catch (error) {
    console.error('Unable to optimize image url', error);
  }

  return value;
};

export const mergeHomepageArticles = (existingArticles: HomepageArticle[], incomingArticles: HomepageArticle[]) => {
  const mergedBySlug = new Map(existingArticles.map((article) => [article.slug, article]));

  incomingArticles.forEach((article) => {
    const current = mergedBySlug.get(article.slug);
    mergedBySlug.set(article.slug, current ? { ...current, ...article } : article);
  });

  return Array.from(mergedBySlug.values()).sort((left, right) => {
    const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
    return rightTime - leftTime;
  });
};
