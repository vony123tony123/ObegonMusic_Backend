import { db } from "../db";
import { Article } from "../types/article";

export type ArticleSearchParams = Partial<
  Pick<Article, 'title' | 'content_url' | 'user_id' | 'category_id'>
> & {
  tag_ids?: string[];
  min_views?: number;
  max_views?: number;
};

export class ArticleModel {
  static async create(article: Omit<Article, 'article_id' | 'views' | 'user' | 'category' | 'tags'> & { tags?: string[] }): Promise<Article> {
    return await db.tx(async t => {
      const result = await t.one(
        `INSERT INTO articles (title, content_url, user_id, category_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [article.title, article.content_url, article.user_id, article.category_id]
      );

      const article_id = result.article_id.toString();
      if (article.tags && article.tags.length > 0) {
        await t.none(
          `INSERT INTO article_tags (article_id, tag_id)
           SELECT $1, tag_id FROM UNNEST($2::bigint[]) tag_id`,
          [article_id, article.tags]
        );
      }

      return {
        ...result,
        article_id,
        user_id: result.user_id.toString(),
        category_id: result.category_id.toString(),
        views: result.views,
      };
    });
  }

  static async getById(id: string): Promise<Article | null> {
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
  
  // 將條件轉成 SQL WHERE 子句及參數
  private static buildWhereClause(params: ArticleSearchParams): { clause: string; values: any[] } {
    const whereConditions: string[] = [];
    const values: any[] = [];

    if (params.title) {
      values.push(`%${params.title}%`);
      whereConditions.push(`a.title ILIKE $${values.length}`);
    }
    if (params.content_url) {
      values.push(`%${params.content_url}%`);
      whereConditions.push(`a.content_url ILIKE $${values.length}`);
    }
    if (params.user_id) {
      values.push(params.user_id);
      whereConditions.push(`a.user_id = $${values.length}`);
    }
    if (params.category_id) {
      values.push(params.category_id);
      whereConditions.push(`a.category_id = $${values.length}`);
    }
    if (params.min_views !== undefined) {
      values.push(params.min_views);
      whereConditions.push(`a.views >= $${values.length}`);
    }
    if (params.max_views !== undefined) {
      values.push(params.max_views);
      whereConditions.push(`a.views <= $${values.length}`);
    }

    const clause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    return { clause, values };
  }

  // 根據 tag_ids 決定是否要加 JOIN 及增加 tag 的篩選條件
  private static buildTagJoinAndCondition(tag_ids?: string[]): { joinClause: string; condition: string; values: any[] } {
    if (!tag_ids || tag_ids.length === 0) {
      return { joinClause: '', condition: '', values: [] };
    }
    // 產生 tag_id 的佔位符字串 ($1, $2, ...)
    // 這裡實際放入的是後面 buildWhereClause 產生的值長度後的偏移，故實際拼接會用 offset
    // 這邊先只做 join 和 where 的文字回傳，參數稍後合併
    const placeholders = tag_ids.map((_, i) => `$${i + 1}`).join(',');

    return {
      joinClause: `JOIN article_tags at ON a.article_id = at.article_id`,
      condition: `at.tag_id IN (${placeholders})`,
      values: tag_ids,
    };
  }

  // 取得所有 tags 並以 article_id 分組
  private static async getTagsForArticles(articleIds: string[]) {
    if (articleIds.length === 0) return {};
    const tagsRaw = await db.any(
      `SELECT at.article_id, t.tag_id, t.tag_name
       FROM article_tags at
       JOIN tags t ON at.tag_id = t.tag_id
       WHERE at.article_id IN ($1:csv)`,
      [articleIds]
    );

    return tagsRaw.reduce<Record<string, { tag_id: string; tag_name: string }[]>>((acc, tag) => {
      const id = tag.article_id.toString();
      if (!acc[id]) acc[id] = [];
      acc[id].push({ tag_id: tag.tag_id.toString(), tag_name: tag.tag_name });
      return acc;
    }, {});
  }

  // 主搜尋函式
  static async search(params: ArticleSearchParams): Promise<Article[]> {
    const { tag_ids, ...otherParams } = params;

    // 先建構 tag 相關 SQL 片段
    const { joinClause: tagJoin, condition: tagCondition, values: tagValues } = this.buildTagJoinAndCondition(tag_ids);

    // 建構其餘條件的 WHERE 子句及參數
    const { clause: whereClause, values: otherValues } = this.buildWhereClause(otherParams);

    // SQL 參數合併：tagValues 在前，其他條件在後，索引要調整
    // 由於 tagValues 用 $1, $2,...，而其他Values 從 $1 開始，所以需要把其他Values 的參數占位改成 $N+offset
    const offset = tagValues.length;
    const adjustedOtherWhereClause = whereClause.replace(/\$(\d+)/g, (_, n) => `$${Number(n) + offset}`);

    const sql = `
      SELECT DISTINCT a.*, 
        u.user_id AS u_user_id, u.name AS u_name,
        c.category_id AS c_category_id, c.name AS c_name
      FROM articles a
      LEFT JOIN users u ON a.user_id = u.user_id
      LEFT JOIN categories c ON a.category_id = c.category_id
      ${tagJoin}
      ${tagCondition ? 'WHERE ' + tagCondition + (adjustedOtherWhereClause ? ' AND ' + adjustedOtherWhereClause.slice(6) : '') : adjustedOtherWhereClause}
    `;

    const sqlParams = [...tagValues, ...otherValues];

    const articlesRaw = await db.any(sql, sqlParams);

    const articleIds = articlesRaw.map(a => a.article_id.toString());
    const tagsByArticle = await this.getTagsForArticles(articleIds);

    return articlesRaw.map(article => {
      const articleIdStr = article.article_id.toString();
      return {
        article_id: articleIdStr,
        title: article.title,
        content_url: article.content_url,
        views: article.views,
        user_id: article.user_id?.toString(),
        category_id: article.category_id?.toString(),
        user: article.u_user_id
          ? { user_id: article.u_user_id.toString(), name: article.u_name }
          : undefined,
        category: article.c_category_id
          ? { category_id: article.c_category_id.toString(), name: article.c_name }
          : undefined,
        tags: tagsByArticle[articleIdStr] || [],
      };
    });
  }
}