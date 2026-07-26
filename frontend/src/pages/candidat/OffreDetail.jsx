// ─────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import {
  Clock, Users, Calendar, ChevronLeft,
  CheckCircle, AlertCircle
} from 'lucide-react'

// Navigation sidebar candidat
const navItems = [
  { path: '/candidat/offres',       label: '🔍 Offres d\'emploi' },
  { path: '/candidat/candidatures', label: '📋 Mes candidatures' },
  { path: '/candidat/entretiens',   label: '📅 Mes entretiens'   },
  { path: '/candidat/invitations',  label: '✉️ Mes invitations'  },
  { path: '/candidat/cv',           label: '👤 Mon CV'           },
]

function OffreDetail() {

  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────
  const [offre, setOffre]           = useState(null)   // données de l'offre
  const [formFields, setFormFields] = useState([])     // champs formulaire personnalisé
  const [formData, setFormData]     = useState({})     // réponses du candidat
  const [loading, setLoading]       = useState(true)
  const [postulating, setPostulating] = useState(false) // true pendant la postulation
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)  // true si déjà postulé ou vient de postuler
  const [successMsg, setSuccessMsg] = useState('')

  // useParams récupère l'ID depuis l'URL /candidat/offres/:id
  const { id } = useParams()
  const navigate = useNavigate()

  // ─────────────────────────────────────────────
  // CHARGEMENT DE L'OFFRE
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchOffre()
  }, [id])

 const fetchOffre = async () => {
  setLoading(true)
  try {
    // 1. Charger l'offre
    const res = await api.get(`/offres/${id}`)
    setOffre(res.data.offre)
    setFormFields(res.data.formFields || [])

    // 2. Vérifier si déjà postulé
    const candidaturesRes = await api.get('/candidat/candidatures')
    const dejaPostule = candidaturesRes.data.some(c => c.job?._id === id)

    if (dejaPostule) {
      setSuccess(true)
      setSuccessMsg('Vous avez déjà postulé à cette offre.')
    }

  } catch (err) {
    setError('Offre introuvable.')
  } finally {
    setLoading(false)
  }
}

  // ─────────────────────────────────────────────
  // GESTION DU FORMULAIRE PERSONNALISÉ
  // ─────────────────────────────────────────────
  const handleFormChange = (fieldId, value) => {
    setFormData({ ...formData, [fieldId]: value })
  }

  // ─────────────────────────────────────────────
  // POSTULER
  // ─────────────────────────────────────────────
  const handlePostuler = async () => {
    setPostulating(true)
    setError('')

    try {
      await api.post('/candidat/candidatures', {
        jobId: id,
        data:  formData    // réponses au formulaire personnalisé
      })
      setSuccess(true)
      setSuccessMsg('Votre candidature a été envoyée avec succès !')

    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la candidature.'
      // Si déjà postulé → afficher comme succès
      if (msg.includes('déjà postulé')) {
        setSuccess(true)
        setSuccessMsg('Vous avez déjà postulé à cette offre.')
      } else {
        setError(msg)
      }
    } finally {
      setPostulating(false)
    }
  }

  // ─────────────────────────────────────────────
  // UTILITAIRES
  // ─────────────────────────────────────────────

  // Formater une date en français
  const formatDate = (date) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  // Vérifier si la deadline est dépassée
  const isExpired = offre?.applicationDeadline &&
    new Date(offre.applicationDeadline) < new Date()


  // ─────────────────────────────────────────────
  // ÉTATS DE CHARGEMENT ET ERREUR
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
          <p className="text-gray-400 text-lg">{error}</p>
          <button
            onClick={() => navigate('/candidat/offres')}
            className="mt-4 text-accent hover:underline text-sm"
          >
            Retour aux offres
          </button>
        </div>
      </Layout>
    )
  }


  // ─────────────────────────────────────────────
  // RENDU PRINCIPAL
  // ─────────────────────────────────────────────
  return (
    <Layout navItems={navItems}>

      {/* ── Bouton retour ── */}
      <button
        onClick={() => navigate('/candidat/offres')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition mb-6"
      >
        <ChevronLeft size={16} />
        Retour aux offres
      </button>

      <div className="max-w-3xl">

        {/* ── En-tête de l'offre ── */}
        <div className="bg-white border border-border rounded-xl p-6 mb-6">

          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-display text-2xl text-gray-900 font-semibold mb-1">
                {offre.title}
              </h1>
              {offre.manager && (
                <p className="text-gray-500 text-sm">
                  Publié par {offre.manager.firstname} {offre.manager.lastname}
                </p>
              )}
            </div>
            <StatusBadge status={offre.status} type="job" />
          </div>

          {/* Détails en grille */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">

            {offre.numberOfRecruits && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={15} className="text-gray-400" />
                <span>{offre.numberOfRecruits} poste{offre.numberOfRecruits > 1 ? 's' : ''}</span>
              </div>
            )}

            {offre.numberOfYearsOfExperience > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={15} className="text-gray-400" />
                <span>{offre.numberOfYearsOfExperience} an{offre.numberOfYearsOfExperience > 1 ? 's' : ''} exp.</span>
              </div>
            )}

            {offre.applicationDeadline && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={15} className={isExpired ? 'text-red-400' : 'text-gray-400'} />
                <span className={isExpired ? 'text-red-500' : ''}>
                  {isExpired ? 'Expiré' : `Expire le ${formatDate(offre.applicationDeadline)}`}
                </span>
              </div>
            )}

          </div>

        </div>

        {/* ── Formulaire personnalisé (si l'offre en a un) ── */}
        {formFields.length > 0 && (
          <div className="bg-white border border-border rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Questions de l'employeur
            </h2>
            <div className="space-y-4">
              {formFields.map((field) => (
                <FormFieldInput
                  key={field._id}
                  field={field}
                  value={formData[field._id] || ''}
                  onChange={(value) => handleFormChange(field._id, value)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Message succès ── */}
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200
                          text-green-700 px-4 py-3 rounded-xl mb-6">
            <CheckCircle size={18} />
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}

        {/* ── Message erreur ── */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200
                          text-red-700 px-4 py-3 rounded-xl mb-6">
            <AlertCircle size={18} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* ── Bouton postuler ── */}
        {!success && !isExpired && (
          <button
            onClick={handlePostuler}
            disabled={postulating}
            className="w-full bg-accent text-white py-3 rounded-xl font-medium text-sm
                       hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {postulating ? 'Envoi en cours...' : 'Postuler à cette offre'}
          </button>
        )}

        {/* ── Offre expirée ── */}
        {isExpired && !success && (
          <div className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl
                          font-medium text-sm text-center">
            Cette offre est clôturée
          </div>
        )}

      </div>

    </Layout>
  )
}


// ─────────────────────────────────────────────
// COMPOSANT — Champ de formulaire personnalisé
// ─────────────────────────────────────────────
function FormFieldInput({ field, value, onChange }) {

  // Libellé dans la bonne langue (fr en priorité)
  const label = field.labelFr || field.labelEn || field.labelAr || 'Question'

  // Rendu selon le type de champ
  switch (field.type) {

    case 0: // Texte libre
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className="w-full px-4 py-2.5 rounded-lg border border-border
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
      )

    case 1: // Nombre
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className="w-full px-4 py-2.5 rounded-lg border border-border
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
      )

    case 2: // Oui/Non
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="flex gap-3">
            {['Oui', 'Non'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`px-4 py-2 rounded-lg text-sm border transition
                  ${value === opt
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-border hover:border-primary/40'
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )

    case 3: // Choix unique
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label key={opt._id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field._id}
                  value={opt.labelFr}
                  checked={value === opt.labelFr}
                  onChange={() => onChange(opt.labelFr)}
                  className="accent-primary"
                />
                <span className="text-sm text-gray-700">{opt.labelFr}</span>
              </label>
            ))}
          </div>
        </div>
      )

    case 4: // Choix multiple
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            {field.options?.map((opt) => {
              const selected = Array.isArray(value) && value.includes(opt.labelFr)
              return (
                <label key={opt._id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => {
                      const current = Array.isArray(value) ? value : []
                      onChange(
                        selected
                          ? current.filter(v => v !== opt.labelFr)  // décocher
                          : [...current, opt.labelFr]               // cocher
                      )
                    }}
                    className="accent-primary"
                  />
                  <span className="text-sm text-gray-700">{opt.labelFr}</span>
                </label>
              )
            })}
          </div>
        </div>
      )

    default:
      return null
  }
}


export default OffreDetail