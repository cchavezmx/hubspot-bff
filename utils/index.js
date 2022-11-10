
import axios from 'axios'
import * as dotenv from 'dotenv'
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
