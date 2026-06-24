import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  // Pendant la vérification de session → ne rien afficher
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-mono">Chargement...</p>
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