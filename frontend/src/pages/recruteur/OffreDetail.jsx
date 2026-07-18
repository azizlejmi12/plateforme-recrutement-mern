import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Layout from '../../components/Layout'
import { navItems } from './Dashboard'
import StatusBadge from '../../components/StatusBadge'
import { Save, ArrowLeft, Trash2 } from 'lucide-react'

const secteurs = {
  1: 'Informatique', 2: 'Finance', 3: 'Marketing',
  4: 'Santé', 5: 'Éducation', 6: 'Commerce',
  7: 'Industrie', 8: 'Tourisme', 9: 'Agriculture', 10: 'Autre'
}

const niveaux = {
  1: 'Junior (0-2 ans)', 2: 'Intermédiaire (2-5 ans)',
  3: 'Senior (5+ ans)', 4: 'Expert (10+ ans)'
}

const devises = { 1: 'TND', 2: 'EUR', 3: 'USD' }

function OffreDetail() {

  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────
  const [offre, setOffre]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({})

  const { id } = useParams()
  const navigate = useNavigate()


  // ─────────────────────────────────────────────
  // CHARGEMENT
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchOffre()
  }, [id])

  const fetchOffre = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/recruteur/${id}`)
      setOffre(res.data)
      // Pré-remplir le formulaire avec les données existantes
      setFormData({
        title:                     res.data.title                     || '',
        level:                     res.data.level                     || '',
        numberOfRecruits:          res.data.numberOfRecruits          || 1,
        sector:                    res.data.sector                    || '',
        numberOfYearsOfExperience: res.data.numberOfYearsOfExperience || 0,
        applicationDeadline:       res.data.applicationDeadline
                                     ? new Date(res.data.applicationDeadline)
                                         .toISOString().split('T')[0]
                                     : '',
        startPublish:              res.data.startPublish
                                     ? new Date(res.data.startPublish)
                                         .toISOString().split('T')[0]
                                     : '',
        endPublish:                res.data.endPublish
                                     ? new Date(res.data.endPublish)
                                         .toISOString().split('T')[0]
                                     : '',
        salary: {
          amount:   res.data.salary?.amount   || '',
          currency: res.data.salary?.currency || 1
        },
        gender:   res.data.gender   || 0,
        duration: {
          value: res.data.duration?.value || '',
          unit:  res.data.duration?.unit  || 'mois'
        },
        hideApply: res.data.hideApply || false,
        fullCv:    res.data.fullCv    || false,
        status:    res.data.status    || 0
      })
    } catch (err) {
      setError('Offre non trouvée.')
    } finally {
      setLoading(false)
    }
  }


  // ─────────────────────────────────────────────
  // GESTION DU FORMULAIRE
  // ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleNestedChange = (parent, field, value) => {
    setFormData({
      ...formData,
      [parent]: { ...formData[parent], [field]: value }
    })
  }


  // ─────────────────────────────────────────────
  // SAUVEGARDER LES MODIFICATIONS
  // ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await api.put(`/recruteur/${id}`, formData)
      setOffre(res.data)
      setSuccess('Offre mise à jour avec succès !')
      setIsEditing(false)
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        setError(errors.map(e => e.message).join(' · '))
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour.')
      }
    } finally {
      setSaving(false)
    }
  }


  // ─────────────────────────────────────────────
  // SUPPRIMER L'OFFRE
  // ─────────────────────────────────────────────
  const handleDelete = async () => {
    // Demander confirmation avant de supprimer
    if (!window.confirm('Supprimer cette offre ? Cette action est irréversible.')) return

    setDeleting(true)
    try {
      await api.delete(`/recruteur/${id}`)
      navigate('/recruteur/offres')
    } catch (err) {
      setError('Erreur lors de la suppression.')
      setDeleting(false)
    }
  }


  // ─────────────────────────────────────────────
  // ÉTATS CHARGEMENT / ERREUR
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <Layout navItems={navItems}>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  if (error && !offre) {
    return (
      <Layout navItems={navItems}>
        <div className="text-center py-20">
          <p className="text-gray-400">{error}</p>
          <button onClick={() => navigate('/recruteur/offres')}
                  className="mt-4 text-accent hover:underline text-sm">
            Retour aux offres
          </button>
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/recruteur/offres')}
            className="p-2 rounded-lg border border-border hover:bg-gray-50 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-display text-2xl text-gray-900 font-semibold">
              {offre?.title}
            </h1>
            <div className="mt-1">
              <StatusBadge status={offre?.status} type="job" />
            </div>
          </div>
        </div>

        {/* Boutons modifier / supprimer */}
        <div className="flex gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm
                         font-medium hover:bg-primary/90 transition"
            >
              Modifier
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 border border-red-200 text-red-500 rounded-lg
                       text-sm font-medium hover:bg-red-50 transition
                       disabled:opacity-50"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* ══ MODE APERÇU ══ */}
      {!isEditing && offre && (
        <div className="bg-white border border-border rounded-xl divide-y divide-border">

          <div className="px-6 py-5">
            <h2 className="font-semibold text-gray-900 mb-4">Informations générales</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Secteur"            value={secteurs[offre.sector]} />
              <InfoItem label="Niveau"             value={niveaux[offre.level]} />
              <InfoItem label="Nombre de postes"   value={offre.numberOfRecruits} />
              <InfoItem label="Années d'expérience" value={offre.numberOfYearsOfExperience ? `${offre.numberOfYearsOfExperience} an(s)` : null} />
              <InfoItem label="Genre"              value={offre.gender === 0 ? 'Tous' : offre.gender === 1 ? 'Homme' : 'Femme'} />
            </div>
          </div>

          <div className="px-6 py-5">
            <h2 className="font-semibold text-gray-900 mb-4">Salaire et durée</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem
                label="Salaire"
                value={offre.salary?.amount ? `${offre.salary.amount} ${devises[offre.salary.currency]}` : null}
              />
              <InfoItem
                label="Durée"
                value={offre.duration?.value ? `${offre.duration.value} ${offre.duration.unit}` : null}
              />
            </div>
          </div>

          <div className="px-6 py-5">
            <h2 className="font-semibold text-gray-900 mb-4">Dates</h2>
            <div className="grid grid-cols-3 gap-4">
              <InfoItem label="Publication"      value={formatDate(offre.startPublish)} />
              <InfoItem label="Fin publication"  value={formatDate(offre.endPublish)} />
              <InfoItem label="Deadline"         value={formatDate(offre.applicationDeadline)} />
            </div>
          </div>

          <div className="px-6 py-5">
            <h2 className="font-semibold text-gray-900 mb-4">Options</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Cacher postuler" value={offre.hideApply ? '✓ Oui' : '✗ Non'} />
              <InfoItem label="CV complet requis" value={offre.fullCv ? '✓ Oui' : '✗ Non'} />
            </div>
          </div>

        </div>
      )}

      {/* ══ MODE ÉDITION ══ */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="bg-white border border-border rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Informations générales</h2>
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input type="text" name="title" value={formData.title}
                       onChange={handleChange} required
                       className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                                  focus:outline-none focus:ring-2 focus:ring-primary/30
                                  focus:border-primary transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Secteur</label>
                  <select name="sector" value={formData.sector} onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                                     focus:outline-none focus:ring-2 focus:ring-primary/30
                                     focus:border-primary transition">
                    <option value="">Sélectionner...</option>
                    {Object.entries(secteurs).map(([id, nom]) => (
                      <option key={id} value={id}>{nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Niveau</label>
                  <select name="level" value={formData.level} onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                                     focus:outline-none focus:ring-2 focus:ring-primary/30
                                     focus:border-primary transition">
                    <option value="">Sélectionner...</option>
                    {Object.entries(niveaux).map(([id, nom]) => (
                      <option key={id} value={id}>{nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de postes</label>
                  <input type="number" name="numberOfRecruits" value={formData.numberOfRecruits}
                         onChange={handleChange} min="1"
                         className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                                    focus:outline-none focus:ring-2 focus:ring-primary/30
                                    focus:border-primary transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Années d'expérience</label>
                  <input type="number" name="numberOfYearsOfExperience"
                         value={formData.numberOfYearsOfExperience}
                         onChange={handleChange} min="0"
                         className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                                    focus:outline-none focus:ring-2 focus:ring-primary/30
                                    focus:border-primary transition" />
                </div>
              </div>

            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Salaire et durée</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Salaire</label>
                <div className="flex gap-2">
                  <input type="number"
                         value={formData.salary?.amount}
                         onChange={(e) => handleNestedChange('salary', 'amount', e.target.value)}
                         placeholder="Ex: 2500"
                         className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-white
                                    focus:outline-none focus:ring-2 focus:ring-primary/30
                                    focus:border-primary transition" />
                  <select value={formData.salary?.currency}
                          onChange={(e) => handleNestedChange('salary', 'currency', e.target.value)}
                          className="px-3 py-2.5 rounded-lg border border-border bg-white
                                     focus:outline-none focus:ring-2 focus:ring-primary/30
                                     focus:border-primary transition">
                    {Object.entries(devises).map(([id, nom]) => (
                      <option key={id} value={id}>{nom}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Durée</label>
                <div className="flex gap-2">
                  <input type="number"
                         value={formData.duration?.value}
                         onChange={(e) => handleNestedChange('duration', 'value', e.target.value)}
                         placeholder="Ex: 6"
                         className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-white
                                    focus:outline-none focus:ring-2 focus:ring-primary/30
                                    focus:border-primary transition" />
                  <select value={formData.duration?.unit}
                          onChange={(e) => handleNestedChange('duration', 'unit', e.target.value)}
                          className="px-3 py-2.5 rounded-lg border border-border bg-white
                                     focus:outline-none focus:ring-2 focus:ring-primary/30
                                     focus:border-primary transition">
                    <option value="mois">Mois</option>
                    <option value="ans">Ans</option>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Dates</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de publication</label>
                <input type="date" name="startPublish" value={formData.startPublish}
                       onChange={handleChange}
                       className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                                  focus:outline-none focus:ring-2 focus:ring-primary/30
                                  focus:border-primary transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fin de publication</label>
                <input type="date" name="endPublish" value={formData.endPublish}
                       onChange={handleChange}
                       className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                                  focus:outline-none focus:ring-2 focus:ring-primary/30
                                  focus:border-primary transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date limite</label>
                <input type="date" name="applicationDeadline" value={formData.applicationDeadline}
                       onChange={handleChange}
                       className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                                  focus:outline-none focus:ring-2 focus:ring-primary/30
                                  focus:border-primary transition" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Statut</h2>
            <div className="flex gap-3">
              <button type="button"
                      onClick={() => setFormData({ ...formData, status: 0 })}
                      className={`flex-1 py-3 rounded-lg text-sm font-medium border transition
                        ${formData.status === 0
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-border hover:border-gray-400'}`}>
                ⚪ Brouillon
              </button>
              <button type="button"
                      onClick={() => setFormData({ ...formData, status: 1 })}
                      className={`flex-1 py-3 rounded-lg text-sm font-medium border transition
                        ${formData.status === 1
                          ? 'bg-success text-white border-success'
                          : 'bg-white text-gray-600 border-border hover:border-success/40'}`}>
                🟢 Publiée
              </button>
              <button type="button"
                      onClick={() => setFormData({ ...formData, status: 2 })}
                      className={`flex-1 py-3 rounded-lg text-sm font-medium border transition
                        ${formData.status === 2
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-gray-600 border-border hover:border-red-300'}`}>
                🔴 Clôturée
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white
                               rounded-lg font-medium hover:bg-primary/90 transition
                               disabled:opacity-50 disabled:cursor-not-allowed">
              <Save size={16} />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button type="button"
                    onClick={() => { setIsEditing(false); setError(''); setSuccess('') }}
                    className="px-6 py-2.5 border border-border text-gray-600 rounded-lg
                               font-medium hover:bg-gray-50 transition">
              Annuler
            </button>
          </div>

        </form>
      )}

    </Layout>
  )
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

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 font-mono uppercase mb-1">{label}</p>
      <p className="text-sm text-gray-700">{value || '—'}</p>
    </div>
  )
}

export default OffreDetail