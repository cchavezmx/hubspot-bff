export const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
  }

  enum operators {
    EQ
    NE
    GT
    GTE
    LT
    LTE
  }

  input filterInput {
    propertyName: String
    operator: operators
    value: String
  }

  input filterGroupsInput {
    filters: [filterInput]
  }

  input propertiesInput {
    filterGroups: [filterGroupsInput]
  }

  type emails {
    value: String    
  }

  type contact {
    id: String
    firstname: String
    lastname: String
    email: String
    phone: String
    address: String
    city: String
    state: String
    error: String
  }

  type Query {    
    getContactProperties(filterInput: propertiesInput!): [contact]
    getContactPropertiesFromArray(emails: [String]): [contact]
  }
`;

