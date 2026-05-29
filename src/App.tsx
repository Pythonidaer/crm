import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { DemoPage } from './pages/DemoPage'
import { LeadListPage } from './pages/LeadListPage'
import { LeadDetailPage } from './pages/LeadDetailPage'
import { ImportLeadsPage } from './pages/ImportLeadsPage'
import { ExportLeadsPage } from './pages/ExportLeadsPage'
import { ScriptsPage } from './pages/ScriptsPage'
import { SettingsPage } from './pages/SettingsPage'

function CrmLayout() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </ProtectedRoute>
  )
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/demo" replace />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/crm" element={<CrmLayout />}>
        <Route index element={<Navigate to="leads" replace />} />
        <Route path="leads" element={<LeadListPage />} />
        <Route path="leads/:id" element={<LeadDetailPage />} />
        <Route path="import" element={<ImportLeadsPage />} />
        <Route path="export" element={<ExportLeadsPage />} />
        <Route path="scripts" element={<ScriptsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/demo" replace />} />
    </Routes>
  )
}
