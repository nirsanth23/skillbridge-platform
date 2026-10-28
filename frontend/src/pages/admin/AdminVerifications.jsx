import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Filter,
  ShieldAlert,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import adminService from '../../services/admin.service'

export const AdminVerifications = () => {
  const [verifications, setVerifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  // Filters
  const [status, setStatus] = useState('pending') // 'pending' | 'verified' | 'all'
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  const fetchVerifications = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page,
        limit: 10,
        status,
      }
      if (role) params.role = role

      const res = await adminService.getVerifications(params)
      setVerifications(res.data?.verifications || [])
      if (res.data?.pagination) {
        setPagination(res.data.pagination)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load verification candidates')
    } finally {
      setLoading(false)
    }
  }, [status, role, page])

  useEffect(() => {
    fetchVerifications()
  }, [fetchVerifications])

  const handleUpdateStatus = async (userId, targetStatus) => {
    setActionLoadingId(userId)
    setError('')
    setSuccess('')
    try {
      await adminService.updateVerificationStatus(userId, targetStatus)
      setSuccess(`Verification status successfully ${targetStatus ? 'granted' : 'revoked'}.`)
      await fetchVerifications()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update verification status')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>Verification Governance</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate candidate credentials, approve verified trust badges, and moderate identity claims.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600">
          <span>Total Records:</span>
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

      {/* Filter Tabs & Role Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Tab buttons */}
        <div className="flex items-center space-x-2">
          {[
            { value: 'pending', label: 'Unverified / Pending' },
            { value: 'verified', label: 'Verified Accounts' },
            { value: 'all', label: 'All Accounts' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatus(tab.value)
                setPage(1)
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                status === tab.value
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Role Filter */}
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value)
            setPage(1)
          }}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
        >
          <option value="">All Roles</option>
          <option value="freelancer">Freelancers</option>
          <option value="mentor">Mentors</option>
          <option value="company">Companies</option>
          <option value="client">Clients</option>
          <option value="student">Students</option>
        </select>
      </div>

      {/* Verifications Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : verifications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Candidates Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no accounts matching the selected verification criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Candidate</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Professional Record</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-5 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {verifications.map((cand) => (
                  <tr key={cand._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {cand.name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/admin/users/${cand._id}`}
                            className="font-bold text-slate-900 hover:text-rose-600 truncate block"
                          >
                            {cand.name}
                          </Link>
                          <p className="text-[11px] text-slate-500 truncate">{cand.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {cand.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      {cand.roleProfile ? (
                        cand.role === 'company' ? (
                          <span>{cand.roleProfile.companyName} ({cand.roleProfile.industry || 'Tech'})</span>
                        ) : (
                          <span>${cand.roleProfile.hourlyRate || 0}/hr • {cand.roleProfile.experienceYears || 0} yrs exp</span>
                        )
                      ) : (
                        <span className="text-slate-400">Standard Profile</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {cand.isVerified ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 font-semibold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-amber-600 font-semibold text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending Review</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {cand.isVerified ? (
                          <button
                            onClick={() => handleUpdateStatus(cand._id, false)}
                            disabled={actionLoadingId === cand._id}
                            className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold transition"
                          >
                            Revoke
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(cand._id, true)}
                            disabled={actionLoadingId === cand._id}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                          >
                            Approve
                          </button>
                        )}
                        <Link
                          to={`/admin/users/${cand._id}`}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                          title="View Profile Details"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
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
    </div>
  )
}

export default AdminVerifications
