import { useEffect, useState } from 'react'
import apiClient from '../api/client'

function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    totalDeals: 0,
    pipelineValue: 0,
    openTickets: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch customers
        const customersRes = await apiClient.get('/customers?limit=1')
        
        // Fetch deals
        const dealsRes = await apiClient.get('/deals')
        
        // Fetch tickets
        const ticketsRes = await apiClient.get('/tickets')

        setMetrics({
          totalCustomers: customersRes.data.total || 0,
          totalDeals: dealsRes.data.total || 0,
          pipelineValue: dealsRes.data.total_pipeline_value || 0,
          openTickets: ticketsRes.data.total || 0
        })
      } catch (err) {
        console.error('Error fetching metrics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu CRM</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="card">
          <h3 className="text-gray-600 text-sm font-medium">Total de Clientes</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">{metrics.totalCustomers}</p>
          <p className="text-gray-500 text-xs mt-2">+0 este mês</p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 text-sm font-medium">Oportunidades</h3>
          <p className="text-4xl font-bold text-green-600 mt-2">{metrics.totalDeals}</p>
          <p className="text-gray-500 text-xs mt-2">Abertas</p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 text-sm font-medium">Pipeline</h3>
          <p className="text-4xl font-bold text-purple-600 mt-2">
            R$ {(metrics.pipelineValue / 1000).toFixed(0)}K
          </p>
          <p className="text-gray-500 text-xs mt-2">Valor total</p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 text-sm font-medium">Tickets Abertos</h3>
          <p className="text-4xl font-bold text-orange-600 mt-2">{metrics.openTickets}</p>
          <p className="text-gray-500 text-xs mt-2">Aguardando resolução</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Pipeline por Estágio</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Prospecção</span>
                <span className="font-medium">R$ 150K</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Qualificação</span>
                <span className="font-medium">R$ 200K</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '47%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Proposta</span>
                <span className="font-medium">R$ 100K</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '24%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Atividades Recentes</h2>
          <div className="space-y-3">
            <div className="text-sm border-l-4 border-blue-600 pl-4 py-2">
              <p className="font-medium text-gray-800">Nova oportunidade criada</p>
              <p className="text-gray-500 text-xs">João Silva - R$ 50K</p>
            </div>
            <div className="text-sm border-l-4 border-green-600 pl-4 py-2">
              <p className="font-medium text-gray-800">Ticket resolvido</p>
              <p className="text-gray-500 text-xs">ABC Serviços - Dúvida sobre WhatsApp</p>
            </div>
            <div className="text-sm border-l-4 border-orange-600 pl-4 py-2">
              <p className="font-medium text-gray-800">SLA em breve</p>
              <p className="text-gray-500 text-xs">Maria Costa - Ticket #2345 - 2h de prazo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
