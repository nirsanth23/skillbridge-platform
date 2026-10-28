import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const ADMIN_NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'User Management', path: '/admin/users', icon: Users },
  { name: 'Verifications', path: '/admin/verifications', icon: ShieldCheck },
  { name: 'Reports & Moderation', path: '/admin/reports', icon: AlertTriangle },
  { name: 'Platform Overview', path: '/admin/platform', icon: BarChart3 },
]

export const AdminLayout = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [isAuthenticated, navigate, location.pathname])

  if (!isAuthenticated || !user) {
    return null
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Admin Portal Restricted</h2>
          <p className="text-sm text-slate-600">
            You are logged in as <span className="font-semibold uppercase text-rose-600">{user.role}</span>. Access to this management portal is restricted to authorized platform administrators only.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            {user.role === 'student' && (
              <button
                onClick={() => navigate('/student/dashboard')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Go to Student Portal
              </button>
            )}
            {user.role === 'client' && (
              <button
                onClick={() => navigate('/client/dashboard')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Go to Client Portal
              </button>
            )}
            {user.role === 'freelancer' && (
              <button
                onClick={() => navigate('/freelancer/dashboard')}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Go to Freelancer Portal
              </button>
            )}
            {user.role === 'mentor' && (
              <button
                onClick={() => navigate('/mentor/dashboard')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Go to Mentor Portal
              </button>
            )}
            {user.role === 'company' && (
              <button
                onClick={() => navigate('/company/dashboard')}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Go to Company Portal
              </button>
            )}
            <button
              onClick={() => logout()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900/5 text-slate-900 flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <Link to="/admin/dashboard" className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-rose-600 rounded-xl flex items-center justify-center shadow-sm text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white text-base leading-none block">SkillBridge</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-rose-400">Admin Portal</span>
          </div>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/60 z-40 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand & Admin Snapshot */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <Link
              to="/admin/dashboard"
              className="flex items-center space-x-2.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-9 h-9 bg-gradient-to-tr from-rose-600 to-red-600 rounded-xl flex items-center justify-center shadow-sm text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white text-base leading-none block">SkillBridge</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-rose-400">Admin Portal</span>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Snapshot */}
          <div className="mt-5 p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-center space-x-3">
            <div className="w-10 h-10 bg-rose-500/20 text-rose-400 font-bold rounded-full flex items-center justify-center text-sm border border-rose-500/30">
              {user.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-rose-300/80 font-mono font-medium truncate">System Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-rose-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/projects"
            className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-500" />
            <span>Public Marketplace</span>
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false)
              logout()
            }}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
