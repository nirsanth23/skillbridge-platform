import {
  AlertCircle,
  BarChart3,
  Briefcase,
  FolderKanban,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import adminService from '../../services/admin.service'

export const AdminPlatform = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPlatformMetrics = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminService.getPlatformOverview()
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load platform analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlatformMetrics()
  }, [fetchPlatformMetrics])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <h3 className="text-lg font-bold text-rose-900">Platform Analytics Unavailable</h3>
        <p className="text-sm text-rose-700 max-w-md mx-auto">{error}</p>
        <button
          onClick={fetchPlatformMetrics}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          Retry
        </button>
      </div>
    )
  }

  const overview = data?.overview || { totalUsers: 0, totalProjects: 0, totalProposals: 0, verifiedUsersCount: 0 }
  const roleDist = data?.roleDistribution || {}
  const statusDist = data?.projectStatusDistribution || {}
  const categoryDist = data?.categoryDistribution || {}

  const roleColors = {
    student: 'bg-emerald-500',
    client: 'bg-blue-500',
    freelancer: 'bg-teal-500',
    mentor: 'bg-purple-500',
    company: 'bg-amber-500',
    admin: 'bg-rose-500',
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2.5">
            <BarChart3 className="w-6 h-6 text-rose-600" />
            <span>Platform Topology & Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry on marketplace volume, category segmentation, and role distributions.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-500 font-medium">Verified Ratio:</span>
          <span className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
            {overview.totalUsers > 0
              ? `${Math.round((overview.verifiedUsersCount / overview.totalUsers) * 100)}%`
              : '0%'}
          </span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">User Base</span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{overview.totalUsers}</div>
          <p className="text-[11px] text-slate-400 mt-1">Total registered accounts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Project Pipeline</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{overview.totalProjects}</div>
          <p className="text-[11px] text-slate-400 mt-1">Total marketplace listings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Market Bids</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{overview.totalProposals}</div>
          <p className="text-[11px] text-slate-400 mt-1">Submitted proposals</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Verified Badges</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{overview.verifiedUsersCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Authenticated trust profiles</p>
        </div>
      </div>

      {/* Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Role Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-4 h-4 text-rose-600" />
            <span>User Population Segmentation</span>
          </h2>

          <div className="space-y-3 pt-2">
            {Object.entries(roleDist).map(([role, count]) => {
              const pct = overview.totalUsers > 0 ? Math.round((count / overview.totalUsers) * 100) : 0
              return (
                <div key={role} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="capitalize font-semibold text-slate-800">{role}</span>
                    <span className="text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${roleColors[role] || 'bg-slate-400'} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Project Status Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <FolderKanban className="w-4 h-4 text-blue-600" />
            <span>Project Status Segmentation</span>
          </h2>

          <div className="space-y-3 pt-2">
            {Object.entries(statusDist).map(([status, count]) => {
              const pct = overview.totalProjects > 0 ? Math.round((count / overview.totalProjects) * 100) : 0
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="capitalize font-semibold text-slate-800">{status.replace('_', ' ')}</span>
                    <span className="text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Project Categories */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Project Category Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {Object.entries(categoryDist).map(([cat, count]) => (
            <div key={cat} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <p className="text-xs font-bold text-slate-900 capitalize truncate">{cat.replace('-', ' ')}</p>
              <p className="text-xl font-extrabold text-slate-800 mt-1">{count}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Postings</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminPlatform
