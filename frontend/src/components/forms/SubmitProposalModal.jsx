import { AlertCircle, CheckCircle, Clock, DollarSign, FileText, Send, X } from 'lucide-react'
import { useState } from 'react'
import proposalService from '../../services/proposal.service'

export const SubmitProposalModal = ({ project, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    coverLetter: '',
    proposedBudget: project?.budgetMin || '',
    estimatedDuration: '2-4 weeks',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen || !project) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.coverLetter.trim() || formData.coverLetter.trim().length < 10) {
      setError('Please provide a cover letter of at least 10 characters.')
      return
    }

    if (!formData.proposedBudget || Number(formData.proposedBudget) <= 0) {
      setError('Please specify a valid proposed budget.')
      return
    }

    if (!formData.estimatedDuration.trim()) {
      setError('Please specify your estimated project duration.')
      return
    }

    setSubmitting(true)
    try {
      await proposalService.createProposal({
        projectId: project._id,
        coverLetter: formData.coverLetter.trim(),
        proposedBudget: Number(formData.proposedBudget),
        estimatedDuration: formData.estimatedDuration.trim(),
      })
      setSuccess(true)
      setTimeout(() => {
        if (onSuccess) onSuccess()
        onClose()
      }, 1500)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.coverLetter ||
          'Failed to submit proposal. You may have already applied to this project.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Submit Proposal</h3>
            <p className="text-xs text-slate-500 truncate max-w-sm">For: {project.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Proposal Submitted!</h4>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Your proposal has been successfully sent to the client. You can track its status in "My Proposals".
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Project Budget Context */}
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-teal-700 font-medium">Client's Budget: </span>
                  <span className="font-bold text-teal-900">
                    ${project.budgetMin} - ${project.budgetMax} ({project.budgetType})
                  </span>
                </div>
                {project.deadline && (
                  <div className="text-teal-700">
                    <span>Deadline: </span>
                    <span className="font-semibold text-teal-900">
                      {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Proposed Budget & Duration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>Your Proposed Budget ($)</span>
                  </label>
                  <input
                    type="number"
                    name="proposedBudget"
                    value={formData.proposedBudget}
                    onChange={handleChange}
                    placeholder="e.g. 500"
                    min="1"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Estimated Duration</span>
                  </label>
                  <input
                    type="text"
                    name="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={handleChange}
                    placeholder="e.g. 2 weeks, 1 month"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  />
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Cover Letter / Pitch</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {formData.coverLetter.length}/3000
                  </span>
                </div>
                <textarea
                  name="coverLetter"
                  rows={5}
                  value={formData.coverLetter}
                  onChange={handleChange}
                  placeholder="Introduce yourself, describe your experience with relevant technologies, and explain why you are the best fit for this project..."
                  maxLength={3000}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center space-x-2 shadow-sm transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : 'Submit Proposal'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubmitProposalModal
