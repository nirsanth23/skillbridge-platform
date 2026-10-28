import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  ShieldCheck,
  User as UserIcon,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import proposalService from '../../services/proposal.service'

export const ClientProjectProposals = () => {
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
              to="/client/projects"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800 mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to My Projects</span>
            </Link>
          )}
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2.5">
            <Briefcase className="w-6 h-6 text-blue-600" />
            <span>{projectId ? 'Project Proposals & Hiring' : 'All Received Proposals'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review candidate qualifications, compare bids, and hire top freelancers directly.
          </p>
        </div>

        {acceptedProposal && (
          <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Freelancer Hired</span>
          </div>
        )}
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

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        {['all', 'pending', 'accepted', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab} ({proposals.filter((p) => tab === 'all' || p.status === tab).length})
          </button>
        ))}
      </div>

      {/* Proposals List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Proposals Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab !== 'all'
              ? `No proposals matching the "${activeTab}" status.`
              : 'No proposals have been submitted for this project yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => {
            const freelancer = proposal.freelancer || {}
            return (
              <div
                key={proposal._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:border-slate-300 transition space-y-4"
              >
                {/* Header row: Freelancer Info & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    {freelancer.profileImage ? (
                      <img
                        src={freelancer.profileImage}
                        alt={freelancer.name}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                        {freelancer.name?.charAt(0) || <UserIcon className="w-6 h-6" />}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/client/freelancers/${freelancer._id}`}
                          className="text-base font-bold text-slate-900 hover:text-blue-600 transition"
                        >
                          {freelancer.name || 'Anonymous Freelancer'}
                        </Link>
                        {freelancer.isVerified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-500" title="Verified Freelancer" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Submitted on {new Date(proposal.createdAt).toLocaleDateString()}
                        {proposal.project?.title && (
                          <span className="ml-2 font-medium text-slate-700">
                            • Project: {proposal.project.title}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Status & Terms */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 flex items-center justify-end space-x-0.5">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        <span>{proposal.proposedBudget}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-end space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{proposal.estimatedDuration}</span>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        proposal.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : proposal.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {proposal.status}
                    </span>
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 mb-1">Cover Letter:</h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {proposal.coverLetter}
                  </p>
                </div>

                {/* Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <Link
                    to={`/client/freelancers/${freelancer._id}`}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    <span>View Full Public Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  {proposal.status === 'pending' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProposal(proposal)
                          setActionType('reject')
                        }}
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProposal(proposal)
                          setActionType('accept')
                        }}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                      >
                        Accept & Hire
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {actionType === 'accept' ? 'Hire Freelancer' : 'Reject Proposal'}
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
              {actionType === 'accept' ? (
                <>
                  Are you sure you want to accept <strong>{selectedProposal.freelancer?.name || 'this freelancer'}</strong>&apos;s proposal for <strong>${selectedProposal.proposedBudget}</strong>?
                  <br />
                  <br />
                  <span className="text-amber-700 font-semibold">
                    Note: Accepting this proposal will mark the project as &quot;In Progress&quot; and automatically reject any other pending proposals.
                  </span>
                </>
              ) : (
                <>
                  Are you sure you want to reject <strong>{selectedProposal.freelancer?.name || 'this candidate'}</strong>&apos;s proposal? This action cannot be undone.
                </>
              )}
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setSelectedProposal(null)
                  setActionType(null)
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className={`px-4 py-2 text-white rounded-xl text-xs font-bold shadow-xs transition ${
                  actionType === 'accept'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoading ? 'Processing...' : actionType === 'accept' ? 'Confirm & Hire' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientProjectProposals
