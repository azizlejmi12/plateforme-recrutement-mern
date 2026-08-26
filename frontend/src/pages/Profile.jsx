import { useEffect, useState } from 'react'
import { Camera, CheckCircle, ImagePlus, Save, UserCircle } from 'lucide-react'
import api from '../services/api'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const [formData, setFormData] = useState({ firstname: '', lastname: '', civility: '', image: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { updateUser } = useAuth()

  const role = window.location.pathname.startsWith('/recruteur') ? 'RECRUTEUR' : 'CANDIDAT'
  const endpoint = role === 'RECRUTEUR' ? '/recruteur/profil' : '/candidat/profil'
  const navItems = role === 'RECRUTEUR'
    ? [{ path: '/recruteur/dashboard', label: 'Dashboard' }, { path: '/recruteur/offres', label: 'Mes offres' }, { path: '/recruteur/cvtheque', label: 'CVthèque' }, { path: '/recruteur/entretiens', label: 'Mes entretiens' }]
    : [{ path: '/candidat/offres', label: "Offres d'emploi" }, { path: '/candidat/candidatures', label: 'Mes candidatures' }, { path: '/candidat/entretiens', label: 'Mes entretiens' }, { path: '/candidat/invitations', label: 'Mes invitations' }, { path: '/candidat/cv', label: 'Mon CV' }]

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(endpoint)
        setFormData({ firstname: response.data.firstname || '', lastname: response.data.lastname || '', civility: response.data.civility || '', image: response.data.image || '' })
      } catch (err) {
        setError(err.response?.data?.message || 'Impossible de charger le profil.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [endpoint])

  const handleChange = (event) => setFormData({ ...formData, [event.target.name]: event.target.value })

  const handleImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 2 Mo.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => { setFormData((current) => ({ ...current, image: reader.result })); setError('') }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    try {
      const response = await api.put(endpoint, formData)
      updateUser(response.data)
      setFormData({ firstname: response.data.firstname || '', lastname: response.data.lastname || '', civility: response.data.civility || '', image: response.data.image || '' })
      setSuccess('Profil mis à jour avec succès.')
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de mettre à jour le profil.')
    } finally { setSaving(false) }
  }

  return <Layout navItems={navItems}>
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 border-l-4 border-accent pl-5"><p className="font-mono text-xs uppercase tracking-[0.18em] text-accent mb-2">Mon espace</p><h1 className="font-display text-3xl text-gray-900 font-semibold">Mon profil</h1><p className="text-gray-500 mt-1">Gérez vos informations personnelles et votre photo.</p></div>
      {loading ? <div className="bg-white border border-border rounded-2xl p-8 shadow-sm animate-pulse space-y-5"><div className="w-24 h-24 rounded-full bg-gray-100" /><div className="h-11 bg-gray-100 rounded-xl" /><div className="h-11 bg-gray-100 rounded-xl" /></div> : <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm"><div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-border"><div className="relative"><div className="w-28 h-28 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center ring-4 ring-primary/5">{formData.image ? <img src={formData.image} alt="Photo de profil" className="w-full h-full object-cover" /> : <UserCircle size={52} strokeWidth={1.4} />}</div><label htmlFor="profile-image" title="Changer la photo" className="absolute right-0 bottom-0 w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary transition-all duration-200"><Camera size={16} /><input id="profile-image" type="file" accept="image/*" onChange={handleImage} className="hidden" /></label></div><div className="text-center sm:text-left"><h2 className="font-display text-2xl font-semibold text-gray-900">Informations personnelles</h2><p className="text-sm text-gray-500 mt-1 flex items-center justify-center sm:justify-start gap-2"><ImagePlus size={15} className="text-accent" /> Image JPG, PNG ou WEBP, 2 Mo maximum</p></div></div><div className="grid sm:grid-cols-2 gap-5 mt-8"><label className="block text-xs uppercase tracking-wider font-mono text-gray-500">Civilité<select name="civility" value={formData.civility} onChange={handleChange} className="mt-2 w-full px-4 py-3 rounded-xl border border-border bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"><option value="">Sélectionner</option><option value="M">M.</option><option value="Mme">Mme</option><option value="Dr">Dr</option></select></label><label className="block text-xs uppercase tracking-wider font-mono text-gray-500">Prénom<input name="firstname" value={formData.firstname} onChange={handleChange} required className="mt-2 w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></label><label className="block text-xs uppercase tracking-wider font-mono text-gray-500">Nom<input name="lastname" value={formData.lastname} onChange={handleChange} required className="mt-2 w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></label></div>{error && <p className="mt-6 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}{success && <p className="mt-6 flex items-center gap-2 text-sm text-success bg-success/10 border border-success/20 rounded-xl px-4 py-3"><CheckCircle size={17} />{success}</p>}<div className="flex justify-end mt-8"><button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl text-sm font-medium shadow-lg shadow-primary/15 hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"><Save size={17} />{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</button></div></form>}
    </div>
  </Layout>
}

export default Profile
