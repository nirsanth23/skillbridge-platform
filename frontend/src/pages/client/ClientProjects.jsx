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

export const ClientProjects = () => {
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
      setError(err.response?.data?.message || 'Failed to fetch client projects')
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
            <Briefcase className="w-6 h-6 text-blue-600" />
            <span>My Projects</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your project listings, review submitted proposals, and track active engagements.
          </p>
        </div>

        <Link
          to="/client/projects/new"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Post a Project</span>
        </Link>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-700 text-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedStatus(filter.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedStatus === filter.value
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Projects Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {selectedStatus
              ? `You do not have any projects with "${selectedStatus}" status.`
              : 'You have not posted any projects yet. Click the button below to get started.'}
          </p>
          <Link
            to="/client/projects/new"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Project</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      project.status === 'open'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : project.status === 'in_progress'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : project.status === 'completed'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {project.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400 capitalize">{project.category}</span>
                </div>

                <Link
                  to={`/client/projects/${project._id}`}
                  className="text-lg font-bold text-slate-900 hover:text-blue-600 transition block line-clamp-1"
                >
                  {project.title}
                </Link>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>

                {/* Skills tags */}
                {project.skills && project.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.skills.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {project.skills.length > 4 && (
                      <span className="px-1.5 py-0.5 text-slate-400 text-[10px]">
                        +{project.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Card Controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400">Budget: </span>
                  <span className="font-bold text-slate-900">${project.budgetMin} - ${project.budgetMax}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <Link
                    to={`/client/projects/${project._id}/proposals`}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                    title="Review Proposals"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Proposals</span>
                  </Link>

                  <Link
                    to={`/client/projects/${project._id}`}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition"
                    title="View Project"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {['draft', 'open'].includes(project.status) && (
                    <Link
                      to={`/client/projects/${project._id}/edit`}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition"
                      title="Edit Project"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                  )}

                  {project.status === 'open' && (
                    <button
                      onClick={() => handleCancelProject(project._id)}
                      disabled={actionLoading}
                      className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition"
                      title="Cancel Project"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}

                  {['draft', 'cancelled'].includes(project.status) && (
                    <button
                      onClick={() => handleDeleteProject(project._id)}
                      disabled={actionLoading}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ClientProjects
