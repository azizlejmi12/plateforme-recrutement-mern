import { createContext, useState, useEffect, useContext } from 'react'
import api, { setAccessToken, getAccessToken } from '../services/api'

// 1. Créer le Context — une "boîte" vide pour l'instant
const AuthContext = createContext()

// 2. Le Provider — le composant qui va remplir la boîte et la rendre disponible
export const AuthProvider = ({ children }) => {

  const [user, setUser]       = useState(null)   // données de l'utilisateur connecté
  const [loading, setLoading] = useState(true)    // true pendant qu'on vérifie la session

  // =============================================
  // Au chargement de l'app — vérifier si une session existe déjà
  // =============================================
  useEffect(() => {
    checkAuth()
  }, [])  // [] = exécuter une seule fois au montage du composant

  const checkAuth = async () => {
    try {
      // Tente de récupérer un nouveau accessToken via le cookie refreshToken
      const res = await api.post('/auth/refresh')
      setAccessToken(res.data.accessToken)

      // Si ça marche, récupérer les infos de l'utilisateur
      const meRes = await api.get('/auth/me')
      setUser(meRes.data)

    } catch (err) {
      // Pas de session valide → utilisateur non connecté
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // =============================================
  // LOGIN
  // =============================================
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    setAccessToken(res.data.accessToken)
    setUser(res.data.user)
    return res.data.user
  }

  // =============================================
  // REGISTER
  // =============================================
  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    return res.data
  }

  // =============================================
  // LOGOUT
  // =============================================
  const logout = async () => {
    await api.post('/auth/logout')
    setAccessToken(null)
    setUser(null)
  }

  // 3. La valeur partagée à toute l'application
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user   // !!user = convertit en booléen (true si user existe)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 4. Hook personnalisé — pour utiliser le context facilement
export const useAuth = () => useContext(AuthContext)