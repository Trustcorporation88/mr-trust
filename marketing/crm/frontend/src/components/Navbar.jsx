import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../hooks/useAuth'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">MEISHOP CRM</h1>
        <p className="text-sm text-gray-500">Customer 360</p>
      </div>

      <div className="px-6 py-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
        <p className="text-xs text-gray-500">{user?.email}</p>
      </div>

      <ul className="mt-6 space-y-2 px-3">
        <li>
          <Link
            to="/"
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              isActive('/') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            📊 Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/customers"
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              isActive('/customers') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            👥 Clientes
          </Link>
        </li>
        <li>
          <Link
            to="/deals"
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              isActive('/deals') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            📈 Pipeline
          </Link>
        </li>
        <li>
          <Link
            to="/tickets"
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              isActive('/tickets') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            🎫 Tickets
          </Link>
        </li>
        <li>
          <Link
            to="/campaigns"
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              isActive('/campaigns') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            📢 Campanhas
          </Link>
        </li>
      </ul>

      <button
        onClick={handleLogout}
        className="mt-6 mx-3 w-56 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Sair
      </button>
    </nav>
  )
}

export default Navbar
