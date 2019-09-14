import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    hangout: Hangout!
    hangouts: [Hangout!]
  }

  extend type Mutation {
    createHangout(
      title: String!
      description: String!
      datetime: DateTime!
      location: String!
      attendeeLimit: Int
    ): Hangout!
    deleteHangout(id: ID!): Hangout!
    joinHangout(id: ID!): Hangout!
    inviteUser(hangoutId: ID!, userId: ID): Hangout!
  }

  type Hangout {
    _id: ID!
    title: String!
    description: String!
    datetime: DateTime!
    location: String!
    organizer: User!
    invited: [User!]
    attendees: [User!]
    attendeeLimit: Int
  }
`