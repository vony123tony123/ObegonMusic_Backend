import { buildSchema } from 'graphql';
import { announcementTypeDefs } from './schemas/annoucement.schema';
import { announcementResolvers } from './resolvers/announcement.resolver';

// 合併 typeDefs
const typeDefs = `
  ${announcementTypeDefs}
`;

// 合併 resolvers
export const root = {
  ...announcementResolvers,
};

// 建立 schema
export const schema = buildSchema(typeDefs);
