# MEISHOP CRM - Frontend Dashboard

Dashboard React/Vite com autenticação JWT, gerenciamento de clientes e visualização Customer 360.

## 🚀 Quick Start

```bash
npm install
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:3000/api/v1
npm run dev
```

Dashboard aberto em: **http://localhost:5173**

## 📦 Estrutura

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js                # Axios + JWT interceptors
│   ├── components/
│   │   └── Navbar.jsx               # Navigation sidebar
│   ├── hooks/
│   │   └── useAuth.js               # Zustand auth store
│   ├── pages/
│   │   ├── Login.jsx                # Auth page
│   │   ├── Dashboard.jsx            # Main dashboard
│   │   ├── Customers.jsx            # Customers list
│   │   └── CustomerDetail.jsx       # Customer 360
│   ├── App.jsx                      # Routing & layout
│   ├── main.jsx                     # React entry point
│   └── index.css                    # TailwindCSS + custom styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── .env                             # Create from .env.example
```

## 🔐 Autenticação

### Login
- Acesse: **http://localhost:5173**
- Email: Qualquer email válido (ex: `user@meishop.com.br`)
- Senha: `123456`
- Token armazenado em `localStorage` como `authToken`

### Logout
- Clique "Sair" no menu lateral
- Token removido de `localStorage`

## 🎨 Páginas

### Dashboard (`/`)
Métricas principais:
- Total de Clientes
- Oportunidades Abertas
- Pipeline Value
- Tickets Abertos

Gráficos:
- Pipeline por Estágio (valor em R$)
- Atividades Recentes (interações, tickets, SLAs)

### Customers (`/customers`)
- Tabela com 20 clientes por página
- **Busca**: Por nome ou email
- **Filtro**: Por segmento ou responsável
- **Health Score**: Visualização em barras
- **Ações**: Clique "Ver" para acessar Customer 360

### Customer 360 (`/customers/:id`)
Visão completa do cliente:
- **Profile**: Nome, email, telefone, indústria, segmento, data de cadastro
- **Health Score**: Gauge visual (0-100%) com interpretação
- **Oportunidades**: Deals associados com estágio e valor
- **Tickets**: Support tickets abertos/em progresso
- **Interações**: Histórico de comunicações (email, call, meeting, notes)

### Login (`/login`)
Tela de autenticação minimalista com:
- Email field
- Password field
- Error messages
- Demo credentials info

## 🔧 Variáveis de Ambiente

```bash
# .env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=MEISHOP CRM
VITE_ENVIRONMENT=development
```

## 🧪 Testar Componentes

### Componente: Navbar
```jsx
<Navbar />
// Menu com 5 itens: Dashboard, Clientes, Pipeline, Tickets, Campanhas
// Botão Sair com logout
```

### Componente: Dashboard
```jsx
<Dashboard />
// 4 KPI cards
// 2 charts (pipeline, activity)
// Responsive grid
```

### Componente: Customers Table
```jsx
<Customers />
// Busca em tempo real
// Paginação
// 20 por página
// Health score visual
```

## 🔗 API Integration

### Axios Client
```javascript
import apiClient from './api/client'

// GET with auth
const response = await apiClient.get('/customers')

// POST with auth
const response = await apiClient.post('/customers', {
  name: 'João',
  email: 'joao@empresa.com'
})

// PATCH
const response = await apiClient.patch('/customers/id', {
  health_score: 75
})

// DELETE
const response = await apiClient.delete('/customers/id')
```

**Nota**: Token JWT é automaticamente injetado em todos os requests via interceptor.

### Auth Store (Zustand)
```javascript
import useAuthStore from './hooks/useAuth'

const { user, token, login, logout, register } = useAuthStore()

// Login
const success = await login('email@test.com', 'password')

// Logout
logout()
```

## 🎨 TailwindCSS Classes

Componentes prontos:
- `.btn-primary` - Botão azul
- `.btn-secondary` - Botão cinza
- `.card` - Caixa com sombra e border
- `.input` - Campo de input com focus
- `.grid` - Grid responsivo (4 colunas desktop → 1 mobile)

## 🛠️ Desenvolvimento

### Adicionar Nova Página

1. Criar componente em `src/pages/MyPage.jsx`
2. Importar em `App.jsx`
3. Adicionar rota:

```javascript
<Route path="/mypage" element={<MyPage />} />
```

### Adicionar Nova Chamada de API

```javascript
// Em uma página/componente
import apiClient from '../api/client'

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await apiClient.get('/my-endpoint')
      setData(response.data)
    } catch (err) {
      console.error('Erro:', err)
    }
  }
  
  fetchData()
}, [])
```

### Usar Auth Store

```javascript
import useAuthStore from '../hooks/useAuth'

function MyComponent() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  
  return (
    <div>
      <p>Olá, {user?.fullName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

## 📊 Estado da Aplicação

### Auth Store (Zustand)
- `user`: Dados do usuário logado
- `token`: JWT token
- `isLoading`: Status de carregamento
- `error`: Mensagem de erro
- `login()`: Fazer login
- `register()`: Registrar
- `logout()`: Logout

### Component State (useState)
- Usado para dados locais (busca, paginação, loading)
- Redux não necessário para MVP

## 🚀 Build & Deployment

### Development
```bash
npm run dev
# http://localhost:5173
```

### Production Build
```bash
npm run build
# Gera dist/ com arquivos otimizados
```

### Preview Production Build
```bash
npm run preview
# Testa build localmente antes de deploy
```

### Deploy (Exemplo: Vercel)
```bash
npm install -g vercel
vercel
# Segue as instruções
# Environment variables: VITE_API_URL
```

## 🔧 Troubleshooting

### API Connection Failed
```bash
# Verificar se backend está rodando
curl http://localhost:3000/health

# Verificar VITE_API_URL em .env
cat .env

# Checar console do navegador (F12)
```

### Login Not Working
```bash
# Verificar backend está servindo /api/v1/auth/login
# Verificar JWT_SECRET no backend .env
# Limpar localStorage: DevTools → Application → Clear all
```

### CORS Errors
```bash
# Backend .env deve ter:
FRONTEND_URL=http://localhost:5173

# Frontend .env deve ter:
VITE_API_URL=http://localhost:3000/api/v1
```

### Tailwind Not Applied
```bash
# Verifica se tailwind.config.js tem content correto
# Redone tailwind generation:
npm run dev  # Deve regenerar estilos
```

## 📚 Dependências Principais

- `react` - UI library
- `react-router-dom` - Routing
- `axios` - HTTP client
- `zustand` - State management
- `tailwindcss` - CSS framework
- `vite` - Build tool

## 🎨 Customização

### Cores
Editar `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#667eea',
      secondary: '#ff6b35',
      success: '#10b981',
      danger: '#ef4444',
    }
  }
}
```

### Logo
Substituir em `Navbar.jsx`:
```javascript
<h1 className="text-2xl font-bold text-blue-600">
  Seu Logo Aqui
</h1>
```

### Menu Items
Editar em `Navbar.jsx` lista de links

## 📞 Suporte

- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [React Router Docs](https://reactrouter.com/)

---

**MEISHOP CRM Frontend** | v1.0.0 | 2026-01-16
