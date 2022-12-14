import { ApolloError } from 'apollo-server-errors'
import { getContactBasicFilter, updateContact, sendWhatsappMessage, updateDeal } from '../../utils/index.js'
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
      const tenRescursiveFunction = async (arrayProp = []) => {
        await setTimeout(500)
        if (arrayProp.length === 0) {
          return contacts.filter(item => item !== undefined)
        }

        const counter = 0
        const currentArray = arrayProp.slice(counter, counter + 10)

        for await (const email of currentArray) {
          const response = await getContactBasicFilter(
            [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
            [...contactProperties, property])
            .then(async ({ data }) => {
              const results = data.results.map(contact => contact)
              if (results.length === 0) {
                contacts.push({
                  email,
                  status: 'error',
                  updateResponse: null
                })
                return
              }
              const [contact] = results
              const { data: updateResponse } = await updateContact(contact.id, hubspotProp)
              const { properties } = updateResponse
              const { property } = hubspotProp
              const status = properties[property] === hubspotProp.value ? 'pending' : 'error'
              return {
                email,
                status,
                updateResponse: updateResponse.properties
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
  },
  sendWhatsappMessageDealHubspot: async (__parent, { alumniInput, hubspotProp }, context, info) => {
    const contacts = []
    try {
      const tenRescursiveFunction = async (arrayProp = []) => {
        await setTimeout(500)
        if (arrayProp.length === 0) {
          return contacts
        }

        const counter = 0
        const currentArray = arrayProp.slice(counter, counter + 10)

        for await (const alumni of currentArray) {
          try {
            // enviar whatsapp
            console.log('enviar whatsapp', alumni)
            const whatsappData = await sendWhatsappMessage(alumni)
            // cambiar propiedad
            if (whatsappData.status !== 200) {
              contacts.push({
                email: alumni.email,
                hubspotResponse: null,
                whatsappResponse: whatsappData.data.message
              })
            }

            const { data: updateResponse } = await updateDeal(alumni.deal_id, hubspotProp)
            if (whatsappData.status === 200 && updateResponse.id === alumni.deal_id) {
              contacts.push({
                email: alumni.email,
                whatsappResponse: whatsappData.data.message,
                hubspotResponse: 'Hubspot property updated'
              })
            }
          } catch (error) {
            contacts.push({
              email: alumni.email,
              whatsappResponse: 'message not sent',
              hubspotResponse: 'Hubspot property not updated'
            })
          }
        }

        const nextArray = arrayProp.slice(counter + 10, Infinity)
        return tenRescursiveFunction(nextArray)
      }

      return await tenRescursiveFunction(alumniInput)
    } catch (error) {
      console.log(error.message)
      return error
    }
  }
}
