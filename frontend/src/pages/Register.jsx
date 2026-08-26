import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Search, UserPlus } from 'lucide-react'
import PasswordStrength from '../components/PasswordStrength'
import { isPasswordValid } from '../utils/passwordValidation'

function Register() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname:  '',
    username:  '',
    email:     '',
    password:  '',
    confirmPassword: '',
    role:      'CANDIDAT'
  })
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const [loading, setLoading]   = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword]               = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Une seule fonction pour gérer TOUS les champs du formulaire
  const handleChange = (e) => {
    setFormData({
      ...formData,                    // garde tous les champs existants
      [e.target.name]: e.target.value // écrase uniquement le champ modifié
    })
  }

 const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')

  if (!isPasswordValid(formData.password)) {
    setError('Le mot de passe ne respecte pas toutes les règles de sécurité.')
    return
  }

  // ← Vérification AVANT d'appeler le backend
  if (formData.password !== formData.confirmPassword) {
    setError('Les mots de passe ne correspondent pas.')
    return   // arrête la fonction ici, n'envoie rien
  }

  setLoading(true)

  try {
    // On retire confirmPassword avant d'envoyer — le backend n'en a pas besoin
    const { confirmPassword, ...dataToSend } = formData
    await register(dataToSend)
    setSuccess(true)

  } catch (err) {
    const errors = err.response?.data?.errors
    if (errors) {
      setError(errors.map(e => e.message).join(' '))
    } else {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription.')
    }
  } finally {
    setLoading(false)
  }
}
  // ─────────── Écran de succès ───────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-8">
        <div className="max-w-sm text-center bg-white border border-border rounded-2xl p-9 shadow-xl shadow-primary/5">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-success text-2xl">✓</span>
          </div>
          <h2 className="font-display text-2xl text-gray-900 font-semibold mb-3">
            Compte créé !
          </h2>
          <p className="text-gray-500 mb-8">
            Vérifie ta boîte email pour activer ton compte avant de te connecter.
          </p>
          <Link
            to="/login"
            className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  // ─────────── Formulaire ───────────
  return (
    <div className="min-h-screen flex bg-bg">

      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-14">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center"><Search size={20} /></div><h1 className="font-display text-3xl text-white font-semibold">Recrutement</h1></div>
        <div>
          <p className="font-display text-4xl text-white leading-tight">
            Rejoignez la plateforme.
          </p>
          <p className="text-white/60 mt-4">
            Que vous cherchiez un talent ou une opportunité.
          </p>
        </div>
        <p className="text-white/40 text-sm font-mono">© 2026 Plateforme Recrutement</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-md bg-white border border-border rounded-2xl p-7 sm:p-9 shadow-xl shadow-primary/5 my-6">

          <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><UserPlus size={19} /></div><h2 className="font-display text-3xl text-gray-900 font-semibold">
            Créer un compte
          </h2></div>
          <p className="text-gray-500 mb-8">
            Inscrivez-vous gratuitement.
          </p>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Choix du rôle ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Je suis
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['CANDIDAT', 'RECRUTEUR'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`py-3 rounded-xl text-sm font-medium border transition-all duration-200
                      ${formData.role === role
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-border hover:border-primary/40'
                      }`}
                  >
                    {role === 'CANDIDAT' ? 'Candidat' : 'Recruteur'}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Prénom + Nom ── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Prénom
                </label>
                <input
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom
                </label>
                <input
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
            </div>

            {/* ── Username ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nom d'utilisateur
              </label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>

            {/* ── Email ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="vous@exemple.com"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>

            {/* ── Password ── */}
           
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mot de passe
            </label>
            <div className="relative">
                <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="6 caractères minimum"
                className="w-full px-4 py-2.5 pr-11 rounded-lg border border-border bg-white
                            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
                <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                tabIndex={-1}
                >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            <PasswordStrength password={formData.password} />
            </div>

            {/* ── Confirmer mot de passe ── */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmer le mot de passe
            </label>
            <div className="relative">
                <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Retape ton mot de passe"
                className="w-full px-4 py-2.5 pr-11 rounded-lg border border-border bg-white
                            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
                <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                tabIndex={-1}
                >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-medium
                         hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>

          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-accent font-medium hover:underline">
              Se connecter
            </Link>
          </p>

        </div>
      </div>

    </div>
  )
}

export default Register