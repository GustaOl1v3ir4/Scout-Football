const express = require('express')
const cors = require('cors')
require('dotenv').config()

const timesRouter = require('./routes/times')
const jogosRouter = require('./routes/jogos')


const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/times', timesRouter)
app.use('/api/jogos', jogosRouter)

app.get('/', (req, res) => {
  res.json({ mensagem: 'ScoutBet API funcionando!' })
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})