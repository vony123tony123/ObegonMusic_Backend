import { Article } from '../types/article';
import { ArticleModel, ArticleSearchParams } from '../models/article.model';

export class ArticleService {
  static async getArticles(): Promise<Article[]> {
    return await ArticleModel.getAll();
  }

  static async getArticleById(id: string): Promise<Article | null> {
    return await ArticleModel.getById(id);
  }

  static async createArticle(input: Partial<Pick<Article, 'article_id'>> & Omit<Article, 'views' | 'user' | 'category' | 'tags'> & { tags?: string[] }): Promise<Article> {
    return await ArticleModel.create(input);
  }

  static async deleteArticle(id: string): Promise<Article | null> {
    return await ArticleModel.deleteById(id);
  }

  static async searchArticles(filters: {
    userName?: string;
    tagName?: string;
    title?: string;
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDir?: 'ASC' | 'DESC';
  }) {
    const { userName, tagName, title } = filters;
    const limit = filters.limit ?? 10;
    const offset = filters.offset ?? 0;
    const orderBy = filters.orderBy ?? 'create_time';
    const orderDir = filters.orderDir ?? 'DESC';

    if (!userName && !tagName && !title) {
      throw new Error('請至少輸入一個搜尋條件');
    }

    // 單條件查詢 → 走輕量 SQL
    if (userName && !tagName && !title) {
      return ArticleModel.getByUserName(userName, limit, offset, orderBy, orderDir);
    }

    if (tagName && !userName && !title) {
      return ArticleModel.getByTagName(tagName, limit, offset, orderBy, orderDir);
    }

    if (title && !userName && !tagName) {
      return ArticleModel.getByTitle(title, limit, offset, orderBy, orderDir);
    }

    // 多條件搜尋 → 走通用 JOIN 查詢
    return ArticleModel.searchCombined(userName, tagName, title, limit, offset, orderBy, orderDir);
  }
}


