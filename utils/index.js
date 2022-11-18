
import axios from 'axios'
import * as dotenv from 'dotenv'
import { dealProperties } from '../utils/CONST.js'
import { createClient } from 'redis'

dotenv.config()

const hubApi = axios.create({
  params: {
    hapikey: process.env.HUBSPOT_API_KEY
  },
  baseURL: 'https://api.hubapi.com'
})

export const getContactBasicFilter = async (filterGroups, properties) => {
  const raw = JSON.stringify({
    filterGroups,
    properties
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

export async function getDealBasicFilter (filterGroups, properties) {
  const raw = JSON.stringify({
    filterGroups,
    properties
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

export async function getDataFromUpstash (email) {
  const client = createClient({
    url: `${process.env.REDIS_URL}`
  })
  client.on('error', (err) => {
    console.log('Error ' + err)
  })
  try {
    const data = async () => {
      await client.connect().catch((err) => console.log('Redis Client Error', err))
      const data = await client.get(email)
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
