export const articleTypeDefs = `
  type Tag {
    tag_id: ID!
    tag_name: String
  }

  type Category {
    category_id: ID!
    name: String
  }

  type User {
    user_id: ID!
    name: String
  }

  type Article {
    article_id: ID!
    title: String!
    content_url: String
    views: Int
    user: User
    category: Category
    tags: [Tag!]
  }

  input ArticleInput {
    article_id: ID
    title: String!
    content_url: String!
    user_id: ID!
    category_id: ID!
    tags: [ID!]
  }

  input ArticleSearchParams {
    userName: String
    tagName: String
    title: String
    limit: Int
    offset: Int
    orderBy: String
    orderDir: String
  }

  input ArticleSearchInput {
    title: String
    content_url: String
    user_id: ID
    category_id: ID
    tag_ids: [String!]
    min_views: Int
    max_views: Int
  }

  extend type Query {
    getArticles: [Article!]!
    getArticleById(article_id: ID!): Article
    searchArticles(params: ArticleSearchParams!): [Article!]!
  }

  extend type Mutation {
    createArticle(input: ArticleInput!): Article
    deleteArticle(article_id: ID!): Article
  }
`;
