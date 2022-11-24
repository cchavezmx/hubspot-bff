import { getContactBasicFilter, getContactDeal, batchDeal, getDataFromUpstash } from '../../utils/index.js'
import { setTimeout } from 'timers/promises'
import { contactProperties } from '../../utils/CONST.js'

const filterPayload = (propertyName, value) => [{ filters: [{ propertyName, operator: 'EQ', value }] }]

export const Query = {
  getContactProperties: async (__parent, { filterInput }, context, info) => {
    try {
      const { filterGroups } = filterInput
      const { data } = await getContactBasicFilter(filterGroups, contactProperties)
      const results = data.results.map(contact => contact.properties)
      return results
    } catch (error) {
      console.log(error)
    }
  },
  getContactPropertiesFromArray: async (__parent, { emails }, context, info) => {
    const contacts = []
    try {
      for await (const email of emails) {
        await setTimeout(500)
        await getContactBasicFilter([{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }], contactProperties)
          .then(({ data }) => {
            const results = data.results.map(contact => contact.properties)
            if (results.length === 0) {
              contacts.push({ error: `No existe el contacto con el email ${email}` })
            }
            console.log('yapa')
            // save on redis cache
            info.cacheControl.setCacheHint({ maxAge: 240 })
            contacts.push(results[0])
          })
      }
      return contacts
    } catch (error) {
      console.log(error)
    }
  },
  getDealsPropertiesFromArray: async (__parent, { emails }, context, info) => {
    const contacts = []
    try {
      const tenRescursiveFunction = async (arrayProp = []) => {
        await setTimeout(500)
        if (arrayProp.length === 0) {
          return contacts
        }

        const counter = 0
        const currentArray = arrayProp.slice(counter, counter + 10)

        for await (const email of currentArray) {
          try {
            const { data: dataContact } = await getContactBasicFilter(filterPayload('email', email), contactProperties)

            if (!dataContact.results.length) {
              contacts.push({
                contactProperties: { error: 'No existe el contacto', email },
                dealProperties: [{ error: 'No existe el contacto' }]
              })
            }
            const [contact] = dataContact.results
            const associatedDeals = await getContactDeal(contact.id)

            if (associatedDeals.length > 0) {
              const { data: alldeals } = await batchDeal(associatedDeals)
              contacts.push({
                contactProperties: contact.properties,
                dealProperties: alldeals.results.flat(Infinity).map(deal => deal.properties)
              })
            } else {
              contacts.push({
                contactProperties: contact.properties,
                dealProperties: [{ error: 'No tiene deals asociados' }]
              })
            }
          } catch (error) {
            console.log('🚀 ~ file: query.js ~ line 77 ~ forawait ~ error', error.message, email)
          }
        }

        const nextArray = arrayProp.slice(counter + 10, Infinity)
        return tenRescursiveFunction(nextArray)
      }

      return await tenRescursiveFunction(emails)
    } catch (error) {
      console.log(error)
      return error
    }
  },
  getAllConfirmedFromArray: async (__parent, { emails, type }, context, info) => {
    try {
      return Promise.all(emails.map(email => getDataFromUpstash(email, type)))
    } catch (error) {
      console.log(error)
      return error
    }
  }
}
