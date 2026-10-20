import {
  AlertCircle,
  Calendar,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import bookingService from '../../services/booking.service'

export const BookingRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Confirmation Modals State
  const [acceptModalBooking, setAcceptModalBooking] = useState(null)
  const [rejectModalBooking, setRejectModalBooking] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await bookingService.getBookingRequests({ status: 'pending' })
      setRequests(res.data?.bookings || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking requests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleConfirmAccept = async () => {
    if (!acceptModalBooking) return
    setProcessing(true)
    setError('')
    setSuccess('')

    try {
      await bookingService.acceptBooking(acceptModalBooking._id)
      setSuccess(`Session with ${acceptModalBooking.student?.name || 'student'} has been confirmed!`)
      setAcceptModalBooking(null)
      await fetchRequests()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept booking request')
    } finally {
      setProcessing(false)
    }
  }

  const handleConfirmReject = async () => {
    if (!rejectModalBooking) return
    setProcessing(true)
    setError('')
    setSuccess('')

    try {
      await bookingService.rejectBooking(rejectModalBooking._id, rejectReason)
      setSuccess('Booking request has been declined.')
      setRejectModalBooking(null)
      setRejectReason('')
      await fetchRequests()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decline booking request')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2.5">
            <CalendarClock className="w-6 h-6 text-amber-500" />
            <span>Incoming Booking Requests</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review and respond to mentorship session proposals submitted by student developers.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/mentor/sessions"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            View Confirmed Sessions
          </Link>
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

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs hover:shadow-xs transition"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Student Info & Topic */}
                <div className="flex items-start space-x-4">
                  {booking.student?.profileImage ? (
                    <img
                      src={booking.student.profileImage}
                      alt={booking.student.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center flex-shrink-0">
                      {booking.student?.name?.charAt(0) || 'S'}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-base">
                        {booking.student?.name || 'Student'}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md uppercase tracking-wider">
                        Pending
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-800 pt-0.5">
                      Topic: <span className="text-emerald-700">{booking.topic}</span>
                    </h3>

                    {booking.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2 max-w-2xl leading-relaxed">
                        <span className="font-semibold text-slate-700">Notes from student: </span>
                        "{booking.notes}"
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{new Date(booking.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{booking.startTime} – {booking.endTime}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-400">
                        Requested {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => setAcceptModalBooking(booking)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition inline-flex items-center justify-center space-x-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept Request</span>
                  </button>

                  <button
                    onClick={() => {
                      setRejectModalBooking(booking)
                      setRejectReason('')
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-semibold transition inline-flex items-center justify-center space-x-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Decline</span>
                  </button>

                  <Link
                    to={`/mentor/sessions/${booking._id}`}
                    className="text-[11px] text-slate-400 hover:text-slate-600 inline-flex items-center space-x-1 pt-1"
                  >
                    <span>Session Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
            <CalendarClock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">You don't have any booking requests yet.</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Students searching for your expertise can schedule sessions. When new requests arrive, you'll be able to review, accept, or decline them here.
          </p>
          <div className="pt-2">
            <Link
              to="/mentor/profile"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition inline-block shadow-2xs"
            >
              Verify Profile & Availability
            </Link>
          </div>
        </div>
      )}

      {/* Accept Confirmation Modal */}
      {acceptModalBooking && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-emerald-600">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Confirm Mentorship Session</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to accept the session on <span className="font-semibold text-slate-900">"{acceptModalBooking.topic}"</span> with <span className="font-semibold text-slate-900">{acceptModalBooking.student?.name}</span>?
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-1">
              <div><span className="font-semibold text-slate-700">Date:</span> {new Date(acceptModalBooking.date).toLocaleDateString()}</div>
              <div><span className="font-semibold text-slate-700">Time:</span> {acceptModalBooking.startTime} – {acceptModalBooking.endTime}</div>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setAcceptModalBooking(null)}
                disabled={processing}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAccept}
                disabled={processing}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
              >
                {processing ? 'Confirming...' : 'Yes, Confirm Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectModalBooking && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <X className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Decline Booking Request</h3>
            </div>
            <p className="text-sm text-slate-600">
              Decline the session requested by <span className="font-semibold text-slate-900">{rejectModalBooking.student?.name}</span> for "{rejectModalBooking.topic}".
            </p>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Reason (Optional, sent to student):
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Schedule conflict, out of office, topic not aligned with current focus..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                maxLength={300}
              />
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalBooking(null)}
                disabled={processing}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={processing}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition"
              >
                {processing ? 'Declining...' : 'Decline Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingRequests
