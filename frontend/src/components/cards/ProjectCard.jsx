import {
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Edit3,
  ExternalLink,
  Tag,
  Trash2,
  User,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const STATUS_BADGES = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-purple-50 text-purple-700 border-purple-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
}

export const ProjectCard = ({ project, onDelete, isOwner = true }) => {
  const formatBudget = () => {
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
    return `Due ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  const statusClass = STATUS_BADGES[project.status] || STATUS_BADGES.open

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-slate-300 transition group">
      <div>
        {/* Header: Status and Type */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusClass}`}
            >
              {project.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {project.projectType === 'company' ? (
                <>
                  <Building2 className="w-3 h-3" />
                  <span>Company</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3" />
                  <span>Individual</span>
                </>
              )}
            </span>
          </div>

          <span className="text-xs text-slate-600 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-slate-600" />
            <span>
              {new Date(project.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </span>
        </div>

        {/* Title */}
        <Link
          to={`/projects/${project._id}`}
          className="block group-hover:text-indigo-600 transition"
        >
          <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-1">
            {project.title}
          </h3>
        </Link>

        {/* Category */}
        <div className="mt-1 flex items-center space-x-1 text-xs font-medium text-indigo-600">
          <Tag className="w-3 h-3" />
          <span>{project.category}</span>
        </div>

        {/* Description snippet */}
        <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Skills Tag list */}
        {project.skills && project.skills.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {project.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium border border-slate-200"
              >
                {skill}
              </span>
            ))}
            {project.skills.length > 4 && (
              <span className="px-2 py-0.5 text-slate-600 text-[11px] font-medium">
                +{project.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-sm font-bold text-slate-900 flex items-center space-x-1">
            <DollarSign className="w-4 h-4 text-emerald-600 -ml-0.5" />
            <span>{formatBudget()}</span>
          </div>
          <div className="text-[11px] text-slate-600 flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-slate-600" />
            <span>{formatDeadline(project.deadline)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={`/projects/${project._id}`}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
            title="View Details"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>

          {isOwner && (
            <>
              <Link
                to={`/projects/${project._id}/edit`}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Edit Project"
              >
                <Edit3 className="w-4 h-4" />
              </Link>

              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(project._id)}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete/Cancel Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectCard
