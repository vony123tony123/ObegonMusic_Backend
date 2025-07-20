export const announcementTypeDefs  = `
  type Announcement {
    announcement_id: ID!
    title: String!
    content: String!
    create_time: String
    update_time: String
    views: Int
  }

  input AnnouncementInput {
    title: String!
    content: String!
  }

  type Query {
    getAll: [Announcement!]!
    getById(announcement_id: ID!): Announcement
  }

  type Mutation {
    create(input: AnnouncementInput!): String
    updateTitle(announcement_id: ID!, newTitle: String!): String
    delete(announcement_id: ID!): String
    incrementViews(announcement_id: ID!): String
  }
`;
