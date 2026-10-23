import express from 'express'
import authenticate from '../../middleware/auth.middleware.js'
import * as proposalController from './proposal.controller.js'

const router = express.Router()

router.use(authenticate)

router.post('/', proposalController.createProposal)
// Freelancer: get own proposals list (must be before /:id)
router.get('/my', proposalController.getMyProposals)
router.get('/my-projects', proposalController.getMyProjectsProposals)
router.get('/project/:projectId', proposalController.getProposalsByProject)
router.get('/:id', proposalController.getProposalById)
router.patch('/:id/accept', proposalController.acceptProposal)
router.patch('/:id/reject', proposalController.rejectProposal)
// Freelancer: withdraw or edit a pending proposal
router.patch('/:id/withdraw', proposalController.withdrawProposal)
router.patch('/:id', proposalController.updateProposal)

export default router
