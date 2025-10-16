import { ArticleController } from '../../controllers/Article.controller';
import { ArticleSearchParams } from '../../models/article.model';

export const articleResolvers = {
  getArticles: () => ArticleController.getArticles(),
  getArticleById: ({ article_id }: { article_id: string }) => ArticleController.getArticleById(article_id),
  searchArticles: ({ params }: { params: ArticleSearchParams }) => ArticleController.searchArticles(params),
  createArticle: ({ input }: any) => ArticleController.createArticle(input),
  deleteArticle: ({ article_id }: { article_id: string }) => ArticleController.deleteArticle(article_id),
};
