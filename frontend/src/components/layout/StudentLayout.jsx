import {
  Bell,
  Briefcase,
  Calendar,
  Compass,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  User,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import notificationService from '../../services/notification.service'

const STUDENT_NAV_ITEMS = [
  { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Find Projects', path: '/student/find-projects', icon: Compass },
  { name: 'My Projects', path: '/student/projects', icon: FolderKanban },
  { name: 'Post Project', path: '/student/projects/new', icon: PlusCircle },
  { name: 'Proposals & Hiring', path: '/student/proposals', icon: Briefcase },
  { name: 'Find Mentors', path: '/student/mentors', icon: Users },
  { name: 'My Bookings', path: '/student/bookings', icon: Calendar },
  { name: 'Notifications', path: '/student/notifications', icon: Bell, badge: true },
  { name: 'Profile', path: '/student/profile', icon: User },
]

export const StudentLayout = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [isAuthenticated, navigate, location.pathname])

  // Fetch unread notifications count
  useEffect(() => {
    if (isAuthenticated && user?.role === 'student') {
      const fetchNotificationsCount = async () => {
        try {
          const res = await notificationService.getNotifications({ limit: 1 })
          if (res.data?.unreadCount !== undefined) {
            setUnreadCount(res.data.unreadCount)
          }
        } catch {
          // Silent fallback
        }
      }
      fetchNotificationsCount()
      const interval = setInterval(fetchNotificationsCount, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user?.role])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  if (!isAuthenticated || !user) {
    return null
  }

  if (user.role !== 'student') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Student Portal Access Only</h2>
          <p className="text-sm text-slate-600">
            You are logged in as <span className="font-semibold uppercase text-indigo-600">{user.role}</span>. This portal is exclusively designated for students.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/profile"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              Go to Profile
            </Link>
            <button
              onClick={() => logout()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 text-white flex-shrink-0 border-r border-slate-800 fixed inset-y-0 z-30">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-base shadow-sm">
            SB
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white flex items-center space-x-1.5">
              <span>SkillBridge</span>
              <span className="text-[10px] font-semibold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-md">
                Student
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Learning &amp; Project Hub</p>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {STUDENT_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge && unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500 text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </NavLink>
            )
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-800">
            <Link to="/student/profile" className="flex items-center space-x-2.5 min-w-0">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </Link>

            <button
              onClick={() => logout()}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                Student Portal
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/student/notifications"
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-indigo-600 rounded-full ring-2 ring-white"></span>
              )}
            </Link>

            <Link
              to="/student/projects/new"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post Project</span>
            </Link>

            <Link
              to="/student/profile"
              className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 transition"
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-200">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            ></div>

            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 text-white">
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                    SB
                  </div>
                  <span className="font-bold text-white text-base">Student Portal</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {STUDENT_NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                          isActive
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500 text-white">
                          {unreadCount}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>

              <div className="p-4 border-t border-slate-800">
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 rounded-xl text-sm font-semibold transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Outlet */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default StudentLayout
