import {
  AlertCircle,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  X,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import bookingService from '../../services/booking.service'

const STATUS_TABS = [
  { id: 'all', label: 'All Sessions' },
  { id: 'confirmed', label: 'Confirmed / Upcoming' },
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'cancelled', label: 'Cancelled' },
]

export const MySessions = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Action Modals State
  const [completeModalBooking, setCompleteModalBooking] = useState(null)
  const [cancelModalBooking, setCancelModalBooking] = useState(null)
  const [processing, setProcessing] = useState(false)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await bookingService.getMyBookings({ role: 'mentor' })
      setBookings(res.data?.bookings || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load mentorship sessions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleConfirmComplete = async () => {
    if (!completeModalBooking) return
    setProcessing(true)
    setError('')
    setSuccess('')

    try {
      await bookingService.completeBooking(completeModalBooking._id)
      setSuccess(`Session on "${completeModalBooking.topic}" has been marked as completed!`)
      setCompleteModalBooking(null)
      await fetchSessions()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete session')
    } finally {
      setProcessing(false)
    }
  }

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return
    setProcessing(true)
    setError('')
    setSuccess('')

    try {
      await bookingService.cancelBooking(cancelModalBooking._id)
      setSuccess('Session has been cancelled.')
      setCancelModalBooking(null)
      await fetchSessions()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel session')
    } finally {
      setProcessing(false)
    }
  }

  // Filter sessions based on active tab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true
    return b.status === activeTab
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md uppercase tracking-wider inline-flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmed</span>
          </span>
        )
      case 'pending':
        return (
          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md uppercase tracking-wider inline-flex items-center space-x-1">
            <CalendarClock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        )
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-md uppercase tracking-wider inline-flex items-center space-x-1">
            <CalendarCheck className="w-3 h-3" />
            <span>Completed</span>
          </span>
        )
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md uppercase tracking-wider inline-flex items-center space-x-1">
            <CalendarX className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        )
      case 'rejected':
        return (
          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md uppercase tracking-wider inline-flex items-center space-x-1">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md uppercase tracking-wider">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2.5">
            <Calendar className="w-6 h-6 text-emerald-600" />
            <span>Mentorship Sessions</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track and manage your upcoming, completed, and pending mentorship calls.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center overflow-x-auto pb-1 gap-2 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const count = bookings.filter((b) => (tab.id === 'all' ? true : b.status === tab.id)).length
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((session) => (
            <div
              key={session._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs hover:shadow-xs transition"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Student Info & Details */}
                <div className="flex items-start space-x-4">
                  {session.student?.profileImage ? (
                    <img
                      src={session.student.profileImage}
                      alt={session.student.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center flex-shrink-0">
                      {session.student?.name?.charAt(0) || 'S'}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-bold text-slate-900 text-base">
                        {session.student?.name || 'Student'}
                      </span>
                      {getStatusBadge(session.status)}
                    </div>

                    <h3 className="text-sm font-semibold text-slate-800 pt-0.5">
                      Topic: <span className="text-slate-900">{session.topic}</span>
                    </h3>

                    {session.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2 max-w-2xl">
                        <span className="font-semibold text-slate-700">Student note: </span>
                        "{session.notes}"
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{session.startTime} – {session.endTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Actions */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Mark Completed (only for confirmed) */}
                  {session.status === 'confirmed' && (
                    <button
                      onClick={() => setCompleteModalBooking(session)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition inline-flex items-center space-x-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mark Completed</span>
                    </button>
                  )}

                  {/* Cancel (for pending or confirmed) */}
                  {['pending', 'confirmed'].includes(session.status) && (
                    <button
                      onClick={() => setCancelModalBooking(session)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-semibold transition inline-flex items-center space-x-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel Session</span>
                    </button>
                  )}

                  <Link
                    to={`/mentor/sessions/${session._id}`}
                    className="text-xs text-slate-400 hover:text-slate-600 inline-flex items-center space-x-1 pt-1"
                  >
                    <span>View Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <CalendarX className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            No {activeTab !== 'all' ? activeTab : ''} sessions found
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {activeTab === 'all'
              ? "You haven't scheduled or received any mentorship sessions yet."
              : `There are no sessions currently with '${activeTab}' status.`}
          </p>
        </div>
      )}

      {/* Complete Session Modal */}
      {completeModalBooking && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-emerald-600">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Mark Session as Completed</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Confirm that your session on <span className="font-semibold text-slate-900">"{completeModalBooking.topic}"</span> with <span className="font-semibold text-slate-900">{completeModalBooking.student?.name}</span> has taken place.
            </p>
            <p className="text-xs text-slate-500">
              This will record the completed session on your mentor statistics and invite the student to submit a verified rating.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCompleteModalBooking(null)}
                disabled={processing}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                disabled={processing}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
              >
                {processing ? 'Completing...' : 'Yes, Complete Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Session Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <X className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Cancel Mentorship Session</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to cancel the session scheduled on <span className="font-semibold text-slate-900">"{cancelModalBooking.topic}"</span> with <span className="font-semibold text-slate-900">{cancelModalBooking.student?.name}</span>?
            </p>
            <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl">
              The student will receive an in-app notification alerting them that this session was cancelled.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                disabled={processing}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Keep Session
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={processing}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition"
              >
                {processing ? 'Cancelling...' : 'Cancel Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MySessions
