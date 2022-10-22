import { ApolloError } from 'apollo-server-errors'
import { getContactBasicFilter, updateContact } from '../../utils/index.js'
import { setTimeout } from 'timers/promises'
import { contactProperties } from '../../utils/CONST.js'

export const Mutation = {
  changePropertiesFromContacts: async (__parent, { emails, hubspotProp }, context, info) => {
    const keys = Object.keys(hubspotProp)
    if (!keys.includes('property') || !keys.includes('value')) {
      throw new ApolloError('Hubspot property and value are required')
    }

    const { property } = hubspotProp
    const contacts = []
    try {
      for await (const email of emails) {
        try {
          await setTimeout(500) // Hubspot API limit is 10 requests per second
          await getContactBasicFilter(
            [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
            [...contactProperties, property])
            .then(async ({ data }) => {
              const results = data.results.map(contact => contact)
              if (results.length === 0) {
                contacts.push({ email: `No existe el contacto con el email ${email}` })
                return
              }
              const [contact] = results
              const { data: updateResponse } = await updateContact(contact.id, hubspotProp)
              info.cacheControl.setCacheHint({ maxAge: 240 })
              contacts.push({ email, updateResponse: updateResponse.properties })
            })
        } catch (error) {
          console.log(error)
        }
      }
      return contacts
    } catch (error) {
      console.log(error)
      return error
    }
  }
}
