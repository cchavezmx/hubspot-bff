
import axios from 'axios'
import * as dotenv from 'dotenv'
import { contactProperties, dealProperties } from '../utils/CONST.js'
import { createClient } from 'redis'

dotenv.config()

const hubApi = axios.create({
  params: {
    hapikey: process.env.HUBSPOT_API_KEY
  },
  baseURL: 'https://api.hubapi.com'
})

export const getContactBasicFilter = async (filterGroups, properties, limit = 100) => {
  const raw = JSON.stringify({
    filterGroups,
    properties,
    limit
  })

  const contact = await hubApi.post('/crm/v3/objects/contacts/search', raw, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  return contact
}

export async function updateContact (dealID, hubspotProp) {
  const { property, value } = hubspotProp

  const raw = JSON.stringify({
    properties: {
      [property]: value
    }
  })

  const deal = await hubApi.patch(`/crm/v3/objects/contacts/${dealID}`, raw, {
    headers: {
      'Content-Type': 'application/json'
    }

  })
  return deal
}

export async function getDealBasicFilter (filterGroups, properties, limit = 100) {
  const raw = JSON.stringify({
    filterGroups,
    properties,
    limit
  })

  const { data } = await hubApi.post('/crm/v3/objects/deals/search', raw, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  return data.results
}

export async function getContactDeal (contactID) {
  const { data } = await hubApi.get(`/crm/v3/objects/contacts/${contactID}/associations/DEALS`)
  return data.results
}

export async function sendWhatsappMessage (message) {
  // eslint-disable-next-line camelcase
  const { name, phone, program, payment_link } = message
  const config = {
    method: 'POST',
    url: 'https://bot-whats-d6rxv5j22a-uc.a.run.app/send/payment/link',
    headers: {
      Authorization: process.env.BASIC_TOKEN,
      'Content-Type': 'application/json'
    },
    // eslint-disable-next-line camelcase
    data: JSON.stringify({ name, phone, program, payment_link })
  }

  const { data } = await axios(config)
  return data
}

export async function updateDeal (dealID, hubspotProp) {
  const { property, value } = hubspotProp

  const raw = JSON.stringify({
    properties: {
      [property]: value
    }
  })

  const deal = await hubApi.patch(`/crm/v3/objects/deals/${dealID}`, raw, {
    headers: {
      'Content-Type': 'application/json'
    }

  })
  return deal
}

export async function batchDeal (associations) {
  const raw = JSON.stringify({
    inputs: associations,
    properties: dealProperties
  })

  const deals = await hubApi.post('/crm/v3/objects/deals/batch/read', raw, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  return deals
}

export async function getDataFromUpstash (email, typeMessage) {
  const client = createClient({
    url: `${process.env.REDIS_URL}`
  })
  client.on('error', (err) => {
    console.log('Error ' + err)
  })
  try {
    const data = async () => {
      await client.connect().catch((err) => console.log('Redis Client Error', err))
      const data = await client.get(`${typeMessage}:${email}`)
      await client.disconnect()
      if (data) {
        return { email, status: data }
      } else {
        return { email, status: 'not_found' }
      }
    }

    return Promise.resolve(data())
  } catch (error) {
    console.log(error)
    return null
  }
}

export async function getDealAssociation (dealId, scope) {
  const { data } = await hubApi.get(`/crm/v3/objects/deals/${dealId}/associations/${scope}`)
  return data.results
}

export async function getTicket (id) {
  const filterBody = {
    filterGroups: [
      {
        filters: [
          {
            operator: 'EQ',
            propertyName: 'hs_object_id',
            value: id
          }
        ]
      }
    ],
    properties: [
      'content',
      'subject'
    ]
  }
  const raw = JSON.stringify({ ...filterBody })

  const { data } = await hubApi.post('/crm/v3/objects/tickets/search', raw, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  return data.results[0].properties
}

export async function getContactFromDealId (deal) {
  try {
    const { data: asosiateID } = await hubApi.get(`/crm/v3/objects/deals/${deal.id}/associations/CONTACT`)

    if (asosiateID.results.length === 0) {
      return null
    }

    const raw = JSON.stringify({
      filterGroups: [{
        filters: [{
          operator: 'EQ',
          propertyName: 'hs_object_id',
          value: asosiateID.results[0].id
        }]
      }],
      properties: contactProperties
    })

    const { data: contact } = await hubApi.post('/crm/v3/objects/contacts/search', raw, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const payload = {
      ...deal.properties,
      ...contact.results[0].properties
    }

    return { ...payload }
  } catch (error) {
    console.log(error)
    return null
  }
}

export async function getContact (id) {
  const filterBody = {
    filterGroups: [
      {
        filters: [
          {
            operator: 'EQ',
            propertyName: 'hs_object_id',
            value: id
          }
        ]
      }
    ],
    properties: contactProperties
  }
  const raw = JSON.stringify({ ...filterBody })

  const { data } = await hubApi.post('/crm/v3/objects/contacts/search', raw, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  return data.results.map((contact) => contact.properties)
}
