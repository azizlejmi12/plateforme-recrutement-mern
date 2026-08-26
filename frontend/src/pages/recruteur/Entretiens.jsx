import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Layout from '../../components/Layout'
import { navItems } from './Dashboard'
import StatusBadge from '../../components/StatusBadge'
import { Plus, Calendar, Clock, User, Briefcase, ChevronDown, ChevronUp } from 'lucide-react'

function Entretiens() {

  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────
  const [entretiens, setEntretiens] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const navigate = useNavigate()


  // ─────────────────────────────────────────────
  // CHARGEMENT
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchEntretiens()
  }, [filterStatus])

  const fetchEntretiens = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterStatus !== '') params.status = filterStatus
      const res = await api.get('/recruteur/entretiens', { params })
      setEntretiens(res.data.entretiens || [])
    } catch (err) {
      setError('Impossible de charger les entretiens.')
    } finally {
      setLoading(false)
    }
  }


  // ─────────────────────────────────────────────
  // CHANGER STATUT ENTRETIEN
  // ─────────────────────────────────────────────
  const handleChangeStatus = async (entretienId, newStatus) => {
    try {
      await api.put(`/recruteur/entretiens/${entretienId}`, { status: newStatus })
      setEntretiens(prev =>
        prev.map(e =>
          e._id === entretienId ? { ...e, status: newStatus } : e
        )
      )
    } catch (err) {
      setError('Erreur lors du changement de statut.')
    }
  }


  // ─────────────────────────────────────────────
  // UTILITAIRES
  // ─────────────────────────────────────────────
  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  const formatTime = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  const presenceLabels = {
    0: 'Présentiel',
    1: 'Visioconférence',
    2: 'Téléphone'
  }

  const statusCandidatLabels = {
    0: '⏳ En attente de réponse',
    1: '✅ Accepté par le candidat',
    2: '❌ Refusé par le candidat'
  }


  // ─────────────────────────────────────────────
  // RENDU JSX
  // ─────────────────────────────────────────────
  return (
    <Layout navItems={navItems}>

      {/* ── En-tête ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-gray-900 font-semibold">
            Mes entretiens
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez vos entretiens planifiés.
          </p>
        </div>
        <Link
          to="/recruteur/entretiens/planifier"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white
                     rounded-lg text-sm font-medium hover:bg-primary/90 transition"
        >
          <Plus size={16} />
          Planifier un entretien
        </Link>
      </div>

      {/* ── Filtre statut ── */}
      <div className="mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-border text-sm text-gray-600
                     focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
        >
          <option value="">Tous les entretiens</option>
          <option value="0">Planifiés</option>
          <option value="1">Effectués</option>
          <option value="2">Annulés</option>
        </select>
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
              <Link
                to="/recruteur/entretiens/planifier"
                className="mt-3 inline-block text-accent text-sm hover:underline"
              >
                Planifier votre premier entretien →
              </Link>
            </div>

          ) : (

            <div className="space-y-3">

              {/* Compteur */}
              <p className="text-sm text-gray-500 font-mono mb-4">
                {entretiens.length} entretien{entretiens.length > 1 ? 's' : ''}
              </p>

              {entretiens.map((entretien) => (
                <div
                  key={entretien._id}
                  className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                >

                  {/* ── Ligne principale ── */}
                  <div className="flex items-center gap-4 px-5 py-4">

                    {/* Date + Heure */}
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

                    {/* Infos */}
                    <div className="flex-1 min-w-0">

                      {/* Candidat */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <User size={13} className="text-gray-400" />
                        <p className="font-medium text-gray-900 text-sm">
                          {entretien.user?.firstname} {entretien.user?.lastname}
                        </p>
                      </div>

                      {/* Offre */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <Briefcase size={13} className="text-gray-400" />
                        <p className="text-sm text-gray-500 truncate">
                          {entretien.job?.title}
                        </p>
                      </div>

                      {/* Mode + statut candidat */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-mono">
                          {presenceLabels[entretien.presence]}
                        </span>
                        <span className="text-xs text-gray-400">
                          {statusCandidatLabels[entretien.statusCandidate]}
                        </span>
                      </div>

                    </div>

                    {/* Statut entretien */}
                    <StatusBadge status={entretien.status} type="interview" />

                    {/* Bouton expand */}
                    <button
                      onClick={() => setExpandedId(
                        prev => prev === entretien._id ? null : entretien._id
                      )}
                      className="p-1.5 rounded-lg text-gray-400
                                 hover:bg-gray-100 transition"
                    >
                      {expandedId === entretien._id
                        ? <ChevronUp size={16} />
                        : <ChevronDown size={16} />
                      }
                    </button>

                  </div>

                  {/* ── Section expandable ── */}
                  {expandedId === entretien._id && (
                    <div className="border-t border-border px-5 py-4 bg-gray-50">

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-400 font-mono uppercase mb-1">
                            Date complète
                          </p>
                          <p className="text-sm text-gray-700">
                            {formatDate(entretien.date)} à {formatTime(entretien.date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-mono uppercase mb-1">
                            Mode
                          </p>
                          <p className="text-sm text-gray-700">
                            {presenceLabels[entretien.presence]}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-mono uppercase mb-1">
                            Email candidat
                          </p>
                          <p className="text-sm text-gray-700">
                            {entretien.user?.email || '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-mono uppercase mb-1">
                            Réponse candidat
                          </p>
                          <p className="text-sm text-gray-700">
                            {statusCandidatLabels[entretien.statusCandidate]}
                          </p>
                        </div>
                      </div>

                      {/* Actions — changer statut */}
                      <div className="flex gap-2 pt-3 border-t border-border">
                        <p className="text-xs text-gray-500 self-center mr-2">
                          Changer le statut :
                        </p>

                        {entretien.status !== 0 && (
                          <button
                            onClick={() => handleChangeStatus(entretien._id, 0)}
                            className="px-3 py-1.5 text-xs rounded-lg border border-border
                                       text-gray-600 hover:bg-gray-100 transition"
                          >
                            ⏰ Planifié
                          </button>
                        )}
                        {entretien.status !== 1 && (
                          <button
                            onClick={() => handleChangeStatus(entretien._id, 1)}
                            className="px-3 py-1.5 text-xs rounded-lg border border-success/30
                                       text-success hover:bg-success/10 transition"
                          >
                            ✅ Effectué
                          </button>
                        )}
                        {entretien.status !== 2 && (
                          <button
                            onClick={() => handleChangeStatus(entretien._id, 2)}
                            className="px-3 py-1.5 text-xs rounded-lg border border-red-200
                                       text-red-500 hover:bg-red-50 transition"
                          >
                            ❌ Annuler
                          </button>
                        )}

                      </div>

                    </div>
                  )}

                </div>
              ))}

            </div>
          )}
        </>
      )}

    </Layout>
  )
}

export default Entretiens