import { useState } from 'react'
import api from '../services/api'

function Tendencias() {
  const [busca, setBusca] = useState('')
  const [times, setTimes] = useState([])
  const [timeSelecionado, setTimeSelecionado] = useState(null)
  const [insights, setInsights] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  async function buscarTimes() {
    if (!busca.trim()) return
    setCarregando(true)
    setErro(null)
    try {
      const resposta = await api.get(`/times/buscar?nome=${busca}`)
      setTimes(resposta.data.response)
    } catch (e) {
      setErro('Erro ao buscar times.')
    } finally {
      setCarregando(false)
    }
  }

  async function analisarTime(time) {
    setTimeSelecionado(time)
    setCarregando(true)
    setErro(null)
    setInsights([])

    try {
      const resForma = await api.get(`/jogos/forma?timeId=${time.team.id}&quantidade=20`)
      const jogos = resForma.data.response
      const insightsGerados = gerarInsights(jogos, time.team.id)
      setInsights(insightsGerados)
    } catch (e) {
      setErro('Erro ao analisar time.')
    } finally {
      setCarregando(false)
    }
  }

  function gerarInsights(jogos, timeId) {
    const insights = []
    const total = jogos.length
    if (total === 0) return insights

    // Over 2.5 gols no total
    const over25 = jogos.filter(j => (j.golsMarcados + j.golsSofridos) > 2.5).length
    const pctOver25 = Math.round((over25 / total) * 100)
    insights.push({
      tipo: pctOver25 >= 60 ? 'positivo' : pctOver25 <= 40 ? 'negativo' : 'neutro',
      titulo: 'Over 2.5 gols',
      descricao: `${over25} de ${total} jogos tiveram mais de 2.5 gols (${pctOver25}%)`,
      mercado: 'Over/Under 2.5'
    })

    // BTTS — ambas as equipes marcaram
    const btts = jogos.filter(j => j.golsMarcados > 0 && j.golsSofridos > 0).length
    const pctBtts = Math.round((btts / total) * 100)
    insights.push({
      tipo: pctBtts >= 60 ? 'positivo' : pctBtts <= 40 ? 'negativo' : 'neutro',
      titulo: 'Ambas marcam (BTTS)',
      descricao: `${btts} de ${total} jogos ambos os times marcaram (${pctBtts}%)`,
      mercado: 'BTTS'
    })

    // Taxa de vitórias geral
    const vitorias = jogos.filter(j => j.resultado === 'V').length
    const pctVitorias = Math.round((vitorias / total) * 100)
    insights.push({
      tipo: pctVitorias >= 55 ? 'positivo' : pctVitorias <= 35 ? 'negativo' : 'neutro',
      titulo: 'Taxa de vitórias',
      descricao: `${vitorias} vitórias em ${total} jogos (${pctVitorias}%)`,
      mercado: 'Resultado final'
    })

    // Desempenho em casa
    const jogosEmCasa = jogos.filter(j => j.local === 'Casa')
    const vitoriasCasa = jogosEmCasa.filter(j => j.resultado === 'V').length
    if (jogosEmCasa.length > 0) {
      const pctCasa = Math.round((vitoriasCasa / jogosEmCasa.length) * 100)
      insights.push({
        tipo: pctCasa >= 60 ? 'positivo' : pctCasa <= 35 ? 'negativo' : 'neutro',
        titulo: 'Força em casa',
        descricao: `${vitoriasCasa} vitórias em ${jogosEmCasa.length} jogos em casa (${pctCasa}%)`,
        mercado: 'Resultado — mandante'
      })
    }

    // Desempenho fora
    const jogosFora = jogos.filter(j => j.local === 'Fora')
    const vitoriasFora = jogosFora.filter(j => j.resultado === 'V').length
    if (jogosFora.length > 0) {
      const pctFora = Math.round((vitoriasFora / jogosFora.length) * 100)
      insights.push({
        tipo: pctFora >= 50 ? 'positivo' : pctFora <= 30 ? 'negativo' : 'neutro',
        titulo: 'Força fora de casa',
        descricao: `${vitoriasFora} vitórias em ${jogosFora.length} jogos fora (${pctFora}%)`,
        mercado: 'Resultado — visitante'
      })
    }

    // Média de gols marcados
    const totalGolsMarcados = jogos.reduce((acc, j) => acc + j.golsMarcados, 0)
    const mediaGols = (totalGolsMarcados / total).toFixed(2)
    insights.push({
      tipo: mediaGols >= 1.5 ? 'positivo' : mediaGols <= 0.8 ? 'negativo' : 'neutro',
      titulo: 'Média de gols marcados',
      descricao: `${mediaGols} gols por jogo nos últimos ${total} jogos`,
      mercado: 'Over/Under — gols'
    })

    // Sequência atual
    const sequencia = []
    for (let i = jogos.length - 1; i >= 0; i--) {
      if (jogos[i].resultado === jogos[jogos.length - 1].resultado) {
        sequencia.push(jogos[i])
      } else break
    }
    if (sequencia.length >= 3) {
      const tipoSeq = sequencia[0].resultado === 'V' ? 'vitórias' :
                      sequencia[0].resultado === 'E' ? 'empates' : 'derrotas'
      insights.push({
        tipo: sequencia[0].resultado === 'V' ? 'positivo' : sequencia[0].resultado === 'D' ? 'negativo' : 'neutro',
        titulo: `Sequência de ${tipoSeq}`,
        descricao: `O time está em sequência de ${sequencia.length} ${tipoSeq} consecutivas`,
        mercado: 'Momento do time'
      })
    }

    return insights
  }

  const corInsight = {
    positivo: 'border-green-700 bg-green-950',
    negativo: 'border-red-700 bg-red-950',
    neutro: 'border-yellow-700 bg-yellow-950'
  }

  const iconeInsight = {
    positivo: '📈',
    negativo: '📉',
    neutro: '➡️'
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Tendências</h1>
      <p className="text-gray-400 text-sm mb-6">Análise automática de padrões nos últimos 20 jogos</p>

      
      <div className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="Digite o nome do time..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && buscarTimes()}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
        />
        <button
          onClick={buscarTimes}
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Buscar
        </button>
      </div>

      {erro && <p className="text-red-400 mb-4">{erro}</p>}
      {carregando && <p className="text-gray-400 mb-4">Analisando dados...</p>}

      
      {times.length > 0 && !timeSelecionado && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {times.map(t => (
            <button
              key={t.team.id}
              onClick={() => analisarTime(t)}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-4 flex flex-col items-center gap-2 transition-colors"
            >
              <img src={t.team.logo} alt={t.team.name} className="w-12 h-12 object-contain" />
              <span className="text-sm font-medium text-center">{t.team.name}</span>
              <span className="text-xs text-gray-400">{t.team.country}</span>
            </button>
          ))}
        </div>
      )}

      
      {timeSelecionado && insights.length > 0 && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => { setTimeSelecionado(null); setInsights([]); setTimes([]) }}
              className="text-gray-400 hover:text-white text-sm"
            >
              ← Voltar
            </button>
            <img src={timeSelecionado.team.logo} alt={timeSelecionado.team.name} className="w-8 h-8 object-contain" />
            <h2 className="text-xl font-bold">{timeSelecionado.team.name}</h2>
            <span className="text-gray-400 text-sm">últimos 20 jogos</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`border rounded-lg p-5 ${corInsight[insight.tipo]}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{iconeInsight[insight.tipo]}</span>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{insight.titulo}</h3>
                    <p className="text-sm text-gray-300 mb-2">{insight.descricao}</p>
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                      Mercado: {insight.mercado}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Tendencias