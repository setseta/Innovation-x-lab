export type HomepageArticle = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  image?: string;
  author?: string;
  content?: string;
  published?: boolean;
  createdAt?: string;
};

export const HOME_ARTICLES_CACHE_KEY = 'ixl-homepage-articles';

const inMemoryHomepageArticleCache = new Map<string, HomepageArticle[]>();

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

  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(cacheKey, JSON.stringify(articles));
  } catch (error) {
    console.error('Unable to persist homepage articles to cache', error);
  }
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
