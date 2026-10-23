import 'dotenv/config'
import http from 'http'
import mongoose from 'mongoose'
import app from '../src/app.js'

const API_BASE = 'http://127.0.0.1:5012/api'
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
  console.log('--- RUNNING DAY 11: FREELANCER PORTAL TEST SUITE ---')
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

    server = app.listen(5012)
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

    const freelancer1 = await registerUser('Alex Freelancer', `alex_${unique}@test.com`, 'FreelancePass123!', 'freelancer')
    const freelancer2 = await registerUser('Sam Developer', `sam_${unique}@test.com`, 'FreelancePass123!', 'freelancer')
    const company = await registerUser('Apex Solutions', `apex_${unique}@test.com`, 'CompanyPass123!', 'company')
    const student = await registerUser('Emily Student', `emily_${unique}@test.com`, 'StudentPass123!', 'student')
    const mentor = await registerUser('David Mentor', `david_${unique}@test.com`, 'MentorPass123!', 'mentor')

    const f1Token = freelancer1.token
    const f2Token = freelancer2.token
    const compToken = company.token
    const studentToken = student.token
    const mentorToken = mentor.token

    assert(f1Token && f2Token && compToken, '1. Successfully registered and authenticated test users with distinct roles')

    // 2. Freelancer Profile Retrieval
    const res2 = await request('/freelancers/me', {
      headers: { Authorization: `Bearer ${f1Token}` },
    })
    assert(
      res2.status === 200 && res2.data?.data?.profile?.user?.email === `alex_${unique}@test.com`,
      '2. Freelancer can retrieve their own profile (auto-initialized)'
    )

    // 3. Freelancer Profile Update
    const res3 = await request('/freelancers/me', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${f1Token}` },
      body: {
        bio: 'Senior full-stack engineer specializing in scalable React and Node.js web applications.',
        skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
        hourlyRate: 65,
        experienceYears: 5,
        availability: 'available',
        portfolio: [
          {
            title: 'SaaS Analytics Dashboard',
            description: 'High throughput telemetry dashboard with real-time charts.',
            projectUrl: 'https://saas-example.com',
            githubUrl: 'https://github.com/alex/saas-dashboard',
          },
        ],
      },
    })
    assert(
      res3.status === 200 &&
        res3.data?.data?.profile?.hourlyRate === 65 &&
        res3.data?.data?.profile?.skills?.includes('TypeScript') &&
        res3.data?.data?.profile?.portfolio?.length === 1,
      '3. Freelancer can update their profile (bio, hourlyRate, skills, portfolio, availability)'
    )

    // 4. Freelancer Profile Validation (Reject invalid hourly rate)
    const res4 = await request('/freelancers/me', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${f1Token}` },
      body: { hourlyRate: -20 },
    })
    assert(res4.status === 400, '4. Rejects negative hourly rate with validation error')

    // 5. Freelancer Profile Validation (Reject invalid availability status)
    const res5 = await request('/freelancers/me', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${f1Token}` },
      body: { availability: 'vacation_mode' },
    })
    assert(res5.status === 400, '5. Rejects invalid availability status')

    // 6. Public Freelancer Profile View
    const res6 = await request(`/freelancers/${freelancer1.userId}`)
    assert(
      res6.status === 200 && res6.data?.data?.profile?.hourlyRate === 65,
      '6. Public freelancer profile can be viewed by user ID'
    )

    // 7. Public Freelancer Discovery
    const res7 = await request('/freelancers?skills=React')
    assert(
      res7.status === 200 && Array.isArray(res7.data?.data?.freelancers),
      '7. Public freelancer discovery lists matching candidates by skills'
    )

    // 8. Freelancer Dashboard Access
    const res8 = await request('/freelancers/dashboard', {
      headers: { Authorization: `Bearer ${f1Token}` },
    })
    assert(
      res8.status === 200 && res8.data?.data?.stats?.profileCompletionPercentage > 0,
      '8. Freelancer can access their role-specific dashboard with aggregated statistics'
    )

    // 9. Role-based Access Control (Company cannot access Freelancer Dashboard)
    const res9 = await request('/freelancers/dashboard', {
      headers: { Authorization: `Bearer ${compToken}` },
    })
    assert(res9.status === 403, '9. Company role is forbidden from accessing Freelancer Dashboard (403)')

    // 10. Role-based Access Control (Student cannot access Freelancer Dashboard)
    const res10 = await request('/freelancers/dashboard', {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert(res10.status === 403, '10. Student role is forbidden from accessing Freelancer Dashboard (403)')

    // 11. Create Project by Company for Freelancer Bidding
    const deadlineDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    const res11 = await request('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${compToken}` },
      body: {
        title: `Enterprise Cloud Portal ${unique}`,
        description: 'Build a secure multi-tenant microservices dashboard.',
        category: 'Web Development',
        skills: ['React', 'Node.js', 'Docker'],
        budgetType: 'fixed',
        budgetMin: 1500,
        budgetMax: 3000,
        deadline: deadlineDate,
        projectType: 'company',
      },
    })
    const projectId = res11.data?.data?.project?._id
    assert(res11.status === 201 && projectId, '11. Company creates an open project for freelancer proposal bidding')

    // 12. Submit Proposal by Freelancer 1
    const res12 = await request('/proposals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${f1Token}` },
      body: {
        projectId,
        coverLetter: 'I have 5+ years of fullstack experience building microservices portals. I can complete this efficiently.',
        proposedBudget: 2200,
        estimatedDuration: '3 weeks',
      },
    })
    const proposal1Id = res12.data?.data?.proposal?._id
    assert(
      res12.status === 201 && proposal1Id && res12.data?.data?.proposal?.status === 'pending',
      '12. Freelancer 1 can submit a proposal with coverLetter, proposedBudget, and estimatedDuration'
    )

    // 13. Duplicate Proposal Prevention
    const res13 = await request('/proposals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${f1Token}` },
      body: {
        projectId,
        coverLetter: 'Second proposal attempt for the exact same project.',
        proposedBudget: 2000,
        estimatedDuration: '2 weeks',
      },
    })
    assert(res13.status === 409, '13. Duplicate proposals by same freelancer on same project are rejected (409 Conflict)')

    // 14. Project Owner cannot submit proposal to own project
    const res14 = await request('/proposals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${compToken}` },
      body: {
        projectId,
        coverLetter: 'Owner bidding on own project which should fail.',
        proposedBudget: 1000,
        estimatedDuration: '1 week',
      },
    })
    assert(res14.status === 400, '14. Project owners cannot submit proposals to their own projects (400)')

    // 15. Freelancer 2 Submits a Proposal
    const res15 = await request('/proposals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${f2Token}` },
      body: {
        projectId,
        coverLetter: 'Experienced cloud backend engineer ready to deliver microservices architecture.',
        proposedBudget: 2600,
        estimatedDuration: '4 weeks',
      },
    })
    const proposal2Id = res15.data?.data?.proposal?._id
    assert(res15.status === 201 && proposal2Id, '15. Freelancer 2 can submit competing proposal to open project')

    // 16. Freelancer 1 retrieves own proposals
    const res16 = await request('/proposals/my', {
      headers: { Authorization: `Bearer ${f1Token}` },
    })
    assert(
      res16.status === 200 &&
        res16.data?.data?.proposals?.some((p) => String(p._id) === String(proposal1Id)),
      '16. Freelancer 1 retrieves their list of submitted proposals via GET /proposals/my'
    )

    // 17. Freelancer 1 updates pending proposal
    const res17 = await request(`/proposals/${proposal1Id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${f1Token}` },
      body: {
        proposedBudget: 2100,
        estimatedDuration: '2.5 weeks',
        coverLetter: 'Updated pitch: I have added relevant Kubernetes references.',
      },
    })
    assert(
      res17.status === 200 && res17.data?.data?.proposal?.proposedBudget === 2100,
      '17. Freelancer 1 can update pending proposal budget and duration'
    )

    // 18. Unauthorized edit (Freelancer 2 cannot edit Freelancer 1 proposal)
    const res18 = await request(`/proposals/${proposal1Id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${f2Token}` },
      body: { proposedBudget: 999 },
    })
    assert(res18.status === 403, '18. Freelancer 2 is forbidden from modifying Freelancer 1 proposal (403)')

    // 19. Freelancer 2 creates another project proposal and withdraws it
    const res19a = await request('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${compToken}` },
      body: {
        title: `Withdraw Test Project ${unique}`,
        description: 'Test project for testing proposal withdrawal workflow.',
        category: 'Web Development',
        skills: ['React'],
        budgetType: 'fixed',
        budgetMin: 500,
        budgetMax: 1000,
        projectType: 'company',
      },
    })
    const withdrawProjId = res19a.data?.data?.project?._id
    const res19b = await request('/proposals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${f2Token}` },
      body: {
        projectId: withdrawProjId,
        coverLetter: 'I will build this test project quickly.',
        proposedBudget: 800,
        estimatedDuration: '1 week',
      },
    })
    const withdrawPropId = res19b.data?.data?.proposal?._id

    // Withdraw the proposal
    const res19 = await request(`/proposals/${withdrawPropId}/withdraw`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${f2Token}` },
    })
    assert(
      res19.status === 200 && res19.data?.data?.proposal?.status === 'withdrawn',
      '19. Freelancer 2 can withdraw their own pending proposal'
    )

    // 20. Client Accepts Proposal 1 (Hire Freelancer 1)
    const res20 = await request(`/proposals/${proposal1Id}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${compToken}` },
    })
    assert(
      res20.status === 200 &&
        res20.data?.data?.proposal?.status === 'accepted' &&
        res20.data?.data?.project?.status === 'in_progress',
      '20. Project owner accepts proposal 1, transitioning project to in_progress'
    )

    // 21. Competing Proposal 2 is Auto-Rejected
    const res21 = await request(`/proposals/${proposal2Id}`, {
      headers: { Authorization: `Bearer ${f2Token}` },
    })
    assert(
      res21.status === 200 && res21.data?.data?.proposal?.status === 'rejected',
      '21. Other pending proposals for the project are automatically rejected upon hiring'
    )

    // 22. Freelancer Active Projects
    const res22 = await request('/freelancers/active-projects', {
      headers: { Authorization: `Bearer ${f1Token}` },
    })
    assert(
      res22.status === 200 &&
        res22.data?.data?.projects?.some((p) => String(p._id) === String(projectId)),
      '22. Freelancer 1 sees the awarded project in GET /freelancers/active-projects'
    )

    // 23. Notification sent to Hired Freelancer 1
    const res23 = await request('/notifications', {
      headers: { Authorization: `Bearer ${f1Token}` },
    })
    const acceptedNotif = res23.data?.data?.notifications?.find((n) => n.type === 'proposal_accepted')
    assert(
      res23.status === 200 && acceptedNotif !== undefined,
      '23. Notification (proposal_accepted) was dispatched to Freelancer 1'
    )

    // 24. Notification sent to Rejected Freelancer 2
    const res24 = await request('/notifications', {
      headers: { Authorization: `Bearer ${f2Token}` },
    })
    const rejectedNotif = res24.data?.data?.notifications?.find((n) => n.type === 'proposal_rejected')
    assert(
      res24.status === 200 && rejectedNotif !== undefined,
      '24. Notification (proposal_rejected) was dispatched to Freelancer 2'
    )

    // 25. Freelancer Marks Notification as Read
    if (acceptedNotif) {
      const res25 = await request(`/notifications/${acceptedNotif._id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${f1Token}` },
      })
      assert(res25.status === 200 && res25.data?.data?.notification?.isRead === true, '25. Freelancer can mark notification as read')
    }

    // 26. Freelancer Dashboard statistics reflect active projects and accepted proposals
    const res26 = await request('/freelancers/dashboard', {
      headers: { Authorization: `Bearer ${f1Token}` },
    })
    assert(
      res26.status === 200 &&
        res26.data?.data?.stats?.activeProjects >= 1 &&
        res26.data?.data?.stats?.acceptedProposals >= 1,
      '26. Freelancer dashboard reflects 1 active project and 1 accepted proposal'
    )

    // 27. Regression: Auth Login works
    const res27 = await request('/auth/login', {
      method: 'POST',
      body: { email: `alex_${unique}@test.com`, password: 'FreelancePass123!' },
    })
    assert(res27.status === 200 && res27.data?.data?.token, '27. Regression: Freelancer login works')

    // 28. Regression: Company Dashboard works
    const res28 = await request('/companies/dashboard', {
      headers: { Authorization: `Bearer ${compToken}` },
    })
    assert(res28.status === 200 && res28.data?.data?.stats, '28. Regression: Company dashboard remains fully functional')

    // 29. Regression: Mentor Dashboard works
    const res29 = await request('/mentor/dashboard', {
      headers: { Authorization: `Bearer ${mentorToken}` },
    })
    assert(res29.status === 200 && res29.data?.data?.bookingStats, '29. Regression: Mentor dashboard remains fully functional')

    // 30. Regression: Student Dashboard works
    const res30 = await request('/student/dashboard', {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert(res30.status === 200 && res30.data?.data?.projectStats, '30. Regression: Student dashboard remains fully functional')

  } catch (err) {
    console.error('Fatal test error:', err)
  } finally {
    if (server) server.close()
    await mongoose.disconnect()
    if (mongod) await mongod.stop()

    console.log('\n======================================================')
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`)
    console.log('======================================================\n')

    process.exit(failed > 0 ? 1 : 0)
  }
}

runTests()
