const express = require('express')
const router = express.Router()
const FootballApi = require('../services/FootballApi')


router.get('/buscar', async(req, res) => {

  const { nome } = req.query

  try {
    const response = await FootballApi.get('/teams', {
      params: {name: nome}
    })
    res.json(response.data)
  } catch (erro) {
     console.log(erro.response?.data || erro.message)
    res.status(500).json({erro: "Erro ao buscar times" })
  }

})

module.exports = router