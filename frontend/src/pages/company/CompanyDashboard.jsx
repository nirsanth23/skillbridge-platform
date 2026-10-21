import {
  AlertCircle,
  ArrowRight,
  Bell,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  FolderPlus,
  Plus,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import companyService from '../../services/company.service'

export const CompanyDashboard = () => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await companyService.getDashboard()
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load company dashboard')
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
    pendingProposals: 0,
    hiredFreelancers: 0,
  }

  const recentProjects = data?.recentProjects || []
  const recentNotifications = data?.recentNotifications || []
  const companyProfile = data?.company?.profile || {}

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-700 via-indigo-700 to-indigo-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-violet-100 border border-white/10">
              <Building2 className="w-3.5 h-3.5 text-violet-300" />
              <span>{companyProfile.companyName || user?.name || 'Company Portal'}</span>
              {data?.company?.isVerified && (
                <span className="flex items-center text-emerald-300 font-semibold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 ml-1" />
                  Verified
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Partner'}
            </h1>
            <p className="text-violet-200 text-sm max-w-xl">
              Post projects, evaluate talent, manage active contracts and grow your team effortlessly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/company/projects/new"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white text-violet-900 hover:bg-violet-50 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 text-violet-700" />
              <span>Post a Project</span>
            </Link>
            <Link
              to="/company/freelancers"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-violet-600/60 hover:bg-violet-600/80 border border-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-md transition"
            >
              <Users className="w-4 h-4" />
              <span>Find Freelancers</span>
            </Link>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-40 -top-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Link
          to="/company/projects/new"
          className="p-4 bg-white hover:bg-violet-50/50 rounded-2xl border border-slate-200 hover:border-violet-300 transition flex items-center space-x-3 group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center group-hover:scale-105 transition">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-violet-700 transition">Post Project</h4>
            <p className="text-[11px] text-slate-500">Create new listing</p>
          </div>
        </Link>

        <Link
          to="/company/projects"
          className="p-4 bg-white hover:bg-violet-50/50 rounded-2xl border border-slate-200 hover:border-violet-300 transition flex items-center space-x-3 group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition">My Projects</h4>
            <p className="text-[11px] text-slate-500">Manage all listings</p>
          </div>
        </Link>

        <Link
          to="/company/proposals"
          className="p-4 bg-white hover:bg-violet-50/50 rounded-2xl border border-slate-200 hover:border-violet-300 transition flex items-center space-x-3 group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition">Proposals</h4>
            <p className="text-[11px] text-slate-500">Review & hire talent</p>
          </div>
        </Link>

        <Link
          to="/company/freelancers"
          className="p-4 bg-white hover:bg-violet-50/50 rounded-2xl border border-slate-200 hover:border-violet-300 transition flex items-center space-x-3 group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition">Freelancers</h4>
            <p className="text-[11px] text-slate-500">Browse talent pool</p>
          </div>
        </Link>

        <Link
          to="/company/profile"
          className="col-span-2 sm:col-span-1 p-4 bg-white hover:bg-violet-50/50 rounded-2xl border border-slate-200 hover:border-violet-300 transition flex items-center space-x-3 group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center group-hover:scale-105 transition">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition">Edit Profile</h4>
            <p className="text-[11px] text-slate-500">Company details</p>
          </div>
        </Link>
      </div>

      {/* Real Statistics Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Projects</span>
            <Briefcase className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalProjects}</p>
          <span className="text-[11px] text-slate-400">All posted items</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Open Projects</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{stats.openProjects}</p>
          <span className="text-[11px] text-emerald-600/80 font-medium">Accepting proposals</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">In Progress</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600">{stats.inProgressProjects}</p>
          <span className="text-[11px] text-indigo-600/80 font-medium">Under active work</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-black text-teal-600">{stats.completedProjects}</p>
          <span className="text-[11px] text-slate-400">Successfully finished</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Pending Bids</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{stats.pendingProposals}</p>
          <span className="text-[11px] text-amber-600/80 font-medium">Awaiting your review</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Hired Talent</span>
            <UserCheck className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-2xl font-black text-violet-600">{stats.hiredFreelancers}</p>
          <span className="text-[11px] text-violet-600/80 font-medium">Active & past hired</span>
        </div>
      </div>

      {/* Two Column Layout: Recent Projects & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Projects (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-violet-600" />
              <h2 className="text-lg font-bold text-slate-900">Recent Projects</h2>
            </div>
            <Link
              to="/company/projects"
              className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No projects posted yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Get started by posting your first project to connect with skilled freelancers.
              </p>
              <Link
                to="/company/projects/new"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition"
              >
                <Plus className="w-4 h-4" />
                <span>Post Your First Project</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((p) => {
                const statusStyles = {
                  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  in_progress: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                  completed: 'bg-teal-50 text-teal-700 border-teal-200',
                  draft: 'bg-slate-100 text-slate-700 border-slate-200',
                  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
                }[p.status] || 'bg-slate-100 text-slate-700 border-slate-200'

                return (
                  <div
                    key={p._id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyles}`}>
                          {p.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400">
                          {p.category || 'General'}
                        </span>
                      </div>
                      <Link
                        to={`/company/projects/${p._id}`}
                        className="text-base font-bold text-slate-900 hover:text-violet-600 transition block truncate"
                      >
                        {p.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>
                          Budget:{' '}
                          <span className="font-semibold text-slate-800">
                            ${p.budgetMin?.toLocaleString()} - ${p.budgetMax?.toLocaleString()}
                          </span>
                        </span>
                        <span>•</span>
                        <span>
                          {p.skills?.slice(0, 3).join(', ')}
                          {p.skills?.length > 3 ? ` +${p.skills.length - 3}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Link
                        to={`/company/projects/${p._id}/proposals`}
                        className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold rounded-xl transition flex items-center space-x-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Proposals</span>
                      </Link>
                      <Link
                        to={`/company/projects/${p._id}`}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Notifications Feed (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-violet-600" />
              <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
            </div>
            <Link
              to="/company/notifications"
              className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-2">
              <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">No new notifications</p>
              <p className="text-[11px] text-slate-400">Activity on your projects will appear here</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-2xs overflow-hidden">
              {recentNotifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 transition ${
                    !n.isRead ? 'bg-violet-50/40' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 leading-snug">{n.title}</p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-violet-600 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {new Date(n.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompanyDashboard
