import {
  Briefcase,
  Building2,
  Compass,
  FolderKanban,
  GraduationCap,
  LogOut,
  Plus,
  Sparkles,
  User,
  UserCheck,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const ROLE_BADGES = {
  student: { label: 'Student', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: GraduationCap },
  client: { label: 'Client', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: User },
  freelancer: { label: 'Freelancer', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Briefcase },
  mentor: { label: 'Mentor', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: Sparkles },
  company: { label: 'Company', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Building2 },
  admin: { label: 'Admin', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: UserCheck },
}

const CREATOR_ROLES = ['student', 'client', 'company']

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const roleMeta = user?.role ? ROLE_BADGES[user.role] || ROLE_BADGES.student : null
  const RoleIcon = roleMeta?.icon
  const canPostProject = user && CREATOR_ROLES.includes(user.role)

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-sm group-hover:bg-indigo-700 transition">
                SB
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  SkillBridge
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  Platform
                </span>
              </div>
            </Link>

            {/* Authenticated Nav Links */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center space-x-1">
                <Link
                  to="/projects"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
                    location.pathname === '/projects'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Projects</span>
                </Link>

                {canPostProject && (
                  <Link
                    to="/my-projects"
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
                      location.pathname === '/my-projects'
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <FolderKanban className="w-4 h-4" />
                    <span>My Projects</span>
                  </Link>
                )}
              </nav>
            )}
          </div>


          {/* Navigation Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Post Project CTA (Student/Client/Company only) */}
                {canPostProject && (
                  <Link
                    to="/projects/create"
                    className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post Project</span>
                  </Link>
                )}

                {/* User Role Badge */}
                {roleMeta && (
                  <div className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleMeta.bg}`}>
                    {RoleIcon && <RoleIcon className="w-3.5 h-3.5" />}
                    <span>{roleMeta.label}</span>
                  </div>
                )}

                {/* Profile Link */}
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 p-1.5 pr-2.5 rounded-full hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center border border-indigo-200">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate hidden sm:inline">
                    {user.name}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-200"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm transition"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
