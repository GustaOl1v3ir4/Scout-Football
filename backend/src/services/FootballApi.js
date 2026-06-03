const axios = require('axios')

const api = axios.create({
    baseURL: process.env.API_FOOTBALL_URL,
    headers: {
        'x-apisports-key': process.env.API_FOOTBALL_KEY
    }
})

module.exports = api