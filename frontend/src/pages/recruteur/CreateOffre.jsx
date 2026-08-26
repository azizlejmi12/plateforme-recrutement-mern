// ─────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Layout from '../../components/Layout'
import { navItems } from './Dashboard'
import { Save, ArrowLeft } from 'lucide-react'

// ─────────────────────────────────────────────
// DONNÉES — Gouvernorats et référentiels
// ─────────────────────────────────────────────
const secteurs = {
  1: 'Informatique',
  2: 'Finance',
  3: 'Marketing',
  4: 'Santé',
  5: 'Éducation',
  6: 'Commerce',
  7: 'Industrie',
  8: 'Tourisme',
  9: 'Agriculture',
  10: 'Autre'
}

const niveaux = {
  1: 'Junior (0-2 ans)',
  2: 'Intermédiaire (2-5 ans)',
  3: 'Senior (5+ ans)',
  4: 'Expert (10+ ans)'
}

const devises = {
  1: 'TND',
  2: 'EUR',
  3: 'USD'
}

function CreateOffre() {

  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────
  const [formData, setFormData] = useState({
    title:                      '',
    level:                      '',
    numberOfRecruits:           1,
    sector:                     '',
    numberOfYearsOfExperience:  0,
    applicationDeadline:        '',
    startPublish:               '',
    endPublish:                 '',
    salary: {
      amount:   '',
      currency: 1
    },
    gender:       0,    // 0=tous, 1=homme, 2=femme
    duration: {
      value: '',
      unit:  'mois'
    },
    hideApply:  false,
    fullCv:     false,
    status:     0       // 0=brouillon par défaut
  })

  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const navigate = useNavigate()


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

  // Pour les champs imbriqués (salary.amount, duration.value)
  const handleNestedChange = (parent, field, value) => {
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [field]: value
      }
    })
  }


  // ─────────────────────────────────────────────
  // SOUMISSION
  // ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await api.post('/recruteur', formData)
      // Rediriger vers le détail de l'offre créée
      navigate(`/recruteur/offres/${res.data._id}`)
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        setError(errors.map(e => e.message).join(' · '))
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la création.')
      }
    } finally {
      setSaving(false)
    }
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
          <h1 className="font-display text-3xl text-gray-900 font-semibold">
            Nouvelle offre
          </h1>
          <p className="text-gray-500 mt-1">
            Remplissez les informations de votre offre d'emploi.
          </p>
        </div>
      </div>

      {/* ── Erreur ── */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ══ INFORMATIONS GÉNÉRALES ══ */}
        <div className="bg-white border border-border rounded-2xl p-7 shadow-sm transition-all duration-200">
          <h2 className="font-semibold text-gray-900 mb-5">
            Informations générales
          </h2>
          <div className="space-y-4">

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Titre du poste <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Ex: Développeur React Senior"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                           focus:outline-none focus:ring-2 focus:ring-primary/30
                           focus:border-primary transition"
              />
            </div>

            {/* Secteur + Niveau */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Secteur
                </label>
                <select
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                             focus:outline-none focus:ring-2 focus:ring-primary/30
                             focus:border-primary transition"
                >
                  <option value="">Sélectionner...</option>
                  {Object.entries(secteurs).map(([id, nom]) => (
                    <option key={id} value={id}>{nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Niveau d'expérience
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                             focus:outline-none focus:ring-2 focus:ring-primary/30
                             focus:border-primary transition"
                >
                  <option value="">Sélectionner...</option>
                  {Object.entries(niveaux).map(([id, nom]) => (
                    <option key={id} value={id}>{nom}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nombre de recrues + Genre */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nombre de postes
                </label>
                <input
                  type="number"
                  name="numberOfRecruits"
                  value={formData.numberOfRecruits}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                             focus:outline-none focus:ring-2 focus:ring-primary/30
                             focus:border-primary transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Genre requis
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                             focus:outline-none focus:ring-2 focus:ring-primary/30
                             focus:border-primary transition"
                >
                  <option value={0}>Tous</option>
                  <option value={1}>Homme</option>
                  <option value={2}>Femme</option>
                </select>
              </div>
            </div>

            {/* Années d'expérience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Années d'expérience requises
              </label>
              <input
                type="number"
                name="numberOfYearsOfExperience"
                value={formData.numberOfYearsOfExperience}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                           focus:outline-none focus:ring-2 focus:ring-primary/30
                           focus:border-primary transition"
              />
            </div>

          </div>
        </div>

        {/* ══ SALAIRE ET DURÉE ══ */}
        <div className="bg-white border border-border rounded-2xl p-7 shadow-sm transition-all duration-200">
          <h2 className="font-semibold text-gray-900 mb-5">
            Salaire et durée
          </h2>
          <div className="grid grid-cols-2 gap-4">

            {/* Salaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Salaire
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.salary.amount}
                  onChange={(e) => handleNestedChange('salary', 'amount', e.target.value)}
                  placeholder="Ex: 2500"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-white
                             focus:outline-none focus:ring-2 focus:ring-primary/30
                             focus:border-primary transition"
                />
                <select
                  value={formData.salary.currency}
                  onChange={(e) => handleNestedChange('salary', 'currency', e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-border bg-white
                             focus:outline-none focus:ring-2 focus:ring-primary/30
                             focus:border-primary transition"
                >
                  {Object.entries(devises).map(([id, nom]) => (
                    <option key={id} value={id}>{nom}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Durée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Durée du contrat
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.duration.value}
                  onChange={(e) => handleNestedChange('duration', 'value', e.target.value)}
                  placeholder="Ex: 6"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-white
                             focus:outline-none focus:ring-2 focus:ring-primary/30
                             focus:border-primary transition"
                />
                <select
                  value={formData.duration.unit}
                  onChange={(e) => handleNestedChange('duration', 'unit', e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-border bg-white
                             focus:outline-none focus:ring-2 focus:ring-primary/30
                             focus:border-primary transition"
                >
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

        {/* ══ DATES ══ */}
        <div className="bg-white border border-border rounded-2xl p-7 shadow-sm transition-all duration-200">
          <h2 className="font-semibold text-gray-900 mb-5">
            Dates
          </h2>
          <div className="grid grid-cols-3 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date de publication
              </label>
              <input
                type="date"
                name="startPublish"
                value={formData.startPublish}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                           focus:outline-none focus:ring-2 focus:ring-primary/30
                           focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date de fin de publication
              </label>
              <input
                type="date"
                name="endPublish"
                value={formData.endPublish}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                           focus:outline-none focus:ring-2 focus:ring-primary/30
                           focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date limite de candidature
              </label>
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                           focus:outline-none focus:ring-2 focus:ring-primary/30
                           focus:border-primary transition"
              />
            </div>

          </div>
        </div>

        {/* ══ OPTIONS ══ */}
        <div className="bg-white border border-border rounded-2xl p-7 shadow-sm transition-all duration-200">
          <h2 className="font-semibold text-gray-900 mb-5">
            Options
          </h2>
          <div className="space-y-3">

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="hideApply"
                checked={formData.hideApply}
                onChange={handleChange}
                className="w-4 h-4 accent-primary"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Cacher le bouton "Postuler"
                </span>
                <p className="text-xs text-gray-400">
                  L'offre sera visible mais les candidats ne pourront pas postuler directement.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="fullCv"
                checked={formData.fullCv}
                onChange={handleChange}
                className="w-4 h-4 accent-primary"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Exiger un CV complet
                </span>
                <p className="text-xs text-gray-400">
                  Seuls les candidats avec un CV complet pourront postuler.
                </p>
              </div>
            </label>

          </div>
        </div>

        {/* ══ STATUT INITIAL ══ */}
        <div className="bg-white border border-border rounded-2xl p-7 shadow-sm transition-all duration-200">
          <h2 className="font-semibold text-gray-900 mb-5">
            Statut de publication
          </h2>
          <div className="flex gap-3">

            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: 0 })}
              className={`flex-1 py-3 rounded-lg text-sm font-medium border transition
                ${formData.status === 0
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-border hover:border-gray-400'
                }`}
            >
              ⚪ Enregistrer en brouillon
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: 1 })}
              className={`flex-1 py-3 rounded-lg text-sm font-medium border transition
                ${formData.status === 1
                  ? 'bg-success text-white border-success'
                  : 'bg-white text-gray-600 border-border hover:border-success/40'
                }`}
            >
              🟢 Publier immédiatement
            </button>

          </div>
        </div>

        {/* ══ BOUTONS ══ */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white
                       rounded-lg font-medium hover:bg-primary/90 transition
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {saving ? 'Création...' : 'Créer l\'offre'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/recruteur/offres')}
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

export default CreateOffre