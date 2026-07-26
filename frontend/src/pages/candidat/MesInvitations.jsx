// ─────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Layout from '../../components/Layout'
import { Calendar, CheckCircle, XCircle, Mail } from 'lucide-react'

const navItems = [
  { path: '/candidat/offres',       label: '🔍 Offres d\'emploi' },
  { path: '/candidat/candidatures', label: '📋 Mes candidatures' },
  { path: '/candidat/entretiens',   label: '📅 Mes entretiens'   },
  { path: '/candidat/invitations',  label: '✉️ Mes invitations'  },
  { path: '/candidat/cv',           label: '👤 Mon CV'           },
]

function MesInvitations() {

  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [responding, setResponding]   = useState(null) // ID de l'invitation en cours


  // ─────────────────────────────────────────────
  // CHARGEMENT
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchInvitations()
  }, [])

  const fetchInvitations = async () => {
    setLoading(true)
    try {
      const res = await api.get('/candidat/invitations')
      setInvitations(res.data)
    } catch (err) {
      setError('Impossible de charger vos invitations.')
    } finally {
      setLoading(false)
    }
  }


  // ─────────────────────────────────────────────
  // RÉPONDRE À UNE INVITATION
  // ─────────────────────────────────────────────
  const handleRepondre = async (invitationId, reponse) => {
    setResponding(invitationId)  // désactiver les boutons de CETTE invitation

    try {
      await api.put(`/candidat/invitations/${invitationId}`, { reponse })

      // Mettre à jour l'invitation localement sans recharger toute la liste
      setInvitations(prev =>
        prev.map(inv =>
          inv._id === invitationId
            ? { ...inv, applied: true }  // marquer comme répondu
            : inv
        )
      )
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la réponse.')
    } finally {
      setResponding(null)
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
          Mes invitations
        </h1>
        <p className="text-gray-500 mt-1">
          Les recruteurs vous invitent à postuler à leurs offres.
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {/* ── Liste des invitations ── */}
      {!loading && !error && (
        <>
          {invitations.length === 0 ? (

            // État vide
            <div className="text-center py-20">
              <Mail size={40} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Aucune invitation reçue.</p>
              <p className="text-gray-400 text-sm mt-1">
                Les recruteurs peuvent vous inviter à postuler à leurs offres.
              </p>
            </div>

          ) : (

            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation._id}
                  className={`bg-white border rounded-xl p-5 transition
                    ${invitation.applied
                      ? 'border-border opacity-70'    // grisé si déjà répondu
                      : 'border-border hover:border-primary/30'
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">

                    {/* ── Infos de l'invitation ── */}
                    <div className="flex-1">

                      {/* Titre de l'offre */}
                      <Link
                        to={`/candidat/offres/${invitation.job?._id}`}
                        className="font-semibold text-gray-900 hover:text-primary transition"
                      >
                        {invitation.job?.title || 'Offre supprimée'}
                      </Link>

                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                        <Calendar size={13} />
                        <span>Reçue le {formatDate(invitation.createdAt)}</span>
                      </div>

                      {/* Deadline de l'offre */}
                      {invitation.job?.applicationDeadline && (
                        <p className="text-xs text-gray-400 mt-1 font-mono">
                          Expire le {formatDate(invitation.job.applicationDeadline)}
                        </p>
                      )}
                    </div>

                    {/* ── Actions / Statut ── */}
                    <div className="flex-shrink-0">

                      {invitation.applied ? (
                        // Déjà répondu
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5
                                         bg-gray-100 text-gray-500 rounded-full text-sm font-medium">
                          <CheckCircle size={14} />
                          Répondu
                        </span>

                      ) : (
                        // Boutons accepter/refuser
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRepondre(invitation._id, true)}
                            disabled={responding === invitation._id}
                            className="flex items-center gap-1.5 px-4 py-2 bg-success text-white
                                       rounded-lg text-sm font-medium hover:bg-success/90 transition
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle size={15} />
                            {responding === invitation._id ? '...' : 'Accepter'}
                          </button>

                          <button
                            onClick={() => handleRepondre(invitation._id, false)}
                            disabled={responding === invitation._id}
                            className="flex items-center gap-1.5 px-4 py-2 border border-border
                                       text-gray-600 rounded-lg text-sm font-medium
                                       hover:bg-gray-50 transition
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle size={15} />
                            {responding === invitation._id ? '...' : 'Refuser'}
                          </button>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              ))}
            </div>

          )}

          {/* Compteur */}
          {invitations.length > 0 && (
            <p className="text-sm text-gray-400 font-mono mt-4">
              {invitations.length} invitation{invitations.length > 1 ? 's' : ''} au total
            </p>
          )}
        </>
      )}

    </Layout>
  )
}

export default MesInvitations