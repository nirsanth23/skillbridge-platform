import {
  AlertCircle,
  ArrowRight,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FolderKanban,
  GraduationCap,
  PlusCircle,
  Sparkles,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import studentService from '../../services/student.service'

export const StudentDashboard = () => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await studentService.getDashboard()
        setData(res.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load student dashboard statistics')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading student dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8 max-w-7xl mx-auto">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  const {
    projectStats = {},
    proposalStats = {},
    bookingStats = {},
    upcomingBooking,
    recentProjects = [],
    recentNotifications = [],
  } = data || {}

  // Calculate profile completion percentage
  let profileCompletion = 40 // Base for registered student
  if (user?.name) profileCompletion += 20
  if (user?.profileImage) profileCompletion += 20
  if (user?.isVerified) profileCompletion += 20

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student Hub</span>
              </span>
              <span className="text-xs text-slate-400">SkillBridge Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Student'}! 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Manage your academic and freelance projects, review incoming developer proposals, and book 1-on-1 mentorship sessions with industry leaders.
            </p>
          </div>

          {/* Profile Completion Bar */}
          <div className="w-full md:w-64 bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Profile Completion</span>
              <span className="text-white font-bold">{profileCompletion}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
            <Link
              to="/student/profile"
              className="text-[11px] text-indigo-300 hover:text-white flex items-center justify-between pt-1 transition"
            >
              <span>Update details</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Link
          to="/student/projects/new"
          className="p-4 bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-2xl shadow-xs transition group flex flex-col items-center text-center space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800">Post Project</span>
        </Link>

        <Link
          to="/student/find-projects"
          className="p-4 bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-2xl shadow-xs transition group flex flex-col items-center text-center space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800">Find Projects</span>
        </Link>

        <Link
          to="/student/mentors"
          className="p-4 bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-2xl shadow-xs transition group flex flex-col items-center text-center space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800">Find a Mentor</span>
        </Link>

        <Link
          to="/student/projects"
          className="p-4 bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-2xl shadow-xs transition group flex flex-col items-center text-center space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition">
            <FolderKanban className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800">My Projects</span>
        </Link>

        <Link
          to="/student/bookings"
          className="p-4 bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-2xl shadow-xs transition group flex flex-col items-center text-center space-y-2 col-span-2 sm:col-span-1"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800">My Bookings</span>
        </Link>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Posted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Posted Projects</span>
            <FolderKanban className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{projectStats.total || 0}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-emerald-600">{projectStats.open || 0} Open</span>
            <span>•</span>
            <span className="font-semibold text-blue-600">{projectStats.inProgress || 0} In Progress</span>
          </div>
        </div>

        {/* Proposals Received */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Proposals</span>
            <Briefcase className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{proposalStats.total || 0}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-amber-600">{proposalStats.pending || 0} Pending</span>
            <span>•</span>
            <span className="font-semibold text-emerald-600">{proposalStats.accepted || 0} Hired</span>
          </div>
        </div>

        {/* Active Mentorships */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Mentorship</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{bookingStats.upcoming || 0}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Upcoming Sessions</span>
          </div>
        </div>

        {/* Completed Projects */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{projectStats.completed || 0}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Successful Milestones</span>
          </div>
        </div>
      </div>

      {/* Main Split Grid: Upcoming Booking & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Upcoming Session Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Next Upcoming Mentor Session</h2>
            </div>
            <Link
              to="/student/bookings"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {upcomingBooking ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                {upcomingBooking.mentor?.profileImage ? (
                  <img
                    src={upcomingBooking.mentor.profileImage}
                    alt={upcomingBooking.mentor.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center">
                    {upcomingBooking.mentor?.name ? upcomingBooking.mentor.name.charAt(0).toUpperCase() : 'M'}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{upcomingBooking.mentor?.name}</h3>
                  <p className="text-xs text-slate-500">{upcomingBooking.topic}</p>
                  <div className="flex items-center space-x-3 text-xs text-indigo-600 font-medium mt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{new Date(upcomingBooking.date).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{upcomingBooking.startTime} - {upcomingBooking.endTime}</span>
                    </span>
                  </div>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                {upcomingBooking.status}
              </span>
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-600 font-medium">No upcoming mentor sessions scheduled.</p>
              <Link
                to="/student/mentors"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
              >
                <span>Book a Mentor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Recent Notifications Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Recent Updates</h2>
            </div>
            <Link
              to="/student/notifications"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-64">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-3 rounded-xl border text-xs space-y-1 transition ${
                    notif.isRead ? 'bg-white border-slate-100' : 'bg-indigo-50/50 border-indigo-100 font-medium'
                  }`}
                >
                  <p className="font-semibold text-slate-900">{notif.title}</p>
                  <p className="text-slate-600 text-[11px] line-clamp-2">{notif.message}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No notifications yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">My Posted Projects</h2>
            <p className="text-xs text-slate-500">Monitor active gigs and candidate proposals</p>
          </div>
          <Link
            to="/student/projects"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <span>All Projects</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentProjects.map((p) => (
              <div
                key={p._id}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition bg-slate-50/40 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{p.title}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                      p.status === 'open'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : p.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : p.status === 'completed'
                        ? 'bg-teal-50 text-teal-700 border-teal-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {p.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{p.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <span className="font-semibold text-slate-700">
                    ${p.budgetMin} - ${p.budgetMax} <span className="text-[10px] text-slate-400">({p.budgetType})</span>
                  </span>

                  <div className="flex items-center space-x-3">
                    <Link
                      to={`/student/projects/${p._id}/proposals`}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      {p.proposalCount || 0} Proposals
                    </Link>
                    <Link
                      to={`/student/projects/${p._id}`}
                      className="text-slate-500 hover:text-slate-900"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 space-y-3">
            <p className="text-sm text-slate-600">No projects posted yet.</p>
            <Link
              to="/student/projects/new"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Your First Project</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard
