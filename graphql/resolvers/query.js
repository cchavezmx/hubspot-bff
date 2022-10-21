import { getContactBasicFilter } from '../../utils/index.js'
import { setTimeout } from 'timers/promises'

const contactProperties = ['firstname', 'lastname', 'email', 'phone', 'address', 'city', 'state']

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
    console.log('🚀 ~ file: query.js ~ line 18 ~ getContactPropertiesFromArray: ~ info', info)
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
  }
}
