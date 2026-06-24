// ─────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import { Calendar, ChevronRight, FileText } from 'lucide-react'

// Navigation sidebar candidat
const navItems = [
  { path: '/candidat/offres',         label: '🔍 Offres d\'emploi' },
  { path: '/candidat/candidatures',   label: '📋 Mes candidatures' },
  { path: '/candidat/invitations',    label: '✉️ Mes invitations'  },
  { path: '/candidat/cv',             label: '👤 Mon CV'           },
]

function MesCandidatures() {

  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────
  const [candidatures, setCandidatures] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')

  // ─────────────────────────────────────────────
  // CHARGEMENT
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchCandidatures()
  }, [])

  const fetchCandidatures = async () => {
    setLoading(true)
    try {
      const res = await api.get('/candidat/candidatures')
      setCandidatures(res.data)
    } catch (err) {
      setError('Impossible de charger vos candidatures.')
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────
  // UTILITAIRES
  // ─────────────────────────────────────────────
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  // ─────────────────────────────────────────────
  // RENDU JSX
  // ─────────────────────────────────────────────
  return (
    <Layout navItems={navItems}>

      {/* ── En-tête ── */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-gray-900 font-semibold">
          Mes candidatures
        </h1>
        <p className="text-gray-500 mt-1">
          Suivez l'état de vos candidatures en temps réel.
        </p>
      </div>

      {/* ── Chargement ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Erreur ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* ── Liste des candidatures ── */}
      {!loading && !error && (
        <>
          {candidatures.length === 0 ? (

            // État vide
            <div className="text-center py-20">
              <FileText size={40} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Aucune candidature pour le moment.</p>
              <Link
                to="/candidat/offres"
                className="mt-3 inline-block text-accent text-sm hover:underline"
              >
                Parcourir les offres →
              </Link>
            </div>

          ) : (

            // Tableau des candidatures
            <div className="bg-white border border-border rounded-xl overflow-hidden">

              {/* En-tête du tableau */}
              <div className="grid grid-cols-4 px-6 py-3 bg-gray-50 border-b border-border
                              text-xs font-medium text-gray-500 uppercase tracking-wide">
                <span>Offre</span>
                <span>Recruteur</span>
                <span>Date</span>
                <span>Statut</span>
              </div>

              {/* Lignes */}
              {candidatures.map((candidature) => (
                <Link
                  key={candidature._id}
                  to={`/candidat/offres/${candidature.job?._id}`}
                  className="grid grid-cols-4 px-6 py-4 border-b border-border last:border-0
                             hover:bg-gray-50 transition items-center group"
                >
                  {/* Titre de l'offre */}
                  <span className="font-medium text-gray-900 text-sm group-hover:text-primary transition truncate pr-4">
                    {candidature.job?.title || 'Offre supprimée'}
                  </span>

                  {/* Recruteur */}
                  <span className="text-sm text-gray-500 truncate pr-4">
                    {candidature.job?.manager
                      ? `${candidature.job.manager.firstname} ${candidature.job.manager.lastname}`
                      : '—'
                    }
                  </span>

                  {/* Date de candidature */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Calendar size={13} />
                    <span>{formatDate(candidature.createdAt)}</span>
                  </div>

                  {/* Statut */}
                  <div className="flex items-center justify-between">
                    <StatusBadge status={candidature.status} type="candidacy" />
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition" />
                  </div>

                </Link>
              ))}

            </div>

          )}

          {/* ── Compteur ── */}
          {candidatures.length > 0 && (
            <p className="text-sm text-gray-400 font-mono mt-4">
              {candidatures.length} candidature{candidatures.length > 1 ? 's' : ''} au total
            </p>
          )}
        </>
      )}

    </Layout>
  )
}

export default MesCandidatures