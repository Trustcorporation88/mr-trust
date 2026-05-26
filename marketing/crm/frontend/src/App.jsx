import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './hooks/useAuth'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import DealsKanban from './pages/DealsKanban'
import Tickets from './pages/Tickets'
import Campaigns from './pages/Campaigns'
import ServicesCatalog from './pages/ServicesCatalog'
import Login from './pages/Login'
import Navbar from './components/Navbar'

function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token)
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-gray-50">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/customers/:id" element={<CustomerDetail />} />
                    <Route path="/deals" element={<DealsKanban />} />
                    <Route path="/tickets" element={<Tickets />} />
                    <Route path="/campaigns" element={<Campaigns />} />
                    <Route path="/services" element={<ServicesCatalog />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
