import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  User as UserIcon,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import proposalService from '../../services/proposal.service'

export const CompanyProjectProposals = () => {
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
        setSuccess(`Successfully hired ${selectedProposal.freelancer?.name || 'freelancer'}! The project is now in progress.`)
      } else if (actionType === 'reject') {
        await proposalService.rejectProposal(selectedProposal._id)
        setSuccess('Proposal has been rejected.')
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

  const acceptedProposal = proposals.find((p) => p.status === 'accepted')

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          {projectId && (
            <Link
              to="/company/projects"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-violet-600 hover:text-violet-800 mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Company Projects</span>
            </Link>
          )}
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2.5">
            <Briefcase className="w-6 h-6 text-violet-600" />
            <span>{projectId ? 'Project Proposals & Hiring' : 'All Received Proposals'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review candidate cover letters, compare quotes, and hire talent securely.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/company/freelancers"
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            Browse All Freelancers
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

      {/* Hired Freelancer Banner if project accepted */}
      {acceptedProposal && (
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200 block">
                Contract In Progress
              </span>
              <h3 className="text-lg font-bold">
                Hired Freelancer: {acceptedProposal.freelancer?.name || 'Talent'}
              </h3>
              <p className="text-xs text-emerald-100">
                Agreed Budget: ${acceptedProposal.proposedBudget?.toLocaleString()} • Duration: {acceptedProposal.estimatedDuration}
              </p>
            </div>
          </div>
          <Link
            to={`/company/freelancers/${acceptedProposal.freelancer?._id}`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white text-emerald-800 rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-50 transition self-start sm:self-center"
          >
            <span>View Public Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        {['all', 'pending', 'accepted', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition ${
              activeTab === tab
                ? 'bg-violet-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab}
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
              {tab === 'all'
                ? proposals.length
                : proposals.filter((p) => p.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Proposals List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mx-auto">
            <UserIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No proposals found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'all'
              ? 'No proposals have been submitted for this project yet.'
              : `There are currently no proposals in "${activeTab}" status.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => {
            const statusConfig = {
              pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending Review' },
              accepted: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Hired' },
              rejected: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Rejected' },
            }[proposal.status] || { bg: 'bg-slate-100 text-slate-700', label: proposal.status }

            const freelancer = proposal.freelancer || {}
            const isEligibleToDecide = proposal.status === 'pending' && !acceptedProposal

            return (
              <div
                key={proposal._id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-violet-200 p-6 shadow-2xs transition space-y-4"
              >
                {/* Header: Freelancer snapshot and proposal status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    {freelancer.profileImage ? (
                      <img
                        src={freelancer.profileImage}
                        alt={freelancer.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-base">
                        {freelancer.name?.charAt(0)?.toUpperCase() || 'F'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/company/freelancers/${freelancer._id}`}
                          className="text-base font-bold text-slate-900 hover:text-violet-600 transition flex items-center space-x-1"
                        >
                          <span>{freelancer.name || 'Freelancer'}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                        {freelancer.isVerified && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <ShieldCheck className="w-3 h-3 mr-0.5" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Submitted on {new Date(proposal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-start sm:self-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.bg}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Proposal Metrics comparison */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Proposed Bid
                    </span>
                    <span className="text-sm font-extrabold text-slate-900">
                      ${proposal.proposedBudget?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Estimated Duration
                    </span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {proposal.estimatedDuration || 'Flexible'}
                    </span>
                  </div>
                  {proposal.project?.title && (
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        Project
                      </span>
                      <span className="text-xs font-semibold text-slate-800 truncate block">
                        {proposal.project.title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Cover letter */}
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-slate-700">Cover Letter:</h4>
                  <p className="text-slate-600 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-line">
                    {proposal.coverLetter}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                  <Link
                    to={`/company/freelancers/${freelancer._id}`}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800 transition"
                  >
                    <span>View Full Public Profile & Portfolio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  {isEligibleToDecide && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProposal(proposal)
                          setActionType('reject')
                        }}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProposal(proposal)
                          setActionType('accept')
                        }}
                        className="inline-flex items-center space-x-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept & Hire</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedProposal && actionType && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {actionType === 'accept' ? 'Confirm Hiring Proposal' : 'Reject Proposal'}
              </h3>
              <button
                onClick={() => {
                  setSelectedProposal(null)
                  setActionType(null)
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {actionType === 'accept'
                ? `You are about to accept the proposal from ${
                    selectedProposal.freelancer?.name || 'this candidate'
                  } for $${selectedProposal.proposedBudget?.toLocaleString()}. Accepting will mark the project as 'in_progress' and reject any other pending bids.`
                : `Are you sure you want to decline this proposal? This action cannot be reversed.`}
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                onClick={() => {
                  setSelectedProposal(null)
                  setActionType(null)
                }}
                disabled={actionLoading}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition disabled:opacity-50 ${
                  actionType === 'accept'
                    ? 'bg-violet-600 hover:bg-violet-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoading
                  ? 'Processing...'
                  : actionType === 'accept'
                  ? 'Confirm & Hire'
                  : 'Decline Proposal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompanyProjectProposals
