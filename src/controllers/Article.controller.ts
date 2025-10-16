import { Article } from '../types/article';
import { ArticleModel, ArticleSearchParams } from '../models/article.model';

export class ArticleController {
  static async getArticles(): Promise<Article[]> {
    return await ArticleModel.getAll();
  }

  static async getArticleById(id: string): Promise<Article | null> {
    return await ArticleModel.getById(id);
  }

  static async searchArticles(params: ArticleSearchParams): Promise<Article[]> {
    return await ArticleModel.search(params);
  }

  static async createArticle(input: Partial<Pick<Article, 'article_id'>> & Omit<Article, 'views' | 'user' | 'category' | 'tags'> & { tags?: string[] }): Promise<Article> {
    return await ArticleModel.create(input);
  }

  static async deleteArticle(id: string): Promise<Article | null> {
    return await ArticleModel.deleteById(id);
  }
}


