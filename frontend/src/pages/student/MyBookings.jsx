import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  PlusCircle,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import bookingService from '../../services/booking.service'


export const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Cancel modal state
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const fetchBookings = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await bookingService.getMyBookings()
      setBookings(res.data?.bookings || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load mentor bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleCancelBooking = async () => {
    if (!selectedBooking) return

    setCancelling(true)
    setError('')
    setSuccess('')
    try {
      await bookingService.cancelBooking(selectedBooking._id)
      setSuccess('Booking cancelled successfully.')
      setSelectedBooking(null)
      await fetchBookings()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking')
    } finally {
      setCancelling(false)
    }
  }

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'upcoming') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return ['pending', 'confirmed'].includes(b.status) && new Date(b.date) >= today
    }
    if (activeTab === 'confirmed') return b.status === 'confirmed'
    if (activeTab === 'completed') return b.status === 'completed'
    if (activeTab === 'cancelled') return b.status === 'cancelled'
    return true
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <span>My Mentorship Sessions</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your booked 1-on-1 calls and live strategy sessions with expert mentors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Tabs */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            {['all', 'upcoming', 'confirmed', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <Link
            to="/student/mentors"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book New Mentor</span>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Fetching your mentorship bookings...</p>
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((booking) => {
            const mentor = booking.mentor || {}
            const isCompleted = booking.status === 'completed'
            const isConfirmed = booking.status === 'confirmed'
            const isPending = booking.status === 'pending'
            const canCancel = ['pending', 'confirmed'].includes(booking.status)


            return (
              <div
                key={booking._id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 p-6 shadow-xs flex flex-col justify-between space-y-4 transition"
              >
                <div className="space-y-3">
                  {/* Top Meta */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      {mentor.profileImage ? (
                        <img
                          src={mentor.profileImage}
                          alt={mentor.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-purple-600 text-white font-bold text-base flex items-center justify-center">
                          {mentor.name ? mentor.name.charAt(0).toUpperCase() : 'M'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{mentor.name || 'Mentor'}</h3>
                        <p className="text-xs text-slate-400">{mentor.email}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                        isConfirmed
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isPending
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : isCompleted
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  {/* Topic & Notes */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">{booking.topic}</h4>
                    {booking.notes && (
                      <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        "{booking.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Time & Cancel Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{booking.startTime} - {booking.endTime}</span>
                    </div>
                  </div>

                  {canCancel && (
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">You don't have any mentor bookings yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Find an experienced mentor in our directory to accelerate your skill growth and project progress.
          </p>
          <div className="pt-2">
            <Link
              to="/student/mentors"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <span>Explore Mentors</span>
            </Link>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cancel Mentor Session</h3>
                <p className="text-xs text-slate-500">Mentor: {selectedBooking.mentor?.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel the session on <span className="font-semibold text-slate-900">"{selectedBooking.topic}"</span> scheduled for {new Date(selectedBooking.date).toLocaleDateString()}? A notification will be sent to the mentor.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                disabled={cancelling}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Keep Session
              </button>

              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyBookings
