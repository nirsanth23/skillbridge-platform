import mongoose from 'mongoose'
import { createNotification } from '../notifications/notification.service.js'
import Project from '../projects/project.model.js'
import Proposal from './proposal.model.js'

/**
 * Submits a new proposal for a project
 * @param {string} freelancerId 
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
export const createProposal = async (freelancerId, data) => {
  const { projectId, coverLetter, proposedBudget, estimatedDuration } = data

  const project = await Project.findById(projectId)
  if (!project) {
    const error = new Error('Project not found')
    error.statusCode = 404
    throw error
  }

  if (project.status !== 'open') {
    const error = new Error(`Cannot submit proposal. Project is currently ${project.status}`)
    error.statusCode = 400
    throw error
  }

  if (String(project.owner) === String(freelancerId)) {
    const error = new Error('Project owners cannot submit proposals to their own projects')
    error.statusCode = 400
    throw error
  }

  const existingProposal = await Proposal.findOne({
    project: projectId,
    freelancer: freelancerId,
  })

  if (existingProposal) {
    const error = new Error('You have already submitted a proposal for this project')
    error.statusCode = 409
    throw error
  }

  const proposal = await Proposal.create({
    project: projectId,
    freelancer: freelancerId,
    coverLetter,
    proposedBudget,
    estimatedDuration,
    status: 'pending',
  })

  // Notify project owner
  await createNotification({
    recipient: project.owner,
    type: 'proposal_received',
    title: 'New Proposal Received',
    message: `A freelancer submitted a proposal on your project "${project.title}"`,
    relatedEntity: {
      entityType: 'proposal',
      entityId: proposal._id,
    },
  })

  const populated = await Proposal.findById(proposal._id)
    .populate('freelancer', 'name email profileImage role')
    .populate('project', 'title status owner budgetMin budgetMax budgetType')

  return populated.toJSON()
}

/**
 * Retrieves all proposals for a specific project (Project Owner only)
 * @param {string} projectId 
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export const getProposalsByProject = async (projectId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    const error = new Error('Invalid project ID')
    error.statusCode = 400
    throw error
  }

  const project = await Project.findById(projectId)
  if (!project) {
    const error = new Error('Project not found')
    error.statusCode = 404
    throw error
  }

  if (String(project.owner) !== String(userId)) {
    const error = new Error('Access denied. You can only view proposals for your own projects')
    error.statusCode = 403
    throw error
  }

  const proposals = await Proposal.find({ project: projectId })
    .populate('freelancer', 'name email profileImage role')
    .sort({ createdAt: -1 })

  return proposals.map((p) => p.toJSON())
}

/**
 * Retrieves all proposals received across all projects owned by the user
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export const getMyProjectsProposals = async (userId) => {
  const userProjects = await Project.find({ owner: userId }).select('_id')
  const projectIds = userProjects.map((p) => p._id)

  const proposals = await Proposal.find({ project: { $in: projectIds } })
    .populate('project', 'title status budgetMin budgetMax budgetType deadline')
    .populate('freelancer', 'name email profileImage role')
    .sort({ createdAt: -1 })

  return proposals.map((p) => p.toJSON())
}

/**
 * Retrieves a single proposal by ID with ownership/access control
 * @param {string} proposalId 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
export const getProposalById = async (proposalId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(proposalId)) {
    const error = new Error('Invalid proposal ID')
    error.statusCode = 400
    throw error
  }

  const proposal = await Proposal.findById(proposalId)
    .populate('project', 'title status owner budgetMin budgetMax budgetType')
    .populate('freelancer', 'name email profileImage role')

  if (!proposal) {
    const error = new Error('Proposal not found')
    error.statusCode = 404
    throw error
  }

  const isOwner = String(proposal.project?.owner) === String(userId)
  const isFreelancer = String(proposal.freelancer?._id) === String(userId)

  if (!isOwner && !isFreelancer) {
    const error = new Error('Access denied to this proposal')
    error.statusCode = 403
    throw error
  }

  return proposal.toJSON()
}

/**
 * Accepts a proposal, hires freelancer, updates project status to in_progress, and rejects remaining proposals
 * @param {string} proposalId 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
export const acceptProposal = async (proposalId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(proposalId)) {
    const error = new Error('Invalid proposal ID')
    error.statusCode = 400
    throw error
  }

  const proposal = await Proposal.findById(proposalId).populate('project')
  if (!proposal) {
    const error = new Error('Proposal not found')
    error.statusCode = 404
    throw error
  }

  const project = await Project.findById(proposal.project?._id || proposal.project)
  if (!project) {
    const error = new Error('Project not found')
    error.statusCode = 404
    throw error
  }

  if (String(project.owner) !== String(userId)) {
    const error = new Error('Access denied. You can only accept proposals for your own projects')
    error.statusCode = 403
    throw error
  }

  if (project.status !== 'open') {
    const error = new Error(`Cannot accept proposal for a project that is ${project.status}`)
    error.statusCode = 400
    throw error
  }

  if (proposal.status !== 'pending') {
    const error = new Error(`Cannot accept a proposal that is already ${proposal.status}`)
    error.statusCode = 400
    throw error
  }

  // 1. Accept this proposal
  proposal.status = 'accepted'
  await proposal.save()

  // 2. Reject all other pending proposals for this project
  const otherPending = await Proposal.find({
    project: project._id,
    _id: { $ne: proposal._id },
    status: 'pending',
  })

  await Proposal.updateMany(
    {
      project: project._id,
      _id: { $ne: proposal._id },
      status: 'pending',
    },
    { $set: { status: 'rejected' } }
  )

  // 3. Update project status and set hired freelancer
  project.status = 'in_progress'
  project.hiredFreelancer = proposal.freelancer
  project.hiredProposal = proposal._id
  await project.save()

  // 4. Send acceptance notification to hired freelancer
  await createNotification({
    recipient: proposal.freelancer,
    type: 'proposal_accepted',
    title: 'Congratulations! You Have Been Hired',
    message: `Your proposal for "${project.title}" has been accepted by the client.`,
    relatedEntity: {
      entityType: 'project',
      entityId: project._id,
    },
  })

  // 5. Notify rejected candidates
  for (const other of otherPending) {
    createNotification({
      recipient: other.freelancer,
      type: 'proposal_rejected',
      title: 'Proposal Status Update',
      message: `The project "${project.title}" has hired another freelancer for this position.`,
      relatedEntity: {
        entityType: 'project',
        entityId: project._id,
      },
    }).catch(() => {})
  }

  const updatedProposal = await Proposal.findById(proposal._id)
    .populate('freelancer', 'name email profileImage role')
    .populate('project', 'title status owner budgetMin budgetMax budgetType hiredFreelancer')

  return {
    proposal: updatedProposal.toJSON(),
    project: project.toJSON(),
  }
}

/**
 * Rejects a proposal on a project
 * @param {string} proposalId 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
export const rejectProposal = async (proposalId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(proposalId)) {
    const error = new Error('Invalid proposal ID')
    error.statusCode = 400
    throw error
  }

  const proposal = await Proposal.findById(proposalId).populate('project')
  if (!proposal) {
    const error = new Error('Proposal not found')
    error.statusCode = 404
    throw error
  }

  const project = await Project.findById(proposal.project?._id || proposal.project)
  if (!project) {
    const error = new Error('Project not found')
    error.statusCode = 404
    throw error
  }

  if (String(project.owner) !== String(userId)) {
    const error = new Error('Access denied. You can only reject proposals for your own projects')
    error.statusCode = 403
    throw error
  }

  if (proposal.status !== 'pending') {
    const error = new Error(`Cannot reject a proposal that is already ${proposal.status}`)
    error.statusCode = 400
    throw error
  }

  proposal.status = 'rejected'
  await proposal.save()

  // Notify freelancer
  await createNotification({
    recipient: proposal.freelancer,
    type: 'proposal_rejected',
    title: 'Proposal Update',
    message: `Your proposal for "${project.title}" was not selected.`,
    relatedEntity: {
      entityType: 'project',
      entityId: project._id,
    },
  })

  return proposal.toJSON()
}
