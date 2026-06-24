// ─────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────

// useState : gérer les variables réactives (email, password, erreurs...)
import { useState } from 'react'

// Link : lien cliquable sans rechargement de page
// useNavigate : redirection automatique après login
import { Link, useNavigate } from 'react-router-dom'

// useAuth : accéder à la fonction login() du AuthContext
import { useAuth } from '../context/AuthContext'

// Eye / EyeOff : icônes pour afficher/cacher le mot de passe
import { Eye, EyeOff } from 'lucide-react'


function Login() {

  // ─────────────────────────────────────────────
  // STATES — variables réactives du composant
  // ─────────────────────────────────────────────

  const [email, setEmail]               = useState('')      // valeur du champ email
  const [password, setPassword]         = useState('')      // valeur du champ mot de passe
  const [error, setError]               = useState('')      // message d'erreur à afficher
  const [loading, setLoading]           = useState(false)   // true pendant l'appel API
  const [showPassword, setShowPassword] = useState(false)   // true = mot de passe visible


  // ─────────────────────────────────────────────
  // HOOKS
  // ─────────────────────────────────────────────

  // Récupère la fonction login() depuis AuthContext
  const { login } = useAuth()

  // Permet de rediriger l'utilisateur vers une autre page
  const navigate = useNavigate()


  // ─────────────────────────────────────────────
  // FONCTION DE SOUMISSION DU FORMULAIRE
  // ─────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault()    // empêche le rechargement de page par défaut
    setError('')          // réinitialise l'erreur précédente
    setLoading(true)      // active le spinner sur le bouton

    try {
      // Appelle POST /api/auth/login via AuthContext
      // retourne les infos de l'utilisateur connecté
      const user = await login(email, password)

      // Redirige vers le bon espace selon le rôle
      if (user.role === 'CANDIDAT')  navigate('/candidat/offres')
      if (user.role === 'RECRUTEUR') navigate('/recruteur/offres')
      if (user.role === 'ADMIN')     navigate('/admin/dashboard')

    } catch (err) {
      // err.response.data.message = message d'erreur envoyé par le backend
      // Si pas de réponse (erreur réseau) → message générique
      setError(err.response?.data?.message || 'Erreur de connexion.')

    } finally {
      // S'exécute toujours, succès ou échec
      setLoading(false)   // désactive le spinner
    }
  }


  // ─────────────────────────────────────────────
  // RENDU JSX
  // ─────────────────────────────────────────────

  return (
    // Conteneur principal — plein écran, flex horizontal
    <div className="min-h-screen flex bg-bg">

      {/* ── Panneau gauche — branding (caché sur mobile) ── */}
      {/* hidden = caché par défaut, lg:flex = visible sur grand écran */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">

        {/* Logo en haut */}
        <h1 className="font-display text-3xl text-white font-semibold">
          Recrutement
        </h1>

        {/* Slogan au centre */}
        <div>
          <p className="font-display text-4xl text-white leading-tight">
            Trouvez le talent.<br />Trouvez l'opportunité.
          </p>
          <p className="text-white/60 mt-4 font-sans">
            La plateforme qui connecte candidats et recruteurs en toute simplicité.
          </p>
        </div>

        {/* Copyright en bas */}
        <p className="text-white/40 text-sm font-mono">© 2026 Plateforme Recrutement</p>
      </div>

      {/* ── Panneau droit — formulaire ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {/* Titre et sous-titre */}
          <h2 className="font-display text-3xl text-gray-900 font-semibold mb-2">
            Connexion
          </h2>
          <p className="text-gray-500 mb-8">
            Accédez à votre espace.
          </p>

          {/* Message d'erreur — affiché uniquement si error n'est pas vide */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Formulaire — onSubmit appelle handleSubmit */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Champ Email ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}                              // valeur contrôlée par le state
                onChange={(e) => setEmail(e.target.value)} // met à jour le state à chaque frappe
                required
                placeholder="vous@exemple.com"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                           transition"
              />
            </div>

            {/* ── Champ Mot de passe ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mot de passe
              </label>

              {/* div relative = point de référence pour positionner le bouton icône */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} // bascule entre visible/caché
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-border bg-white
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                             transition"
                  // pr-11 = padding-right pour ne pas que le texte passe sous l'icône
                />

                {/* Bouton icône — positionné en absolu à droite de l'input */}
                <button
                  type="button"           // IMPORTANT : évite de soumettre le formulaire au clic
                  onClick={() => setShowPassword(!showPassword)} // bascule true/false
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}           // exclu de la navigation clavier (Tab)
                >
                  {/* Affiche EyeOff si visible, Eye si caché */}
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* ── Bouton de soumission ── */}
            <button
              type="submit"
              disabled={loading}    // désactivé pendant l'appel API
              className="w-full bg-primary text-white py-2.5 rounded-lg font-medium
                         hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Texte dynamique selon l'état loading */}
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

          </form>
          {/* FIN du formulaire */}

          {/* Lien vers la page d'inscription */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Pas encore de compte ?{' '}
            {/* Link = navigation sans rechargement de page */}
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