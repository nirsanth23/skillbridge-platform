import {
  Bell,
  Briefcase,
  Building2,
  Compass,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import notificationService from '../../services/notification.service'

const COMPANY_NAV_ITEMS = [
  { name: 'Dashboard', path: '/company/dashboard', icon: LayoutDashboard },
  { name: 'Company Profile', path: '/company/profile', icon: Building2 },
  { name: 'Find Projects', path: '/company/find-projects', icon: Compass },
  { name: 'My Projects', path: '/company/projects', icon: Briefcase },
  { name: 'Post a Project', path: '/company/projects/new', icon: PlusCircle },
  { name: 'Proposals & Hiring', path: '/company/proposals', icon: FileText },
  { name: 'Find Freelancers', path: '/company/freelancers', icon: Users },
  { name: 'Notifications', path: '/company/notifications', icon: Bell, badge: true },
]

export const CompanyLayout = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [isAuthenticated, navigate, location.pathname])

  // Fetch unread notifications count
  useEffect(() => {
    let isMounted = true
    if (isAuthenticated && user?.role === 'company') {
      const fetchNotificationsCount = async () => {
        try {
          const res = await notificationService.getNotifications({ limit: 1 })
          if (isMounted && res.data?.unreadCount !== undefined) {
            setUnreadCount(res.data.unreadCount)
          }
        } catch {
          // Silent fallback
        }
      }
      fetchNotificationsCount()
      const interval = setInterval(fetchNotificationsCount, 30000)
      return () => {
        isMounted = false
        clearInterval(interval)
      }
    }
    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user?.role])

  if (!isAuthenticated || !user) {
    return null
  }

  if (user.role !== 'company') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Company Portal Access Only</h2>
          <p className="text-sm text-slate-600">
            You are logged in as <span className="font-semibold uppercase text-violet-600">{user.role}</span>. This portal is exclusively designated for registered companies.
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
            {user.role === 'mentor' && (
              <button
                onClick={() => navigate('/mentor/dashboard')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Go to Mentor Portal
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
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <Link to="/company/dashboard" className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-base leading-none block">SkillBridge</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-violet-600">Company Portal</span>
          </div>
        </Link>

        <div className="flex items-center space-x-2">
          <Link
            to="/company/notifications"
            className="p-2 text-slate-600 hover:text-slate-900 relative rounded-lg hover:bg-slate-100 transition"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand & Company Profile Snapshot */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <Link
              to="/company/dashboard"
              className="flex items-center space-x-2.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-9 h-9 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-base leading-none block">SkillBridge</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-violet-600">Company Portal</span>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Mini Profile */}
          <div className="mt-5 p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center space-x-3">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-10 h-10 bg-violet-100 text-violet-700 font-bold rounded-full flex items-center justify-center text-sm">
                {user.name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {COMPANY_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-violet-50 text-violet-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge && unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-rose-500 text-white rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => {
              setMobileMenuOpen(false)
              logout()
            }}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
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

export default CompanyLayout
