import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import mentorService from '../../services/mentor.service'


export const MentorDiscovery = () => {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  // Search & Filter state
  const [search, setSearch] = useState('')
  const [expertise, setExpertise] = useState('')
  const [availability, setAvailability] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [page, setPage] = useState(1)

  const fetchMentors = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page,
        limit: 9,
        sortBy,
      }
      if (search.trim()) params.search = search.trim()
      if (expertise.trim()) params.expertise = expertise.trim()
      if (availability) params.availability = availability

      const res = await mentorService.getMentors(params)
      setMentors(res.data?.mentors || [])
      setPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch mentors')
    } finally {
      setLoading(false)
    }
  }, [page, sortBy, availability, search, expertise])

  useEffect(() => {
    fetchMentors()
  }, [fetchMentors])


  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchMentors()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Expert Mentorship</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Connect with Industry Mentors
          </h1>
          <p className="text-sm text-slate-300">
            Get personalized code reviews, career guidance, and live 1-on-1 strategy sessions from top engineers and domain specialists.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by mentor name, bio, or topics..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <input
              type="text"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="Filter by skill (e.g. React)"
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-full sm:w-44"
            />

            <select
              value={availability}
              onChange={(e) => {
                setAvailability(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">All Availability</option>
              <option value="available">Available Now</option>
              <option value="busy">Busy</option>
              <option value="not_available">Not Available</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="rating">Top Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="hourlyRate">Lowest Rate</option>
              <option value="createdAt">Newest Mentors</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition flex-shrink-0 cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Discovering verified mentors...</p>
        </div>
      ) : mentors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((profile) => {
            const userObj = profile.user || {}
            return (
              <div
                key={profile._id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition p-6 flex flex-col justify-between space-y-4"
              >
                {/* Mentor Card Top */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      {userObj.profileImage ? (
                        <img
                          src={userObj.profileImage}
                          alt={userObj.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-purple-600 text-white font-bold text-lg flex items-center justify-center">
                          {userObj.name ? userObj.name.charAt(0).toUpperCase() : 'M'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{userObj.name || 'Mentor'}</h3>
                        <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                          {userObj.isVerified && (
                            <span className="inline-flex items-center space-x-0.5 text-emerald-600 font-semibold">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Verified</span>
                            </span>
                          )}
                          <span>•</span>
                          <span>{profile.experienceYears || 0} yrs exp</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize border ${
                        profile.availability === 'available'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : profile.availability === 'busy'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {profile.availability || 'Available'}
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {profile.bio || 'Expert software mentor ready to accelerate your engineering journey.'}
                  </p>

                  {/* Expertise chips */}
                  {profile.expertise?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {profile.expertise.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer: Rating, Rate & Book Action */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{profile.rating ? profile.rating.toFixed(1) : '5.0'}</span>
                      <span className="text-slate-400 font-normal">({profile.reviewCount || 0})</span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-900">${profile.hourlyRate || 0}</span>
                      <span className="text-[10px] text-slate-400">/hr</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/student/mentors/${profile._id}`}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl text-center transition"
                    >
                      View Profile
                    </Link>
                    <Link
                      to={`/student/mentors/${profile._id}/book`}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl text-center shadow-2xs transition"
                    >
                      Book Session
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No mentors match your filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keyword or clearing the expertise filter to see more mentors.
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-slate-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="p-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default MentorDiscovery
