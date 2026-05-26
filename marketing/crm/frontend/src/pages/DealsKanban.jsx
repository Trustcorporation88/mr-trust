import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'

function DealsKanban() {
  const navigate = useNavigate()
  const [deals, setDeals] = useState({})
  const [loading, setLoading] = useState(true)
  const [draggedDeal, setDraggedDeal] = useState(null)

  const stages = ['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechado']

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/deals')
      
      // Group by stage
      const groupedDeals = {}
      stages.forEach(stage => {
        groupedDeals[stage] = response.data.data.filter(d => d.stage === stage)
      })
      
      setDeals(groupedDeals)
    } catch (err) {
      console.error('Error fetching deals:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (e, deal) => {
    setDraggedDeal(deal)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, targetStage) => {
    e.preventDefault()
    
    if (!draggedDeal || draggedDeal.stage === targetStage) {
      setDraggedDeal(null)
      return
    }

    try {
      // Update deal stage
      await apiClient.post(`/deals/${draggedDeal.id}/stage`, {
        stage: targetStage
      })

      // Update local state
      const updatedDeals = { ...deals }
      updatedDeals[draggedDeal.stage] = updatedDeals[draggedDeal.stage].filter(
        d => d.id !== draggedDeal.id
      )
      updatedDeals[targetStage] = [
        ...updatedDeals[targetStage],
        { ...draggedDeal, stage: targetStage }
      ]
      
      setDeals(updatedDeals)
      setDraggedDeal(null)
    } catch (err) {
      console.error('Error updating deal:', err)
    }
  }

  const handleWon = async (deal) => {
    try {
      await apiClient.post(`/deals/${deal.id}/won`)
      fetchDeals()
    } catch (err) {
      console.error('Error marking deal as won:', err)
    }
  }

  const handleLost = async (deal) => {
    try {
      await apiClient.post(`/deals/${deal.id}/lost`, {
        lost_reason: 'Perdido via Kanban'
      })
      fetchDeals()
    } catch (err) {
      console.error('Error marking deal as lost:', err)
    }
  }

  const getTotalValue = (stageDeal) => {
    return stageDeal.reduce((sum, deal) => sum + (deal.amount || 0), 0)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="card text-center py-12">
          <p className="text-gray-600">Carregando pipeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Pipeline (Kanban)</h1>
        <p className="text-gray-600">Arraste as oportunidades entre estágios</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {stages.map((stage) => (
          <div key={stage} className="card">
            <h3 className="text-sm font-medium text-gray-700">{stage}</h3>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {deals[stage]?.length || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              R$ {(getTotalValue(deals[stage] || []) / 1000).toFixed(0)}K
            </p>
          </div>
        ))}
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-5 gap-4 auto-cols-max overflow-x-auto">
        {stages.map((stage) => (
          <div
            key={stage}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
            className="flex-shrink-0 w-80 bg-gray-100 rounded-lg p-4 min-h-96"
          >
            <h2 className="font-bold text-gray-800 mb-4">{stage}</h2>
            
            <div className="space-y-3">
              {(deals[stage] || []).map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal)}
                  className="bg-white p-4 rounded-lg shadow cursor-move hover:shadow-lg transition-shadow border-l-4 border-blue-600"
                >
                  <p className="font-medium text-gray-800">{deal.title}</p>
                  
                  <div className="text-sm text-gray-600 mt-2">
                    <p className="text-xs">Customer ID: {deal.customer_id.substring(0, 8)}</p>
                  </div>
                  
                  <p className="text-lg font-bold text-green-600 mt-3">
                    R$ {deal.amount?.toLocaleString()}
                  </p>

                  {deal.expected_close_date && (
                    <p className="text-xs text-gray-500 mt-2">
                      ⏰ {new Date(deal.expected_close_date).toLocaleDateString('pt-BR')}
                    </p>
                  )}

                  <div className="flex gap-2 mt-3">
                    {stage === 'Fechado' && (
                      <>
                        <button
                          onClick={() => handleWon(deal)}
                          className="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        >
                          ✓ Won
                        </button>
                        <button
                          onClick={() => handleLost(deal)}
                          className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        >
                          ✗ Lost
                        </button>
                      </>
                    )}
                    {stage !== 'Fechado' && (
                      <button
                        onClick={() => navigate(`/deals/${deal.id}`)}
                        className="w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      >
                        Detalhes
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {(!deals[stage] || deals[stage].length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">Nenhuma oportunidade</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Drag hint */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          💡 Dica: Arraste os cards entre colunas para atualizar o estágio automaticamente.
        </p>
      </div>
    </div>
  )
}

export default DealsKanban
