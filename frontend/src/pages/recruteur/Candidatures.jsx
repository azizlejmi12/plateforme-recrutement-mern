import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import Layout from '../../components/Layout'
import { navItems } from './Dashboard'
import StatusBadge from '../../components/StatusBadge'
import {
  ArrowLeft, Star, StarOff,
  FileText, Calendar, ChevronDown, ChevronUp
} from 'lucide-react'

function Candidatures() {

  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────
  const [offre, setOffre]               = useState(null)
  const [candidatures, setCandidatures] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [expandedId, setExpandedId]     = useState(null) // ID candidature ouverte
  const [shortlisting, setShortlisting] = useState(null) // ID en cours
  const [noteData, setNoteData]         = useState({})   // notes en cours de saisie
  const [savingNote, setSavingNote]     = useState(null) // ID note en cours

  const { id } = useParams()   // ID de l'offre
  const navigate = useNavigate()


  // ─────────────────────────────────────────────
  // CHARGEMENT
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [offreRes, candidaturesRes] = await Promise.all([
        api.get(`/recruteur/${id}`),
        api.get(`/recruteur/${id}/candidatures`)
      ])
      setOffre(offreRes.data)
      setCandidatures(candidaturesRes.data.candidatures || [])
    } catch (err) {
      setError('Impossible de charger les candidatures.')
    } finally {
      setLoading(false)
    }
  }


  // ─────────────────────────────────────────────
  // PRÉSÉLECTIONNER UN CANDIDAT
  // ─────────────────────────────────────────────
  const handleShortlist = async (candidatureId, currentValue) => {
    setShortlisting(candidatureId)
    try {
      await api.put(
        `/recruteur/candidatures/${candidatureId}/shortlist`,
        { shortlisted: !currentValue }
      )
      // Mettre à jour localement
      setCandidatures(prev =>
        prev.map(c =>
          c._id === candidatureId
            ? { ...c, shortlisted: !currentValue }
            : c
        )
      )
    } catch (err) {
      setError('Erreur lors de la présélection.')
    } finally {
      setShortlisting(null)
    }
  }


  // ─────────────────────────────────────────────
  // AJOUTER UNE NOTE
  // ─────────────────────────────────────────────
  const handleAddNote = async (candidature) => {
    const description = noteData[candidature._id]
    if (!description?.trim()) return

    setSavingNote(candidature._id)
    try {
      await api.post('/recruteur/notes/candidature', {
        userId:      candidature.user._id,
        jobId:       id,
        description,
        type:        0
      })
      // Vider le champ après succès
      setNoteData(prev => ({ ...prev, [candidature._id]: '' }))
      alert('Note ajoutée avec succès !')
    } catch (err) {
      setError('Erreur lors de l\'ajout de la note.')
    } finally {
      setSavingNote(null)
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

  const toggleExpand = (candidatureId) => {
    setExpandedId(prev => prev === candidatureId ? null : candidatureId)
  }


  // ─────────────────────────────────────────────
  // RENDU JSX
  // ─────────────────────────────────────────────
  return (
    <Layout navItems={navItems}>

      {/* ── En-tête ── */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/recruteur/offres')}
          className="p-2 rounded-lg border border-border hover:bg-gray-50 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl text-gray-900 font-semibold">
            Candidatures
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {offre?.title || '...'}
          </p>
        </div>
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

      {/* ── Liste des candidatures ── */}
      {!loading && !error && (
        <>
          {candidatures.length === 0 ? (

            <div className="text-center py-20">
              <FileText size={40} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Aucune candidature reçue.</p>
            </div>

          ) : (

            <div className="space-y-3">

              {/* Compteur + filtre shortlist */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500 font-mono">
                  {candidatures.length} candidature{candidatures.length > 1 ? 's' : ''}
                  {' · '}
                  {candidatures.filter(c => c.shortlisted).length} présélectionné(s)
                </p>
              </div>

              {candidatures.map((candidature) => (
                <div
                  key={candidature._id}
                  className={`bg-white border rounded-xl overflow-hidden transition
                    ${candidature.shortlisted
                      ? 'border-accent/40'     // bordure accent si présélectionné
                      : 'border-border'
                    }`}
                >
                  {/* ── Ligne principale ── */}
                  <div className="flex items-center gap-4 px-5 py-4">

                    {/* Initiales du candidat */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary
                                    flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      {candidature.user?.firstname?.[0]?.toUpperCase() || '?'}
                      {candidature.user?.lastname?.[0]?.toUpperCase() || ''}
                    </div>

                    {/* Infos candidat */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">
                        {candidature.user?.civility} {candidature.user?.firstname} {candidature.user?.lastname}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {candidature.user?.email}
                      </p>
                    </div>

                    {/* Date candidature */}
                    <div className="text-xs text-gray-400 font-mono hidden md:block">
                      {formatDate(candidature.createdAt)}
                    </div>

                    {/* Statut */}
                    <StatusBadge status={candidature.status} type="candidacy" />

                    {/* Bouton présélectionner */}
                    <button
                      onClick={() => handleShortlist(candidature._id, candidature.shortlisted)}
                      disabled={shortlisting === candidature._id}
                      title={candidature.shortlisted ? 'Retirer de la sélection' : 'Présélectionner'}
                      className={`p-1.5 rounded-lg transition disabled:opacity-50
                        ${candidature.shortlisted
                          ? 'text-accent bg-accent/10 hover:bg-accent/20'
                          : 'text-gray-400 hover:bg-gray-100'
                        }`}
                    >
                      {candidature.shortlisted
                        ? <Star size={16} fill="currentColor" />
                        : <StarOff size={16} />
                      }
                    </button>

                    {/* Bouton expand */}
                    <button
                      onClick={() => toggleExpand(candidature._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"
                    >
                      {expandedId === candidature._id
                        ? <ChevronUp size={16} />
                        : <ChevronDown size={16} />
                      }
                    </button>

                  </div>

                  {/* ── Détail expandable ── */}
                  {expandedId === candidature._id && (
                    <div className="border-t border-border px-5 py-4 bg-gray-50 space-y-4">

                      {/* CV du candidat */}
                      {candidature.cv && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase
                                        tracking-wide mb-2">
                            CV du candidat
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

                            {candidature.cv.mobile && (
                              <CVItem label="Mobile" value={candidature.cv.mobile} />
                            )}
                            {candidature.cv.linkedin && (
                              <CVItem label="LinkedIn" value={candidature.cv.linkedin} />
                            )}
                            {candidature.cv.github && (
                              <CVItem label="GitHub" value={candidature.cv.github} />
                            )}
                            {candidature.cv.skills?.length > 0 && (
                              <div className="col-span-2 md:col-span-3">
                                <p className="text-xs text-gray-400 mb-1">Compétences</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {candidature.cv.skills.map((skill, i) => (
                                    <span key={i}
                                          className="px-2 py-0.5 bg-primary/10 text-primary
                                                     rounded-full text-xs font-medium">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {candidature.cv.preferredPositions?.length > 0 && (
                              <div className="col-span-2 md:col-span-3">
                                <p className="text-xs text-gray-400 mb-1">Postes souhaités</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {candidature.cv.preferredPositions.map((pos, i) => (
                                    <span key={i}
                                          className="px-2 py-0.5 bg-success/10 text-success
                                                     rounded-full text-xs font-medium">
                                      {pos}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      )}

                      {/* Réponses formulaire personnalisé */}
                      {candidature.data && Object.keys(candidature.data).length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase
                                        tracking-wide mb-2">
                            Réponses au formulaire
                          </p>
                          <div className="space-y-1">
                            {Object.entries(candidature.data).map(([key, value]) => (
                              <div key={key} className="flex gap-2 text-sm">
                                <span className="text-gray-400 font-mono">{key}:</span>
                                <span className="text-gray-700">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-2 border-t border-border">

                        {/* Planifier entretien */}
                        <Link
                          to={`/recruteur/entretiens/planifier?userId=${candidature.user?._id}&jobId=${id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white
                                     rounded-lg text-xs font-medium hover:bg-primary/90 transition"
                        >
                          <Calendar size={13} />
                          Planifier entretien
                        </Link>

                        {/* Note */}
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            placeholder="Ajouter une note..."
                            value={noteData[candidature._id] || ''}
                            onChange={(e) => setNoteData(prev => ({
                              ...prev,
                              [candidature._id]: e.target.value
                            }))}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-border
                                       text-xs focus:outline-none focus:ring-2
                                       focus:ring-primary/30 focus:border-primary transition"
                          />
                          <button
                            onClick={() => handleAddNote(candidature)}
                            disabled={savingNote === candidature._id}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg
                                       text-xs font-medium hover:bg-gray-200 transition
                                       disabled:opacity-50"
                          >
                            {savingNote === candidature._id ? '...' : 'Ajouter'}
                          </button>
                        </div>

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


// ─────────────────────────────────────────────
// COMPOSANTS UTILITAIRES
// ─────────────────────────────────────────────
function CVItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 font-mono uppercase mb-0.5">{label}</p>
      <p className="text-sm text-gray-700 truncate">{value}</p>
    </div>
  )
}

export default Candidatures