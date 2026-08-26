import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  // Pendant la vérification de session → ne rien afficher
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-full max-w-sm px-6 space-y-4 animate-pulse">
          <div className="h-3 w-24 bg-primary/10 rounded-full mx-auto" />
          <div className="h-12 bg-white border border-border rounded-xl" />
          <div className="h-24 bg-white border border-border rounded-xl" />
          <p className="text-center text-xs text-gray-400 font-mono">Chargement...</p>
        </div>
      </div>
    )
  }

  // Pas connecté → rediriger vers login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Rôle non autorisé → rediriger vers login
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/login" replace />
  }

  // Tout est OK → afficher la page
  return children
}

export default ProtectedRoute