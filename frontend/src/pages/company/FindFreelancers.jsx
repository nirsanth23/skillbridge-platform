import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Filter,
  Search,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import freelancerService from '../../services/freelancer.service'

const AVAILABILITY_OPTIONS = [
  { value: '', label: 'All Availability' },
  { value: 'available', label: 'Available Now' },
  { value: 'busy', label: 'Busy' },
  { value: 'not_available', label: 'Not Available' },
]

const SORT_OPTIONS = [
  { value: 'rating:desc', label: 'Highest Rated' },
  { value: 'hourlyRate:asc', label: 'Hourly Rate: Low to High' },
  { value: 'hourlyRate:desc', label: 'Hourly Rate: High to Low' },
  { value: 'experienceYears:desc', label: 'Most Experienced' },
  { value: 'createdAt:desc', label: 'Newest Members' },
]

export const FindFreelancers = () => {
  const [freelancers, setFreelancers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  // Filters state
  const [search, setSearch] = useState('')
  const [skills, setSkills] = useState('')
  const [availability, setAvailability] = useState('')
  const [sortOption, setSortOption] = useState('rating:desc')
  const [page, setPage] = useState(1)

  const fetchFreelancers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [sortBy, sortOrder] = sortOption.split(':')
      const params = {
        page,
        limit: 9,
        sortBy,
        sortOrder,
      }
      if (search.trim()) params.search = search.trim()
      if (skills.trim()) params.skills = skills.trim()
      if (availability) params.availability = availability

      const res = await freelancerService.getFreelancers(params)
      setFreelancers(res.data?.freelancers || [])
      setPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to discover freelancers')
    } finally {
      setLoading(false)
    }
  }, [page, sortOption, availability, search, skills])

  useEffect(() => {
    fetchFreelancers()
  }, [fetchFreelancers])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchFreelancers()
  }

  const handleClearFilters = () => {
    setSearch('')
    setSkills('')
    setAvailability('')
    setSortOption('rating:desc')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-800 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-200 border border-violet-500/30">
            <Users className="w-3.5 h-3.5" />
            <span>Freelancer Discovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Discover & Hire Top Freelance Talent
          </h1>
          <p className="text-xs sm:text-sm text-violet-200">
            Connect with verified software engineers, designers, and specialists ready to work on your company projects.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keywords, skills, bio..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Skills (e.g. React, Node, Python)"
              className="w-full sm:w-56 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            />

            <select
              value={availability}
              onChange={(e) => {
                setAvailability(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            >
              {AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              Search
            </button>
          </div>
        </form>

        {(search || skills || availability) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Showing results for active filters • {pagination.total} talent found
            </span>
            <button
              onClick={handleClearFilters}
              className="text-violet-600 hover:text-violet-800 font-semibold"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Freelancers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : freelancers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No freelancers matched your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms, removing specific skill tags, or clearing availability filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freelancers.map((profile) => {
            const userObj = profile.user || {}
            const availabilityBadge = {
              available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              busy: 'bg-amber-50 text-amber-700 border-amber-200',
              not_available: 'bg-slate-100 text-slate-600 border-slate-200',
            }[profile.availability] || 'bg-slate-100 text-slate-600 border-slate-200'

            return (
              <div
                key={profile._id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-violet-300 shadow-2xs hover:shadow-xs transition p-6 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-4">
                  {/* Top Freelancer Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      {userObj.profileImage ? (
                        <img
                          src={userObj.profileImage}
                          alt={userObj.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-base">
                          {userObj.name?.charAt(0)?.toUpperCase() || 'F'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h3 className="font-bold text-sm text-slate-900 group-hover:text-violet-600 transition truncate">
                            {userObj.name || 'Freelancer'}
                          </h3>
                          {userObj.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          )}
                        </div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border mt-1 ${availabilityBadge}`}>
                          {profile.availability?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-900">
                        ${profile.hourlyRate || 0}
                      </span>
                      <span className="text-[10px] text-slate-400 block">/ hour</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {profile.bio || 'Experienced software professional specializing in modern tech stacks.'}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1">
                    {profile.skills?.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {profile.skills?.length > 4 && (
                      <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded-md text-[10px] font-medium">
                        +{profile.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer metrics and Profile Link */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span className="font-bold text-slate-800">
                        {profile.rating > 0 ? profile.rating.toFixed(1) : 'New'}
                      </span>
                      <span className="text-slate-400">({profile.reviewCount || 0})</span>
                    </div>
                    <span>•</span>
                    <span>{profile.experienceYears || 0} yrs exp</span>
                  </div>

                  <Link
                    to={`/company/freelancers/${profile._id}`}
                    className="px-3.5 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl text-xs font-bold transition"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-5 py-3 shadow-2xs">
          <span className="text-xs text-slate-500">
            Page <span className="font-semibold text-slate-800">{pagination.page}</span> of{' '}
            <span className="font-semibold text-slate-800">{pagination.pages}</span> ({pagination.total} total)
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={pagination.page >= pagination.pages}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FindFreelancers
