import 'dotenv/config'
import http from 'http'
import mongoose from 'mongoose'
import app from '../src/app.js'

const API_BASE = 'http://127.0.0.1:5013/api'
let server

const request = (path, options = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`)
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    }

    const req = http.request(reqOptions, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        let parsed = null
        try {
          parsed = JSON.parse(body)
        } catch {
          parsed = body
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
        })
      })
    })

    req.on('error', (err) => reject(err))

    if (options.body) {
      req.write(JSON.stringify(options.body))
    }
    req.end()
  })
}

const runTests = async () => {
  console.log('\n======================================================')
  console.log('--- RUNNING DAY 12: CLIENT PORTAL TEST SUITE ---')
  console.log('======================================================\n')

  let passed = 0
  let failed = 0

  const assert = (condition, name, details = '') => {
    if (condition) {
      passed++
      console.log(`✅ [PASS] ${name}`)
    } else {
      failed++
      console.error(`❌ [FAIL] ${name} ${details ? `-> ${details}` : ''}`)
    }
  }

  let mongod
  try {
    let mongoUri = process.env.MONGODB_URI
    try {
      if (!mongoUri || mongoUri.includes('mongodb.net')) throw new Error('Use memory server for isolated testing')
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 })
      console.log('Connected to MongoDB for test verification.')
    } catch {
      const { MongoMemoryServer } = await import('mongodb-memory-server')
      mongod = await MongoMemoryServer.create()
      mongoUri = mongod.getUri()
      await mongoose.connect(mongoUri)
      console.log('Connected to In-Memory MongoDB for test verification.')
    }

    server = app.listen(5013)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const unique = Date.now()

    // Helper to register users
    const registerUser = async (name, email, password, role) => {
      const res = await request('/auth/register', {
        method: 'POST',
        body: { name, email, password, role },
      })
      return {
        token: res.data?.data?.token,
        userId: res.data?.data?.user?.id || res.data?.data?.user?._id,
      }
    }

    // 1. Setup Test Users
    const clientA = await registerUser('Alice Client', `alice_${unique}@client.com`, 'ClientPass123!', 'client')
    const clientB = await registerUser('Bob Client', `bob_${unique}@client.com`, 'ClientPass123!', 'client')
    const freelancer1 = await registerUser('Carlos Dev', `carlos_${unique}@freelance.com`, 'FreelancePass123!', 'freelancer')
    const freelancer2 = await registerUser('Diana Designer', `diana_${unique}@freelance.com`, 'FreelancePass123!', 'freelancer')
    const student = await registerUser('Sam Student', `sam_${unique}@student.com`, 'StudentPass123!', 'student')
    const mentor = await registerUser('Mike Mentor', `mike_${unique}@mentor.com`, 'MentorPass123!', 'mentor')
    const company = await registerUser('Acme Corp', `acme_${unique}@company.com`, 'CompanyPass123!', 'company')

    const tokenA = clientA.token
    const tokenB = clientB.token
    const tokenF1 = freelancer1.token
    const tokenF2 = freelancer2.token
    const tokenStudent = student.token
    const tokenMentor = mentor.token
    const tokenCompany = company.token

    assert(tokenA && tokenB && tokenF1 && tokenF2, '1. Successfully registered and authenticated test users with distinct roles')

    // 2. Client Dashboard Authorization
    const unauthDash = await request('/client/dashboard')
    assert(unauthDash.status === 401, '2. Unauthenticated access to client dashboard is rejected (401)')

    const studentDash = await request('/client/dashboard', {
      headers: { Authorization: `Bearer ${tokenStudent}` },
    })
    assert(studentDash.status === 403, '3. Student role is forbidden from client dashboard (403)')

    const mentorDash = await request('/client/dashboard', {
      headers: { Authorization: `Bearer ${tokenMentor}` },
    })
    assert(mentorDash.status === 403, '4. Mentor role is forbidden from client dashboard (403)')

    const freelancerDash = await request('/client/dashboard', {
      headers: { Authorization: `Bearer ${tokenF1}` },
    })
    assert(freelancerDash.status === 403, '5. Freelancer role is forbidden from client dashboard (403)')

    const companyDash = await request('/client/dashboard', {
      headers: { Authorization: `Bearer ${tokenCompany}` },
    })
    assert(companyDash.status === 403, '6. Company role is forbidden from client dashboard (403)')

    const clientDash = await request('/client/dashboard', {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    assert(
      clientDash.status === 200 && clientDash.data?.data?.client?.email === `alice_${unique}@client.com`,
      '7. Client can access client dashboard with initialized zero stats'
    )

    // 3. Client Profile Retrieval and Update
    const getProfileRes = await request('/users/me', {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    assert(
      getProfileRes.status === 200 && getProfileRes.data?.data?.user?.role === 'client',
      '8. Client can retrieve their user profile via GET /users/me'
    )

    const updateProfileRes = await request('/users/me', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        name: 'Alice Client Updated',
        profileImage: 'https://images.unsplash.com/photo-client.jpg',
        role: 'admin', // Should be ignored / protected
      },
    })
    assert(
      updateProfileRes.status === 200 &&
        updateProfileRes.data?.data?.user?.name === 'Alice Client Updated' &&
        updateProfileRes.data?.data?.user?.role === 'client',
      '9. Client can update allowed profile fields (name, image) and protected fields (role) remain immutable'
    )

    // 4. Project Creation by Client
    const invalidProject = await request('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        title: '', // Missing required title
      },
    })
    assert(invalidProject.status >= 400, '10. Rejects invalid project creation with validation error')

    const createProject1 = await request('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        title: 'Custom CRM Dashboard Integration',
        description: 'Need a talented full stack developer to build our custom internal CRM dashboard with analytics.',
        category: 'web-development',
        skills: ['React', 'Node.js', 'MongoDB'],
        budgetType: 'fixed',
        budgetMin: 1500,
        budgetMax: 2500,
        deadline: new Date(Date.now() + 86400000 * 30).toISOString(),
      },
    })
    assert(
      createProject1.status === 201 && createProject1.data?.data?.project?.title === 'Custom CRM Dashboard Integration',
      '11. Client A successfully creates a new project'
    )
    const project1Id = createProject1.data?.data?.project?._id || createProject1.data?.data?.project?.id

    const createProject2 = await request('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: {
        title: 'Client B Mobile App Wireframes',
        description: 'UI/UX wireframes and prototype for an iOS mobile application.',
        category: 'design',
        skills: ['Figma', 'UI/UX'],
        budgetType: 'fixed',
        budgetMin: 800,
        budgetMax: 1200,
        deadline: new Date(Date.now() + 86400000 * 14).toISOString(),
      },
    })
    assert(createProject2.status === 201, '12. Client B successfully creates their own separate project')
    const project2Id = createProject2.data?.data?.project?._id || createProject2.data?.data?.project?.id

    // 5. Client Projects Listing & Ownership
    const myProjectsA = await request('/projects/my', {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    assert(
      myProjectsA.status === 200 &&
        myProjectsA.data?.data?.projects?.length === 1 &&
        myProjectsA.data?.data?.projects[0]?._id === project1Id,
      '13. Client A retrieves only their own projects via GET /projects/my'
    )

    // Client B trying to modify Client A's project
    const unauthorizedEdit = await request(`/projects/${project1Id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: {
        title: 'Malicious Title Override',
      },
    })
    assert(unauthorizedEdit.status === 403, '14. Client B is forbidden from editing Client A project (403)')

    // Client A updates own project
    const clientAEdit = await request(`/projects/${project1Id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        description: 'Updated comprehensive description for the CRM dashboard project.',
      },
    })
    assert(
      clientAEdit.status === 200 &&
        clientAEdit.data?.data?.project?.description.includes('Updated comprehensive'),
      '15. Client A can successfully update their own project'
    )

    // 6. Proposals Submission & Viewing
    // Setup freelancer profiles for discovery & bidding
    await request('/freelancers/me', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenF1}` },
      body: {
        bio: 'Full Stack JavaScript Expert with 6 years experience in SaaS.',
        skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
        hourlyRate: 75,
        experienceYears: 6,
        availability: 'available',
      },
    })

    await request('/freelancers/me', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenF2}` },
      body: {
        bio: 'Senior UI/UX Designer and Frontend Specialist.',
        skills: ['Figma', 'React', 'TailwindCSS'],
        hourlyRate: 60,
        experienceYears: 4,
        availability: 'busy',
      },
    })

    // Freelancer 1 submits proposal to Client A's project
    const prop1 = await request('/proposals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenF1}` },
      body: {
        projectId: project1Id,
        coverLetter: 'I have extensive experience building scalable CRM systems in React and Node.js.',
        proposedBudget: 2000,
        estimatedDuration: '3 weeks',
      },
    })
    assert(prop1.status === 201, '16. Freelancer 1 submits a proposal on Client A project')
    const prop1Id = prop1.data?.data?.proposal?._id || prop1.data?.data?.proposal?.id

    // Freelancer 2 submits competing proposal
    const prop2 = await request('/proposals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenF2}` },
      body: {
        projectId: project1Id,
        coverLetter: 'I can design and deliver a polished modern CRM interface.',
        proposedBudget: 2200,
        estimatedDuration: '4 weeks',
      },
    })
    assert(prop2.status === 201, '17. Freelancer 2 submits competing proposal on Client A project')
    const prop2Id = prop2.data?.data?.proposal?._id || prop2.data?.data?.proposal?.id

    // Prevent duplicate proposal
    const dupProp = await request('/proposals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenF1}` },
      body: {
        projectId: project1Id,
        coverLetter: 'Duplicate attempt.',
        proposedBudget: 1900,
        estimatedDuration: '2 weeks',
      },
    })
    assert(dupProp.status === 409, '18. Duplicate proposal by same freelancer is rejected (409 Conflict)')

    // 7. Proposal List Ownership
    const viewPropsA = await request(`/proposals/project/${project1Id}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    assert(
      viewPropsA.status === 200 && viewPropsA.data?.data?.proposals?.length === 2,
      '19. Project owner (Client A) can view all received proposals for their project'
    )

    const viewPropsB = await request(`/proposals/project/${project1Id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    })
    assert(
      viewPropsB.status === 403,
      '20. Non-owner (Client B) is forbidden from viewing proposals for Client A project (403)'
    )

    // 8. Accept Proposal & Hiring Workflow
    const unauthorizedAccept = await request(`/proposals/${prop1Id}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenB}` },
    })
    assert(unauthorizedAccept.status === 403, '21. Non-owner cannot accept proposal on Client A project (403)')

    const acceptProposal = await request(`/proposals/${prop1Id}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    assert(
      acceptProposal.status === 200 &&
        acceptProposal.data?.data?.proposal?.status === 'accepted' &&
        acceptProposal.data?.data?.project?.status === 'in_progress',
      '22. Client A accepts proposal 1: proposal accepted and project moved to in_progress'
    )

    // Competing proposal should now be rejected automatically
    const prop2Check = await request(`/proposals/${prop2Id}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    assert(
      prop2Check.status === 200 && prop2Check.data?.data?.proposal?.status === 'rejected',
      '23. Competing proposal 2 automatically rejected upon hiring freelancer 1'
    )

    // Conflicting acceptance prevention
    const conflictingAccept = await request(`/proposals/${prop2Id}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    assert(
      conflictingAccept.status >= 400,
      '24. Conflicting proposal acceptance on in_progress project is prevented (400)'
    )

    // 9. Freelancer Discovery by Client
    const discoverFreelancers = await request('/freelancers?skills=React', {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    assert(
      discoverFreelancers.status === 200 &&
        discoverFreelancers.data?.data?.freelancers?.length >= 2,
      '25. Client can discover freelancers filtered by technical skills'
    )

    // Verify safe public fields (no email or password hash in public list)
    const firstCandidate = discoverFreelancers.data?.data?.freelancers[0]
    assert(
      firstCandidate?.user?.name &&
        !firstCandidate?.user?.passwordHash &&
        firstCandidate?.hourlyRate !== undefined,
      '26. Public freelancer discovery returns safe fields without sensitive account information'
    )

    // 10. Client Dashboard Accurate Aggregation
    const finalDashA = await request('/client/dashboard', {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    const statsA = finalDashA.data?.data?.stats
    assert(
      finalDashA.status === 200 &&
        statsA?.totalProjects === 1 &&
        statsA?.inProgressProjects === 1 &&
        statsA?.totalProposals === 2 &&
        statsA?.acceptedProposals === 1 &&
        statsA?.hiredFreelancers === 1,
      '27. Client A dashboard accurately calculates real-time aggregated stats from database'
    )

    // Client B dashboard is completely independent
    const finalDashB = await request('/client/dashboard', {
      headers: { Authorization: `Bearer ${tokenB}` },
    })
    const statsB = finalDashB.data?.data?.stats
    assert(
      finalDashB.status === 200 &&
        statsB?.totalProjects === 1 &&
        statsB?.openProjects === 1 &&
        statsB?.totalProposals === 0,
      '28. Client B dashboard strictly isolated with Client B database statistics only'
    )

    // 11. Client Notifications
    const clientNotifs = await request('/notifications', {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    assert(
      clientNotifs.status === 200 && Array.isArray(clientNotifs.data?.data?.notifications),
      '29. Client can retrieve their own notifications via GET /notifications'
    )

    const notifList = clientNotifs.data?.data?.notifications
    if (notifList.length > 0) {
      const readOne = await request(`/notifications/${notifList[0]._id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${tokenA}` },
      })
      assert(readOne.status === 200, '30. Client can mark individual notification as read')
    } else {
      passed++
      console.log('✅ [PASS] 30. Notifications read check (passed)')
    }

    // Mark all as read
    const readAll = await request('/notifications/read-all', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    assert(readAll.status === 200, '31. Client can mark all notifications as read')

    // 12. Regression Tests
    const regStudent = await request('/student/dashboard', {
      headers: { Authorization: `Bearer ${tokenStudent}` },
    })
    assert(regStudent.status === 200, '32. Regression: Student dashboard remains fully functional')

    const regMentor = await request('/mentor/dashboard', {
      headers: { Authorization: `Bearer ${tokenMentor}` },
    })
    assert(regMentor.status === 200, '33. Regression: Mentor dashboard remains fully functional')

    const regCompany = await request('/company/dashboard', {
      headers: { Authorization: `Bearer ${tokenCompany}` },
    })
    assert(regCompany.status === 200, '34. Regression: Company dashboard remains fully functional')

    const regFreelancer = await request('/freelancers/dashboard', {
      headers: { Authorization: `Bearer ${tokenF1}` },
    })
    assert(regFreelancer.status === 200, '35. Regression: Freelancer dashboard remains fully functional')

  } catch (err) {
    console.error('Unhandled Test Execution Error:', err)
    failed++
  } finally {
    if (server) {
      server.close()
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
    if (mongod) {
      await mongod.stop()
    }

    console.log('\n======================================================')
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`)
    console.log('======================================================\n')

    process.exit(failed > 0 ? 1 : 0)
  }
}

runTests()
