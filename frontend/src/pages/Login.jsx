import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(email, password)

      if (user.role === 'CANDIDAT')  navigate('/candidat/offres')
      if (user.role === 'RECRUTEUR') navigate('/recruteur/offres')
      if (user.role === 'ADMIN')     navigate('/admin/dashboard')

    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-bg">

      {/* ───────── Panneau gauche — branding ───────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">
        <h1 className="font-display text-3xl text-white font-semibold">
          Recrutement
        </h1>

        <div>
          <p className="font-display text-4xl text-white leading-tight">
            Trouvez le talent.<br />Trouvez l'opportunité.
          </p>
          <p className="text-white/60 mt-4 font-sans">
            La plateforme qui connecte candidats et recruteurs en toute simplicité.
          </p>
        </div>

        <p className="text-white/40 text-sm font-mono">© 2026 Plateforme Recrutement</p>
      </div>

      {/* ───────── Panneau droit — formulaire ───────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          <h2 className="font-display text-3xl text-gray-900 font-semibold mb-2">
            Connexion
          </h2>
          <p className="text-gray-500 mb-8">
            Accédez à votre espace.
          </p>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vous@exemple.com"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                           transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                           transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-medium
                         hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-accent font-medium hover:underline">
              S'inscrire
            </Link>
          </p>

        </div>
      </div>

    </div>
  )
}

export default Login