import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import Board from './pages/Board'
import SettingsLayout from './pages/Settings'
import AccountSettings from './pages/AccountSettings'
import PreferencesSettings from './pages/PreferencesSettings'

export const AppRoutes = () => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/app" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="about" element={<About />} />
        <Route path="board/:id" element={<Board />} />
        <Route path="settings" element={<SettingsLayout />}>
          <Route index element={<AccountSettings />} />
          <Route path="preferences" element={<PreferencesSettings />} />
        </Route>
      </Route>
    </Routes>
  </AuthProvider>
)