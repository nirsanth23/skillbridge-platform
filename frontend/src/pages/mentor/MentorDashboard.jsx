import {
  AlertCircle,
  ArrowRight,
  Bell,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  CheckCircle2,
  Clock,
  Sparkles,
  Star,
  User,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import bookingService from '../../services/booking.service'
import mentorService from '../../services/mentor.service'

export const MentorDashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [processingId, setProcessingId] = useState(null)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await mentorService.getDashboardData()
      setDashboardData(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load mentor dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const handleAcceptRequest = async (bookingId) => {
    setProcessingId(bookingId)
    try {
      await bookingService.acceptBooking(bookingId)
      setActionSuccess('Session booking request accepted and confirmed!')
      await fetchDashboard()
      setTimeout(() => setActionSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept booking request')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectRequest = async (bookingId) => {
    setProcessingId(bookingId)
    try {
      await bookingService.rejectBooking(bookingId, 'Declined by mentor')
      setActionSuccess('Booking request declined.')
      await fetchDashboard()
      setTimeout(() => setActionSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decline booking request')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-200 rounded-2xl" />
          <div className="h-72 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error && !dashboardData) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <h3 className="text-lg font-bold text-rose-900">Failed to load Dashboard</h3>
        <p className="text-sm text-rose-700 max-w-md mx-auto">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          Try Again
        </button>
      </div>
    )
  }

  const {
    mentor,
    bookingStats,
    upcomingSession,
    recentRequests = [],
    recentNotifications = [],
  } = dashboardData || {}

  return (
    <div className="space-y-6">
      {/* Action Notification */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-800 text-sm shadow-2xs">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-medium border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Mentor Operations Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || mentor?.name || 'Mentor'}! 👋
            </h1>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              Empower student developers, lead live strategy sessions, and review upcoming session requests.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/mentor/requests"
              className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition inline-flex items-center space-x-2"
            >
              <CalendarClock className="w-4 h-4 text-emerald-600" />
              <span>Review Requests</span>
              {bookingStats?.pending > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-500 text-white rounded-full">
                  {bookingStats.pending}
                </span>
              )}
            </Link>
            <Link
              to="/mentor/profile"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold text-xs sm:text-sm backdrop-blur-md transition inline-flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Key Metric Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Requests
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">{bookingStats?.pending ?? 0}</span>
            <p className="text-xs text-slate-500 mt-0.5">Awaiting your response</p>
          </div>
        </div>

        {/* Confirmed Sessions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Confirmed Sessions
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">{bookingStats?.confirmed ?? 0}</span>
            <p className="text-xs text-slate-500 mt-0.5">Upcoming scheduled sessions</p>
          </div>
        </div>

        {/* Completed Sessions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Completed Calls
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">{bookingStats?.completed ?? 0}</span>
            <p className="text-xs text-slate-500 mt-0.5">Total conducted sessions</p>
          </div>
        </div>

        {/* Rating & Reviews */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Mentor Rating
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {mentor?.rating ? mentor.rating.toFixed(1) : '5.0'}
            </span>
            <span className="text-xs text-slate-500">
              ({mentor?.reviewCount ?? 0} {mentor?.reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Calculated from verified reviews</p>
        </div>
      </div>

      {/* Main Grid: Next Upcoming Session & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Next Upcoming Session & Incoming Requests */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Session Spotlight */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Next Upcoming Session</h2>
                  <p className="text-xs text-slate-500">Your next scheduled 1-on-1 mentorship call</p>
                </div>
              </div>
              <Link
                to="/mentor/sessions"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center space-x-1"
              >
                <span>All Sessions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingSession ? (
              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  {upcomingSession.student?.profileImage ? (
                    <img
                      src={upcomingSession.student.profileImage}
                      alt={upcomingSession.student.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-base flex-shrink-0">
                      {upcomingSession.student?.name?.charAt(0) || 'S'}
                    </div>
                  )}
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded-md uppercase tracking-wider mb-1">
                      Confirmed
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {upcomingSession.topic}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Student: <span className="font-semibold text-slate-900">{upcomingSession.student?.name}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(upcomingSession.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{upcomingSession.startTime} – {upcomingSession.endTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 justify-end sm:items-end">
                  <Link
                    to={`/mentor/sessions/${upcomingSession._id}`}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <CalendarX className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No upcoming sessions scheduled</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When students book sessions and you accept them, your confirmed appointments will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Incoming Booking Requests */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recent Booking Requests</h2>
                  <p className="text-xs text-slate-500">Students requesting your mentorship guidance</p>
                </div>
              </div>
              <Link
                to="/mentor/requests"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center space-x-1"
              >
                <span>View All ({bookingStats?.pending ?? 0})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentRequests.length > 0 ? (
              <div className="divide-y divide-slate-100 mt-2">
                {recentRequests.map((booking) => (
                  <div
                    key={booking._id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {booking.student?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{booking.topic}</h3>
                        <p className="text-xs text-slate-600">
                          From: <span className="font-medium text-slate-900">{booking.student?.name}</span>
                        </p>
                        <div className="flex items-center space-x-3 mt-1 text-[11px] text-slate-500">
                          <span>{new Date(booking.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{booking.startTime} – {booking.endTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleAcceptRequest(booking._id)}
                        disabled={processingId === booking._id}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(booking._id)}
                        disabled={processingId === booking._id}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg text-xs font-semibold transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-700">You don't have any booking requests yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Make sure your profile and availability are up to date so students can discover and book sessions with you.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions & Notifications Feed */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-2.5">
              <Link
                to="/mentor/requests"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition">
                    <CalendarClock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Booking Requests</p>
                    <p className="text-[11px] text-slate-500">Respond to incoming students</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
              </Link>

              <Link
                to="/mentor/sessions"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">My Sessions</p>
                    <p className="text-[11px] text-slate-500">Manage confirmed & completed calls</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
              </Link>

              <Link
                to="/mentor/profile"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Edit Mentor Profile</p>
                    <p className="text-[11px] text-slate-500">Topics, hourly rate & availability</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
              </Link>

              <Link
                to="/mentor/reviews"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center group-hover:bg-amber-100 transition">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">View Reviews</p>
                    <p className="text-[11px] text-slate-500">Ratings from completed sessions</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
              </Link>
            </div>
          </div>

          {/* Recent Notifications Feed */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-slate-500" />
                <h2 className="text-base font-bold text-slate-900">Notifications</h2>
              </div>
              <Link
                to="/mentor/notifications"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                View All
              </Link>
            </div>

            {recentNotifications.length > 0 ? (
              <div className="space-y-3">
                {recentNotifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`p-3 rounded-xl text-xs space-y-1 transition ${
                      notif.isRead
                        ? 'bg-slate-50 border border-slate-100'
                        : 'bg-emerald-50/60 border border-emerald-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{notif.title}</span>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <p className="text-slate-600 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 block pt-0.5">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center space-y-1.5">
                <Bell className="w-7 h-7 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No new notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MentorDashboard
