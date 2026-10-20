import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Check,
  CheckCircle2,
  Clock,
  Mail,
  X,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import bookingService from '../../services/booking.service'

export const BookingDetails = () => {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [processing, setProcessing] = useState(false)

  // Modals
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const fetchBooking = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await bookingService.getBookingById(id)
      setBooking(res.data?.booking || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchBooking()
  }, [fetchBooking])

  const handleAccept = async () => {
    setProcessing(true)
    setError('')
    setSuccess('')
    try {
      await bookingService.acceptBooking(id)
      setSuccess('Session has been accepted and confirmed!')
      await fetchBooking()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept booking')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    setProcessing(true)
    setError('')
    setSuccess('')
    try {
      await bookingService.rejectBooking(id, rejectReason)
      setSuccess('Booking request declined.')
      setShowRejectModal(false)
      await fetchBooking()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decline booking')
    } finally {
      setProcessing(false)
    }
  }

  const handleComplete = async () => {
    setProcessing(true)
    setError('')
    setSuccess('')
    try {
      await bookingService.completeBooking(id)
      setSuccess('Session marked as completed successfully!')
      await fetchBooking()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete session')
    } finally {
      setProcessing(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this mentorship session?')) return
    setProcessing(true)
    setError('')
    setSuccess('')
    try {
      await bookingService.cancelBooking(id)
      setSuccess('Session has been cancelled.')
      await fetchBooking()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel session')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded-lg" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <h3 className="text-lg font-bold text-rose-900">Booking Details Unavailable</h3>
        <p className="text-sm text-rose-700">{error || 'Session not found or access denied.'}</p>
        <Link
          to="/mentor/sessions"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sessions</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to="/mentor/sessions"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Sessions</span>
        </Link>
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

      {/* Session Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
        {/* Header & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Session Overview
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{booking.topic}</h1>
          </div>

          <div>
            {booking.status === 'confirmed' && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg uppercase tracking-wider inline-flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmed</span>
              </span>
            )}
            {booking.status === 'pending' && (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg uppercase tracking-wider inline-flex items-center space-x-1">
                <CalendarClock className="w-4 h-4" />
                <span>Pending Request</span>
              </span>
            )}
            {booking.status === 'completed' && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-lg uppercase tracking-wider inline-flex items-center space-x-1">
                <CalendarCheck className="w-4 h-4" />
                <span>Completed</span>
              </span>
            )}
            {booking.status === 'cancelled' && (
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg uppercase tracking-wider inline-flex items-center space-x-1">
                <CalendarX className="w-4 h-4" />
                <span>Cancelled</span>
              </span>
            )}
            {booking.status === 'rejected' && (
              <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-lg uppercase tracking-wider inline-flex items-center space-x-1">
                <XCircle className="w-4 h-4" />
                <span>Declined</span>
              </span>
            )}
          </div>
        </div>

        {/* Schedule Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center shadow-2xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Scheduled Date</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {new Date(booking.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Session Window</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {booking.startTime} – {booking.endTime} (24h)
              </p>
            </div>
          </div>
        </div>

        {/* Student Profile Card */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Participant</span>
          <div className="flex items-center space-x-4">
            {booking.student?.profileImage ? (
              <img
                src={booking.student.profileImage}
                alt={booking.student.name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-xl flex items-center justify-center">
                {booking.student?.name?.charAt(0) || 'S'}
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-900">{booking.student?.name || 'Student Developer'}</h2>
              <p className="text-xs text-slate-500 flex items-center space-x-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{booking.student?.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Student Preparation Notes & Goals
            </span>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed">
              "{booking.notes}"
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Booking created {new Date(booking.createdAt).toLocaleDateString()}
          </span>

          <div className="flex items-center space-x-3">
            {booking.status === 'pending' && (
              <>
                <button
                  onClick={handleAccept}
                  disabled={processing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-2xs transition inline-flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{processing ? 'Processing...' : 'Accept Request'}</span>
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={processing}
                  className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-semibold transition inline-flex items-center space-x-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Decline</span>
                </button>
              </>
            )}

            {booking.status === 'confirmed' && (
              <>
                <button
                  onClick={handleComplete}
                  disabled={processing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-2xs transition inline-flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{processing ? 'Saving...' : 'Mark Session Completed'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={processing}
                  className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-semibold transition inline-flex items-center space-x-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel Session</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Decline Session Request</h3>
            <p className="text-xs text-slate-600">Provide an optional message for the student explaining why this session was declined:</p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Conflict with work schedule..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              maxLength={300}
            />
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={processing}
                className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
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

export default BookingDetails
