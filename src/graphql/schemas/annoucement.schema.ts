export const announcementTypeDefs  = `
  type Announcement {
    announcement_id: ID!
    title: String!
    content_url: String
    create_time: String
    update_time: String
    views: Int
  }

  input AnnouncementInput {
    title: String!
    content_url: String!
    announcement_id: ID
    views: Int
  }

  type Query {
    getAll: [Announcement!]!
    getById(announcement_id: ID!): Announcement
  }

  type Mutation {
    create(input: AnnouncementInput!): Announcement
    updateTitle(announcement_id: ID!, newTitle: String!): Announcement
    delete(announcement_id: ID!): Announcement
    incrementViews(announcement_id: ID!): Announcement
  }
`;
