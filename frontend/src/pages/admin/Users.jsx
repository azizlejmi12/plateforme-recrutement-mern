import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Shield, ShieldOff, Trash2 } from 'lucide-react'
import api from '../../services/api'
import Layout from '../../components/Layout'
import { ErrorMessage, Spinner, navItems } from './Dashboard'

function Users() {
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({ role: '', blocked: '' })
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUsers = async (page = pagination.page) => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/admin/users', { params: { ...filters, page } })
      setUsers(response.data.users)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger les utilisateurs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers(1) }, [filters.role, filters.blocked])

  const toggleBlock = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}/block`, { blocked: !user.blocked })
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de modifier le statut.')
    }
  }

  const removeUser = async (user) => {
    if (!window.confirm(`Supprimer l'utilisateur ${user.email} ?`)) return
    try {
      await api.delete(`/admin/users/${user._id}`)
      fetchUsers(users.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page)
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de supprimer cet utilisateur.')
    }
  }

  return <Layout navItems={navItems}>
    <div className="mb-8"><h1 className="font-display text-3xl text-gray-900 font-semibold">Utilisateurs</h1><p className="text-gray-500 mt-1">Gérez les comptes candidats et recruteurs.</p></div>
    <div className="bg-white border border-border rounded-xl p-4 mb-5 flex flex-wrap gap-3">
      <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} className="px-3 py-2 rounded-lg border border-border bg-white text-sm"><option value="">Tous les rôles</option><option value="CANDIDAT">Candidats</option><option value="RECRUTEUR">Recruteurs</option></select>
      <select value={filters.blocked} onChange={(e) => setFilters({ ...filters, blocked: e.target.value })} className="px-3 py-2 rounded-lg border border-border bg-white text-sm"><option value="">Tous les statuts</option><option value="false">Actifs</option><option value="true">Bloqués</option></select>
    </div>
    {loading && <Spinner />}
    {error && <ErrorMessage message={error} />}
    {!loading && !error && <>
      <div className="bg-white border border-border rounded-xl overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-500"><tr><th className="px-5 py-3 font-medium">Nom</th><th className="px-5 py-3 font-medium">Email</th><th className="px-5 py-3 font-medium">Rôle</th><th className="px-5 py-3 font-medium">Statut</th><th className="px-5 py-3 font-medium text-right">Actions</th></tr></thead><tbody>{users.map((user) => <tr key={user._id} className="border-t border-border"><td className="px-5 py-4 font-medium text-gray-900">{user.firstname || user.lastname ? `${user.firstname || ''} ${user.lastname || ''}`.trim() : user.username}</td><td className="px-5 py-4 text-gray-600">{user.email}</td><td className="px-5 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'CANDIDAT' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>{user.role}</span></td><td className="px-5 py-4"><span className={user.blocked ? 'text-red-600' : 'text-success'}>{user.blocked ? 'Bloqué' : 'Actif'}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button title={user.blocked ? 'Débloquer' : 'Bloquer'} onClick={() => toggleBlock(user)} className={`p-2 rounded-lg ${user.blocked ? 'text-success hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}>{user.blocked ? <Shield size={17} /> : <ShieldOff size={17} />}</button><button title="Supprimer" onClick={() => removeUser(user)} className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50"><Trash2 size={17} /></button></div></td></tr>)}</tbody></table>{users.length === 0 && <p className="text-center py-10 text-gray-400">Aucun utilisateur trouvé.</p>}</div>
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500"><span>Page {pagination.page} sur {pagination.totalPages}</span><div className="flex gap-2"><button disabled={pagination.page <= 1} onClick={() => fetchUsers(pagination.page - 1)} className="p-2 border border-border rounded-lg disabled:opacity-40"><ChevronLeft size={17} /></button><button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchUsers(pagination.page + 1)} className="p-2 border border-border rounded-lg disabled:opacity-40"><ChevronRight size={17} /></button></div></div>
    </>}
  </Layout>
}

export default Users
