import { db, pgp } from "../db";
import { Article } from "../types/article";

export class ArticleModel {
  // TRUE NUCLEAR OPTION: Use a single, dedicated client to bypass the connection pool entirely.
  static async create(article: Article): Promise<Article> {
    let client: any = null;
    try {
      const columns = ['title', 'content_url', 'user_id', 'category_id'];
      const values = [article.title, article.content_url, article.user.user_id, article.category.category_id];

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
        const article_id = result.article_id;
        if (article.tags && article.tags.length > 0) {
          await t.none(
            `INSERT INTO article_tags (article_id, tag_id)
             SELECT $1, tag_id FROM UNNEST($2::bigint[]) tag_id`,
            [article_id, article.tags]
          );
        }
        return result.article_id;
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
      article_id: article.article_id,
      title: article.title,
      content_url: article.content_url,
      views: article.views,
      user: article.u_user_id ? { user_id: article.u_user_id, name: article.u_name } : undefined,
      category: article.c_category_id ? { category_id: article.c_category_id, name: article.c_name } : undefined,
      tags: tags.map(t => ({ tag_id: t.tag_id, tag_name: t.tag_name })),
      createTime: article.create_time,
      updateTime: article.update_time,
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
      const tags = articleTags.filter(at => at.article_id === article.article_id)
                               .map(t => ({ tag_id: t.tag_id, tag_name: t.tag_name }));
      return {
        article_id: article.article_id,
        title: article.title,
        content_url: article.content_url,
        views: article.views,
        user: article.u_user_id ? { user_id: article.u_user_id, name: article.u_name } : undefined,
        category: article.c_category_id ? { category_id: article.c_category_id, name: article.c_name } : undefined,
        tags: tags.map(t => ({ tag_id: t.tag_id, tag_name: t.tag_name })),
        createTime: article.create_time,
        updateTime: article.update_time,
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

  static async getByUserName(
      userName: string,
      limit: number,
      offset: number,
      orderBy: string,
      orderDir: 'ASC' | 'DESC'
  ): Promise<Article[]> {
      // 白名單檢查，防止 SQL injection
      const allowedColumns = ['article_id', 'title', 'content_url', 'views', 'user_id', 'category_id', 'create_time'];
      const allowedDirs: ('ASC' | 'DESC')[] = ['ASC', 'DESC'];

      if (!allowedColumns.includes(orderBy)) {
          throw new Error(`Invalid orderBy column: ${orderBy}`);
      }
      if (!allowedDirs.includes(orderDir)) {
          throw new Error(`Invalid order direction: ${orderDir}`);
      }

      const sql = `
        SELECT a.*
        FROM articles a
        JOIN users u ON a.user_id = u.user_id
        WHERE u.name ILIKE $1
        ORDER BY ${orderBy} ${orderDir}
        LIMIT $2 OFFSET $3
      `;

      const articles = await db.any(sql, [`%${userName}%`, limit, offset]);
      
      return articles.map(article => {
        return {
          article_id: article.article_id,
          title: article.title,
          content_url: article.content_url,
          views: article.views,
          user: { user_id: article.user_id},
          category: { category_id: article.category_id},
          createTime: article.create_time,
          updateTime: article.update_time,
        };
      });
  }

  static async getByTagName(
    tagName: string,
    limit: number,
    offset: number,
    orderBy: string,
    orderDir: 'ASC' | 'DESC'
  ): Promise<Article[]> {
    const allowedColumns = ['article_id', 'title', 'content_url', 'views', 'user_id', 'category_id', 'create_time'];
    const allowedDirs: ('ASC' | 'DESC')[] = ['ASC', 'DESC'];

    if (!allowedColumns.includes(orderBy)) {
        throw new Error(`Invalid orderBy column: ${orderBy}`);
    }
    if (!allowedDirs.includes(orderDir)) {
        throw new Error(`Invalid order direction: ${orderDir}`);
    }

    const sql = `
      SELECT DISTINCT a.*
      FROM articles a
      JOIN article_tags at ON a.article_id = at.article_id
      JOIN tags t ON at.tag_id = t.tag_id
      WHERE t.tag_name ILIKE $1
      ORDER BY ${orderBy} ${orderDir}
      LIMIT $2 OFFSET $3
    `;

    const articles =  await db.any(sql, [`%${tagName}%`, limit, offset]);
    return articles.map(article => {
      return {
        article_id: article.article_id,
        title: article.title,
        content_url: article.content_url,
        views: article.views,
        user: { user_id: article.user_id},
        category: { category_id: article.category_id},
        createTime: article.create_time,
        updateTime: article.update_time,
      };
    });
  }


  static async getByTitle(
    title: string,
    limit: number,
    offset: number,
    orderBy: string,
    orderDir: 'ASC' | 'DESC'
    ): Promise<Article[]> {
    // 白名單檢查，避免 SQL injection
    const allowedColumns = ['article_id', 'title', 'content_url', 'views', 'user_id', 'category_id', 'create_time'];
    const allowedDirs: ('ASC' | 'DESC')[] = ['ASC', 'DESC'];

    if (!allowedColumns.includes(orderBy)) {
        throw new Error(`Invalid orderBy column: ${orderBy}`);
    }
    if (!allowedDirs.includes(orderDir)) {
        throw new Error(`Invalid order direction: ${orderDir}`);
    }

    const sql = `
      SELECT *
      FROM articles
      WHERE title ILIKE $1
      ORDER BY ${orderBy} ${orderDir}
      LIMIT $2 OFFSET $3
    `;

    const articles =  await db.any(sql, [`%${title}%`, limit, offset]);
    return articles.map(article => {
      return {
        article_id: article.article_id,
        title: article.title,
        content_url: article.content_url,
        views: article.views,
        user: { user_id: article.user_id},
        category: { category_id: article.category_id},
        createTime: article.create_time,
        updateTime: article.update_time,
      };
    });
  }


  static async searchCombined(
    userName?: string,
    tagName?: string,
    title?: string,
    limit = 10,
    offset = 0,
    orderBy = 'create_time',
    orderDir: 'ASC' | 'DESC' = 'DESC'
  ): Promise<Article[]> {
    // 白名單檢查，避免 SQL injection
    const allowedColumns = ['article_id', 'title', 'content_url', 'views', 'user_id', 'category_id', 'create_time'];
    const allowedDirs: ('ASC' | 'DESC')[] = ['ASC', 'DESC'];

    if (!allowedColumns.includes(orderBy)) {
        throw new Error(`Invalid orderBy column: ${orderBy}`);
    }
    if (!allowedDirs.includes(orderDir)) {
        throw new Error(`Invalid order direction: ${orderDir}`);
    }

    let sql = `
      SELECT DISTINCT a.*
      FROM articles a
      LEFT JOIN users u ON a.user_id = u.user_id
      LEFT JOIN article_tags at ON a.article_id = at.article_id
      LEFT JOIN tags t ON at.tag_id = t.tag_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (userName) {
        params.push(`%${userName}%`);
        sql += ` AND u.name ILIKE $${params.length}`;
    }

    if (tagName) {
        params.push(`%${tagName}%`);
        sql += ` AND t.tag_name ILIKE $${params.length}`;
    }

    if (title) {
        params.push(`%${title}%`);
        sql += ` AND a.title ILIKE $${params.length}`;
    }

    // 最後加上 LIMIT 和 OFFSET
    params.push(limit, offset);
    sql += ` ORDER BY ${orderBy} ${orderDir} LIMIT $${params.length - 1} OFFSET $${params.length}`;

    // pg-promise 查詢
    const articles = await db.any(sql, params);
    return articles.map(article => {
      return {
        article_id: article.article_id,
        title: article.title,
        content_url: article.content_url,
        views: article.views,
        user: { user_id: article.user_id},
        category: { category_id: article.category_id},
        createTime: article.create_time,
        updateTime: article.update_time,
      };
    });
  }



}
