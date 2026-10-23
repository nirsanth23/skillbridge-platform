import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Compass,
  DollarSign,
  ExternalLink,
  FolderGit2,
  Mail,
  User,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import freelancerService from '../../services/freelancer.service'

const FILTER_TABS = [
  { id: 'all', label: 'All Projects' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
]

export const ActiveProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const fetchActiveProjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (activeFilter !== 'all') {
        params.status = activeFilter
      }
      const res = await freelancerService.getActiveProjects(params)
      setProjects(res.data?.projects || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load active projects')
    } finally {
      setLoading(false)
    }
  }, [activeFilter])

  useEffect(() => {
    fetchActiveProjects()
  }, [fetchActiveProjects])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-semibold mb-2">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Project Engagements</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Active & Awarded Projects</h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage client deliverables, communication, and track milestones for your hired engagements.
            </p>
          </div>
          <Link
            to="/freelancer/find-projects"
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 shadow-2xs"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Opportunities</span>
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2 mt-6 pt-6 border-t border-slate-100">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeFilter === tab.id
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl p-8">
          <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No Awarded Projects</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {activeFilter === 'all'
              ? 'You have not been hired for any client projects yet. Submit strong proposals to win jobs!'
              : `You have no ${activeFilter.replace('_', ' ')} projects.`}
          </p>
          <Link
            to="/freelancer/find-projects"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl inline-flex items-center space-x-1.5 transition"
          >
            <Compass className="w-4 h-4" />
            <span>Browse Open Marketplace</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((proj) => (
            <div
              key={proj._id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4 hover:border-slate-300 transition"
            >
              {/* Header: Title & Status */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center space-x-2.5 mb-1.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        proj.status === 'in_progress'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {proj.status?.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-semibold">
                      {proj.category}
                    </span>
                  </div>
                  <Link
                    to={`/projects/${proj._id}`}
                    className="font-bold text-slate-900 hover:text-teal-600 text-lg transition truncate block"
                  >
                    {proj.title}
                  </Link>
                </div>

                {/* Contract Amount */}
                <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-2.5 self-start">
                  <span className="text-[10px] uppercase font-bold text-teal-700 block">
                    Agreed Budget
                  </span>
                  <span className="text-base font-extrabold text-teal-900">
                    ${proj.hiredProposal?.proposedBudget || proj.budgetMax || proj.budgetMin}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                {proj.description}
              </p>

              {/* Client Info & Metadata Strip */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Client Profile */}
                <div className="flex items-center space-x-3">
                  {proj.owner?.profileImage ? (
                    <img
                      src={proj.owner.profileImage}
                      alt={proj.owner.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-200 text-slate-700 font-bold rounded-full flex items-center justify-center text-sm">
                      {proj.owner?.name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Client
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {proj.owner?.name || 'Project Client'}
                    </h5>
                    {proj.owner?.email && (
                      <a
                        href={`mailto:${proj.owner.email}`}
                        className="text-[11px] text-teal-600 hover:underline flex items-center space-x-1"
                      >
                        <Mail className="w-3 h-3" />
                        <span>{proj.owner.email}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Project Timing / Deadlines */}
                <div className="flex items-center space-x-4 text-xs text-slate-500">
                  {proj.deadline && (
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Deadline: {new Date(proj.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  {proj.hiredProposal?.estimatedDuration && (
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Duration: {proj.hiredProposal.estimatedDuration}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-2 flex items-center justify-end">
                <Link
                  to={`/projects/${proj._id}`}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center space-x-1.5 transition"
                >
                  <span>View Project Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ActiveProjects
