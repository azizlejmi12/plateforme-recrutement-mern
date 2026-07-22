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
import MesInvitations  from './pages/candidat/MesInvitations'

// Pages recruteur
import Dashboard            from './pages/recruteur/Dashboard'
import MesOffres            from './pages/recruteur/MesOffres'
import CreateOffre          from './pages/recruteur/CreateOffre'
import OffreDetailRecruteur from './pages/recruteur/OffreDetail'
import Candidatures         from './pages/recruteur/Candidatures'
import Entretiens           from './pages/recruteur/Entretiens'

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
          <Route path="/candidat/invitations" element={
            <ProtectedRoute roles={['CANDIDAT']}>
              <MesInvitations />
            </ProtectedRoute>
          } />

          {/* ── Routes recruteur — spécifiques AVANT wildcards ── */}
          <Route path="/recruteur/dashboard" element={
            <ProtectedRoute roles={['RECRUTEUR']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/recruteur/offres" element={
            <ProtectedRoute roles={['RECRUTEUR']}>
              <MesOffres />
            </ProtectedRoute>
          } />
          <Route path="/recruteur/offres/creer" element={
            <ProtectedRoute roles={['RECRUTEUR']}>
              <CreateOffre />
            </ProtectedRoute>
          } />
          <Route path="/recruteur/offres/:id" element={
            <ProtectedRoute roles={['RECRUTEUR']}>
              <OffreDetailRecruteur />
            </ProtectedRoute>
          } />
          <Route path="/recruteur/offres/:id/candidatures" element={
            <ProtectedRoute roles={['RECRUTEUR']}>
              <Candidatures />
            </ProtectedRoute>
          } />
          <Route path="/recruteur/entretiens" element={
            <ProtectedRoute roles={['RECRUTEUR']}>
              <Entretiens />
            </ProtectedRoute>
          } />
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