import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Compass,
  Filter,
  FolderPlus,
  Plus,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProjectCard from '../../components/cards/ProjectCard'
import useAuth from '../../hooks/useAuth'
import projectService from '../../services/project.service'

const CREATOR_ROLES = ['student', 'client', 'company']

const STATUS_FILTERS = [
  { label: 'All My Projects', value: '' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Draft', value: 'draft' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export const MyProjects = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  const canCreate = user && CREATOR_ROLES.includes(user.role)

  const fetchMyProjects = async (status = selectedStatus) => {
    setLoading(true)
    setError('')
    try {
      const params = status ? { status } : {}
      const res = await projectService.getMyProjects(params)
      setProjects(res.data.projects || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyProjects(selectedStatus)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus])

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete or cancel this project posting?')) {
      return
    }

    setError('')
    try {
      await projectService.deleteProject(projectId)
      setSuccess('Project deleted successfully')
      setProjects((prev) => prev.filter((p) => p._id !== projectId))
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">My Posted Projects</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage lifecycle, edits, and status of projects you have published
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/projects"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Explore Marketplace</span>
            </Link>

            {canCreate && (
              <Link
                to="/projects/create"
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Post Project</span>
              </Link>
            )}
          </div>
        </div>

        {/* Feedback alerts */}
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

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
          {STATUS_FILTERS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                selectedStatus === tab.value
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Projects List / Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-xs font-medium text-slate-500">Loading your projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
              <FolderPlus className="w-8 h-8" />
            </div>
            <div className="max-w-sm mx-auto">
              <h3 className="text-base font-bold text-slate-900">
                You haven't created any projects yet.
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Post a new project to connect with skilled freelancers and mentors on SkillBridge.
              </p>
            </div>
            {canCreate && (
              <div className="pt-2">
                <Link
                  to="/projects/create"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Your First Project</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onDelete={handleDelete}
                isOwner={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyProjects
