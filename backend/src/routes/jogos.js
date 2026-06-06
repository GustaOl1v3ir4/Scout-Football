const express = require('express')
const router = express.Router()
const FootballApi = require('../services/FootballApi')

router.get('/buscar', async(req, res) => {
    const { timeId, temporada } = req.query

    try {
        const response = await FootballApi.get('/fixtures', {
            params: {
                team: timeId,
                season: temporada
            }
        })
        res.json(response.data)
        } catch {
            console.log(erro.response?.data || erro.message)
            res.status(500).json({erro: "Erro ao buscar times" })
        }
})

router.get('/estatisticas', async(req, res) => {
    const { timeId, ligaId, temporada } = req.query

    try {
        const response = await FootballApi.get('teams/statistics', {
            params: {
                team: timeId,
                league: ligaId,
                season: temporada
            }
        })
        res.json(response.data)
    } catch {
        console.log(erro.response?.data || erro.message)
        res.status(500).json({erro: "Erro ao buscar estatisticas" })
    }
})

router.get('/h2h', async(req, res) => {
    const { timeId, timeId2, temporada } = req.query

    try{
        const response = await FootballApi.get('/fixtures/head2head', {
            params: {
                team1: timeId,
                team2: timeId2,
                season: temporada
            }
        })
        res.json(response.data)
    } catch {
        console.log(erro.response?.data || erro.message)
        res.status(500).json({erro: "Erro ao buscar confrontos diretos" })
    }
})

module.exports = router

