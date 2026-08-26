import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BriefcaseBusiness, CalendarDays, FileText, LayoutDashboard, LogOut, Mail, Search, Settings, UserCircle, Users } from 'lucide-react'

const iconByPath = {
  dashboard: LayoutDashboard,
  offres: BriefcaseBusiness,
  candidatures: FileText,
  entretiens: CalendarDays,
  invitations: Mail,
  cv: UserCircle,
  cvtheque: Users,
  referentiels: Settings,
  users: Users,
}

function Layout({ children, navItems }) {
  const { user, logout } = useAuth()
  const location = useLocation()   // donne l'URL actuelle

  return (
    <div className="min-h-screen flex bg-bg">

      {/* ───────── SIDEBAR ───────── */}
      <aside className="w-72 bg-primary text-white flex flex-col fixed h-screen shadow-xl shadow-primary/10">

        {/* Logo / titre */}
        <div className="px-7 py-7 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center shadow-lg shadow-black/10"><Search size={20} /></div>
            <div><h1 className="font-display text-2xl font-semibold tracking-tight">Recrutement</h1><p className="text-[10px] uppercase tracking-[0.18em] text-white/50 mt-1 font-mono">{user?.role}</p></div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = iconByPath[Object.keys(iconByPath).find((key) => item.path.includes(key))] || FileText

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-white/15 text-white shadow-sm before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-accent'
                    : 'text-white/65 hover:bg-white/10 hover:text-white hover:translate-x-0.5'
                  }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
                <span>{item.label.replace(/^[^\p{L}\p{N}]+/u, '')}</span>
              </Link>
            )
          })}
        </nav>

        {/* Profil + déconnexion en bas */}
        <div className="px-6 py-5 border-t border-white/10 bg-black/10">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-accent/90 text-white flex items-center justify-center font-display font-semibold">{`${user?.firstname?.[0] || ''}${user?.lastname?.[0] || ''}`.toUpperCase() || <UserCircle size={21} />}</div><div className="min-w-0"><p className="text-sm font-medium truncate">{user?.firstname} {user?.lastname}</p><p className="text-xs text-white/55 truncate">{user?.email}</p></div></div>
          <button
            onClick={logout}
            className="mt-4 flex items-center gap-2 text-xs uppercase tracking-wider text-white/60 hover:text-white transition-all duration-200"
          >
            <LogOut size={15} /> Se déconnecter
          </button>
        </div>
      </aside>

      {/* ───────── CONTENU ───────── */}
      <main className="flex-1 ml-72 p-8 lg:p-10">
        {children}
      </main>

    </div>
  )
}

export default Layout