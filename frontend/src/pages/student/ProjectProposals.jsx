import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  ShieldCheck,
  User as UserIcon,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import proposalService from '../../services/proposal.service'

export const ProjectProposals = () => {
  const { id: projectId } = useParams()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Modal confirmation states
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [actionType, setActionType] = useState(null) // 'accept' | 'reject'
  const [actionLoading, setActionLoading] = useState(false)

  const fetchProposals = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      let res
      if (projectId) {
        res = await proposalService.getProjectProposals(projectId)
      } else {
        res = await proposalService.getMyProjectsProposals()
      }
      setProposals(res.data?.proposals || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project proposals')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])


  const handleConfirmAction = async () => {
    if (!selectedProposal || !actionType) return

    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      if (actionType === 'accept') {
        await proposalService.acceptProposal(selectedProposal._id)
        setSuccess(`Successfully hired ${selectedProposal.freelancer?.name || 'freelancer'}!`)
      } else if (actionType === 'reject') {
        await proposalService.rejectProposal(selectedProposal._id)
        setSuccess('Proposal rejected.')
      }
      setSelectedProposal(null)
      setActionType(null)
      await fetchProposals()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${actionType} proposal`)
    } finally {
      setActionLoading(false)
    }
  }

  const filteredProposals = proposals.filter((p) => {
    if (activeTab === 'pending') return p.status === 'pending'
    if (activeTab === 'accepted') return p.status === 'accepted'
    if (activeTab === 'rejected') return p.status === 'rejected'
    return true
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {projectId && (
            <Link
              to="/student/projects"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to My Projects</span>
            </Link>
          )}
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Briefcase className="w-6 h-6 text-indigo-600" />
            <span>{projectId ? 'Project Proposals & Hiring' : 'All Received Proposals'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review freelancer bids, verify qualifications, and award project contracts.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          {['all', 'pending', 'accepted', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
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

      {/* Loading State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Fetching candidate proposals...</p>
        </div>
      ) : filteredProposals.length > 0 ? (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => {
            const freelancer = proposal.freelancer || {}
            const isAccepted = proposal.status === 'accepted'
            const isPending = proposal.status === 'pending'
            const isRejected = proposal.status === 'rejected'

            return (
              <div
                key={proposal._id}
                className={`bg-white rounded-2xl border p-6 transition shadow-xs space-y-4 ${
                  isAccepted
                    ? 'border-emerald-300 ring-2 ring-emerald-100'
                    : 'border-slate-200 hover:border-indigo-200'
                }`}
              >
                {/* Proposal Top Meta */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    {freelancer.profileImage ? (
                      <img
                        src={freelancer.profileImage}
                        alt={freelancer.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-lg flex items-center justify-center">
                        {freelancer.name ? freelancer.name.charAt(0).toUpperCase() : 'F'}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-slate-900">{freelancer.name || 'Freelancer'}</h3>
                        {freelancer.isVerified && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 uppercase">
                          {freelancer.role || 'Freelancer'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Submitted {new Date(proposal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {proposal.project?.title && ` on "${proposal.project.title}"`}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isAccepted && (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Hired Candidate</span>
                      </span>
                    )}
                    {isPending && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Under Review
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Offer Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Proposed Bid</p>
                      <p className="font-bold text-slate-900">${proposal.proposedBudget}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Estimated Timeline</p>
                      <p className="font-bold text-slate-900">{proposal.estimatedDuration}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 col-span-2 sm:col-span-1">
                    <UserIcon className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Freelancer Contact</p>
                      <p className="font-semibold text-slate-700 truncate">{freelancer.email || 'Private'}</p>
                    </div>
                  </div>
                </div>

                {/* Cover Letter Content */}
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Cover Letter</p>
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/30 p-3.5 rounded-xl border border-slate-100">
                    {proposal.coverLetter}
                  </p>
                </div>

                {/* Owner Actions */}
                {isPending && (
                  <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedProposal(proposal)
                        setActionType('reject')
                      }}
                      className="px-4 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      Decline Proposal
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProposal(proposal)
                        setActionType('accept')
                      }}
                      className="inline-flex items-center space-x-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept &amp; Hire</span>
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No proposals received yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When freelancers submit bids on your project, their proposals and portfolio submissions will appear here.
          </p>
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  actionType === 'accept'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-rose-100 text-rose-600'
                }`}
              >
                {actionType === 'accept' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {actionType === 'accept' ? 'Hire Freelancer' : 'Decline Proposal'}
                </h3>
                <p className="text-xs text-slate-500">
                  Candidate: <span className="font-semibold text-slate-800">{selectedProposal.freelancer?.name}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {actionType === 'accept'
                ? `Are you sure you want to hire this freelancer for $${selectedProposal.proposedBudget}? This will set the project status to "In Progress" and decline other pending proposals.`
                : 'Are you sure you want to decline this candidate proposal? This action cannot be undone.'}
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedProposal(null)
                  setActionType(null)
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className={`px-5 py-2 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer ${
                  actionType === 'accept'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoading ? 'Processing...' : actionType === 'accept' ? 'Confirm & Hire' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectProposals
