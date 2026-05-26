import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'

function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/customers', {
          params: { page, limit: 20, search: search || undefined }
        })
        setCustomers(response.data.data)
        setTotal(response.data.total)
      } catch (err) {
        console.error('Error fetching customers:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [page, search])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
          <p className="text-gray-600">Gerenciar base de clientes</p>
        </div>
        <button className="btn-primary">
          + Novo Cliente
        </button>
      </div>

      <div className="card mb-6">
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={handleSearch}
          className="input w-full"
        />
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">Carregando clientes...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">Nenhum cliente encontrado</p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Telefone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Segmento</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Health Score</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.phone}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {customer.segment || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${customer.health_score}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-700">{customer.health_score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        to={`/customers/${customer.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <p>Total: {total} clientes</p>
            <div className="space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <span>Página {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={customers.length < 20}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Customers
