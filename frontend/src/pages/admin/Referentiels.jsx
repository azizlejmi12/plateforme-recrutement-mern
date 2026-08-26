import { useEffect, useState } from 'react'
import { Check, Edit3, Plus, X } from 'lucide-react'
import api from '../../services/api'
import Layout from '../../components/Layout'
import { ErrorMessage, Spinner, navItems } from './Dashboard'

const types = [
  { key: 'skills', label: 'Compétences' },
  { key: 'languages', label: 'Langues' },
  { key: 'degrees', label: 'Diplômes' },
  { key: 'areas', label: "Domaines d'expertise" },
  { key: 'specialities', label: 'Spécialités' },
]
const emptyForm = { labelFr: '', labelEn: '', labelAr: '', status: 1 }

function Referentiels() {
  const [type, setType] = useState('skills')
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const fetchItems = async () => {
    setLoading(true); setError('')
    try { const response = await api.get(`/admin/referentiels/${type}`); setItems(response.data) } catch (err) { setError(err.response?.data?.message || 'Impossible de charger ce référentiel.') } finally { setLoading(false) }
  }
  useEffect(() => { fetchItems(); setEditingId(null); setForm(emptyForm); setMessage('') }, [type])

  const submit = async (event) => {
    event.preventDefault(); setError(''); setMessage('')
    try {
      if (editingId) await api.put(`/admin/referentiels/${type}/${editingId}`, form)
      else await api.post(`/admin/referentiels/${type}`, form)
      setForm(emptyForm); setEditingId(null); setMessage(editingId ? 'Élément modifié.' : 'Élément ajouté.'); fetchItems()
    } catch (err) { setError(err.response?.data?.message || 'Impossible d’enregistrer cet élément.') }
  }
  const edit = (item) => { setEditingId(item._id); setForm({ labelFr: item.labelFr || '', labelEn: item.labelEn || '', labelAr: item.labelAr || '', status: item.status ?? 1 }); setMessage('') }
  const toggleStatus = async (item) => { try { await api.put(`/admin/referentiels/${type}/${item._id}`, { status: item.status === 1 ? 0 : 1 }); fetchItems() } catch (err) { setError(err.response?.data?.message || 'Impossible de modifier le statut.') } }

  return <Layout navItems={navItems}><div className="mb-8"><h1 className="font-display text-3xl text-gray-900 font-semibold">Référentiels</h1><p className="text-gray-500 mt-1">Gérez les valeurs proposées dans les formulaires.</p></div><div className="flex flex-wrap gap-2 border-b border-border mb-6">{types.map((item) => <button key={item.key} onClick={() => setType(item.key)} className={`px-4 py-2.5 text-sm font-medium border-b-2 ${type === item.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>{item.label}</button>)}</div><div className="grid xl:grid-cols-[minmax(0,1fr)_360px] gap-6">{loading ? <Spinner /> : <div className="bg-white border border-border rounded-xl overflow-hidden"><div className="px-5 py-4 border-b border-border"><h2 className="font-semibold text-gray-900">{types.find((item) => item.key === type).label}</h2></div>{items.length === 0 ? <p className="text-center py-10 text-gray-400 text-sm">Aucun élément.</p> : <div>{items.map((item) => <div key={item._id} className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border last:border-0"><div><p className="font-medium text-gray-900">{item.labelFr}</p><p className="text-xs text-gray-400">{item.labelEn || 'Sans libellé anglais'} {item.status === 0 && '· Inactif'}</p></div><div className="flex gap-1"><button title="Modifier" onClick={() => edit(item)} className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg"><Edit3 size={16} /></button><button title={item.status === 1 ? 'Désactiver' : 'Activer'} onClick={() => toggleStatus(item)} className={`p-2 rounded-lg ${item.status === 1 ? 'text-success hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>{item.status === 1 ? <Check size={16} /> : <X size={16} />}</button></div></div>)}</div>}</div>}<form onSubmit={submit} className="bg-white border border-border rounded-xl p-5 h-fit"><h2 className="font-semibold text-gray-900 mb-4">{editingId ? 'Modifier' : 'Ajouter'} un élément</h2><div className="space-y-3"><Field label="Libellé français" value={form.labelFr} required onChange={(value) => setForm({ ...form, labelFr: value })} /><Field label="Libellé anglais" value={form.labelEn} onChange={(value) => setForm({ ...form, labelEn: value })} /><Field label="Libellé arabe" value={form.labelAr} onChange={(value) => setForm({ ...form, labelAr: value })} /><label className="block text-sm text-gray-700">Statut<select value={form.status} onChange={(event) => setForm({ ...form, status: Number(event.target.value) })} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-white"><option value={1}>Actif</option><option value={0}>Inactif</option></select></label></div>{error && <div className="mt-4"><ErrorMessage message={error} /></div>}{message && <p className="mt-4 text-sm text-success">{message}</p>}<div className="flex gap-2 mt-5"><button type="submit" className="flex-1 flex justify-center items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90"><Plus size={16} />{editingId ? 'Enregistrer' : 'Ajouter'}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm) }} className="px-4 py-2.5 border border-border rounded-lg text-sm">Annuler</button>}</div></form></div></Layout>
}
function Field({ label, value, onChange, required = false }) { return <label className="block text-sm text-gray-700">{label}<input required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none" /></label> }
export default Referentiels
