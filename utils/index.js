
import axios from 'axios'
import * as dotenv from 'dotenv'
dotenv.config()

console.log('🚀 ~ file: index.js ~ line 3 ~ process.env', process.env.BASIC_TOKEN)

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
  console.log('🚀 ~ file: index.js ~ line 85 ~ sendWhatsappMessage ~ data', data)
  if (data.status !== 200) {
    throw new Error('Error al enviar el mensaje', data.error)
  }

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
