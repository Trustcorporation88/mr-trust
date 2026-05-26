import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../api/client'

function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [interactions, setInteractions] = useState([])
  const [deals, setDeals] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get(`/customers/${id}`)
        setCustomer(response.data.customer)
        setInteractions(response.data.interactions)
        setDeals(response.data.deals)
        setTickets(response.data.tickets)
      } catch (err) {
        console.error('Error fetching customer:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomerData()
  }, [id])

  if (loading) {
    return (
      <div className="p-8">
        <div className="card text-center py-12">
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="p-8">
        <div className="card text-center py-12">
          <p className="text-gray-600">Cliente não encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/customers')}
        className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Voltar para clientes
      </button>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{customer.name}</h1>
              <p className="text-gray-600 mt-1">{customer.email}</p>
            </div>
            <button className="btn-primary">Editar</button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-gray-600 text-sm font-medium">Telefone</p>
              <p className="text-lg font-semibold text-gray-800">{customer.phone || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Segmento</p>
              <p className="text-lg font-semibold text-gray-800">{customer.segment || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Indústria</p>
              <p className="text-lg font-semibold text-gray-800">{customer.industry || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Cliente desde</p>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(customer.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-gray-600 text-sm font-medium mb-4">Health Score</h3>
          <div className="text-6xl font-bold text-blue-600 mb-2">{customer.health_score}%</div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full"
              style={{ width: `${customer.health_score}%` }}
            ></div>
          </div>
          <p className="text-gray-600 text-sm mt-4">
            {customer.health_score >= 70
              ? '✅ Cliente saudável'
              : customer.health_score >= 40
              ? '⚠️ Atenção necessária'
              : '🚨 Risco elevado'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Oportunidades ({deals.length})</h2>
          {deals.length === 0 ? (
            <p className="text-gray-600">Nenhuma oportunidade</p>
          ) : (
            <div className="space-y-3">
              {deals.map((deal) => (
                <div key={deal.id} className="p-3 border border-gray-200 rounded-lg">
                  <p className="font-medium text-gray-800">{deal.title}</p>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>{deal.stage}</span>
                    <span className="font-semibold">R$ {deal.amount?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Tickets ({tickets.length})</h2>
          {tickets.length === 0 ? (
            <p className="text-gray-600">Nenhum ticket aberto</p>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-3 border border-gray-200 rounded-lg">
                  <p className="font-medium text-gray-800">{ticket.title}</p>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                      ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {ticket.priority}
                    </span>
                    <span>{ticket.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Interações Recentes ({interactions.length})</h2>
        {interactions.length === 0 ? (
          <p className="text-gray-600">Nenhuma interação registrada</p>
        ) : (
          <div className="space-y-3">
            {interactions.map((interaction) => (
              <div key={interaction.id} className="border-l-4 border-blue-600 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{interaction.type}</p>
                    <p className="text-sm text-gray-600 mt-1">{interaction.notes}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(interaction.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerDetail
