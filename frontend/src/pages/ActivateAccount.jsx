import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { CheckCircle, LoaderCircle, XCircle } from 'lucide-react'

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
      <div className="w-full max-w-md bg-white border border-border rounded-2xl p-9 shadow-xl shadow-primary/5 text-center">
        <div className={`w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center ${error ? 'bg-red-50 text-red-600' : message.includes('succès') ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
          {error ? <XCircle size={26} /> : message.includes('succès') ? <CheckCircle size={26} /> : <LoaderCircle size={26} className="animate-spin" />}
        </div>
        <h1 className="font-display text-2xl text-gray-900 font-semibold mb-3">
          Activation du compte
        </h1>
        {message && <p className="text-gray-600 leading-relaxed">{message}</p>}
        {error && <p className="text-red-600 leading-relaxed">{error}</p>}
        <Link to="/login" className="inline-flex mt-7 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all duration-200">
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
}

export default ActivateAccount