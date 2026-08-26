// ─────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import { navItems } from './Dashboard'
import {
  Plus, Search, ChevronRight,
  Users, Eye, EyeOff
} from 'lucide-react'

function MesOffres() {

  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────
  const [offres, setOffres]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilterStatus] = useState('') // filtre par statut
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [changingStatus, setChangingStatus] = useState(null) // ID en cours


  // ─────────────────────────────────────────────
  // CHARGEMENT
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchOffres()
  }, [page, filterStatus])

  const fetchOffres = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 8 }
      if (filterStatus !== '') params.status = filterStatus

      const res = await api.get('/recruteur', { params })
      setOffres(res.data.offres || [])
      setTotalPages(res.data.pagination?.totalPages || 1)
    } catch (err) {
      setError('Impossible de charger vos offres.')
    } finally {
      setLoading(false)
    }
  }


  // ─────────────────────────────────────────────
  // CHANGER LE STATUT D'UNE OFFRE
  // ─────────────────────────────────────────────
  const handleChangeStatus = async (offreId, newStatus) => {
    // newStatus : 0=brouillon, 1=publié, 2=clôturé
    setChangingStatus(offreId)
    try {
      await api.put(`/recruteur/${offreId}`, { status: newStatus })

      // Mettre à jour localement sans recharger
      setOffres(prev =>
        prev.map(o =>
          o._id === offreId ? { ...o, status: newStatus } : o
        )
      )
    } catch (err) {
      setError('Erreur lors du changement de statut.')
    } finally {
      setChangingStatus(null)
    }
  }


  // ─────────────────────────────────────────────
  // FILTRAGE CÔTÉ FRONTEND (recherche par titre)
  // ─────────────────────────────────────────────
  const offresFiltrees = offres.filter(o =>
    o.title.toLowerCase().includes(search.toLowerCase())
  )


  // ─────────────────────────────────────────────
  // UTILITAIRES
  // ─────────────────────────────────────────────
  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }


  // ─────────────────────────────────────────────
  // RENDU JSX
  // ─────────────────────────────────────────────
  return (
    <Layout navItems={navItems}>

      {/* ── En-tête ── */}
      <div className="flex items-center justify-between mb-8 border-l-4 border-accent pl-5">
        <div>
          <h1 className="font-display text-3xl text-gray-900 font-semibold">
            Mes offres
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez vos offres d'emploi.
          </p>
        </div>

        {/* Bouton créer une offre */}
        <Link
          to="/recruteur/offres/creer"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white
                     rounded-lg text-sm font-medium hover:bg-primary/90 transition"
        >
          <Plus size={16} />
          Nouvelle offre
        </Link>
      </div>

      {/* ── Barre de recherche + filtre statut ── */}
      <div className="flex gap-3 mb-6">

        {/* Recherche par titre */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une offre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30
                       focus:border-primary transition"
          />
        </div>

        {/* Filtre par statut */}
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
          className="px-3 py-2.5 rounded-lg border border-border text-sm text-gray-600
                     focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
        >
          <option value="">Tous les statuts</option>
          <option value="0">Brouillons</option>
          <option value="1">Publiées</option>
          <option value="2">Clôturées</option>
        </select>

      </div>

      {/* ── Chargement ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Erreur ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {/* ── Liste des offres ── */}
      {!loading && !error && (
        <>
          {offresFiltrees.length === 0 ? (

            <div className="text-center py-20 bg-white border border-border rounded-2xl shadow-sm">
              <p className="text-gray-400 text-lg">Aucune offre trouvée.</p>
              <Link
                to="/recruteur/offres/creer"
                className="mt-3 inline-block text-accent text-sm hover:underline"
              >
                Créer votre première offre →
              </Link>
            </div>

          ) : (

            <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-200">

              {/* En-tête tableau */}
              <div className="grid grid-cols-5 px-6 py-3 bg-gray-50 border-b border-border
                              text-xs font-medium text-gray-500 uppercase tracking-wide">
                <span className="col-span-2">Titre</span>
                <span>Statut</span>
                <span>Deadline</span>
                <span>Actions</span>
              </div>

              {/* Lignes */}
              {offresFiltrees.map((offre) => (
                <div
                  key={offre._id}
                  className="grid grid-cols-5 px-6 py-4 border-b border-border
                             last:border-0 items-center hover:bg-gray-50 transition"
                >
                  {/* Titre */}
                  <div className="col-span-2">
                    <p className="font-medium text-gray-900 text-sm">{offre.title}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      Créée le {formatDate(offre.createdAt)}
                    </p>
                  </div>

                  {/* Statut */}
                  <div>
                    <StatusBadge status={offre.status} type="job" />
                  </div>

                  {/* Deadline */}
                  <div className="text-sm text-gray-500">
                    {formatDate(offre.applicationDeadline)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">

                    {/* Bouton publier/dépublier */}
                    {offre.status === 0 && (
                      <button
                        onClick={() => handleChangeStatus(offre._id, 1)}
                        disabled={changingStatus === offre._id}
                        title="Publier"
                        className="p-1.5 rounded-lg text-success hover:bg-success/10
                                   transition disabled:opacity-50"
                      >
                        <Eye size={16} />
                      </button>
                    )}

                    {offre.status === 1 && (
                      <button
                        onClick={() => handleChangeStatus(offre._id, 2)}
                        disabled={changingStatus === offre._id}
                        title="Clôturer"
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50
                                   transition disabled:opacity-50"
                      >
                        <EyeOff size={16} />
                      </button>
                    )}

                    {offre.status === 2 && (
                      <button
                        onClick={() => handleChangeStatus(offre._id, 1)}
                        disabled={changingStatus === offre._id}
                        title="Republier"
                        className="p-1.5 rounded-lg text-success hover:bg-success/10
                                   transition disabled:opacity-50"
                      >
                        <Eye size={16} />
                      </button>
                    )}

                    {/* Voir candidatures */}
                    <Link
                      to={`/recruteur/offres/${offre._id}/candidatures`}
                      className="flex items-center gap-1 p-1.5 rounded-lg text-gray-500
                                 hover:bg-gray-100 transition"
                      title="Voir les candidatures"
                    >
                      <Users size={16} />
                    </Link>

                    {/* Voir détail / modifier */}
                    <Link
                      to={`/recruteur/offres/${offre._id}`}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                      title="Modifier"
                    >
                      <ChevronRight size={16} />
                    </Link>

                  </div>
                </div>
              ))}

            </div>

          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-border text-sm
                           hover:bg-gray-50 disabled:opacity-40 transition"
              >
                ← Précédent
              </button>
              <span className="text-sm font-mono text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-border text-sm
                           hover:bg-gray-50 disabled:opacity-40 transition"
              >
                Suivant →
              </button>
            </div>
          )}

          {/* Compteur */}
          <p className="text-sm text-gray-400 font-mono mt-4">
            {offresFiltrees.length} offre{offresFiltrees.length > 1 ? 's' : ''}
          </p>
        </>
      )}

    </Layout>
  )
}

export default MesOffres