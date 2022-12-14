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

  enum programs {
    code
    data
    ux
    ai
    ui
    data_ai
    ux_ui
  }

  enum status {
    pending    
    error
  }

  enum scopeEnum {
    tickets
    contacts
  }

  enum contactPropertiesEnum {
    next_info_session_register
    envio_link_ensayo
  }

  enum dealPropertiesEnum {
    dealname
    amount
    closedate
    programa_de_interes
    link_pago_parcialidades
    envio_link_pago_whatsapp
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
  
  input hubspotContactProp {
    property: contactPropertiesEnum
    value: String
  }

  input hubspoDealtProp {
    property: dealPropertiesEnum
    value: String
  }
  
  type emails  @cacheControl(maxAge: 240) {
    value: String    
  }

  type contact {
    id: Int
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

  type ticket {
    subject: String,
    content: String,
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

  type associatedToDeal {
    tickets: [ticket]
    contacts: [contact]
  }

  type contactProperties {
    next_info_session_register: String
    envio_link_ensayo: String
  }

  type updateResponse {
    email: String
    status: status
    updateResponse: contactProperties
  }

  type whatsappResponse {
    email: String
    whatsappResponse: String
    hubspotResponse: String
  }

  input Alumni {
    email: String
    name: String
    phone: String
    program: programs
    payment_link: String
    deal_id: String      
  }

  type DealAndContact {
    createdate: String
    dealname: String
    hs_lastmodifieddate: String
    hs_object_id: String
    link_pago_parcialidades: String
    link_de_inscripcion: String
    programa_de_interes: String
    address: String
    city: String
    email: String
    firstname: String
    lastmodifieddate: String
    lastname: String
    mobilephone: String
    phone: String
    state: String
    error: String
  }

  
  type contactConfirmed {
    email: String
    status: String
  }

  enum dateEnum {
    createdate
    hs_lastmodifieddate
  }

  input DateFilterInput {
    propertyName: dateEnum,
    date: String
  }
    
  type Mutation {
    changePropertiesFromContacts(emails: [String], hubspotProp: hubspotContactProp): [updateResponse]
    sendWhatsappMessageDealHubspot(alumniInput: [Alumni], hubspotProp: hubspoDealtProp): [whatsappResponse]
  }

  type Query {    
    getContactProperties(filterInput: propertiesInput!): [contact]
    getContactPropertiesFromArray(emails: [String]): [contact]
    getDealsPropertiesFromArray(emails: [String]): [contactAndDeal]
    getAllConfirmedFromArray(emails: [String], type: contactPropertiesEnum ): [contactConfirmed]
    getDealAssociated(dealId: String, scope: scopeEnum): [associatedToDeal]
    getContactsAndDealFromStage(dealstage: String, dateFilter: DateFilterInput): [DealAndContact]
  }

`
