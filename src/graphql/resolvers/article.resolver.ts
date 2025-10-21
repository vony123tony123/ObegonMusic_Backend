import { ArticleService } from '../../services/Article.service';
import { ArticleSearchParams } from '../../models/article.model';

export const articleResolvers = {
  getArticles: () => ArticleService.getArticles(),
  getArticleById: ({ article_id }: { article_id: string }) => ArticleService.getArticleById(article_id),
  createArticle: ({ input }: any) => ArticleService.createArticle(input),
  deleteArticle: ({ article_id }: { article_id: string }) => ArticleService.deleteArticle(article_id),
};
