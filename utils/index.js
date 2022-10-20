
import axios from 'axios';
import * as dotenv from 'dotenv'
dotenv.config()

const hubApi = axios.create({
  params: {
    hapikey: process.env.HUBSPOT_API_KEY,
  },
  baseURL: 'https://api.hubapi.com',
});


export const getContactBasicFilter = async (filterGroups, properties) => {    
  const raw = JSON.stringify({
    filterGroups,
    properties,
  });

  const contact = await hubApi.post('/crm/v3/objects/contacts/search', raw, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return contact
}

