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

  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }

  directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
    ) on FIELD_DEFINITION | OBJECT | INTERFACE    

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
  
  input hubspotProp {
    property: String
    value: String
  }
  
  type emails  @cacheControl(maxAge: 240) {
    value: String    
  }


  type contact {
    id: String
    firstname: String
    lastname: String
    email: String
    phone: String
    mobilephone: String
    address: String
    city: String
    state: String
    error: String
  }

  type deal {
    error: String
    hs_object_id: String
    link_pago_parcialidades: String
    programa_de_interes: String
  }

  type contactAndDeal {
    contactProperties: contact
    dealProperties: [deal]
    error: String
  }

  type contactProperties {
    next_info_session_register: String
    envio_link_ensayo: String
  }

  type updateResponse {
    email: String
    updateResponse: contactProperties
  }

  type Mutation {
    changePropertiesFromContacts(emails: [String], hubspotProp: hubspotProp): [updateResponse]
  }

  type Query {    
    getContactProperties(filterInput: propertiesInput!): [contact]
    getContactPropertiesFromArray(emails: [String]): [contact]
    getDealsPropertiesFromArray(emails: [String]): [contactAndDeal]

  }

`
