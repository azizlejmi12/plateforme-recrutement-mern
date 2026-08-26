import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import Layout from '../../components/Layout'
import { navItems } from './Dashboard'
import { ArrowLeft, Calendar } from 'lucide-react'

function PlanifierEntretien() {

  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────
  const [formData, setFormData] = useState({
    userId:   '',
    jobId:    '',
    date:     '',
    time:     '',
    presence: 0
  })
  const [offres, setOffres]                   = useState([])
  const [candidatures, setCandidatures]       = useState([])
  const [loadingCandidats, setLoadingCandidats] = useState(false)
  const [saving, setSaving]                   = useState(false)
  const [error, setError]                     = useState('')
  const [success, setSuccess]                 = useState(false)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()


  // ─────────────────────────────────────────────
  // CHARGEMENT INITIAL
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchOffres()
  }, [])

  const fetchOffres = async () => {
    try {
      const res = await api.get('/recruteur', { params: { limit: 100 } })
      const offresData = res.data.offres || []
      setOffres(offresData)

      // Si jobId dans l'URL → pré-sélectionner l'offre et charger les candidats
      const jobId  = searchParams.get('jobId')
      const userId = searchParams.get('userId')

      if (jobId) {
        setFormData(prev => ({ ...prev, jobId, userId: userId || '' }))
        fetchCandidatures(jobId, userId)
      }
    } catch (err) {
      console.error('Erreur chargement offres')
    }
  }

  // Charger les candidatures d'une offre
  const fetchCandidatures = async (jobId, preselectedUserId = null) => {
    if (!jobId) return
    setLoadingCandidats(true)
    try {
      const res = await api.get(`/recruteur/${jobId}/candidatures`, {
        params: { limit: 100 }
      })
      setCandidatures(res.data.candidatures || [])

      // Si userId dans l'URL → pré-sélectionner le candidat
      if (preselectedUserId) {
        setFormData(prev => ({ ...prev, userId: preselectedUserId }))
      }
    } catch (err) {
      console.error('Erreur chargement candidats')
    } finally {
      setLoadingCandidats(false)
    }
  }


  // ─────────────────────────────────────────────
  // GESTION DU FORMULAIRE
  // ─────────────────────────────────────────────

  // Quand le recruteur change l'offre → recharger les candidats
  const handleOffreChange = async (e) => {
    const jobId = e.target.value
    setFormData({ ...formData, jobId, userId: '' })
    setCandidatures([])
    fetchCandidatures(jobId)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }


  // ─────────────────────────────────────────────
  // SOUMISSION
  // ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      // Combiner date + heure
      const dateTime = new Date(`${formData.date}T${formData.time}`)

      await api.post('/recruteur/entretiens', {
        userId:   formData.userId,
        jobId:    formData.jobId,
        date:     dateTime,
        presence: Number(formData.presence)
      })

      setSuccess(true)

    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        setError(errors.map(e => e.message).join(' · '))
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la planification.')
      }
    } finally {
      setSaving(false)
    }
  }


  // ─────────────────────────────────────────────
  // ÉCRAN DE SUCCÈS
  // ─────────────────────────────────────────────
  if (success) {
    return (
      <Layout navItems={navItems}>
        <div className="max-w-md mx-auto text-center py-20">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center
                          justify-center mx-auto mb-6">
            <Calendar size={28} className="text-success" />
          </div>
          <h2 className="font-display text-2xl text-gray-900 font-semibold mb-3">
            Entretien planifié !
          </h2>
          <p className="text-gray-500 mb-8">
            Le candidat sera notifié et pourra accepter ou refuser l'invitation.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/recruteur/entretiens')}
              className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm
                         font-medium hover:bg-primary/90 transition"
            >
              Voir mes entretiens
            </button>
            <button
              onClick={() => {
                setSuccess(false)
                setFormData({ userId: '', jobId: '', date: '', time: '', presence: 0 })
                setCandidatures([])
              }}
              className="px-5 py-2.5 border border-border text-gray-600 rounded-lg
                         text-sm font-medium hover:bg-gray-50 transition"
            >
              Planifier un autre
            </button>
          </div>
        </div>
      </Layout>
    )
  }


  // ─────────────────────────────────────────────
  // RENDU JSX
  // ─────────────────────────────────────────────
  return (
    <Layout navItems={navItems}>

      {/* ── En-tête ── */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg border border-border hover:bg-gray-50 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-3xl text-gray-900 font-semibold">
            Planifier un entretien
          </h1>
          <p className="text-gray-500 mt-1">
            Invitez un candidat à un entretien.
          </p>
        </div>
      </div>

      {/* ── Erreur ── */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200
                        text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">

        {/* ══ OFFRE + CANDIDAT ══ */}
        <div className="bg-white border border-border rounded-2xl p-7 shadow-sm transition-all duration-200">
          <h2 className="font-semibold text-gray-900 mb-5">Offre et candidat</h2>

          <div className="space-y-4">

            {/* Sélection offre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Offre <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.jobId}
                onChange={handleOffreChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                           focus:outline-none focus:ring-2 focus:ring-primary/30
                           focus:border-primary transition"
              >
                <option value="">Sélectionner une offre...</option>
                {offres.map((offre) => (
                  <option key={offre._id} value={offre._id}>
                    {offre.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection candidat — affiché seulement si offre sélectionnée */}
            {formData.jobId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Candidat <span className="text-red-500">*</span>
                </label>

                {loadingCandidats ? (
                  <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent
                                    rounded-full animate-spin" />
                    Chargement des candidats...
                  </div>
                ) : candidatures.length === 0 ? (
                  <div className="px-4 py-3 rounded-lg bg-gray-50 border border-border
                                  text-sm text-gray-400">
                    Aucun candidat n'a postulé à cette offre.
                  </div>
                ) : (
                  <select
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                               focus:outline-none focus:ring-2 focus:ring-primary/30
                               focus:border-primary transition"
                  >
                    <option value="">Sélectionner un candidat...</option>
                    {candidatures.map((candidature) => (
                      <option
                        key={candidature._id}
                        value={candidature.user?._id}
                      >
                        {candidature.user?.civility}{' '}
                        {candidature.user?.firstname}{' '}
                        {candidature.user?.lastname}
                        {' — '}
                        {candidature.user?.email}
                      </option>
                    ))}
                  </select>
                )}

                {/* Compteur */}
                {candidatures.length > 0 && (
                  <p className="text-xs text-gray-400 font-mono mt-1.5">
                    {candidatures.length} candidat{candidatures.length > 1 ? 's' : ''} disponible{candidatures.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ══ DATE ET HEURE ══ */}
        <div className="bg-white border border-border rounded-2xl p-7 shadow-sm transition-all duration-200">
          <h2 className="font-semibold text-gray-900 mb-5">Date et heure</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                           focus:outline-none focus:ring-2 focus:ring-primary/30
                           focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Heure <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                           focus:outline-none focus:ring-2 focus:ring-primary/30
                           focus:border-primary transition"
              />
            </div>
          </div>
        </div>

        {/* ══ MODE ══ */}
        <div className="bg-white border border-border rounded-2xl p-7 shadow-sm transition-all duration-200">
          <h2 className="font-semibold text-gray-900 mb-5">Mode de l'entretien</h2>

          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 0, label: '🏢 Présentiel' },
              { value: 1, label: '💻 Visioconférence' },
              { value: 2, label: '📞 Téléphone' }
            ].map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() => setFormData({ ...formData, presence: mode.value })}
                className={`py-3 rounded-lg text-sm font-medium border transition
                  ${Number(formData.presence) === mode.value
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-border hover:border-primary/40'
                  }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══ BOUTONS ══ */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || !formData.userId || !formData.jobId}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white
                       rounded-lg font-medium hover:bg-primary/90 transition
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Calendar size={16} />
            {saving ? 'Planification...' : 'Planifier l\'entretien'}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-border text-gray-600 rounded-lg
                       font-medium hover:bg-gray-50 transition"
          >
            Annuler
          </button>
        </div>

      </form>

    </Layout>
  )
}

export default PlanifierEntretien