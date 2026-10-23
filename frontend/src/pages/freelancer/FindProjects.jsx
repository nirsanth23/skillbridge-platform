import {
  AlertCircle,
  Briefcase,
  Calendar,
  Clock,
  Compass,
  DollarSign,
  ExternalLink,
  Filter,
  Search,
  Send,
  Sparkles,
  Tag,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SubmitProposalModal from '../../components/forms/SubmitProposalModal'
import projectService from '../../services/project.service'

const CATEGORIES = [
  'All Categories',
  'Web Development',
  'Mobile App Development',
  'Frontend Development',
  'Backend Development',
  'UI/UX Design',
  'Data Science & AI',
  'DevOps & Cloud',
]

export const FindProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedProjectForProposal, setSelectedProjectForProposal] = useState(null)

  // Filters state
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All Categories')
  const [budgetType, setBudgetType] = useState('')
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 })

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        status: 'open',
        page,
        limit: 9,
      }
      if (search.trim()) params.search = search.trim()
      if (category && category !== 'All Categories') params.category = category
      if (budgetType) params.budgetType = budgetType
      if (minBudget) params.minBudget = minBudget
      if (maxBudget) params.maxBudget = maxBudget

      const res = await projectService.getProjects(params)
      // res.data can be array or { projects, pagination }
      if (Array.isArray(res.data)) {
        setProjects(res.data)
        setPagination({ totalPages: 1, total: res.data.length })
      } else if (res.data?.projects) {
        setProjects(res.data.projects)
        setPagination(res.data.pagination || { totalPages: 1, total: res.data.projects.length })
      } else {
        setProjects([])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [search, category, budgetType, minBudget, maxBudget, page])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchProjects])

  const handleResetFilters = () => {
    setSearch('')
    setCategory('All Categories')
    setBudgetType('')
    setMinBudget('')
    setMaxBudget('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Project Marketplace</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Explore Open Projects</h1>
            <p className="text-sm text-slate-600 mt-1">
              Browse vetted freelance opportunities from clients and companies. Filter by skills, budget, and category.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{projects.length}</strong> available projects
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-6 border-t border-slate-100">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search title, skills..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                setPage(1)
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Type */}
          <div>
            <select
              value={budgetType}
              onChange={(e) => {
                setBudgetType(e.target.value)
                setPage(1)
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="">All Budget Types</option>
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly Rate</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="text-slate-400 absolute left-3 top-2.5 text-xs">$</span>
              <input
                type="number"
                placeholder="Min $"
                value={minBudget}
                onChange={(e) => {
                  setMinBudget(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-6 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <button
              onClick={handleResetFilters}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center space-x-1"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl p-8">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No Projects Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search criteria, category filters, or budget ranges.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj._id}
              className="bg-white border border-slate-200 hover:border-teal-300 rounded-2xl p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                {/* Category & Budget Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-semibold truncate max-w-[150px]">
                    {proj.category || 'General'}
                  </span>
                  <span className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg text-xs font-bold">
                    ${proj.budgetMin} - ${proj.budgetMax}
                    <span className="text-[10px] font-medium text-teal-600 uppercase ml-1">
                      {proj.budgetType === 'hourly' ? '/hr' : 'fixed'}
                    </span>
                  </span>
                </div>

                {/* Title */}
                <Link
                  to={`/projects/${proj._id}`}
                  className="font-bold text-slate-900 hover:text-teal-600 text-base line-clamp-1 transition block"
                >
                  {proj.title}
                </Link>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {proj.description}
                </p>

                {/* Skills tags */}
                {proj.skills && proj.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {proj.skills.slice(0, 4).map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-medium rounded-md"
                      >
                        {s}
                      </span>
                    ))}
                    {proj.skills.length > 4 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{proj.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{new Date(proj.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/projects/${proj._id}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => setSelectedProjectForProposal(proj)}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center space-x-1 shadow-2xs"
                  >
                    <Send className="w-3 h-3" />
                    <span>Apply</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Proposal Submission Modal */}
      {selectedProjectForProposal && (
        <SubmitProposalModal
          project={selectedProjectForProposal}
          isOpen={Boolean(selectedProjectForProposal)}
          onClose={() => setSelectedProjectForProposal(null)}
          onSuccess={() => {
            fetchProjects()
          }}
        />
      )}
    </div>
  )
}

export default FindProjects
