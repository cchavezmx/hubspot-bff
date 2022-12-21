import { getContactBasicFilter, getContactDeal, batchDeal, getDataFromUpstash, getDealAssociation, getTicket, getDealBasicFilter, getContactFromDealId, getContact } from '../../utils/index.js'
import { setTimeout } from 'timers/promises'
import { contactProperties, dealProperties } from '../../utils/CONST.js'
import { ApolloError } from 'apollo-server-core'

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
                contactProperties: { ...contact.properties, id: contact.id },
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
  },
  getDealAssociated: async (__parent, { dealId, scope }, context, info) => {
    try {
      const results = await getDealAssociation(dealId, scope)

      let response = []
      if (scope === 'tickets') {
        response = await Promise.all(results.map(({ id }) => getTicket(id)))
      } else if (scope === 'contacts') {
        response = await Promise.all(results.map(({ id }) => getContact(id)))
      } else {
        throw new Error('Debes enviar un scope valido')
      }
      return [{ [scope]: response.flat(Infinity) }]
    } catch (error) {
      console.log(error)
      return error
    }
  },
  getContactsAndDealFromStage: async (__parent, { dealstage, dateFilter }, context, info) => {
    console.log('🚀 ~ file: query.js:120 ~ getContactsAndDealFromStage: ~ dateFilter', dateFilter)
    const filters = () => {
      if (dateFilter.propertyName) {
        const valueDate = new Date(dateFilter.date).getTime()
        return [
          {
            operator: 'EQ',
            propertyName: 'dealstage',
            value: dealstage
          },
          {
            propertyName: dateFilter.propertyName,
            operator: 'BETWEEN',
            highValue: valueDate + 86400000,
            value: valueDate
          }
        ]
      }
      return [
        {
          operator: 'EQ',
          propertyName: 'dealstage',
          value: dealstage
        }
      ]
    }

    console.log(filters(), 'filters')

    const results = []
    const data = {
      filterGroups: [
        {
          filters: [...filters()]
        }
      ],
      limit: 100,
      properties: dealProperties
    }

    try {
      const contactAndDeal = await getDealBasicFilter(data.filterGroups, dealProperties, 100)
      for await (const deal of contactAndDeal) {
        await setTimeout(500)
        await getContactFromDealId(deal)
          .then(data => {
            if (typeof data?.hs_object_id !== 'undefined') {
              results.push(data)
            } else {
              results.push({ error: 'Sin datos de contacto', ...deal.properties })
            }
          })
      }
      return results
    } catch (error) {
      return new ApolloError(error)
    }
  }
}

// {
//   "eventId": "100",
//   "subscriptionId": 1863268,
//   "portalId": 7918300,
//   "occurredAt": 1669976445924,
//   "subscriptionType": "deal.propertyChange",
//   "attemptNumber": 0,
//   "objectId": 123,
//   "changeSource": "CRM",
//   "propertyName": "dealstage",
//   "propertyValue": "sample-value",
//   "appId": 1269948
// }
