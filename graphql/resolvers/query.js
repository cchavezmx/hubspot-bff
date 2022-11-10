import { getContactBasicFilter, getDealBasicFilter, getContactDeal } from '../../utils/index.js'
import { setTimeout } from 'timers/promises'
import { contactProperties, dealProperties } from '../../utils/CONST.js'

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
          const response = await getContactBasicFilter(
            [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
            [...contactProperties])
            .then(async ({ data }) => {
              const results = data.results.map(contact => contact)
              if (results.length === 0) {
                contacts.push({ error: `No existe el contacto con el email ${email}` })
                return
              }
              const [contact] = results
              // probamos con el primer deal
              const [associatedDeals] = await getContactDeal(contact.id)

              let dealData = null
              if (associatedDeals) {
                dealData = await getDealBasicFilter(
                  [{ filters: [{ propertyName: 'hs_object_id', operator: 'EQ', value: associatedDeals.id }] }],
                  dealProperties)
                  .then((res) => {
                    const results = res.map(deal => deal.properties)
                    return results
                  })
              } else {
                // contacts.push({ error: 'No existe Deal asociado' })
                return { error: 'No existe Deal asociado' }
              }

              return {
                contactProperties: contact.properties,
                dealProperties: dealData ? dealData[0] : null
              }
            })

          contacts.push(response)
        }

        const nextArray = arrayProp.slice(counter + 10, Infinity)
        return tenRescursiveFunction(nextArray)
      }

      return tenRescursiveFunction(emails)
    } catch (error) {
      console.log(error)
      return error
    }
  }
}
