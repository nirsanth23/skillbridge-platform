import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Compass,
  DollarSign,
  Edit2,
  ExternalLink,
  Eye,
  FileText,
  Send,
  Trash2,
  X,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import proposalService from '../../services/proposal.service'

const STATUS_TABS = [
  { id: 'all', label: 'All Proposals' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'withdrawn', label: 'Withdrawn' },
]

export const MyProposals = () => {
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [expandedProposalId, setExpandedProposalId] = useState(null)

  // Edit proposal state
  const [editingProposal, setEditingProposal] = useState(null)
  const [editFormData, setEditFormData] = useState({
    proposedBudget: '',
    estimatedDuration: '',
    coverLetter: '',
  })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState('')

  // Withdraw proposal confirmation state
  const [withdrawingProposal, setWithdrawingProposal] = useState(null)
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false)
  const [actionSuccess, setActionSuccess] = useState('')

  const fetchProposals = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (activeTab !== 'all') {
        params.status = activeTab
      }
      const res = await proposalService.getMyProposals(params)
      setProposals(res.data?.proposals || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch proposals')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  // Open Edit Modal
  const openEditModal = (proposal) => {
    setEditingProposal(proposal)
    setEditFormData({
      proposedBudget: proposal.proposedBudget || '',
      estimatedDuration: proposal.estimatedDuration || '',
      coverLetter: proposal.coverLetter || '',
    })
    setEditError('')
  }

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editFormData.coverLetter.trim() || editFormData.coverLetter.trim().length < 10) {
      setEditError('Cover letter must be at least 10 characters long.')
      return
    }
    if (!editFormData.proposedBudget || Number(editFormData.proposedBudget) <= 0) {
      setEditError('Please provide a valid budget amount.')
      return
    }

    setEditSubmitting(true)
    setEditError('')
    try {
      await proposalService.updateProposal(editingProposal._id, {
        coverLetter: editFormData.coverLetter.trim(),
        proposedBudget: Number(editFormData.proposedBudget),
        estimatedDuration: editFormData.estimatedDuration.trim(),
      })
      setActionSuccess('Proposal updated successfully!')
      setEditingProposal(null)
      fetchProposals()
      setTimeout(() => setActionSuccess(''), 4000)
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update proposal.')
    } finally {
      setEditSubmitting(false)
    }
  }

  // Handle Withdraw Confirm
  const handleConfirmWithdraw = async () => {
    if (!withdrawingProposal) return
    setWithdrawSubmitting(true)
    try {
      await proposalService.withdrawProposal(withdrawingProposal._id)
      setActionSuccess('Proposal withdrawn successfully.')
      setWithdrawingProposal(null)
      fetchProposals()
      setTimeout(() => setActionSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to withdraw proposal.')
      setWithdrawingProposal(null)
    } finally {
      setWithdrawSubmitting(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Accepted & Hired</span>
          </span>
        )
      case 'pending':
        return (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </span>
        )
      case 'rejected':
        return (
          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-full flex items-center space-x-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Not Selected</span>
          </span>
        )
      case 'withdrawn':
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold rounded-full">
            Withdrawn
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-semibold mb-2">
              <Send className="w-3.5 h-3.5" />
              <span>Proposals Center</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">My Submitted Proposals</h1>
            <p className="text-sm text-slate-600 mt-1">
              Track, edit, and manage all the proposals you have sent for client projects.
            </p>
          </div>
          <Link
            to="/freelancer/find-projects"
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 shadow-2xs"
          >
            <Compass className="w-4 h-4" />
            <span>Find More Projects</span>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 mt-6 pt-6 border-t border-slate-100 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-800 text-sm font-semibold">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Proposals List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl p-8">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No Proposals in this Status</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {activeTab === 'all'
              ? 'You have not submitted any proposals yet. Start applying to open client gigs!'
              : `You have no ${activeTab} proposals.`}
          </p>
          <Link
            to="/freelancer/find-projects"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl inline-flex items-center space-x-1.5 transition"
          >
            <Compass className="w-4 h-4" />
            <span>Browse Open Projects</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((prop) => (
            <div
              key={prop._id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4 hover:border-slate-300 transition"
            >
              {/* Proposal Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center space-x-2.5 mb-1.5">
                    {getStatusBadge(prop.status)}
                    <span className="text-xs text-slate-400">
                      Applied on {new Date(prop.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    to={`/projects/${prop.project?._id || prop.project}`}
                    className="font-bold text-slate-900 hover:text-teal-600 text-lg transition truncate block"
                  >
                    {prop.project?.title || 'Project Details'}
                  </Link>
                </div>

                {/* Proposal Bid & Duration Stats */}
                <div className="flex items-center space-x-4 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 self-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Your Bid
                    </span>
                    <span className="text-base font-extrabold text-teal-700">
                      ${prop.proposedBudget}
                    </span>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Duration
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {prop.estimatedDuration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cover Letter Excerpt / Full View */}
              <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700">Cover Letter Pitch</span>
                  <button
                    onClick={() =>
                      setExpandedProposalId(expandedProposalId === prop._id ? null : prop._id)
                    }
                    className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    {expandedProposalId === prop._id ? 'Collapse' : 'View Full'}
                  </button>
                </div>
                <p
                  className={`text-xs text-slate-600 leading-relaxed whitespace-pre-line ${
                    expandedProposalId === prop._id ? '' : 'line-clamp-2'
                  }`}
                >
                  {prop.coverLetter}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                <Link
                  to={`/projects/${prop.project?._id || prop.project}`}
                  className="text-xs font-semibold text-slate-600 hover:text-teal-600 flex items-center space-x-1"
                >
                  <span>View Original Project Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                {/* Pending Actions: Edit & Withdraw */}
                {prop.status === 'pending' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(prop)}
                      className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit Proposal</span>
                    </button>
                    <button
                      onClick={() => setWithdrawingProposal(prop)}
                      className="px-3.5 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Withdraw</span>
                    </button>
                  </div>
                )}

                {prop.status === 'accepted' && (
                  <Link
                    to="/freelancer/active-projects"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs"
                  >
                    <span>Go to Active Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Proposal Modal */}
      {editingProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">Edit Pending Proposal</h3>
              <button
                onClick={() => setEditingProposal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Proposed Budget ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editFormData.proposedBudget}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, proposedBudget: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.estimatedDuration}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, estimatedDuration: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cover Letter Pitch
                </label>
                <textarea
                  rows={5}
                  required
                  maxLength={3000}
                  value={editFormData.coverLetter}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, coverLetter: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingProposal(null)}
                  disabled={editSubmitting}
                  className="px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {editSubmitting ? 'Updating...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      {withdrawingProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-lg">Withdraw this Proposal?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to withdraw your proposal for{' '}
                <strong className="text-slate-800">
                  {withdrawingProposal.project?.title || 'this project'}
                </strong>
                ? The client will no longer consider this submission.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setWithdrawingProposal(null)}
                disabled={withdrawSubmitting}
                className="px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50"
              >
                Keep Proposal
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                disabled={withdrawSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
              >
                {withdrawSubmitting ? 'Withdrawing...' : 'Yes, Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyProposals
