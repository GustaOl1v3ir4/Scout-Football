const express = require('express')
const cors = require('cors')
require('dotenv').config()

const timesRouter = require('./routes/times')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/times', timesRouter)

app.get('/', (req, res) => {
  res.json({ mensagem: 'ScoutBet API funcionando!' })
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})