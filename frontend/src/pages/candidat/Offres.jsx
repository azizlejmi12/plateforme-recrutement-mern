// ─────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────

// useState : gérer les filtres, la pagination, les données
// useEffect : charger les offres au démarrage et à chaque changement de filtre
import { useState, useEffect } from 'react'

// Link : naviguer vers le détail d'une offre
import { Link } from 'react-router-dom'

// Notre instance axios configurée
import api from '../../services/api'

// Notre composant Layout avec sidebar
import Layout from '../../components/Layout'

// Icônes
import { Search, MapPin, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react'


// ─────────────────────────────────────────────
// NAVIGATION SIDEBAR — spécifique au candidat
// ─────────────────────────────────────────────

const navItems = [
  { path: '/candidat/offres',         label: '🔍 Offres d\'emploi' },
  { path: '/candidat/candidatures',   label: '📋 Mes candidatures' },
  { path: '/candidat/invitations',    label: '✉️ Mes invitations'  },
  { path: '/candidat/cv',             label: '👤 Mon CV'           },
]


function Offres() {

  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────

  const [offres, setOffres]       = useState([])      // liste des offres reçues du backend
  const [loading, setLoading]     = useState(true)    // chargement initial
  const [error, setError]         = useState('')       // erreur éventuelle

  // Filtres de recherche
  const [search, setSearch]       = useState('')       // recherche par titre
  const [sector, setSector]       = useState('')       // filtre secteur
  const [level, setLevel]         = useState('')       // filtre niveau

  // Pagination
  const [page, setPage]           = useState(1)        // page actuelle
  const [totalPages, setTotalPages] = useState(1)      // nombre total de pages


  // ─────────────────────────────────────────────
  // CHARGEMENT DES OFFRES
  // ─────────────────────────────────────────────

  // useEffect se déclenche au montage ET chaque fois que page, sector ou level change
  useEffect(() => {
    fetchOffres()
  }, [page, sector, level])
  // ⚠️ "search" n'est pas dans le tableau — on cherche manuellement avec le bouton


  const fetchOffres = async () => {
    setLoading(true)
    setError('')

    try {
      // Construction des paramètres de l'URL
      // ex: /api/offres?page=1&limit=6&sector=1&level=2
      const params = { page, limit: 6 }
      if (sector) params.sector = sector
      if (level)  params.level  = level

      const res = await api.get('/offres', { params })

      setOffres(res.data.offres)
      setTotalPages(res.data.pagination.totalPages)

    } catch (err) {
      setError('Impossible de charger les offres.')
    } finally {
      setLoading(false)
    }
  }


  // ─────────────────────────────────────────────
  // FILTRES
  // ─────────────────────────────────────────────

  // Recherche par titre — filtrée côté frontend (parmi les offres déjà chargées)
  const offresFiltrees = offres.filter(offre =>
    offre.title.toLowerCase().includes(search.toLowerCase())
  )

  // Réinitialiser les filtres
  const resetFiltres = () => {
    setSearch('')
    setSector('')
    setLevel('')
    setPage(1)
  }


  // ─────────────────────────────────────────────
  // RENDU JSX
  // ─────────────────────────────────────────────

  return (
    <Layout navItems={navItems}>

      {/* ── En-tête de la page ── */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-gray-900 font-semibold">
          Offres d'emploi
        </h1>
        <p className="text-gray-500 mt-1">
          {totalPages > 0 ? `Parcourez les opportunités disponibles` : 'Aucune offre disponible'}
        </p>
      </div>

      {/* ── Barre de recherche + filtres ── */}
      <div className="bg-white border border-border rounded-xl p-4 mb-6 flex flex-wrap gap-3">

        {/* Recherche par titre */}
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un poste..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>

        {/* Filtre secteur */}
        <select
          value={sector}
          onChange={(e) => { setSector(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-lg border border-border text-sm text-gray-600
                     focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
        >
          <option value="">Tous les secteurs</option>
          <option value="1">Informatique</option>
          <option value="2">Finance</option>
          <option value="3">Marketing</option>
          <option value="4">Santé</option>
          <option value="5">Éducation</option>
        </select>

        {/* Filtre niveau */}
        <select
          value={level}
          onChange={(e) => { setLevel(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-lg border border-border text-sm text-gray-600
                     focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
        >
          <option value="">Tous les niveaux</option>
          <option value="1">Junior</option>
          <option value="2">Intermédiaire</option>
          <option value="3">Senior</option>
        </select>

        {/* Bouton reset */}
        {(search || sector || level) && (
          <button
            onClick={resetFiltres}
            className="px-3 py-2 rounded-lg border border-border text-sm text-gray-500
                       hover:bg-gray-50 transition"
          >
            Réinitialiser
          </button>
        )}

      </div>

      {/* ── État de chargement ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Message d'erreur ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* ── Liste des offres ── */}
      {!loading && !error && (
        <>
          {offresFiltrees.length === 0 ? (

            // État vide
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">Aucune offre trouvée.</p>
              <button onClick={resetFiltres} className="mt-3 text-accent text-sm hover:underline">
                Réinitialiser les filtres
              </button>
            </div>

          ) : (

            // Grille des cards
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {offresFiltrees.map((offre) => (
                <OffreCard key={offre._id} offre={offre} />
              ))}
            </div>

          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">

              {/* Bouton page précédente */}
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-lg border border-border hover:bg-gray-50
                           disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Numéro de page actuelle */}
              <span className="text-sm font-mono text-gray-600">
                Page {page} / {totalPages}
              </span>

              {/* Bouton page suivante */}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-border hover:bg-gray-50
                           disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={18} />
              </button>

            </div>
          )}
        </>
      )}

    </Layout>
  )
}


// ─────────────────────────────────────────────
// COMPOSANT CARD — une offre d'emploi
// ─────────────────────────────────────────────

function OffreCard({ offre }) {

  // Formater la date limite
  const deadline = offre.applicationDeadline
    ? new Date(offre.applicationDeadline).toLocaleDateString('fr-FR', {
        day:   'numeric',
        month: 'short',
        year:  'numeric'
      })
    : null

  // Vérifier si la deadline est proche (moins de 7 jours)
  const isUrgent = offre.applicationDeadline &&
    new Date(offre.applicationDeadline) - new Date() < 7 * 24 * 60 * 60 * 1000

  return (
    // Link transforme toute la card en lien cliquable
    <Link
      to={`/candidat/offres/${offre._id}`}
      className="block bg-white border border-border rounded-xl p-5
                 hover:border-primary/40 hover:shadow-sm transition group"
    >
      {/* En-tête de la card */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition leading-tight">
          {offre.title}
        </h3>

        {/* Badge urgent si deadline proche */}
        {isUrgent && (
          <span className="ml-2 flex-shrink-0 text-xs font-mono px-2 py-0.5 rounded-full
                           bg-red-50 text-red-600 border border-red-200">
            Urgent
          </span>
        )}
      </div>

      {/* Infos du recruteur */}
      {offre.manager && (
        <p className="text-sm text-gray-500 mb-3">
          {offre.manager.firstname} {offre.manager.lastname}
        </p>
      )}

      {/* Détails de l'offre */}
      <div className="space-y-1.5">

        {/* Nombre de postes */}
        {offre.numberOfRecruits && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Users size={13} />
            <span>{offre.numberOfRecruits} poste{offre.numberOfRecruits > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Expérience requise */}
        {offre.numberOfYearsOfExperience > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={13} />
            <span>{offre.numberOfYearsOfExperience} an{offre.numberOfYearsOfExperience > 1 ? 's' : ''} d'expérience</span>
          </div>
        )}

        {/* Date limite */}
        {deadline && (
          <div className={`flex items-center gap-2 text-xs ${isUrgent ? 'text-red-500' : 'text-gray-500'}`}>
            <MapPin size={13} />
            <span>Expire le {deadline}</span>
          </div>
        )}

      </div>

      {/* Pied de card — bouton "Voir l'offre" */}
      <div className="mt-4 pt-4 border-t border-border">
        <span className="text-xs font-medium text-primary group-hover:underline">
          Voir l'offre →
        </span>
      </div>

    </Link>
  )
}


export default Offres