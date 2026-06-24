import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Pages publiques
import Home            from './pages/Home'
import Login           from './pages/Login'
import Register        from './pages/Register'

// Pages candidat
import Offres          from './pages/candidat/Offres'
import OffreDetail     from './pages/candidat/OffreDetail'
import MesCandidatures from './pages/candidat/MesCandidatures'
import MonCV           from './pages/candidat/MonCV'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Routes publiques ── */}
          <Route path="/"         element={<Home />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Routes candidat ── */}
          <Route path="/candidat/offres" element={
            <ProtectedRoute roles={['CANDIDAT']}>
              <Offres />
            </ProtectedRoute>
          } />

          <Route path="/candidat/offres/:id" element={
            <ProtectedRoute roles={['CANDIDAT']}>
              <OffreDetail />
            </ProtectedRoute>
          } />

          <Route path="/candidat/candidatures" element={
            <ProtectedRoute roles={['CANDIDAT']}>
              <MesCandidatures />
            </ProtectedRoute>
          } />

          <Route path="/candidat/cv" element={
            <ProtectedRoute roles={['CANDIDAT']}>
              <MonCV />
            </ProtectedRoute>
          } />

          {/* ── Routes recruteur ── */}
          <Route path="/recruteur/*" element={
            <ProtectedRoute roles={['RECRUTEUR']}>
              <div>Pages recruteur — à venir</div>
            </ProtectedRoute>
          } />

          {/* ── Routes admin ── */}
          <Route path="/admin/*" element={
            <ProtectedRoute roles={['ADMIN']}>
              <div>Pages admin — à venir</div>
            </ProtectedRoute>
          } />

          {/* ── Route 404 ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App