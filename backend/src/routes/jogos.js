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

router.get('/h2h', async (req, res) => {
  const { time1, time2 } = req.query

  try {
    const response = await FootballApi.get('fixtures/headtohead', {
      params: {
        h2h: `${time1}-${time2}`
      }
    })
    res.json(response.data)
  } catch (erro) {
    console.log(erro.response?.data || erro.message)
    res.status(500).json({ erro: 'Erro ao buscar confrontos diretos' })
  }
})

router.get('/ultimos', async (req, res) => {
  const { timeId, temporada, quantidade } = req.query

  try {
    const response = await FootballApi.get('fixtures', {
      params: {
        team: timeId,
        season: temporada || 2024
      }
    })

    const hoje = new Date()

    const jogosRealizados = response.data.response.filter(jogo => {
      const dataJogo = new Date(jogo.fixture.date)
      return dataJogo < hoje
    })

    const ultimos = jogosRealizados.slice(-(quantidade || 10))

    res.json({ results: ultimos.length, response: ultimos })
  } catch (erro) {
    console.log('Erro detalhado:', erro.response?.data || erro.message)
    res.status(500).json({ erro: 'Erro ao buscar ultimos jogos' })
  }
})

router.get('/proximos', async (req, res) => {
  const { timeId, temporada } = req.query

  try {
    const response = await FootballApi.get('fixtures', {
      params: {
        team: timeId,
        season: temporada || 2024
      }
    })

    const hoje = new Date()

    const proximos = response.data.response.filter(jogo => {
      const dataJogo = new Date(jogo.fixture.date)
      return dataJogo > hoje
    })
    
    if (proximos.length === 0) {
      const ultimos = response.data.response.slice(-5)
      return res.json({ results: ultimos.length, response: ultimos, aviso: 'Sem jogos futuros, exibindo últimos jogos da temporada' })
    }

    res.json({ results: proximos.length, response: proximos })
  } catch (erro) {
    console.log(erro.response?.data || erro.message)
    res.status(500).json({ erro: 'Erro ao buscar próximos jogos' })
  }
})

router.get('/forma', async (req, res) => {
  const { timeId, quantidade } = req.query

  try {
    const response = await FootballApi.get('fixtures', {
      params: {
        team: timeId,
        season: 2024
      }
    })

    const jogos = response.data.response

    const forma = jogos.map(jogo => {
      const timeCasa = jogo.teams.home
      const timeFora = jogo.teams.away
      const golsCasa = jogo.goals.home
      const golsFora = jogo.goals.away
      const ehCasa = timeCasa.id == timeId

      let resultado
      if (golsCasa === golsFora) resultado = 'E'
      else if (ehCasa && golsCasa > golsFora) resultado = 'V'
      else if (!ehCasa && golsFora > golsCasa) resultado = 'V'
      else resultado = 'D'

      return {
        data: jogo.fixture.date,
        adversario: ehCasa ? timeFora.name : timeCasa.name,
        golsMarcados: ehCasa ? golsCasa : golsFora,
        golsSofridos: ehCasa ? golsFora : golsCasa,
        local: ehCasa ? 'Casa' : 'Fora',
        resultado
      }
    })

    res.json({ results: forma.length, response: forma })
  } catch (erro) {
    console.log(erro.response?.data || erro.message)
    res.status(500).json({ erro: 'Erro ao calcular forma' })
  }
})
    

module.exports = router

