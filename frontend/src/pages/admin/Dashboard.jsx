import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, FileText, Users, UserX } from 'lucide-react'
import api from '../../services/api'
import Layout from '../../components/Layout'

export const navItems = [
  { path: '/admin/dashboard', label: '📊 Dashboard' },
  { path: '/admin/users', label: '👥 Utilisateurs' },
  { path: '/admin/referentiels', label: '📚 Référentiels' },
]

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats')
        setStats(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Impossible de charger les statistiques.')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <Layout navItems={navItems}>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-gray-900 font-semibold">Dashboard admin</h1>
        <p className="text-gray-500 mt-1">Vue globale de la plateforme.</p>
      </div>
      {loading && <Spinner />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={<Users size={19} />} label="Total utilisateurs" value={stats.users.total} color="bg-primary/10 text-primary" />
          <StatCard icon={<UserX size={19} />} label="Utilisateurs bloqués" value={stats.users.bloques} color="bg-red-50 text-red-600" />
          <StatCard icon={<Briefcase size={19} />} label="Offres publiées" value={stats.offres.publiees} color="bg-success/10 text-success" />
          <StatCard icon={<FileText size={19} />} label="Candidatures" value={stats.candidatures.total} color="bg-accent/10 text-accent" />
        </div>
      )}
      {!loading && !error && (
        <div className="mt-8 flex gap-3">
          <Link to="/admin/users" className="bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90">Gérer les utilisateurs</Link>
          <Link to="/admin/referentiels" className="border border-border bg-white text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">Gérer les référentiels</Link>
        </div>
      )}
    </Layout>
  )
}

function StatCard({ icon, label, value, color }) {
  return <div className="bg-white border border-border rounded-xl p-5"><div className="flex justify-between items-start"><span className="text-sm text-gray-500">{label}</span><span className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>{icon}</span></div><p className="font-display text-3xl font-semibold text-gray-900 mt-4">{value}</p></div>
}

export function Spinner() {
  return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
}

export function ErrorMessage({ message }) {
  return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{message}</div>
}

export default Dashboard
