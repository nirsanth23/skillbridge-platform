import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Send,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import bookingService from '../../services/booking.service'
import mentorService from '../../services/mentor.service'

const getTomorrowDateString = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

export const BookMentor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [mentor, setMentor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Booking form state
  const [date, setDate] = useState(getTomorrowDateString)
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('11:00')
  const [topic, setTopic] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const fetchMentor = async () => {
      setLoading(true)
      try {
        const res = await mentorService.getMentorById(id)
        setMentor(res.data?.profile || null)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load mentor details')
      } finally {
        setLoading(false)
      }
    }
    fetchMentor()
  }, [id])


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!date) {
      setError('Please select a date for the session')
      return
    }

    if (!startTime || !endTime) {
      setError('Please select both start and end times')
      return
    }

    if (!topic.trim()) {
      setError('Please enter a session topic or goal')
      return
    }

    setSubmitting(true)
    try {
      await bookingService.createBooking({
        mentorId: mentor.user?._id || mentor.user,
        date,
        startTime,
        endTime,
        topic: topic.trim(),
        notes: notes.trim(),
      })
      setSuccess('Mentor session booked successfully!')
      setTimeout(() => {
        navigate('/student/bookings')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.general || 'Failed to book session')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Preparing booking calendar...</p>
        </div>
      </div>
    )
  }

  const mentorUser = mentor?.user || {}
  const todayString = new Date().toISOString().split('T')[0]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <Link
        to={`/student/mentors/${id}`}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Mentor Profile</span>
      </Link>

      {/* Mentor Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          {mentorUser.profileImage ? (
            <img
              src={mentorUser.profileImage}
              alt={mentorUser.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-purple-600 text-white font-bold text-lg flex items-center justify-center">
              {mentorUser.name ? mentorUser.name.charAt(0).toUpperCase() : 'M'}
            </div>
          )}
          <div>
            <h2 className="text-base font-bold text-slate-900">{mentorUser.name || 'Mentor'}</h2>
            <p className="text-xs text-slate-500">{mentor?.experienceYears || 0} years experience • {mentor?.expertise?.slice(0, 3).join(', ')}</p>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="text-xs text-slate-400 font-medium">Session Rate</span>
          <p className="text-lg font-bold text-slate-900">${mentor?.hourlyRate || 0}/hr</p>
        </div>
      </div>

      {/* Booking Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>Book a 1-on-1 Mentorship Session</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a convenient date and time to connect with your mentor.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
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

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Session Date *
            </label>
            <input
              type="date"
              required
              min={todayString}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                End Time *
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Topic / Focus Goal *
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Code Review for Full-Stack Project, System Design Mentorship"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Session Notes / Questions for Mentor (Optional)
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Share any GitHub repo links, specific roadblocks, or questions you would like to cover..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
            ></textarea>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
            <Link
              to={`/student/mentors/${id}`}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Confirming Booking...' : 'Confirm Mentorship Session'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookMentor
