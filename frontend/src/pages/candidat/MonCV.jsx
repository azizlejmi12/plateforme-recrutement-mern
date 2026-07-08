import { useState, useEffect } from 'react'
import api from '../../services/api'
import Layout from '../../components/Layout'
import { Save, Plus, X } from 'lucide-react'

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

// ─────────────────────────────────────────────
// NAVIGATION SIDEBAR
// ─────────────────────────────────────────────
const navItems = [
  { path: '/candidat/offres',         label: '🔍 Offres d\'emploi' },
  { path: '/candidat/candidatures',   label: '📋 Mes candidatures' },
  { path: '/candidat/invitations',    label: '✉️ Mes invitations'  },
  { path: '/candidat/cv',             label: '👤 Mon CV'           },
]

function MonCV() {

  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────
  const [cv, setCV]               = useState(null)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    dateOfBirth:        '',
    mobile:             '',
    github:             '',    // ← remplace phone
    linkedin:           '', 
    civilStatus:        0,
    driverLicense:      false,
    skills:             [],
    areaOfExpertise:    [],
    preferredPositions: [],
    birthProvinceId:    '',
    addressProvinceId:  '',
  })

  // States pour les inputs d'ajout de tags
  const [newSkill, setNewSkill]       = useState('')
  const [newArea, setNewArea]         = useState('')
  const [newPosition, setNewPosition] = useState('')


  // ─────────────────────────────────────────────
  // CHARGEMENT DU CV
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchCV()
  }, [])

  const fetchCV = async () => {
    setLoading(true)
    try {
      const res = await api.get('/candidat/cv')
      setCV(res.data)
      setFormData({
        dateOfBirth:        res.data.dateOfBirth
                              ? new Date(res.data.dateOfBirth).toISOString().split('T')[0]
                              : '',
        mobile:             res.data.mobile             || '',
        github:             res.data.github             || '',
        linkedin:           res.data.linkedin           || '',
        civilStatus:        res.data.civilStatus        || 0,
        driverLicense:      res.data.driverLicense      || false,
        skills:             res.data.skills             || [],
        areaOfExpertise:    res.data.areaOfExpertise    || [],
        preferredPositions: res.data.preferredPositions || [],
        birthProvinceId:    res.data.birthProvinceId    || '',
        addressProvinceId:  res.data.addressProvinceId  || '',
      })
    } catch (err) {
      if (err.response?.status === 404) {
        setCV(null)
        setIsEditing(true)
      } else {
        setError('Impossible de charger votre CV.')
      }
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

  // Skills
  const addSkill = () => {
    if (!newSkill.trim()) return
    setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] })
    setNewSkill('')
  }
  const removeSkill = (index) => {
    setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== index) })
  }

  // Domaines d'expertise
  const addArea = () => {
    if (!newArea.trim()) return
    setFormData({ ...formData, areaOfExpertise: [...formData.areaOfExpertise, newArea.trim()] })
    setNewArea('')
  }
  const removeArea = (index) => {
    setFormData({ ...formData, areaOfExpertise: formData.areaOfExpertise.filter((_, i) => i !== index) })
  }

  // Postes souhaités
  const addPosition = () => {
    if (!newPosition.trim()) return
    setFormData({ ...formData, preferredPositions: [...formData.preferredPositions, newPosition.trim()] })
    setNewPosition('')
  }
  const removePosition = (index) => {
    setFormData({ ...formData, preferredPositions: formData.preferredPositions.filter((_, i) => i !== index) })
  }


  // ─────────────────────────────────────────────
  // SAUVEGARDE
  // ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      let res
      if (cv) {
        res = await api.put('/candidat/cv', formData)
      } else {
        res = await api.post('/candidat/cv', formData)
      }

      // Recharger le CV frais depuis le backend
      const freshCV = await api.get('/candidat/cv')
      setCV(freshCV.data)
      setFormData({
        dateOfBirth:        freshCV.data.dateOfBirth
                              ? new Date(freshCV.data.dateOfBirth).toISOString().split('T')[0]
                              : '',
        mobile:             freshCV.data.mobile             || '',
        github:             freshCV.data.github             || '',
        linkedin:           freshCV.data.linkedin           || '',
        civilStatus:        freshCV.data.civilStatus        || 0,
        driverLicense:      freshCV.data.driverLicense      || false,
        skills:             freshCV.data.skills             || [],
        areaOfExpertise:    freshCV.data.areaOfExpertise    || [],
        preferredPositions: freshCV.data.preferredPositions || [],
        birthProvinceId:    freshCV.data.birthProvinceId    || '',
        addressProvinceId:  freshCV.data.addressProvinceId  || '',
      })

      setSuccess('CV sauvegardé avec succès !')
      setIsEditing(false)

    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
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

  const civilStatusLabels = {
    0: 'Célibataire', 1: 'Marié(e)', 2: 'Divorcé(e)', 3: 'Veuf/Veuve'
  }


  // ─────────────────────────────────────────────
  // RENDU JSX
  // ─────────────────────────────────────────────
  return (
    <Layout navItems={navItems}>

      {/* ── En-tête ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-gray-900 font-semibold">Mon CV</h1>
          <p className="text-gray-500 mt-1">
            {cv ? 'Gérez vos informations personnelles.' : 'Créez votre CV pour postuler aux offres.'}
          </p>
        </div>
        {cv && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium
                       hover:bg-primary/90 transition"
          >
            Modifier
          </button>
        )}
      </div>

      {/* ── Chargement ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && (
        <>
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

          {/* ══════════════════════════════════════
              MODE APERÇU
          ══════════════════════════════════════ */}
          {cv && !isEditing && (
            <div className="bg-white border border-border rounded-xl divide-y divide-border">

              {/* Informations personnelles */}
              <div className="px-6 py-5">
                <h2 className="font-semibold text-gray-900 mb-4">Informations personnelles</h2>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Date de naissance"       value={formatDate(cv.dateOfBirth)} />
                  <InfoItem label="Mobile"                  value={cv.mobile} />
                  <InfoItem label="GitHub"   value={cv.github} />
                  <InfoItem label="LinkedIn" value={cv.linkedin} />
                  <InfoItem label="Situation familiale"     value={civilStatusLabels[cv.civilStatus]} />
                  <InfoItem label="Permis de conduire"      value={cv.driverLicense ? '✓ Oui' : '✗ Non'} />
                  <InfoItem
                    label="Gouvernorat de naissance"
                    value={cv.birthProvinceId ? gouvernorats[cv.birthProvinceId] : null}
                  />
                  <InfoItem
                    label="Gouvernorat de résidence"
                    value={cv.addressProvinceId ? gouvernorats[cv.addressProvinceId] : null}
                  />
                </div>
              </div>

              {/* Compétences */}
              <div className="px-6 py-5">
                <h2 className="font-semibold text-gray-900 mb-4">Compétences</h2>
                {cv.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {cv.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Aucune compétence renseignée.</p>
                )}
              </div>

              {/* Domaines d'expertise */}
              <div className="px-6 py-5">
                <h2 className="font-semibold text-gray-900 mb-4">Domaines d'expertise</h2>
                {cv.areaOfExpertise?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {cv.areaOfExpertise.map((area, i) => (
                      <span key={i} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                        {area}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Aucun domaine renseigné.</p>
                )}
              </div>

              {/* Postes souhaités */}
              <div className="px-6 py-5">
                <h2 className="font-semibold text-gray-900 mb-4">Postes souhaités</h2>
                {cv.preferredPositions?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {cv.preferredPositions.map((pos, i) => (
                      <span key={i} className="px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">
                        {pos}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Aucun poste souhaité renseigné.</p>
                )}
              </div>

            </div>
          )}


          {/* ══════════════════════════════════════
              MODE ÉDITION
          ══════════════════════════════════════ */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ── Informations personnelles ── */}
              <div className="bg-white border border-border rounded-xl p-6">
                <h2 className="font-semibold text-gray-900 mb-5">Informations personnelles</h2>
                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de naissance</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth}
                           onChange={handleChange}
                           className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile</label>
                    <input type="tel" name="mobile" value={formData.mobile}
                           onChange={handleChange} placeholder="12 345 678"
                           className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      GitHub
                    </label>
                    <input type="url" name="github" value={formData.github}
                          onChange={handleChange}
                          placeholder="https://github.com/username"
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                                      focus:outline-none focus:ring-2 focus:ring-primary/30
                                      focus:border-primary transition" />
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    LinkedIn
                      </label>
                      <input type="url" name="linkedin" value={formData.linkedin}
                            onChange={handleChange}
                            placeholder="https://linkedin.com/in/username"
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                                        focus:outline-none focus:ring-2 focus:ring-primary/30
                                        focus:border-primary transition" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Situation familiale</label>
                    <select name="civilStatus" value={formData.civilStatus} onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition">
                      <option value={0}>Célibataire</option>
                      <option value={1}>Marié(e)</option>
                      <option value={2}>Divorcé(e)</option>
                      <option value={3}>Veuf/Veuve</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Gouvernorat de naissance
                    </label>
                    <select name="birthProvinceId" value={formData.birthProvinceId}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition">
                      <option value="">Sélectionner...</option>
                      {Object.entries(gouvernorats).map(([id, nom]) => (
                        <option key={id} value={id}>{nom}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Gouvernorat de résidence
                    </label>
                    <select name="addressProvinceId" value={formData.addressProvinceId}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-white
                                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition">
                      <option value="">Sélectionner...</option>
                      {Object.entries(gouvernorats).map(([id, nom]) => (
                        <option key={id} value={id}>{nom}</option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Permis de conduire */}
                <div className="mt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="driverLicense" checked={formData.driverLicense}
                           onChange={handleChange} className="w-4 h-4 accent-primary" />
                    <span className="text-sm font-medium text-gray-700">Je possède un permis de conduire</span>
                  </label>
                </div>
              </div>

              {/* ── Compétences ── */}
              <TagSection
                title="Compétences"
                items={formData.skills}
                newValue={newSkill}
                onNewValueChange={(e) => setNewSkill(e.target.value)}
                onAdd={addSkill}
                onRemove={removeSkill}
                placeholder="Ex: JavaScript, React, Photoshop..."
                colorClass="bg-primary/10 text-primary"
                btnClass="bg-primary hover:bg-primary/90"
              />

              {/* ── Domaines d'expertise ── */}
              <TagSection
                title="Domaines d'expertise"
                items={formData.areaOfExpertise}
                newValue={newArea}
                onNewValueChange={(e) => setNewArea(e.target.value)}
                onAdd={addArea}
                onRemove={removeArea}
                placeholder="Ex: Informatique, Finance, Marketing..."
                colorClass="bg-accent/10 text-accent"
                btnClass="bg-accent hover:bg-accent/90"
              />

              {/* ── Postes souhaités ── */}
              <TagSection
                title="Postes souhaités"
                items={formData.preferredPositions}
                newValue={newPosition}
                onNewValueChange={(e) => setNewPosition(e.target.value)}
                onAdd={addPosition}
                onRemove={removePosition}
                placeholder="Ex: Développeur React, Chef de projet..."
                colorClass="bg-success/10 text-success"
                btnClass="bg-success hover:bg-success/90"
              />

              {/* ── Boutons ── */}
              <div className="flex gap-3">
                <button type="submit" disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white
                                   rounded-lg font-medium hover:bg-primary/90 transition
                                   disabled:opacity-50 disabled:cursor-not-allowed">
                  <Save size={16} />
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                {cv && (
                  <button type="button"
                          onClick={() => { setIsEditing(false); setError(''); setSuccess('') }}
                          className="px-6 py-2.5 border border-border text-gray-600 rounded-lg
                                     font-medium hover:bg-gray-50 transition">
                    Annuler
                  </button>
                )}
              </div>

            </form>
          )}
        </>
      )}
    </Layout>
  )
}


// ─────────────────────────────────────────────
// COMPOSANT — Section de tags réutilisable
// ─────────────────────────────────────────────
function TagSection({ title, items, newValue, onNewValueChange, onAdd, onRemove, placeholder, colorClass, btnClass }) {
  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <h2 className="font-semibold text-gray-900 mb-5">{title}</h2>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {items.map((item, i) => (
            <span key={i} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
              {item}
              <button type="button" onClick={() => onRemove(i)} className="hover:text-red-500 transition">
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={newValue}
          onChange={onNewValueChange}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-white
                     focus:outline-none focus:ring-2 focus:ring-primary/30
                     focus:border-primary transition text-sm"
        />
        <button type="button" onClick={onAdd}
                className={`px-4 py-2.5 text-white rounded-lg transition ${btnClass}`}>
          <Plus size={18} />
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2">Appuie sur Entrée ou clique + pour ajouter</p>
    </div>
  )
}


// ─────────────────────────────────────────────
// COMPOSANT — Ligne d'info en mode aperçu
// ─────────────────────────────────────────────
function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 font-mono uppercase mb-1">{label}</p>
      <p className="text-sm text-gray-700">{value || '—'}</p>
    </div>
  )
}

export default MonCV