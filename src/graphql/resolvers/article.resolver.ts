import { ArticleService } from '../../services/Article.service';
import { Article } from '../../types/article';

export const articleResolvers = {
  getArticles: () => ArticleService.getArticles(),
  getArticleById: ({ article_id }: { article_id: string }) => ArticleService.getArticleById(article_id),
  createArticle: ({ input }: any) => {
    const article:Article = {article_id: input.article_id, title: input.title, content_url: input.content_url, user: { user_id: input.user_id }, category: { category_id: input.category_id }};
    if(input.tags) {
      article['tags'] = input.tags;
    }
    return ArticleService.createArticle(article)
  },
  deleteArticle: ({ article_id }: { article_id: string }) => ArticleService.deleteArticle(article_id),
  searchArticles: async (
      {params}:any
    ) => {
      return ArticleService.searchArticles(params);
    },
};
