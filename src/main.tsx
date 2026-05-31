import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import './styles/global.css'
import { seedEnrichedLeadsIfEmpty } from './utils/derSeedLoader'
import { isDatabaseLeadsEnabled } from './utils/leadApi'

// In local dev (VITE_DEV_AUTO_LOGIN=true), skip the login screen entirely.
// This flag is set in .env.local and never reaches production.
if (import.meta.env['VITE_DEV_AUTO_LOGIN'] === 'true') {
  localStorage.setItem('jonnovative_crm_auth', 'true')
}

if (!isDatabaseLeadsEnabled()) {
  seedEnrichedLeadsIfEmpty()
}

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '')

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename || undefined}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
