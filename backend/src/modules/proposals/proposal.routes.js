import express from 'express'
import authenticate from '../../middleware/auth.middleware.js'
import * as proposalController from './proposal.controller.js'

const router = express.Router()

router.use(authenticate)

router.post('/', proposalController.createProposal)
router.get('/my-projects', proposalController.getMyProjectsProposals)
router.get('/project/:projectId', proposalController.getProposalsByProject)
router.get('/:id', proposalController.getProposalById)
router.patch('/:id/accept', proposalController.acceptProposal)
router.patch('/:id/reject', proposalController.rejectProposal)

export default router
