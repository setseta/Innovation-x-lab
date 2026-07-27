import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHomepageArticleQuery, buildHomepageArticleResponse, HOMEPAGE_ARTICLE_SELECT_FIELDS } from '../homepageArticleUtils.js';

test('buildHomepageArticleQuery keeps the homepage filters focused', () => {
  const query = buildHomepageArticleQuery({ category: 'AI Lab', published: true });

  assert.deepEqual(query, { category: 'AI Lab', published: true });
});

test('buildHomepageArticleResponse only exposes homepage-card fields', () => {
  const payload = buildHomepageArticleResponse({
    title: 'OpenAI launches a new model',
    slug: 'openai-launches-a-new-model',
    description: 'A concise overview of the release.',
    content: 'This is a much longer article body that should not be returned for the homepage card.',
    image: 'https://example.com/image.jpg',
    category: 'AI Lab',
    createdAt: '2026-07-27T00:00:00.000Z',
    author: 'Innovation X Lab',
  });

  assert.deepEqual(Object.keys(payload).sort(), ['author', 'category', 'createdAt', 'date', 'description', 'excerpt', 'image', 'readingTime', 'slug', 'title'].sort());
  assert.equal(payload.excerpt, 'A concise overview of the release.');
  assert.equal(payload.date, '2026-07-27T00:00:00.000Z');
  assert.ok(payload.readingTime >= 3);
});

test('homepage projection fields stay explicit for fast responses', () => {
  assert.ok(HOMEPAGE_ARTICLE_SELECT_FIELDS.includes('title'));
  assert.ok(HOMEPAGE_ARTICLE_SELECT_FIELDS.includes('slug'));
  assert.ok(HOMEPAGE_ARTICLE_SELECT_FIELDS.includes('description'));
  assert.ok(HOMEPAGE_ARTICLE_SELECT_FIELDS.includes('image'));
  assert.ok(HOMEPAGE_ARTICLE_SELECT_FIELDS.includes('category'));
  assert.ok(HOMEPAGE_ARTICLE_SELECT_FIELDS.includes('createdAt'));
});
