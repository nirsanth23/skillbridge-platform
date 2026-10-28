import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import adminService from '../../services/admin.service'

const REPORT_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
]

export const AdminReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  // Filters
  const [status, setStatus] = useState('')
  const [reportedItemType, setReportedItemType] = useState('')
  const [page, setPage] = useState(1)

  // Resolution Modal State
  const [selectedReport, setSelectedReport] = useState(null)
  const [resolutionStatus, setResolutionStatus] = useState('resolved')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page,
        limit: 10,
      }
      if (status) params.status = status
      if (reportedItemType) params.reportedItemType = reportedItemType

      const res = await adminService.getReports(params)
      setReports(res.data?.reports || [])
      if (res.data?.pagination) {
        setPagination(res.data.pagination)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load moderation reports')
    } finally {
      setLoading(false)
    }
  }, [status, reportedItemType, page])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handleConfirmResolution = async () => {
    if (!selectedReport) return

    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      await adminService.updateReportStatus(selectedReport._id, {
        status: resolutionStatus,
        resolutionNotes,
      })
      setSuccess(`Report marked as ${resolutionStatus}.`)
      setSelectedReport(null)
      setResolutionNotes('')
      await fetchReports()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update report status')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2.5">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            <span>Content Moderation & Incident Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review reported marketplace listings, user accounts, and candidate proposals for compliance.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600">
          <span>Total Incidents:</span>
          <span className="font-bold text-slate-900">{pagination.total}</span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-700 text-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
          {REPORT_STATUSES.map((st) => (
            <button
              key={st.value}
              onClick={() => {
                setStatus(st.value)
                setPage(1)
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                status === st.value
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <select
          value={reportedItemType}
          onChange={(e) => {
            setReportedItemType(e.target.value)
            setPage(1)
          }}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
        >
          <option value="">All Reported Entities</option>
          <option value="user">User Accounts</option>
          <option value="project">Project Listings</option>
          <option value="proposal">Proposals / Bids</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Moderation Incidents</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no moderation reports requiring administrative intervention.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Reported Entity</th>
                  <th className="py-3.5 px-4">Reason & Details</th>
                  <th className="py-3.5 px-4">Reporter</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Filed</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {reports.map((rep) => (
                  <tr key={rep._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800">
                          {rep.reportedItemType}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 truncate max-w-[120px]">
                          {rep.reportedItemId}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">{rep.reason}</p>
                      {rep.details && (
                        <p className="text-[11px] text-slate-500 truncate">{rep.details}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <p className="font-medium text-slate-800">{rep.reporter?.name || 'Anonymous'}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{rep.reporter?.role || 'User'}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          rep.status === 'pending'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : rep.status === 'under_review'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : rep.status === 'resolved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {rep.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => {
                          setSelectedReport(rep)
                          setResolutionStatus(rep.status === 'pending' ? 'under_review' : 'resolved')
                          setResolutionNotes(rep.resolutionNotes || '')
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition"
                      >
                        Moderate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200 text-xs text-slate-500 bg-slate-50/40">
            <span>
              Page <strong className="text-slate-800">{pagination.page}</strong> of{' '}
              <strong className="text-slate-800">{pagination.pages}</strong>
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={pagination.page >= pagination.pages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Moderation Resolution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Resolve Moderation Incident</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <p className="font-bold text-slate-900">Reason: {selectedReport.reason}</p>
              <p className="text-slate-600">{selectedReport.details || 'No additional details provided.'}</p>
              <p className="text-slate-400 text-[10px]">Entity Type: {selectedReport.reportedItemType}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Moderation Resolution Action</label>
              <select
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-semibold"
              >
                <option value="under_review">Under Review — Investigation underway</option>
                <option value="resolved">Resolved — Issue remediated / policy enforced</option>
                <option value="dismissed">Dismissed — Report unsubstantiated / no breach</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Resolution Notes (Optional)</label>
              <textarea
                rows={3}
                placeholder="Log internal administrator notes regarding this decision..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setSelectedReport(null)}
                disabled={actionLoading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolution}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                {actionLoading ? 'Saving...' : 'Apply Moderation Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReports
