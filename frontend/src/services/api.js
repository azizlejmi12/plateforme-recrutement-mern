import axios from 'axios'

// Instance axios configurée pour notre backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true   // OBLIGATOIRE pour envoyer le cookie refreshToken
})

// Variable en mémoire pour stocker l'access token
// (PAS dans localStorage — plus sécurisé)
let accessToken = null

export const setAccessToken = (token) => {
  accessToken = token
}

export const getAccessToken = () => accessToken

// =============================================
// INTERCEPTOR — Ajouter le token à chaque requête
// =============================================
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// =============================================
// INTERCEPTOR — Rafraîchir le token si expiré
// =============================================
api.interceptors.response.use(
  (response) => response,   // si tout va bien, on ne fait rien

  async (error) => {
    const originalRequest = error.config

    const isRefreshCall = originalRequest.url.includes('/auth/refresh')


    // Si erreur 401 (token expiré) ET qu'on n'a pas déjà réessayé
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true   // éviter une boucle infinie

      try {
        // Appeler /refresh pour avoir un nouveau token
        const res = await axios.post(
          'http://localhost:5000/api/auth/refresh',
          {},
          { withCredentials: true }
        )

        const newAccessToken = res.data.accessToken
        setAccessToken(newAccessToken)

        // Réessayer la requête originale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)

      } catch (refreshError) {
        // Le refresh a échoué → déconnecter l'utilisateur
        setAccessToken(null)
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api