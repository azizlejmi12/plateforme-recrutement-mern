import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Layout({ children, navItems }) {
  const { user, logout } = useAuth()
  const location = useLocation()   // donne l'URL actuelle

  return (
    <div className="min-h-screen flex bg-bg">

      {/* ───────── SIDEBAR ───────── */}
      <aside className="w-64 bg-primary text-white flex flex-col fixed h-screen">

        {/* Logo / titre */}
        <div className="px-6 py-6 border-b border-white/10">
          <h1 className="font-display text-2xl font-semibold">Recrutement</h1>
          <p className="text-xs text-white/60 mt-1 font-mono">{user?.role}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                  ${isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Profil + déconnexion en bas */}
        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-sm font-medium truncate">
            {user?.firstname} {user?.lastname}
          </p>
          <p className="text-xs text-white/60 truncate">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-3 text-sm text-white/70 hover:text-white transition"
          >
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* ───────── CONTENU ───────── */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>

    </div>
  )
}

export default Layout