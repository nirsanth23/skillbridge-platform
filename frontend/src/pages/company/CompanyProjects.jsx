import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Edit3,
  Eye,
  FileText,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import projectService from '../../services/project.service'

const STATUS_FILTERS = [
  { label: 'All Projects', value: '' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Draft', value: 'draft' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export const CompanyProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = selectedStatus ? { status: selectedStatus } : {}
      const res = await projectService.getMyProjects(params)
      setProjects(res.data?.projects || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch company projects')
    } finally {
      setLoading(false)
    }
  }, [selectedStatus])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleCancelProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to cancel this project?')) {
      return
    }

    setActionLoading(true)
    setError('')
    try {
      await projectService.updateProject(projectId, { status: 'cancelled' })
      setSuccess('Project status changed to cancelled.')
      await fetchProjects()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel project')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to permanently delete this project? This cannot be undone.')) {
      return
    }

    setActionLoading(true)
    setError('')
    try {
      await projectService.deleteProject(projectId)
      setSuccess('Project removed successfully.')
      setProjects((prev) => prev.filter((p) => p._id !== projectId))
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2.5">
            <Briefcase className="w-6 h-6 text-violet-600" />
            <span>Company Projects</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your company listings, review incoming proposals, and track active engagements.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/company/find-projects"
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            Explore Market
          </Link>
          <Link
            to="/company/projects/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Project</span>
          </Link>
        </div>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-700 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setSelectedStatus(f.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedStatus === f.value
                ? 'bg-violet-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-3xl flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No projects found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {selectedStatus
              ? `There are no projects currently marked with status "${selectedStatus}".`
              : 'You have not created any projects yet. Post your first project to start receiving bids from top freelancers.'}
          </p>
          <div className="pt-2">
            <Link
              to="/company/projects/new"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project Listing</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const statusConfig = {
              open: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Open for Bids' },
              in_progress: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'In Progress' },
              completed: { bg: 'bg-teal-50 text-teal-700 border-teal-200', label: 'Completed' },
              draft: { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Draft' },
              cancelled: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Cancelled' },
            }[project.status] || { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: project.status }

            const isEligibleToEdit = ['draft', 'open'].includes(project.status)
            const isEligibleToCancel = ['draft', 'open'].includes(project.status)

            return (
              <div
                key={project._id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-violet-200 p-6 shadow-2xs hover:shadow-xs transition space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusConfig.bg}`}>
                        {statusConfig.label}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {project.category || 'General'}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400">
                        Posted {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <Link
                      to={`/company/projects/${project._id}`}
                      className="text-lg font-bold text-slate-900 hover:text-violet-600 transition block truncate"
                    >
                      {project.title}
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-2">{project.description}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-right min-w-[140px]">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Budget Range</span>
                      <span className="text-sm font-extrabold text-slate-900">
                        ${project.budgetMin?.toLocaleString()} - ${project.budgetMax?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skills tags and Project details */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {project.skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/company/projects/${project._id}/proposals`}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl text-xs font-bold transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Review Proposals</span>
                    </Link>

                    <Link
                      to={`/company/projects/${project._id}`}
                      className="inline-flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </Link>

                    {isEligibleToEdit && (
                      <Link
                        to={`/company/projects/${project._id}/edit`}
                        className="inline-flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                    )}

                    {isEligibleToCancel && (
                      <button
                        onClick={() => handleCancelProject(project._id)}
                        disabled={actionLoading}
                        className="inline-flex items-center space-x-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                        title="Cancel Project"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}

                    {project.status === 'draft' && (
                      <button
                        onClick={() => handleDeleteProject(project._id)}
                        disabled={actionLoading}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                        title="Delete Draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CompanyProjects
