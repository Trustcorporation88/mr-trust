import { useEffect, useState } from 'react'
import apiClient from '../api/client'

function Tickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('open')
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    fetchTickets()
    fetchMetrics()
  }, [filter])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/tickets', {
        params: { status: filter === 'all' ? undefined : filter, limit: 50 }
      })
      setTickets(response.data.data)
    } catch (err) {
      console.error('Error fetching tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMetrics = async () => {
    try {
      const response = await apiClient.get('/tickets/metrics/all')
      setMetrics(response.data)
    } catch (err) {
      console.error('Error fetching metrics:', err)
    }
  }

  const handleResolve = async (ticketId) => {
    try {
      await apiClient.post(`/tickets/${ticketId}/resolve`, {
        resolution_notes: 'Resolvido'
      })
      fetchTickets()
      fetchMetrics()
    } catch (err) {
      console.error('Error resolving ticket:', err)
    }
  }

  const getStatusColor = (slaStatus) => {
    switch (slaStatus) {
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'ok':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Tickets de Suporte</h1>
        <p className="text-gray-600">Gerenciar fila de atendimento com SLA tracking</p>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-6 gap-4 mb-8">
          <div className="card">
            <p className="text-gray-600 text-sm font-medium">Abertos</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{metrics.open}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm font-medium">Em Progresso</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{metrics.in_progress}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm font-medium">Vencidos</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{metrics.overdue}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm font-medium">Resolvidos</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{metrics.resolved}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm font-medium">CSAT Médio</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{metrics.avg_csat}★</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm font-medium">SLA Compliance</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{metrics.sla_compliance_rate}%</p>
          </div>
        </div>
      )}

      {/* Filter buttons */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {['open', 'in_progress', 'resolved', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {status === 'open' && 'Abertos'}
            {status === 'in_progress' && 'Em Progresso'}
            {status === 'resolved' && 'Resolvidos'}
            {status === 'all' && 'Todos'}
          </button>
        ))}
      </div>

      {/* Tickets Table */}
      {loading ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">Carregando tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">Nenhum ticket encontrado</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Título</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Prioridade</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">SLA</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tempo Restante</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Criado em</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    ticket.sla_is_overdue ? 'bg-red-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">
                    {ticket.id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {ticket.title}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority === 'high' && '🔴 Alta'}
                      {ticket.priority === 'medium' && '🟡 Média'}
                      {ticket.priority === 'low' && '🟢 Baixa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {ticket.status === 'open' && 'Aberto'}
                      {ticket.status === 'in_progress' && 'Em Progresso'}
                      {ticket.status === 'resolved' && 'Resolvido'}
                      {ticket.status === 'closed' && 'Fechado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.sla_status)}`}>
                      {ticket.sla_is_overdue && '❌ Vencido'}
                      {!ticket.sla_is_overdue && ticket.sla_remaining_minutes < 60 && '⚠️ Crítico'}
                      {!ticket.sla_is_overdue && ticket.sla_remaining_minutes >= 60 && '✅ OK'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    {ticket.sla_remaining_minutes < 60
                      ? `${ticket.sla_remaining_minutes}m`
                      : `${Math.floor(ticket.sla_remaining_minutes / 60)}h`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {ticket.status !== 'closed' && (
                      <button
                        onClick={() => handleResolve(ticket.id)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Resolver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Tickets
