import { useState } from 'react'
import api from '../services/api'

function Explorador() {
  const [busca, setBusca] = useState('')
  const [times, setTimes] = useState([])
  const [timeSelecionado, setTimeSelecionado] = useState(null)
  const [estatisticas, setEstatisticas] = useState(null)
  const [forma, setForma] = useState([])
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
      setErro('Erro ao buscar times. Verifique se o backend está rodando.')
    } finally {
      setCarregando(false)
    }
  }

  async function selecionarTime(time) {
    setTimeSelecionado(time)
    setCarregando(true)
    setErro(null)
    try {
      const [resEstat, resForma] = await Promise.all([
        api.get(`/jogos/estatisticas?timeId=${time.team.id}&ligaId=71&temporada=2024`),
        api.get(`/jogos/forma?timeId=${time.team.id}&quantidade=10`)
      ])
      console.log('Estatísticas:', resEstat.data)
      console.log('Forma:', resForma.data)
      setEstatisticas(resEstat.data.response)
      setForma(resForma.data.response)
    } catch (e) {
        console.log('Erro:', e)
      setErro('Erro ao carregar dados do time.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Explorador de Dados</h1>

      
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
      {carregando && <p className="text-gray-400 mb-4">Carregando...</p>}

      
      {times.length > 0 && !timeSelecionado && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {times.map(t => (
            <button
              key={t.team.id}
              onClick={() => selecionarTime(t)}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-4 flex flex-col items-center gap-2 transition-colors"
            >
              <img src={t.team.logo} alt={t.team.name} className="w-12 h-12 object-contain" />
              <span className="text-sm font-medium text-center">{t.team.name}</span>
              <span className="text-xs text-gray-400">{t.team.country}</span>
            </button>
          ))}
        </div>
      )}

      
      {timeSelecionado && estatisticas && (
        <div>
          
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => { setTimeSelecionado(null); setEstatisticas(null); setForma([]) }}
              className="text-gray-400 hover:text-white text-sm"
            >
              ← Voltar
            </button>
            <img src={timeSelecionado.team.logo} alt={timeSelecionado.team.name} className="w-10 h-10 object-contain" />
            <h2 className="text-xl font-bold">{timeSelecionado.team.name}</h2>
            <span className="text-gray-400 text-sm">{estatisticas.league?.name} {estatisticas.league?.season}</span>
          </div>

         
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Jogos</p>
              <p className="text-2xl font-bold">{estatisticas.fixtures?.played?.total}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Vitórias</p>
              <p className="text-2xl font-bold text-green-400">{estatisticas.fixtures?.wins?.total}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Empates</p>
              <p className="text-2xl font-bold text-yellow-400">{estatisticas.fixtures?.draws?.total}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Derrotas</p>
              <p className="text-2xl font-bold text-red-400">{estatisticas.fixtures?.loses?.total}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Gols marcados</p>
              <p className="text-2xl font-bold">{estatisticas.goals?.for?.total?.total}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Gols sofridos</p>
              <p className="text-2xl font-bold">{estatisticas.goals?.against?.total?.total}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Média de gols</p>
              <p className="text-2xl font-bold">{estatisticas.goals?.for?.average?.total}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Clean sheets</p>
              <p className="text-2xl font-bold">{estatisticas.clean_sheet?.total}</p>
            </div>
          </div>

          
          {forma.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Últimos 10 jogos</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-left border-b border-gray-700">
                      <th className="pb-2">Data</th>
                      <th className="pb-2">Adversário</th>
                      <th className="pb-2">Local</th>
                      <th className="pb-2">Gols</th>
                      <th className="pb-2">Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forma.map((jogo, i) => (
                      <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="py-2 text-gray-400">
                          {new Date(jogo.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-2">{jogo.adversario}</td>
                        <td className="py-2 text-gray-400">{jogo.local}</td>
                        <td className="py-2">{jogo.golsMarcados} x {jogo.golsSofridos}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            jogo.resultado === 'V' ? 'bg-green-900 text-green-400' :
                            jogo.resultado === 'E' ? 'bg-yellow-900 text-yellow-400' :
                            'bg-red-900 text-red-400'
                          }`}>
                            {jogo.resultado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Explorador