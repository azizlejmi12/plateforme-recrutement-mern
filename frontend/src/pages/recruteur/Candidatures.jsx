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

// ─────────────────────────────────────────────
// DONNÉES — Gouvernorats tunisiens
// ─────────────────────────────────────────────
const gouvernorats = {
  1: 'Ariana', 2: 'Béja', 3: 'Ben Arous', 4: 'Bizerte',
  5: 'Gabès', 6: 'Gafsa', 7: 'Jendouba', 8: 'Kairouan',
  9: 'Kasserine', 10: 'Kébili', 11: 'Le Kef', 12: 'Mahdia',
  13: 'Manouba', 14: 'Médenine', 15: 'Monastir', 16: 'Nabeul',
  17: 'Sfax', 18: 'Sidi Bouzid', 19: 'Siliana', 20: 'Sousse',
  21: 'Tataouine', 22: 'Tozeur', 23: 'Tunis', 24: 'Zaghouan'
}

const civilStatusLabels = ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve']

function Candidatures() {

  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────
  const [offre, setOffre]               = useState(null)
  const [candidatures, setCandidatures] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [expandedId, setExpandedId]     = useState(null)
  const [shortlisting, setShortlisting] = useState(null)
  const [noteData, setNoteData]         = useState({})
  const [savingNote, setSavingNote]     = useState(null)
  const [notes, setNotes]               = useState({})

  const { id } = useParams()
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
  // TOGGLE EXPAND + CHARGEMENT NOTES
  // ─────────────────────────────────────────────
  const toggleExpand = async (candidatureId, userId) => {
    if (expandedId === candidatureId) {
      setExpandedId(null)
      return
    }

    setExpandedId(candidatureId)

    // Charger les notes si pas encore chargées
    if (!notes[candidatureId]) {
      try {
        const res = await api.get(`/recruteur/notes/candidature/${userId}/${id}`)
        setNotes(prev => ({ ...prev, [candidatureId]: res.data }))
      } catch (err) {
        console.error('Erreur chargement notes')
      }
    }
  }


  // ─────────────────────────────────────────────
  // PRÉSÉLECTIONNER
  // ─────────────────────────────────────────────
  const handleShortlist = async (candidatureId, currentValue) => {
    setShortlisting(candidatureId)
    try {
      await api.put(
        `/recruteur/candidatures/${candidatureId}/shortlist`,
        { shortlisted: !currentValue }
      )
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

      // Recharger les notes après ajout
      const res = await api.get(
        `/recruteur/notes/candidature/${candidature.user._id}/${id}`
      )
      setNotes(prev => ({ ...prev, [candidature._id]: res.data }))

      // Vider le champ
      setNoteData(prev => ({ ...prev, [candidature._id]: '' }))

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

              {/* Compteur */}
              <div className="mb-4">
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
                      ? 'border-accent/40'
                      : 'border-border'
                    }`}
                >

                  {/* ── Ligne principale ── */}
                  <div className="flex items-center gap-4 px-5 py-4">

                    {/* Initiales */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary
                                    flex items-center justify-center font-semibold
                                    text-sm flex-shrink-0">
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

                    {/* Date */}
                    <div className="text-xs text-gray-400 font-mono hidden md:block">
                      {formatDate(candidature.createdAt)}
                    </div>

                    {/* Statut */}
                    <StatusBadge status={candidature.status} type="candidacy" />

                    {/* Bouton présélectionner */}
                    <button
                      onClick={() => handleShortlist(candidature._id, candidature.shortlisted)}
                      disabled={shortlisting === candidature._id}
                      title={candidature.shortlisted ? 'Retirer' : 'Présélectionner'}
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
                      onClick={() => toggleExpand(candidature._id, candidature.user?._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"
                    >
                      {expandedId === candidature._id
                        ? <ChevronUp size={16} />
                        : <ChevronDown size={16} />
                      }
                    </button>

                  </div>

                  {/* ── Section expandable ── */}
                  {expandedId === candidature._id && (
                    <div className="border-t border-border px-5 py-4 bg-gray-50 space-y-5">

                      {/* ── CV complet ── */}
                      {candidature.cv && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase
                                        tracking-wide mb-3">
                            CV du candidat
                          </p>

                          {/* Infos personnelles */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                            {candidature.cv.mobile && (
                              <CVItem label="Mobile" value={candidature.cv.mobile} />
                            )}
                            {candidature.cv.linkedin && (
                              <CVItem label="LinkedIn" value={candidature.cv.linkedin} />
                            )}
                            {candidature.cv.github && (
                              <CVItem label="GitHub" value={candidature.cv.github} />
                            )}
                            {candidature.cv.dateOfBirth && (
                              <CVItem
                                label="Date de naissance"
                                value={new Date(candidature.cv.dateOfBirth)
                                  .toLocaleDateString('fr-FR', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                  })}
                              />
                            )}
                            {candidature.cv.civilStatus !== undefined && (
                              <CVItem
                                label="Situation familiale"
                                value={civilStatusLabels[candidature.cv.civilStatus]}
                              />
                            )}
                            {candidature.cv.driverLicense !== undefined && (
                              <CVItem
                                label="Permis de conduire"
                                value={candidature.cv.driverLicense ? '✓ Oui' : '✗ Non'}
                              />
                            )}
                            {candidature.cv.birthProvinceId && (
                              <CVItem
                                label="Gouvernorat de naissance"
                                value={gouvernorats[candidature.cv.birthProvinceId]}
                              />
                            )}
                            {candidature.cv.addressProvinceId && (
                              <CVItem
                                label="Gouvernorat de résidence"
                                value={gouvernorats[candidature.cv.addressProvinceId]}
                              />
                            )}
                          </div>

                          {/* Compétences */}
                          {candidature.cv.skills?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-400 mb-1.5">Compétences</p>
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

                          {/* Domaines d'expertise */}
                          {candidature.cv.areaOfExpertise?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-400 mb-1.5">Domaines d'expertise</p>
                              <div className="flex flex-wrap gap-1.5">
                                {candidature.cv.areaOfExpertise.map((area, i) => (
                                  <span key={i}
                                        className="px-2 py-0.5 bg-accent/10 text-accent
                                                   rounded-full text-xs font-medium">
                                    {area}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Postes souhaités */}
                          {candidature.cv.preferredPositions?.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-400 mb-1.5">Postes souhaités</p>
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
                      )}

                      {/* ── Réponses formulaire ── */}
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

                      {/* ── Notes ── */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase
                                      tracking-wide mb-2">
                          Notes ({notes[candidature._id]?.length || 0})
                        </p>

                        {notes[candidature._id]?.length > 0 ? (
                          <div className="space-y-2 mb-3">
                            {notes[candidature._id].map((note) => (
                              <div key={note._id}
                                   className="bg-white border border-border rounded-lg px-3 py-2">
                                <p className="text-sm text-gray-700">{note.description}</p>
                                <p className="text-xs text-gray-400 font-mono mt-1">
                                  {note.createdBy?.firstname} {note.createdBy?.lastname}
                                  {' · '}
                                  {formatDate(note.createdAt)}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 mb-3">Aucune note.</p>
                        )}
                      </div>

                      {/* ── Actions ── */}
                      <div className="flex items-center gap-3 pt-2 border-t border-border">

                        {/* Planifier entretien */}
                        <Link
                          to={`/recruteur/entretiens/planifier?userId=${candidature.user?._id}&jobId=${id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary
                                     text-white rounded-lg text-xs font-medium
                                     hover:bg-primary/90 transition"
                        >
                          <Calendar size={13} />
                          Planifier entretien
                        </Link>

                        {/* Ajouter une note */}
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            placeholder="Ajouter une note..."
                            value={noteData[candidature._id] || ''}
                            onChange={(e) => setNoteData(prev => ({
                              ...prev,
                              [candidature._id]: e.target.value
                            }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddNote(candidature)}
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
      <p className="text-sm text-gray-700 truncate">{value || '—'}</p>
    </div>
  )
}

export default Candidatures