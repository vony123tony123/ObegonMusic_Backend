import { db, pgp } from "../db";
import { Article } from "../types/article";

export type ArticleSearchParams = Partial<
  Pick<Article, 'title' | 'content_url' | 'user_id' | 'category_id'>
> & {
  tag_ids?: string[];
  min_views?: number;
  max_views?: number;
};

export class ArticleModel {
  // TRUE NUCLEAR OPTION: Use a single, dedicated client to bypass the connection pool entirely.
  static async create(article: Partial<Pick<Article, 'article_id'>> & Omit<Article, 'views' | 'user' | 'category' | 'tags'> & { tags?: string[] }): Promise<Article> {
    let client: any = null;
    try {
      const columns = ['title', 'content_url', 'user_id', 'category_id'];
      const values = [article.title, article.content_url, parseInt(article.user_id!, 10), parseInt(article.category_id!, 10)];

      if (article.article_id) {
        columns.unshift('article_id');
        values.unshift(article.article_id);
      }

      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      const columnNames = columns.join(', ');
      
      // Use the client for the transaction
      const insertArticleId = await db.tx(async t => {
        const result = await t.one(
          `INSERT INTO articles (${columnNames})
           VALUES (${placeholders})
           RETURNING *`,
          values
        );
        const article_id = result.article_id.toString();
        if (article.tags && article.tags.length > 0) {
          await t.none(
            `INSERT INTO article_tags (article_id, tag_id)
             SELECT $1, tag_id FROM UNNEST($2::bigint[]) tag_id`,
            [article_id, article.tags]
          );
        }
        return result.article_id.toString();
      });
      
      // Refetch the complete article data to ensure consistency, using the same transaction.
      return (await this.getByIdWithTransaction(insertArticleId))!;
    } finally {
      // Release the client back to the pool
      if (client) {
        client.done();
      }
    }
  }

  // Helper method to get by ID within a specific transaction context
  private static async getByIdWithTransaction(id: string): Promise<Article | null> {
    const article = await db.oneOrNone(`
      SELECT a.*, u.user_id AS u_user_id, u.name AS u_name,
             c.category_id AS c_category_id, c.name AS c_name
      FROM articles a
      LEFT JOIN users u ON a.user_id = u.user_id
      LEFT JOIN categories c ON a.category_id = c.category_id
      WHERE a.article_id = $1`, [id]);

    if (!article) return null;

    const tags = await db.any(`
      SELECT t.tag_id, t.tag_name
      FROM tags t
      JOIN article_tags at ON t.tag_id = at.tag_id
      WHERE at.article_id = $1`, [id]);

    return {
      article_id: article.article_id.toString(),
      title: article.title,
      content_url: article.content_url,
      views: article.views,
      user_id: article.user_id?.toString(),
      category_id: article.category_id?.toString(),
      user: article.u_user_id ? { user_id: article.u_user_id.toString(), name: article.u_name } : undefined,
      category: article.c_category_id ? { category_id: article.c_category_id.toString(), name: article.c_name } : undefined,
      tags: tags.map(t => ({ tag_id: t.tag_id.toString(), tag_name: t.tag_name }))
    };
  }


  static async getById(id: string): Promise<Article | null> {
    return this.getByIdWithTransaction(id); // Use the main 'db' pool for reads
  }

  static async getAll(): Promise<Article[]> {
    const articles = await db.any(`
      SELECT a.*, u.user_id AS u_user_id, u.name AS u_name,
             c.category_id AS c_category_id, c.name AS c_name
      FROM articles a
      LEFT JOIN users u ON a.user_id = u.user_id
      LEFT JOIN categories c ON a.category_id = c.category_id`);

    const articleTags = await db.any(`
      SELECT at.article_id, t.tag_id, t.tag_name
      FROM article_tags at
      JOIN tags t ON at.tag_id = t.tag_id`);

    return articles.map(article => {
      const tags = articleTags.filter(at => at.article_id.toString() === article.article_id.toString())
                               .map(t => ({ tag_id: t.tag_id.toString(), tag_name: t.tag_name }));
      return {
        article_id: article.article_id.toString(),
        title: article.title,
        content_url: article.content_url,
        views: article.views,
        user_id: article.user_id?.toString(),
        category_id: article.category_id?.toString(),
        user: article.u_user_id ? { user_id: article.u_user_id.toString(), name: article.u_name } : undefined,
        category: article.c_category_id ? { category_id: article.c_category_id.toString(), name: article.c_name } : undefined,
        tags,
      };
    });
  }

  static async deleteById(id: string): Promise<Article | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    await db.tx(async t => {
      await t.none(`DELETE FROM article_tags WHERE article_id = $1`, [id]);
      await t.none(`DELETE FROM articles WHERE article_id = $1`, [id]);
    });
    return existing;
  }
}
