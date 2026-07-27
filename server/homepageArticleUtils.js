export const HOMEPAGE_ARTICLE_SELECT_FIELDS = ['title', 'slug', 'description', 'image', 'category', 'createdAt', 'author', 'published', 'premium', 'updatedAt'];

export const buildHomepageArticleQuery = ({ category, published, premium } = {}) => {
  const query = {};

  if (category) {
    query.category = String(category);
  }

  const normalizedPublished = published === true || published === 'true';
  const normalizedPremium = premium === true || premium === 'true';

  if (published === false || published === 'false') {
    query.published = false;
  } else if (normalizedPublished) {
    query.published = true;
  }

  if (premium === false || premium === 'false') {
    query.premium = false;
  } else if (normalizedPremium) {
    query.premium = true;
  }

  return query;
};

export const buildHomepageArticleResponse = (article = {}) => {
  const excerpt = String(article.description || '').trim() || String(article.excerpt || '').trim();
  const createdAt = article.createdAt || article.date || '';
  const readingTime = Math.max(3, Math.ceil((String(article.content || '').split(/\s+/).filter(Boolean).length || 180) / 180));

  return {
    title: article.title,
    slug: article.slug,
    excerpt,
    description: excerpt,
    image: article.image || '',
    category: article.category,
    date: createdAt,
    createdAt,
    author: article.author || 'Innovation X Lab',
    readingTime,
  };
};
