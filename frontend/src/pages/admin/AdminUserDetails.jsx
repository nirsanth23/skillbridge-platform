import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Mail,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import adminService from '../../services/admin.service'

export const AdminUserDetails = () => {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [feedback, setFeedback] = useState('')

  const fetchUserDetails = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminService.getUserById(id)
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user administrative details')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchUserDetails()
  }, [fetchUserDetails])

  const handleToggleVerification = async () => {
    if (!data?.user) return
    setActionLoading(true)
    setFeedback('')
    try {
      const nextStatus = !data.user.isVerified
      await adminService.updateVerificationStatus(data.user._id, nextStatus)
      setData((prev) => ({
        ...prev,
        user: { ...prev.user, isVerified: nextStatus },
      }))
      setFeedback(`User verification status changed to ${nextStatus ? 'Verified' : 'Unverified'}`)
      setTimeout(() => setFeedback(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update verification status')
    } finally {
      setActionLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (!data?.user) return
    if (!window.confirm(`Are you sure you want to change account status to "${newStatus}"?`)) return
    setActionLoading(true)
    setFeedback('')
    try {
      await adminService.updateUserStatus(data.user._id, newStatus)
      setData((prev) => ({
        ...prev,
        user: { ...prev.user, status: newStatus },
      }))
      setFeedback(`Account status successfully updated to "${newStatus}"`)
      setTimeout(() => setFeedback(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-44 bg-slate-200 rounded-3xl" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Link
          to="/admin/users"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to User Management</span>
        </Link>
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-3xl text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  const user = data?.user || {}
  const roleProfile = data?.roleProfile || {}
  const stats = data?.stats || {}

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/admin/users"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to User Directory</span>
      </Link>

      {/* Feedback Message */}
      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-700 text-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* User Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-slate-200 shadow-xs flex-shrink-0"
          />
        ) : (
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-900 text-white font-bold text-3xl flex items-center justify-center flex-shrink-0 shadow-sm">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        )}

        <div className="flex-1 text-center sm:text-left space-y-3 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                {user.isVerified && (
                  <span className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center justify-center sm:justify-start space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.email}</span>
              </p>
            </div>

            <div className="flex items-center justify-center sm:justify-end space-x-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold uppercase tracking-wider">
                {user.role}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  user.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {user.status}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-500 border-t border-slate-100">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Registered on {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <span>•</span>
            <span>Projects Owned: <strong>{stats.projectsCount || 0}</strong></span>
            <span>•</span>
            <span>Proposals Submitted: <strong>{stats.proposalsCount || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Complementary Role Profile */}
      {roleProfile && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 capitalize">
            {user.role} Professional Record
          </h2>

          {user.role === 'freelancer' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">{roleProfile.bio || 'No bio provided'}</p>
              <div className="flex items-center space-x-4 text-slate-700">
                <span>Rate: <strong>${roleProfile.hourlyRate || 0}/hr</strong></span>
                <span>•</span>
                <span>Experience: <strong>{roleProfile.experienceYears || 0} Years</strong></span>
                <span>•</span>
                <span>Availability: <strong>{roleProfile.availability || 'available'}</strong></span>
              </div>
              {roleProfile.skills && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {roleProfile.skills.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {user.role === 'mentor' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">{roleProfile.bio || 'No bio provided'}</p>
              <div className="flex items-center space-x-4 text-slate-700">
                <span>Session Fee: <strong>${roleProfile.hourlyRate || 0}/session</strong></span>
                <span>•</span>
                <span>Experience: <strong>{roleProfile.experienceYears || 0} Years</strong></span>
              </div>
            </div>
          )}

          {user.role === 'company' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">{roleProfile.description || 'No description provided'}</p>
              <div className="flex items-center space-x-4 text-slate-700">
                <span>Company: <strong>{roleProfile.companyName}</strong></span>
                <span>•</span>
                <span>Industry: <strong>{roleProfile.industry || 'Tech'}</strong></span>
                <span>•</span>
                <span>Size: <strong>{roleProfile.companySize || 'N/A'}</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Administrative Governance Actions */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Administrative Governance Actions</h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleToggleVerification}
            disabled={actionLoading}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
              user.isVerified
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {user.isVerified ? 'Revoke Verification' : 'Grant Verified Status'}
          </button>

          {user.status !== 'active' && (
            <button
              onClick={() => handleStatusChange('active')}
              disabled={actionLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
            >
              Activate Account
            </button>
          )}

          {user.status !== 'suspended' && (
            <button
              onClick={() => handleStatusChange('suspended')}
              disabled={actionLoading}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition"
            >
              Suspend Account
            </button>
          )}

          {user.status !== 'deactivated' && (
            <button
              onClick={() => handleStatusChange('deactivated')}
              disabled={actionLoading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition"
            >
              Deactivate Account
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminUserDetails
