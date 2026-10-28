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
      if (res.data?.pagination) {
        setPagination(res.data.pagination)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search freelancers')
    } finally {
      setLoading(false)
    }
  }, [search, skills, availability, sortOption, page])

  useEffect(() => {
    fetchFreelancers()
  }, [fetchFreelancers])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchFreelancers()
  }

  const handleResetFilters = () => {
    setSearch('')
    setSkills('')
    setAvailability('')
    setSortOption('rating:desc')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Discover Freelance Talent</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Explore verified professionals, evaluate skills, and invite candidates to your projects.
          </p>
        </div>

        <Link
          to="/client/projects/new"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Briefcase className="w-4 h-4" />
          <span>Post a Job for Freelancers</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or bio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Skills Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Skills (e.g. React, Node, Python)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Availability */}
          <select
            value={availability}
            onChange={(e) => {
              setAvailability(e.target.value)
              setPage(1)
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            {AVAILABILITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value)
              setPage(1)
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </form>

        {(search || skills || availability || sortOption !== 'rating:desc') && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">Active filters applied</span>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Freelancers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : freelancers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Freelancers Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria, skill keywords, or availability filters to find matching talent.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {freelancers.map((profile) => {
            const user = profile.user || {}
            return (
              <div
                key={profile._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 hover:shadow-xs transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top snapshot */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                          {user.name?.charAt(0) || 'F'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h3 className="text-sm font-bold text-slate-900 leading-tight">
                            {user.name || 'Freelancer'}
                          </h3>
                          {user.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-emerald-500" title="Verified" />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-blue-600">
                          ${profile.hourlyRate || 0}/hr
                        </p>
                      </div>
                    </div>

                    {/* Availability tag */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        profile.availability === 'available'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : profile.availability === 'busy'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {profile.availability === 'available' ? 'Available' : profile.availability || 'Available'}
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {profile.bio || 'Experienced professional ready to contribute to impactful projects.'}
                  </p>

                  {/* Skills badges */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {profile.skills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {profile.skills.length > 4 && (
                        <span className="px-1.5 py-0.5 text-slate-400 text-[10px]">
                          +{profile.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Rating & Action Card Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <div className="flex items-center space-x-1 text-amber-500 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>
                        {profile.rating > 0 ? profile.rating.toFixed(1) : 'New'}
                      </span>
                      <span className="text-slate-400">({profile.reviewCount || 0})</span>
                    </div>
                    <span>•</span>
                    <span>{profile.experienceYears || 0} yrs exp</span>
                  </div>

                  <Link
                    to={`/client/freelancers/${profile._id}`}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition"
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
