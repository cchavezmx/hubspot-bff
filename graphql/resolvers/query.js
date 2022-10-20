import { getContactBasicFilter } from '../../utils/index.js';

const contactProperties = ['firstname', 'lastname', 'email', 'phone', 'address', 'city', 'state']

export const Query = {
  getContactProperties: async (__parent, { filterInput }, context, info) => {
    try {
      const { filterGroups } = filterInput;
      const { data } = await getContactBasicFilter(filterGroups, contactProperties);      
      const results = data.results.map(contact => contact.properties);
      return results;

    } catch (error) {
      console.log(error);
    }
  },
  getContactPropertiesFromArray: async (__parent, { emails }, context, info) => {
    const contacts = [];
    try {
      for (const email of emails) {
        await getContactBasicFilter([{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }], contactProperties)
        .then(({ data }) => {
          const results = data.results.map(contact => contact.properties);
          if (results.length === 0) {
            contacts.push({ error: `No existe el contacto con el email ${email}` });
          }
          contacts.push(results[0]);
        });
      }
      return contacts;

    } catch (error) {
      console.log(error);
    }
  }
}
