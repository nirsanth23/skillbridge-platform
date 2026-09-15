import {
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  FolderKanban,
  Plus,
  RotateCcw,
  Search,
  Tag,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProjectCard from '../../components/cards/ProjectCard'
import useAuth from '../../hooks/useAuth'
import projectService from '../../services/project.service'

const CREATOR_ROLES = ['student', 'client', 'company']

const CATEGORIES = [
  'All Categories',
  'Web Development',
  'Mobile App Development',
  'UI/UX Design',
  'Backend & APIs',
  'AI & Machine Learning',
  'Data Engineering',
  'Cloud & DevOps',
  'Cybersecurity',
  'Academic Mentorship & Research',
]

const BUDGET_TYPES = [
  { label: 'All Budgets', value: '' },
  { label: 'Fixed Price', value: 'fixed' },
  { label: 'Hourly Rate', value: 'hourly' },
]

export const Projects = () => {
  const { user } = useAuth()

  // Filter States
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [budgetType, setBudgetType] = useState('')
  const [skills, setSkills] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const limit = 9

  // Data States
  const [projects, setProjects] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const canCreate = user && CREATOR_ROLES.includes(user.role)

  const fetchProjects = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page,
        limit,
        sort,
      }
      if (search.trim()) params.search = search.trim()
      if (category && category !== 'All Categories') params.category = category
      if (budgetType) params.budgetType = budgetType
      if (skills.trim()) params.skills = skills.trim()

      const res = await projectService.getProjects(params)
      setProjects(res.data.projects || [])
      setTotal(res.data.total || 0)
      setTotalPages(res.data.totalPages || 1)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch marketplace projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, budgetType, sort, page])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchProjects()
  }

  const handleResetFilters = () => {
    setSearch('')
    setCategory('')
    setBudgetType('')
    setSkills('')
    setSort('newest')
    setPage(1)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold border border-white/10">
              <Compass className="w-3.5 h-3.5 text-indigo-300" />
              <span>Explore Marketplace Opportunities</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Discover &amp; Collaborate on Projects
            </h1>
            <p className="text-sm text-indigo-100/90 leading-relaxed max-w-2xl">
              Browse verified development gigs, open student projects, and enterprise freelance contracts. Filter by skill stack, pricing models, and categories.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 relative z-10">
            {canCreate && (
              <Link
                to="/projects/create"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl text-xs font-bold shadow-sm transition"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Post a Project</span>
              </Link>
            )}

            <Link
              to="/my-projects"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition"
            >
              <FolderKanban className="w-4 h-4 text-indigo-200" />
              <span>My Projects</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Controls Bar */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects by title, description or keywords..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Skills keyword filter */}
            <div className="relative sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Tag className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Filter by skills (e.g. React, Node)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
            >
              Search
            </button>
          </form>

          {/* Filter Dropdowns Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Dropdown */}
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-slate-600">Category:</span>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    setPage(1)
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget Type Selector */}
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-slate-600">Budget:</span>
                <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                  {BUDGET_TYPES.map((bt) => (
                    <button
                      key={bt.value}
                      type="button"
                      onClick={() => {
                        setBudgetType(bt.value)
                        setPage(1)
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        budgetType === bt.value
                          ? 'bg-white text-indigo-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {bt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Sort selector */}
              <div className="flex items-center space-x-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-600">Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value)
                    setPage(1)
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              {/* Reset button */}
              {(search || category || budgetType || skills || sort !== 'newest') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center space-x-1 text-slate-500 hover:text-indigo-600 transition"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Global Feedback */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Total Count Info */}
        {!loading && (
          <div className="flex justify-between items-center text-xs font-medium text-slate-500 px-1">
            <span>
              Showing {projects.length} of {total} open project{total !== 1 ? 's' : ''}
            </span>
            <span>
              Page {page} of {totalPages}
            </span>
          </div>
        )}

        {/* Projects Cards Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-xs font-medium text-slate-500">Discovering marketplace projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <div className="max-w-sm mx-auto">
              <h3 className="text-base font-bold text-slate-900">No projects found</h3>
              <p className="mt-1 text-xs text-slate-500">
                Try changing your search keywords or clearing selected filters to find available projects.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const isOwner = user?.id && (project.owner?._id === user.id || project.owner === user.id)
              return (
                <ProjectCard
                  key={project._id}
                  project={project}
                  isOwner={isOwner}
                />
              )
            })}
          </div>
        )}

        {/* Server-Side Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 pt-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="inline-flex items-center space-x-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setPage(pageNum)}
                className={`w-9 h-9 rounded-xl text-xs font-semibold transition border ${
                  page === pageNum
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="inline-flex items-center space-x-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Projects
