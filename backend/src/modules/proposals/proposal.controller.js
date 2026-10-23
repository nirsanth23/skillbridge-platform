import * as proposalService from './proposal.service.js'
import { validateCreateProposalInput } from './proposal.validation.js'

/**
 * @route   POST /api/proposals
 * @desc    Submit a proposal for a project
 * @access  Private (Freelancer)
 */
export const createProposal = async (req, res, next) => {
  try {
    const { isValid, errors, sanitized } = validateCreateProposalInput(req.body)
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      })
    }

    const proposal = await proposalService.createProposal(req.user.id, sanitized)
    return res.status(201).json({
      success: true,
      message: 'Proposal submitted successfully',
      data: { proposal },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   GET /api/proposals/project/:projectId
 * @desc    Get all proposals for a specific project
 * @access  Private (Project Owner)
 */
export const getProposalsByProject = async (req, res, next) => {
  try {
    const proposals = await proposalService.getProposalsByProject(
      req.params.projectId,
      req.user.id
    )
    return res.status(200).json({
      success: true,
      data: { proposals },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   GET /api/proposals/my-projects
 * @desc    Get all proposals received across all user's projects
 * @access  Private
 */
export const getMyProjectsProposals = async (req, res, next) => {
  try {
    const proposals = await proposalService.getMyProjectsProposals(req.user.id)
    return res.status(200).json({
      success: true,
      data: { proposals },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   GET /api/proposals/:id
 * @desc    Get proposal details by ID
 * @access  Private
 */
export const getProposalById = async (req, res, next) => {
  try {
    const proposal = await proposalService.getProposalById(
      req.params.id,
      req.user.id
    )
    return res.status(200).json({
      success: true,
      data: { proposal },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   PATCH /api/proposals/:id/accept
 * @desc    Accept proposal and hire freelancer
 * @access  Private (Project Owner)
 */
export const acceptProposal = async (req, res, next) => {
  try {
    const result = await proposalService.acceptProposal(
      req.params.id,
      req.user.id
    )
    return res.status(200).json({
      success: true,
      message: 'Proposal accepted successfully. Freelancer hired!',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   PATCH /api/proposals/:id/reject
 * @desc    Reject a proposal
 * @access  Private (Project Owner)
 */
export const rejectProposal = async (req, res, next) => {
  try {
    const proposal = await proposalService.rejectProposal(
      req.params.id,
      req.user.id
    )
    return res.status(200).json({
      success: true,
      message: 'Proposal rejected',
      data: { proposal },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   GET /api/proposals/my
 * @desc    Get all proposals submitted by the logged-in freelancer
 * @access  Private (Freelancer)
 */
export const getMyProposals = async (req, res, next) => {
  try {
    const result = await proposalService.getMyProposals(req.user.id, req.query)
    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   PATCH /api/proposals/:id/withdraw
 * @desc    Withdraw a pending proposal (Freelancer only)
 * @access  Private (Freelancer)
 */
export const withdrawProposal = async (req, res, next) => {
  try {
    const proposal = await proposalService.withdrawProposal(req.params.id, req.user.id)
    return res.status(200).json({
      success: true,
      message: 'Proposal withdrawn successfully',
      data: { proposal },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   PATCH /api/proposals/:id
 * @desc    Update a pending proposal (Freelancer only)
 * @access  Private (Freelancer)
 */
export const updateProposal = async (req, res, next) => {
  try {
    const proposal = await proposalService.updateProposal(req.params.id, req.user.id, req.body)
    return res.status(200).json({
      success: true,
      message: 'Proposal updated successfully',
      data: { proposal },
    })
  } catch (error) {
    next(error)
  }
}
