import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  User,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import adminService from '../../services/admin.service'

export const AdminDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminService.getDashboard()
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load administrator dashboard')
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 rounded-2xl" />
          <div className="h-80 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <h3 className="text-lg font-bold text-rose-900">Dashboard Unavailable</h3>
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

  const users = data?.users || { total: 0, active: 0, suspended: 0, byRole: {} }
  const projects = data?.projects || { total: 0, open: 0, inProgress: 0, completed: 0 }
  const proposals = data?.proposals || { total: 0, pending: 0, accepted: 0 }
  const verifications = data?.verifications || { pending: 0, verified: 0 }
  const moderation = data?.moderation || { pendingReports: 0, totalReports: 0 }
  const recent = data?.recentActivity || { users: [], projects: [], proposals: [], reports: [] }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-rose-500/20 backdrop-blur-md rounded-full text-xs font-medium text-rose-300 border border-rose-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>SkillBridge Administration Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Platform Command Center
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Monitor active platform telemetry, evaluate verification requests, moderate reported incidents, and enforce account governance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchDashboard}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Telemetry</span>
            </button>
            <Link
              to="/admin/users"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              <Users className="w-4 h-4" />
              <span>Manage Users</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Users</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{users.total}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">{users.active} active accounts</p>
        </div>

        {/* Total Projects */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Projects</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{projects.total}</div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">{projects.open} open for bids</p>
        </div>

        {/* Total Proposals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Proposals</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{proposals.total}</div>
          <p className="text-[11px] text-purple-600 font-medium mt-1">{proposals.accepted} hired</p>
        </div>

        {/* In-Progress Engagements */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">In Progress</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{projects.inProgress}</div>
          <p className="text-[11px] text-slate-400 mt-1">Active contracts</p>
        </div>

        {/* Verifications Pending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Verifications</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{verifications.verified}</div>
          <p className="text-[11px] text-slate-400 mt-1">{verifications.pending} unverified</p>
        </div>

        {/* Pending Moderation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Pending Reports</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600">{moderation.pendingReports}</div>
          <p className="text-[11px] text-slate-400 mt-1">Require moderation</p>
        </div>
      </div>

      {/* Role Breakdown Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-rose-600" />
            <span>User Population by Role</span>
          </h2>
          <Link to="/admin/platform" className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center space-x-1">
            <span>Detailed Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center space-x-3">
            <GraduationCap className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-[11px] text-slate-500 font-semibold">Students</p>
              <p className="text-lg font-bold text-slate-900">{users.byRole?.student || 0}</p>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center space-x-3">
            <User className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-[11px] text-slate-500 font-semibold">Clients</p>
              <p className="text-lg font-bold text-slate-900">{users.byRole?.client || 0}</p>
            </div>
          </div>

          <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-100 flex items-center space-x-3">
            <Briefcase className="w-5 h-5 text-teal-600 flex-shrink-0" />
            <div>
              <p className="text-[11px] text-slate-500 font-semibold">Freelancers</p>
              <p className="text-lg font-bold text-slate-900">{users.byRole?.freelancer || 0}</p>
            </div>
          </div>

          <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center space-x-3">
            <UserCheck className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <div>
              <p className="text-[11px] text-slate-500 font-semibold">Mentors</p>
              <p className="text-lg font-bold text-slate-900">{users.byRole?.mentor || 0}</p>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100 flex items-center space-x-3">
            <Building2 className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-[11px] text-slate-500 font-semibold">Companies</p>
              <p className="text-lg font-bold text-slate-900">{users.byRole?.company || 0}</p>
            </div>
          </div>

          <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-100 flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="text-[11px] text-slate-500 font-semibold">Admins</p>
              <p className="text-lg font-bold text-slate-900">{users.byRole?.admin || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent User Registrations */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Registrations</h2>
              <p className="text-xs text-slate-500">Newly onboarded platform accounts</p>
            </div>
            <Link to="/admin/users" className="text-xs font-bold text-rose-600 hover:text-rose-700">
              View All
            </Link>
          </div>

          {recent.users.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No user registrations recorded</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recent.users.map((u) => (
                <div key={u._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {u.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <Link to={`/admin/users/${u._id}`} className="text-xs font-bold text-slate-900 hover:text-rose-600 truncate block">
                        {u.name}
                      </Link>
                      <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {u.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Project Postings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Projects</h2>
              <p className="text-xs text-slate-500">Latest posted opportunities</p>
            </div>
            <Link to="/admin/platform" className="text-xs font-bold text-rose-600 hover:text-rose-700">
              View Analytics
            </Link>
          </div>

          {recent.projects.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No projects posted yet</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recent.projects.map((p) => (
                <div key={p._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{p.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      Owner: {p.owner?.name || 'User'} ({p.owner?.role || 'creator'}) • ${p.budgetMin}-${p.budgetMax}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                      p.status === 'open'
                        ? 'bg-emerald-50 text-emerald-700'
                        : p.status === 'in_progress'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {p.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
