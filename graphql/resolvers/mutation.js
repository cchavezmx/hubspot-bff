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
      const tenRescursiveFunction = async (emails = []) => {
        await setTimeout(500)
        if (emails.length === 0) {
          return true
        }

        const counter = 0
        const currentArray = emails.slice(counter, counter + 10)

        for await (const email of currentArray) {
          const response = await getContactBasicFilter(
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
              return { email, updateResponse: updateResponse.properties }
            })
          contacts.push(response)
        }

        const nextArray = emails.slice(counter + 10, Infinity)
        tenRescursiveFunction(nextArray)
      }

      await tenRescursiveFunction(emails)
      return contacts
    } catch (error) {
      console.log(error)
      return error
    }
  }
}
