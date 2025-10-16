import { buildSchema } from 'graphql';
import { announcementTypeDefs } from './schemas/annoucement.schema';
import { announcementResolvers } from './resolvers/announcement.resolver';
import { articleTypeDefs } from './schemas/article.schema';
import { articleResolvers } from './resolvers/article.resolver';

// 合併 typeDefs
const typeDefs = `
  ${announcementTypeDefs}
  ${articleTypeDefs}
`;

// 合併 resolvers
export const root = {
  ...announcementResolvers,
  ...articleResolvers,
};

// 建立 schema
export const schema = buildSchema(typeDefs);
