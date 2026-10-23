import {
  AlertCircle,
  ArrowRight,
  Bell,
  Briefcase,
  CheckCircle,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  ExternalLink,
  Eye,
  FileText,
  FolderGit2,
  Send,
  Sparkles,
  Star,
  User,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import freelancerService from '../../services/freelancer.service'

export const FreelancerDashboard = () => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await freelancerService.getDashboard()
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load freelancer dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-36 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-2xl" />
          <div className="h-96 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h4 className="font-bold">Error loading dashboard</h4>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition"
        >
          Try Again
        </button>
      </div>
    )
  }

  const { stats, recentProposals = [], activeProjects = [], recentNotifications = [], profile } =
    data || {}

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Accepted</span>
          </span>
        )
      case 'pending':
        return (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-full flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        )
      case 'rejected':
        return (
          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold rounded-full">
            Rejected
          </span>
        )
      case 'withdrawn':
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold rounded-full">
            Withdrawn
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-1 bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-full">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-full text-xs font-semibold text-teal-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Freelancer Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Freelancer'}!
            </h1>
            <p className="text-sm sm:text-base text-teal-100">
              Discover high-impact client projects, manage your active gigs, and grow your freelance career on SkillBridge.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/freelancer/find-projects"
              className="px-5 py-3 bg-white text-teal-800 hover:bg-teal-50 rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center space-x-2"
            >
              <Compass className="w-4 h-4 text-teal-600" />
              <span>Browse Projects</span>
            </Link>
            <Link
              to="/freelancer/profile"
              className="px-5 py-3 bg-teal-800/60 hover:bg-teal-800/80 border border-teal-400/30 text-white rounded-xl font-semibold text-sm transition flex items-center justify-center space-x-2"
            >
              <User className="w-4 h-4 text-teal-200" />
              <span>View Profile</span>
            </Link>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="mt-6 pt-5 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3 flex-1 max-w-md">
            <span className="text-teal-100 font-semibold whitespace-nowrap">
              Profile Completeness: {stats?.profileCompletionPercentage || 0}%
            </span>
            <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats?.profileCompletionPercentage || 0}%` }}
              />
            </div>
          </div>
          {stats?.profileCompletionPercentage < 100 && (
            <Link
              to="/freelancer/profile"
              className="text-amber-300 hover:text-white font-semibold underline underline-offset-2 transition"
            >
              Add skills and portfolio to boost your client visibility →
            </Link>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Proposals */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Proposals</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{stats?.totalProposals || 0}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              <span className="text-amber-600 font-semibold">{stats?.pendingProposals || 0}</span> pending
            </p>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Gigs</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{stats?.activeProjects || 0}</span>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">In Progress</p>
          </div>
        </div>

        {/* Completed Projects */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Completed</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{stats?.completedProjects || 0}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Delivered</p>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Client Rating</span>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-slate-900">{stats?.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{stats?.reviewCount || 0} reviews</p>
          </div>
        </div>

        {/* Hourly Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Hourly Rate</span>
            <div className="p-2 bg-violet-50 text-violet-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">${stats?.hourlyRate || 0}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">/ hour</p>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Availability</span>
            <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`inline-block px-2 py-0.5 text-xs font-bold rounded-md uppercase ${
                stats?.availability === 'available'
                  ? 'bg-emerald-100 text-emerald-800'
                  : stats?.availability === 'busy'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {stats?.availability?.replace('_', ' ') || 'Available'}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Status</p>
          </div>
        </div>
      </div>

      {/* Main Content: 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Active Projects & Recent Proposals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Projects Gigs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FolderGit2 className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">Active Projects & Gigs</h3>
              </div>
              <Link
                to="/freelancer/active-projects"
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
              >
                <span>View all ({stats?.activeProjects || 0})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeProjects.length === 0 ? (
              <div className="py-8 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <FolderGit2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-semibold text-slate-700 text-sm">No Active Projects Right Now</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Submit compelling proposals to open projects to get hired by top clients and companies.
                </p>
                <Link
                  to="/freelancer/find-projects"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl inline-flex items-center space-x-1.5 transition"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Find Client Projects</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeProjects.map((proj) => (
                  <div key={proj._id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        to={`/projects/${proj._id}`}
                        className="font-semibold text-slate-900 hover:text-teal-600 text-sm truncate block transition"
                      >
                        {proj.title}
                      </Link>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                        <span>Client: {proj.owner?.name || 'Client'}</span>
                        <span>•</span>
                        <span className="font-medium text-slate-700">
                          ${proj.budgetMin} - ${proj.budgetMax}
                        </span>
                        <span>•</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            proj.status === 'in_progress'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {proj.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/projects/${proj._id}`}
                      className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                      title="View Project Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Proposals */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">Recent Proposals Submitted</h3>
              </div>
              <Link
                to="/freelancer/proposals"
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
              >
                <span>All proposals ({stats?.totalProposals || 0})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentProposals.length === 0 ? (
              <div className="py-8 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-semibold text-slate-700 text-sm">No Proposals Submitted Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Browse matching marketplace projects and send customized proposals with your budget and timeframe.
                </p>
                <Link
                  to="/freelancer/find-projects"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl inline-flex items-center space-x-1.5 transition"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Browse Projects</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentProposals.map((prop) => (
                  <div key={prop._id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/projects/${prop.project?._id || prop.project}`}
                          className="font-semibold text-slate-900 hover:text-teal-600 text-sm truncate block transition"
                        >
                          {prop.project?.title || 'Project Proposal'}
                        </Link>
                        {getStatusBadge(prop.status)}
                      </div>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                        <span>
                          Proposed: <strong className="text-slate-700">${prop.proposedBudget}</strong>
                        </span>
                        <span>•</span>
                        <span>Duration: {prop.estimatedDuration}</span>
                        <span>•</span>
                        <span>{new Date(prop.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link
                      to="/freelancer/proposals"
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-teal-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition"
                    >
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Profile Overview & Quick Notifications */}
        <div className="space-y-6">
          {/* Freelancer Profile Snapshot */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Profile Snapshot</h3>
              <Link
                to="/freelancer/profile"
                className="text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                Edit Profile
              </Link>
            </div>

            <div className="text-center pb-4 border-b border-slate-100">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-teal-500 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 bg-teal-100 text-teal-700 font-extrabold text-xl rounded-full flex items-center justify-center mx-auto border-2 border-teal-300">
                  {user?.name?.charAt(0)?.toUpperCase() || 'F'}
                </div>
              )}
              <h4 className="font-bold text-slate-900 mt-2 text-base">{user?.name}</h4>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>

            {/* Skills */}
            <div className="mt-4">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                Top Skills
              </span>
              {profile?.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.slice(0, 6).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                  {profile.skills.length > 6 && (
                    <span className="px-2 py-1 text-slate-400 text-xs font-medium">
                      +{profile.skills.length - 6} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
              )}
            </div>

            {/* Portfolio count */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Portfolio Items</span>
              <span className="font-bold text-slate-800">{profile?.portfolio?.length || 0} Projects</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Experience</span>
              <span className="font-bold text-slate-800">{profile?.experienceYears || 0} years</span>
            </div>
          </div>

          {/* Quick Notifications */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">Notifications</h3>
              </div>
              <Link
                to="/freelancer/notifications"
                className="text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                View all
              </Link>
            </div>

            {recentNotifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No recent notifications.</p>
            ) : (
              <div className="space-y-3">
                {recentNotifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`p-3 rounded-xl border text-xs ${
                      notif.read ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-teal-50/60 border-teal-100 text-teal-900 font-medium'
                    }`}
                  >
                    <p className="font-bold mb-0.5">{notif.title}</p>
                    <p className="line-clamp-2">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FreelancerDashboard
