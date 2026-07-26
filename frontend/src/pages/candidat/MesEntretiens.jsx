import { useState, useEffect } from 'react'
import api from '../../services/api'
import Layout from '../../components/Layout'
import { Calendar, Clock, CheckCircle, XCircle, Briefcase } from 'lucide-react'

const navItems = [
  { path: '/candidat/offres',       label: '🔍 Offres d\'emploi' },
  { path: '/candidat/candidatures', label: '📋 Mes candidatures' },
  { path: '/candidat/entretiens',   label: '📅 Mes entretiens'   },
  { path: '/candidat/invitations',  label: '✉️ Mes invitations'  },
  { path: '/candidat/cv',           label: '👤 Mon CV'           },
]

function MesEntretiens() {

  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────
  const [entretiens, setEntretiens] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [responding, setResponding] = useState(null)


  // ─────────────────────────────────────────────
  // CHARGEMENT
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchEntretiens()
  }, [])

  const fetchEntretiens = async () => {
    setLoading(true)
    try {
      const res = await api.get('/candidat/entretiens')
      setEntretiens(res.data)
    } catch (err) {
      setError('Impossible de charger vos entretiens.')
    } finally {
      setLoading(false)
    }
  }


  // ─────────────────────────────────────────────
  // RÉPONDRE À UN ENTRETIEN
  // ─────────────────────────────────────────────
  const handleRepondre = async (entretienId, reponse) => {
    // reponse : 1 = accepter, 2 = refuser
    setResponding(entretienId)
    try {
      await api.put(`/candidat/entretiens/${entretienId}`, { reponse })

      // Mettre à jour localement
      setEntretiens(prev =>
        prev.map(e =>
          e._id === entretienId
            ? { ...e, statusCandidate: reponse }
            : e
        )
      )
    } catch (err) {
      setError('Erreur lors de la réponse.')
    } finally {
      setResponding(null)
    }
  }


  // ─────────────────────────────────────────────
  // UTILITAIRES
  // ─────────────────────────────────────────────
  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  const formatTime = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  const presenceLabels = {
    0: '🏢 Présentiel',
    1: '💻 Visioconférence',
    2: '📞 Téléphone'
  }


  // ─────────────────────────────────────────────
  // RENDU JSX
  // ─────────────────────────────────────────────
  return (
    <Layout navItems={navItems}>

      {/* ── En-tête ── */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-gray-900 font-semibold">
          Mes entretiens
        </h1>
        <p className="text-gray-500 mt-1">
          Consultez et répondez aux invitations d'entretien.
        </p>
      </div>

      {/* ── Chargement ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent
                          rounded-full animate-spin" />
        </div>
      )}

      {/* ── Erreur ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700
                        px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {/* ── Liste ── */}
      {!loading && !error && (
        <>
          {entretiens.length === 0 ? (

            <div className="text-center py-20">
              <Calendar size={40} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Aucun entretien planifié.</p>
              <p className="text-gray-400 text-sm mt-1">
                Les recruteurs vous inviteront ici pour des entretiens.
              </p>
            </div>

          ) : (

            <div className="space-y-4">
              {entretiens.map((entretien) => (
                <div
                  key={entretien._id}
                  className={`bg-white border rounded-xl overflow-hidden transition
                    ${entretien.statusCandidate === 1
                      ? 'border-success/40'    // vert si accepté
                      : entretien.statusCandidate === 2
                        ? 'border-red-200'     // rouge si refusé
                        : 'border-border'      // normal si en attente
                    }`}
                >
                  <div className="flex items-start gap-4 p-5">

                    {/* ── Mini calendrier ── */}
                    <div className="flex-shrink-0 text-center bg-primary/5
                                    rounded-lg px-3 py-2 min-w-16">
                      <p className="text-xs text-gray-500 font-mono">
                        {new Date(entretien.date).toLocaleDateString('fr-FR', { month: 'short' })}
                      </p>
                      <p className="text-2xl font-bold text-primary leading-none">
                        {new Date(entretien.date).getDate()}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {formatTime(entretien.date)}
                      </p>
                    </div>

                    {/* ── Infos ── */}
                    <div className="flex-1 min-w-0">

                      {/* Offre */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <Briefcase size={14} className="text-gray-400" />
                        <p className="font-semibold text-gray-900 text-sm">
                          {entretien.job?.title || 'Offre non disponible'}
                        </p>
                      </div>

                      {/* Date complète */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar size={13} className="text-gray-400" />
                        <p className="text-sm text-gray-600">
                          {formatDate(entretien.date)}
                        </p>
                      </div>

                      {/* Heure + mode */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-gray-400" />
                          <p className="text-sm text-gray-600">
                            {formatTime(entretien.date)}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">
                          {presenceLabels[entretien.presence]}
                        </span>
                      </div>

                      {/* Recruteur */}
                      {entretien.createdBy && (
                        <p className="text-xs text-gray-400">
                          Planifié par {entretien.createdBy?.firstname} {entretien.createdBy?.lastname}
                        </p>
                      )}

                    </div>

                    {/* ── Statut + Actions ── */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-3">

                      {/* Statut actuel */}
                      {entretien.statusCandidate === 0 && (
                        <span className="text-xs font-mono px-2 py-1 rounded-full
                                         bg-accent/10 text-accent border border-accent/20">
                          ⏳ En attente de votre réponse
                        </span>
                      )}
                      {entretien.statusCandidate === 1 && (
                        <span className="text-xs font-mono px-2 py-1 rounded-full
                                         bg-success/10 text-success border border-success/20">
                          ✅ Accepté
                        </span>
                      )}
                      {entretien.statusCandidate === 2 && (
                        <span className="text-xs font-mono px-2 py-1 rounded-full
                                         bg-red-50 text-red-500 border border-red-200">
                          ❌ Refusé
                        </span>
                      )}

                      {/* Boutons répondre — seulement si en attente */}
                      {entretien.statusCandidate === 0 && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRepondre(entretien._id, 1)}
                            disabled={responding === entretien._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-success
                                       text-white rounded-lg text-xs font-medium
                                       hover:bg-success/90 transition
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle size={13} />
                            {responding === entretien._id ? '...' : 'Accepter'}
                          </button>
                          <button
                            onClick={() => handleRepondre(entretien._id, 2)}
                            disabled={responding === entretien._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 border
                                       border-red-200 text-red-500 rounded-lg text-xs
                                       font-medium hover:bg-red-50 transition
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle size={13} />
                            {responding === entretien._id ? '...' : 'Refuser'}
                          </button>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              ))}

              {/* Compteur */}
              <p className="text-sm text-gray-400 font-mono mt-2">
                {entretiens.length} entretien{entretiens.length > 1 ? 's' : ''} au total
              </p>
            </div>
          )}
        </>
      )}

    </Layout>
  )
}

export default MesEntretiens