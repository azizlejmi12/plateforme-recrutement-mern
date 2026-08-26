import { Link } from 'react-router-dom'

function NotFound() {
  return <div className="min-h-screen flex items-center justify-center bg-bg px-6"><div className="text-center"><p className="font-mono text-sm text-accent">404</p><h1 className="font-display text-4xl text-gray-900 font-semibold mt-2">Page introuvable</h1><p className="text-gray-500 mt-2 mb-6">Cette page n’existe pas ou n’est plus disponible.</p><Link to="/" className="inline-flex bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90">Retour à l’accueil</Link></div></div>
}

export default NotFound
