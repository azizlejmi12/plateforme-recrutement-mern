import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../services/api'

function ActivateAccount() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState('Activation en cours...')
  const [error, setError] = useState('')

  useEffect(() => {
    const activate = async () => {
      try {
        await api.get(`/auth/activate/${token}`)
        setMessage('Compte activé avec succès. Vous pouvez vous connecter.')
        setTimeout(() => navigate('/login'), 1500)
      } catch (err) {
        setError(err.response?.data?.message || 'Impossible d\'activer le compte.')
        setMessage('')
      }
    }

    if (token) activate()
  }, [token, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-md bg-white border border-border rounded-2xl p-8 shadow-sm text-center">
        <h1 className="font-display text-2xl text-gray-900 font-semibold mb-3">
          Activation du compte
        </h1>
        {message && <p className="text-gray-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
        <Link to="/login" className="inline-block mt-6 text-primary hover:underline">
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
}

export default ActivateAccount