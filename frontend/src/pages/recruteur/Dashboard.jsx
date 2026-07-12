import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Layout from '../../components/Layout'
import {
  Briefcase, Users, Calendar,
  ChevronRight, CheckCircle, XCircle, Clock
} from 'lucide-react'

// ─────────────────────────────────────────────
// NAVIGATION SIDEBAR RECRUTEUR
// ─────────────────────────────────────────────
export const navItems = [
  { path: '/recruteur/dashboard',  label: '📊 Dashboard'      },
  { path: '/recruteur/offres',     label: '💼 Mes offres'     },
  { path: '/recruteur/entretiens', label: '📅 Mes entretiens' },
]

function Dashboard() {

  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')


  // ─────────────────────────────────────────────
  // CHARGEMENT
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const res = await api.get('/recruteur/dashboard')
      setStats(res.data)
    } catch (err) {
      setError('Impossible de charger le dashboard.')
    } finally {
      setLoading(false)
    }
  }


  // ─────────────────────────────────────────────
  // RENDU JSX
  // ─────────────────────────────────────────────
  return (
    <Layout navItems={navItems}>

      {/* ── En-tête ── */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-gray-900 font-semibold">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Vue d'ensemble de votre activité de recrutement.
        </p>
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

      {/* ── Contenu ── */}
      {!loading && !error && stats && (
        <>

          {/* ══ SECTION OFFRES ══ */}
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Offres
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Briefcase size={18} />}
              label="Total"
              value={stats.offres.total}
              color="bg-primary/10 text-primary"
            />
            <StatCard
              icon={<CheckCircle size={18} />}
              label="Publiées"
              value={stats.offres.publiees}
              color="bg-success/10 text-success"
            />
            <StatCard
              icon={<Clock size={18} />}
              label="Brouillons"
              value={stats.offres.brouillons}
              color="bg-accent/10 text-accent"
            />
            <StatCard
              icon={<XCircle size={18} />}
              label="Clôturées"
              value={stats.offres.cloturees}
              color="bg-red-50 text-red-500"
            />
          </div>

          {/* ══ SECTION CANDIDATURES ══ */}
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Candidatures
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              icon={<Users size={18} />}
              label="Total reçues"
              value={stats.candidatures.total}
              color="bg-primary/10 text-primary"
            />
            <StatCard
              icon={<Clock size={18} />}
              label="En attente"
              value={stats.candidatures.enAttente}
              color="bg-accent/10 text-accent"
            />
            <StatCard
              icon={<CheckCircle size={18} />}
              label="Présélectionnés"
              value={stats.candidatures.shortlisted}
              color="bg-success/10 text-success"
            />
          </div>

          {/* ══ SECTION ENTRETIENS ══ */}
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Entretiens
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              icon={<Calendar size={18} />}
              label="Total"
              value={stats.entretiens.total}
              color="bg-primary/10 text-primary"
            />
            <StatCard
              icon={<Clock size={18} />}
              label="À venir"
              value={stats.entretiens.aVenir}
              color="bg-accent/10 text-accent"
            />
            <StatCard
              icon={<CheckCircle size={18} />}
              label="Effectués"
              value={stats.entretiens.effectues}
              color="bg-success/10 text-success"
            />
          </div>

          {/* ══ DERNIÈRES OFFRES ══ */}
          <div className="bg-white border border-border rounded-xl overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-gray-900">Mes dernières offres</h2>
              <Link
                to="/recruteur/offres"
                className="text-sm text-accent hover:underline"
              >
                Voir tout →
              </Link>
            </div>

            {stats.dernieresOffres.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">Aucune offre créée.</p>
                <Link
                  to="/recruteur/offres/creer"
                  className="mt-3 inline-block text-accent text-sm hover:underline"
                >
                  Créer votre première offre →
                </Link>
              </div>
            ) : (
              <div>
                {stats.dernieresOffres.map((offre) => (
                  <Link
                    key={offre._id}
                    to={`/recruteur/offres/${offre._id}`}
                    className="flex items-center justify-between px-6 py-4
                               border-b border-border last:border-0
                               hover:bg-gray-50 transition group"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm
                                    group-hover:text-primary transition">
                        {offre.title}
                      </p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        {offre.status === 0 ? '⚪ Brouillon' :
                         offre.status === 1 ? '🟢 Publiée'  :
                                              '🔴 Clôturée'}
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-gray-300 group-hover:text-gray-500 transition"
                    />
                  </Link>
                ))}
              </div>
            )}

          </div>

        </>
      )}

    </Layout>
  )
}


// ─────────────────────────────────────────────
// COMPOSANT — Carte de statistique
// ─────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p className="font-display text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}

export default Dashboard