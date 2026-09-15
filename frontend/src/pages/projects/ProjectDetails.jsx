import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit3,
  Send,
  ShieldCheck,
  Tag,
  Trash2,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import projectService from '../../services/project.service'

const STATUS_BADGES = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-purple-50 text-purple-700 border-purple-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
}

export const ProjectDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [applyClicked, setApplyClicked] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await projectService.getProjectById(id)
        setProject(res.data.project)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load project details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProject()
    }
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete or cancel this project?')) {
      return
    }

    setDeleting(true)
    setError('')
    try {
      await projectService.deleteProject(id)
      setSuccess('Project deleted successfully')
      setTimeout(() => {
        navigate('/projects')
      }, 1000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project')
      setDeleting(false)
    }
  }

  const formatBudget = () => {
    if (!project) return ''
    const isHourly = project.budgetType === 'hourly'
    const suffix = isHourly ? '/hr' : ''

    if (project.budgetMin > 0 && project.budgetMax > 0) {
      if (project.budgetMin === project.budgetMax) {
        return `$${project.budgetMin}${suffix}`
      }
      return `$${project.budgetMin} - $${project.budgetMax}${suffix}`
    }

    if (project.budgetMin > 0) {
      return `From $${project.budgetMin}${suffix}`
    }

    if (project.budgetMax > 0) {
      return `Up to $${project.budgetMax}${suffix}`
    }

    return 'Negotiable'
  }

  const formatDeadline = (dateStr) => {
    if (!dateStr) return 'Flexible deadline'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-slate-500">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Project Not Found</h2>
          <p className="text-sm text-slate-600">
            {error || 'The requested project could not be found or has been removed.'}
          </p>
          <div className="pt-2">
            <Link
              to="/projects"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const ownerId = project.owner?._id || project.owner
  const isOwner = ownerId && user?.id && ownerId.toString() === user.id.toString()
  const statusClass = STATUS_BADGES[project.status] || STATUS_BADGES.open

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/projects"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </Link>

          {isOwner && (
            <div className="flex items-center space-x-2">
              <Link
                to={`/projects/${project._id}/edit`}
                className="inline-flex items-center space-x-1 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Project</span>
              </Link>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center space-x-1 px-3.5 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          )}
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

        {/* Main Project Details Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main Details (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusClass}`}
                  >
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {project.projectType === 'company' ? (
                      <>
                        <Building2 className="w-3 h-3" />
                        <span>Company Project</span>
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3" />
                        <span>Individual Project</span>
                      </>
                    )}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center space-x-1 ml-auto">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Posted{' '}
                      {new Date(project.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                  {project.title}
                </h1>

                <div className="mt-2 flex items-center space-x-1.5 text-xs font-semibold text-indigo-600">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{project.category}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Project Description &amp; Scope
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              {project.skills && project.skills.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    Required Skills &amp; Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar (1 col): Budget, Timeline, Poster Card & Apply CTA */}
          <div className="space-y-6">
            {/* Budget & Timeline Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Project Overview
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {project.budgetType === 'hourly' ? 'Hourly Rate' : 'Total Budget'}
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-0.5 flex items-center space-x-1">
                    <DollarSign className="w-5 h-5 text-emerald-600 -ml-1" />
                    <span>{formatBudget()}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Target Deadline
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>{formatDeadline(project.deadline)}</span>
                  </div>
                </div>
              </div>

              {/* Apply / Proposal Placeholder Button */}
              {!isOwner && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    onClick={() => setApplyClicked(true)}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>Apply for Project</span>
                  </button>

                  {applyClicked && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl text-xs space-y-1">
                      <p className="font-semibold">⚡ Proposal Submissions Coming in Day 8</p>
                      <p className="text-indigo-600">
                        The full proposal bidding and proposal submission module will be unlocked in Day 8.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Poster / Owner Safe Card */}
            {project.owner && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Posted By
                </h3>

                <div className="flex items-center space-x-3.5">
                  {project.owner.profileImage ? (
                    <img
                      src={project.owner.profileImage}
                      alt={project.owner.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center">
                      {project.owner.name ? project.owner.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-sm font-bold text-slate-900">{project.owner.name}</h4>
                      {project.owner.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600" title="Verified Client" />
                      )}
                    </div>
                    <span className="inline-block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      {project.owner.role}
                    </span>
                  </div>
                </div>

                {project.owner.isVerified && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Client Account</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetails
