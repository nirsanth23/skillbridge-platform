import {
  AlertCircle,
  ArrowRight,
  Bell,
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  FolderPlus,
  Plus,
  ShieldCheck,
  TrendingUp,
  User,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import clientService from '../../services/client.service'

export const ClientDashboard = () => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await clientService.getDashboard()
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load client dashboard')
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
        <div className="h-32 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 rounded-2xl" />
          <div className="h-80 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <h3 className="text-lg font-bold text-rose-900">Failed to load Dashboard</h3>
        <p className="text-sm text-rose-700 max-w-md mx-auto">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          Retry
        </button>
      </div>
    )
  }

  const stats = data?.stats || {
    totalProjects: 0,
    openProjects: 0,
    inProgressProjects: 0,
    completedProjects: 0,
    totalProposals: 0,
    pendingProposals: 0,
    acceptedProposals: 0,
    hiredFreelancers: 0,
  }

  const recentProjects = data?.recentProjects || []
  const recentProposals = data?.recentProposals || []
  const recentNotifications = data?.recentNotifications || []

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-blue-100 border border-white/10">
              <User className="w-3.5 h-3.5 text-blue-300" />
              <span>Individual Client Portal</span>
              {data?.client?.isVerified && (
                <span className="flex items-center text-emerald-300 font-semibold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 ml-1" />
                  Verified
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Client'}
            </h1>
            <p className="text-blue-100 text-sm max-w-xl">
              Post your projects, explore top-tier freelance talent, review competitive proposals, and hire seamlessly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/client/projects/new"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Post a Project</span>
            </Link>
            <Link
              to="/client/freelancers"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600/60 hover:bg-blue-600 text-white rounded-xl text-xs font-bold border border-white/20 transition"
            >
              <Users className="w-4 h-4" />
              <span>Find Freelancers</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Projects */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Projects</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalProjects}</div>
          <p className="text-[11px] text-slate-400 mt-1">All posted listings</p>
        </div>

        {/* Open Projects */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Open Projects</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.openProjects}</div>
          <p className="text-[11px] text-slate-400 mt-1">Accepting proposals</p>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">In Progress</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.inProgressProjects}</div>
          <p className="text-[11px] text-slate-400 mt-1">Under development</p>
        </div>

        {/* Completed */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Completed</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600">{stats.completedProjects}</div>
          <p className="text-[11px] text-slate-400 mt-1">Delivered work</p>
        </div>

        {/* Total Proposals */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Proposals</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.totalProposals}</div>
          <p className="text-[11px] text-slate-400 mt-1">Received proposals</p>
        </div>

        {/* Pending Review */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Pending Review</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600">{stats.pendingProposals}</div>
          <p className="text-[11px] text-slate-400 mt-1">Requires review</p>
        </div>
      </div>

      {/* Main Grid: Projects & Proposals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Projects (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Projects</h2>
              <p className="text-xs text-slate-500">Track and manage your posted project listings</p>
            </div>
            <Link
              to="/client/projects"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 transition"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-2xs">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto">
                <FolderPlus className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">No Projects Posted Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Create your first project listing to receive proposals from talented freelancers across the globe.
                </p>
              </div>
              <Link
                to="/client/projects/new"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Project</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          project.status === 'open'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : project.status === 'in_progress'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : project.status === 'completed'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {project.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 capitalize">{project.category}</span>
                    </div>

                    <Link
                      to={`/client/projects/${project._id}`}
                      className="text-base font-bold text-slate-900 hover:text-blue-600 transition block truncate"
                    >
                      {project.title}
                    </Link>

                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span>
                        Budget: <strong className="text-slate-800">${project.budgetMin} - ${project.budgetMax}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Proposals: <strong className="text-blue-600">{project.proposalCount || 0}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <Link
                      to={`/client/projects/${project._id}/proposals`}
                      className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Proposals ({project.proposalCount || 0})</span>
                    </Link>
                    <Link
                      to={`/client/projects/${project._id}`}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition"
                      title="View Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Proposal Activity */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Proposals</h2>
                <p className="text-xs text-slate-500">Latest submissions on your active project listings</p>
              </div>
              <Link
                to="/client/proposals"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 transition"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentProposals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-500">
                No proposals received yet. Freelancers will bid on your open projects soon!
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentProposals.map((proposal) => (
                  <div
                    key={proposal._id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {proposal.freelancer?.profileImage ? (
                        <img
                          src={proposal.freelancer.profileImage}
                          alt={proposal.freelancer.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {proposal.freelancer?.name?.charAt(0) || 'F'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {proposal.freelancer?.name || 'Freelancer'}
                          </p>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[10px] font-semibold ${
                              proposal.status === 'accepted'
                                ? 'bg-emerald-50 text-emerald-700'
                                : proposal.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {proposal.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          On project: <span className="font-medium text-slate-700">{proposal.project?.title || 'Project'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-slate-900">${proposal.proposedBudget}</p>
                      <p className="text-[10px] text-slate-400">{proposal.estimatedDuration}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Notifications & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/client/projects/new"
                className="w-full flex items-center justify-between p-3 bg-blue-50/50 hover:bg-blue-50 text-blue-900 rounded-xl text-xs font-semibold border border-blue-100 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Post a New Project</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              </Link>
              <Link
                to="/client/freelancers"
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200/60 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <Users className="w-4 h-4 text-slate-600" />
                  <span>Discover Freelancers</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/client/proposals"
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200/60 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>Review All Proposals</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Activity / Notifications Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Notifications</h3>
              </div>
              <Link
                to="/client/notifications"
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
              >
                View All
              </Link>
            </div>

            {recentNotifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No recent notifications</p>
            ) : (
              <div className="space-y-3">
                {recentNotifications.slice(0, 5).map((notif) => (
                  <div
                    key={notif._id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs"
                  >
                    <p className="font-semibold text-slate-800">{notif.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
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

export default ClientDashboard
