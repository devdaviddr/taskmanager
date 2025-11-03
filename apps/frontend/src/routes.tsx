import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import Board from './pages/Board'
import Settings from './pages/Settings'

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/app" element={<Layout />}>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="about" element={<About />} />
      <Route path="board/:id" element={<Board />} />
      <Route path="settings" element={<Settings />} />
    </Route>
  </Routes>
)