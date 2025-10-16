import { db } from "../db";
import { Article } from "../types/article";
import { ArticleModel } from "./article.model";

const testUser = { user_id: '999', name: 'Test User' };
const testCategory = { category_id: '999', name: 'Test Category' };
const testTag = { tag_id: '999', tag_name: 'Test Tag' };
const testTag1 = { tag_id: '1001', tag_name: 'Tag One' };
const testTag2 = { tag_id: '1002', tag_name: 'Tag Two' };

describe('ArticleModel', () => {

  let testArticle: Article;
  beforeEach(async () => {
    await db.none(`INSERT INTO users (user_id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [testUser.user_id, testUser.name]);
    await db.none(`INSERT INTO categories (category_id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [testCategory.category_id, testCategory.name]);
    await db.none(`INSERT INTO tags (tag_id, tag_name) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [testTag.tag_id, testTag.tag_name]);
  });

  afterEach(async () => {
    await db.none(`DELETE FROM article_tags WHERE article_id IN (SELECT article_id FROM articles WHERE user_id = $1)`, [testUser.user_id]);
    await db.none(`DELETE FROM articles WHERE user_id = $1`, [testUser.user_id]);
    await db.none(`DELETE FROM tags WHERE tag_id = $1`, [testTag.tag_id]);
    await db.none(`DELETE FROM categories WHERE category_id = $1`, [testCategory.category_id]);
    await db.none(`DELETE FROM users WHERE user_id = $1`, [testUser.user_id]);
  });

  afterAll(() => {
      db.$pool.end(); // 關閉 pg-promise 的連線池
  });

  test('create() should insert a new article and return it', async () => {
    const articleInput = {
      title: 'Test Title',
      content_url: 'https://test.url',
      user_id: '999',
      category_id: '999',
    };
    const created = await ArticleModel.create(articleInput);
    expect(created).toMatchObject({
      title: articleInput.title,
      content_url: articleInput.content_url,
      user_id: articleInput.user_id,
      category_id: articleInput.category_id,
      views: 0,
    });
    testArticle = created;
  });

  test('getById() should return the correct article', async () => {
    const found = await ArticleModel.getById(testArticle.article_id);
    expect(found).not.toBeNull();
    expect(found!.article_id).toBe(testArticle.article_id);
  });

  test('getAll() should return an array containing our article', async () => {
    const all = await ArticleModel.getAll();
    expect(all).toEqual(expect.arrayContaining([expect.objectContaining({ article_id: testArticle.article_id })]));
  });

  test('deleteById() should delete the article and return it', async () => {
    const deleted = await ArticleModel.deleteById(testArticle.article_id);
    expect(deleted).not.toBeNull();
    const after = await ArticleModel.getById(testArticle.article_id);
    expect(after).toBeNull();
  });

  test('create and getById with tags', async () => {
    const created = await ArticleModel.create({
      title: 'Article with Tags',
      content_url: 'https://example.com',
      user_id: testUser.user_id,
      category_id: testCategory.category_id,
      tags: [testTag.tag_id]
    });

    const found = await ArticleModel.getById(created.article_id);
    expect(found).not.toBeNull();
    expect(found!.tags).toEqual(expect.arrayContaining([{ tag_id: testTag.tag_id, tag_name: testTag.tag_name }]));
  });

  test('getAll includes tags', async () => {
    const all = await ArticleModel.getAll();
    expect(all.some(a => a.tags?.some(t => t.tag_id === testTag.tag_id))).toBe(true);
  });

  test('deleteById removes article and tags', async () => {
    const created = await ArticleModel.create({
      title: 'To Delete',
      content_url: 'https://delete.com',
      user_id: testUser.user_id,
      category_id: testCategory.category_id,
      tags: [testTag.tag_id]
    });
    const deleted = await ArticleModel.deleteById(created.article_id);
    expect(deleted).not.toBeNull();
    const after = await ArticleModel.getById(created.article_id);
    expect(after).toBeNull();
  });
});


//-------------------------測試Search--------------------------

describe('ArticleModel.search', () => {
  let createdArticles: { article_id: string; title: string }[] = [];

  beforeEach(async () => {
    // Insert test user, category, tags
    await db.none(`INSERT INTO users (user_id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [testUser.user_id, testUser.name]);
    await db.none(`INSERT INTO categories (category_id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [testCategory.category_id, testCategory.name]);
    await db.none(`INSERT INTO tags (tag_id, tag_name) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [testTag1.tag_id, testTag1.tag_name]);
    await db.none(`INSERT INTO tags (tag_id, tag_name) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [testTag2.tag_id, testTag2.tag_name]);

    // Create multiple articles with different tags and views
    const article1 = await ArticleModel.create({
      title: 'First Article',
      content_url: 'https://first.com',
      user_id: testUser.user_id,
      category_id: testCategory.category_id,
      tags: [testTag1.tag_id]
    });

    const article2 = await ArticleModel.create({
      title: 'Second Article',
      content_url: 'https://second.com',
      user_id: testUser.user_id,
      category_id: testCategory.category_id,
      tags: [testTag2.tag_id]
    });

    const article3 = await ArticleModel.create({
      title: 'Third Article',
      content_url: 'https://third.com',
      user_id: testUser.user_id,
      category_id: testCategory.category_id,
      tags: [testTag1.tag_id, testTag2.tag_id]
    });

    // Update views for testing min/max_views filter
    await db.none(`UPDATE articles SET views = 50 WHERE article_id = $1`, [article1.article_id]);
    await db.none(`UPDATE articles SET views = 150 WHERE article_id = $1`, [article2.article_id]);
    await db.none(`UPDATE articles SET views = 200 WHERE article_id = $1`, [article3.article_id]);

    createdArticles = [article1, article2, article3];
  });

  afterEach(async () => {
    // Clean up test data
    await db.none(`DELETE FROM article_tags WHERE article_id IN ($1:csv)`, [createdArticles.map(a => a.article_id)]);
    await db.none(`DELETE FROM articles WHERE article_id IN ($1:csv)`, [createdArticles.map(a => a.article_id)]);
    await db.none(`DELETE FROM tags WHERE tag_id IN ($1:csv)`, [[testTag1.tag_id, testTag2.tag_id]]);
    await db.none(`DELETE FROM categories WHERE category_id = $1`, [testCategory.category_id]);
    await db.none(`DELETE FROM users WHERE user_id = $1`, [testUser.user_id]);
  });

  test('search by title partial match', async () => {
    const results = await ArticleModel.search({ title: 'First' });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain('First');
  });

  test('search by content_url partial match', async () => {
    const results = await ArticleModel.search({ content_url: 'second.com' });
    expect(results.length).toBe(1);
    expect(results[0].content_url).toContain('second.com');
  });

  test('search by user_id', async () => {
    const results = await ArticleModel.search({ user_id: testUser.user_id });
    expect(results.length).toBeGreaterThanOrEqual(3);
  });

  test('search by category_id', async () => {
    const results = await ArticleModel.search({ category_id: testCategory.category_id });
    expect(results.length).toBeGreaterThanOrEqual(3);
  });

  test('search by tags (single tag)', async () => {
    const results = await ArticleModel.search({ tag_ids: [testTag1.tag_id] });
    expect(results.length).toBeGreaterThanOrEqual(2); // article1 and article3
    results.forEach(article => {
      const tagIds = article.tags?.map(t => t.tag_id) ?? [];
      expect(tagIds).toContain(testTag1.tag_id);
    });
  });

  test('search by tags (multiple tags)', async () => {
    const results = await ArticleModel.search({ tag_ids: [testTag1.tag_id, testTag2.tag_id] });
    // Should return articles that have ANY of the tags, not necessarily all
    expect(results.length).toBeGreaterThanOrEqual(3);
  });

  test('search by views range', async () => {
    const results = await ArticleModel.search({ min_views: 100, max_views: 200 });
    expect(results.length).toBe(2);
    results.forEach(article => {
      expect(article.views).toBeGreaterThanOrEqual(100);
      expect(article.views).toBeLessThanOrEqual(200);
    });
  });

  test('search by combined filters', async () => {
    const results = await ArticleModel.search({
      user_id: testUser.user_id,
      category_id: testCategory.category_id,
      tag_ids: [testTag2.tag_id],
      min_views: 100,
    });
    expect(results.length).toBe(2); // article2 and article3 match these conditions
    results.forEach(article => {
      expect(article.user_id).toBe(testUser.user_id);
      expect(article.category_id).toBe(testCategory.category_id);
      expect(article.tags?.some(t => t.tag_id === testTag2.tag_id)).toBe(true);
      expect(article.views).toBeGreaterThanOrEqual(100);
    });
  });
  
});
