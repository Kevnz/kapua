const axios = require('axios');

module.exports = (base, headers = { 'x-kapua': 'true' }) => {
  return axios.create({
    baseURL: base,
    timeout: 3000,
    headers
  });
};
