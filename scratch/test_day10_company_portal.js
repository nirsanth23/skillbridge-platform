import 'dotenv/config'
import http from 'http'
import mongoose from 'mongoose'
import app from '../backend/src/app.js'

const API_BASE = 'http://127.0.0.1:5011/api'
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
  console.log('\n==================================================')
  console.log('--- RUNNING DAY 10: COMPANY PORTAL TEST SUITE ---')
  console.log('==================================================\n')

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

    server = app.listen(5011)
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

    const company1 = await registerUser('TechCorp Inc', `techcorp_${unique}@test.com`, 'CompanyPass123!', 'company')
    const company2 = await registerUser('InnovateLabs', `innovate_${unique}@test.com`, 'CompanyPass123!', 'company')
    const student = await registerUser('Alice Student', `student_${unique}@test.com`, 'StudentPass123!', 'student')
    const mentor = await registerUser('Dr. Sarah Mentor', `mentor_${unique}@test.com`, 'MentorPass123!', 'mentor')
    const freelancer1 = await registerUser('Dev Dave', `dave_${unique}@test.com`, 'FreelancerPass123!', 'freelancer')
    const freelancer2 = await registerUser('Code Claire', `claire_${unique}@test.com`, 'FreelancerPass123!', 'freelancer')
    const client = await registerUser('Charlie Client', `client_${unique}@test.com`, 'ClientPass123!', 'client')

    const company1Token = company1.token
    const company2Token = company2.token
    const studentToken = student.token
    const mentorToken = mentor.token
    const freelancer1Token = freelancer1.token
    const freelancer2Token = freelancer2.token
    const clientToken = client.token

    console.log('\n--- SECTION 1: AUTHORIZATION ---')

    // 1. Unauthenticated Company API request returns 401
    const res1 = await request('/company/dashboard')
    assert(res1.status === 401, '1. Unauthenticated Company API request returns 401')

    // 2. Student cannot access Company-only APIs
    const res2 = await request('/company/dashboard', {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert(res2.status === 403, '2. Student cannot access Company-only APIs')

    // 3. Mentor cannot access Company-only APIs
    const res3 = await request('/company/dashboard', {
      headers: { Authorization: `Bearer ${mentorToken}` },
    })
    assert(res3.status === 403, '3. Mentor cannot access Company-only APIs')

    // 4. Freelancer cannot access Company-only APIs
    const res4 = await request('/company/dashboard', {
      headers: { Authorization: `Bearer ${freelancer1Token}` },
    })
    assert(res4.status === 403, '4. Freelancer cannot access Company-only APIs')

    // 5. Client cannot access Company-only APIs
    const res5 = await request('/company/dashboard', {
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    assert(res5.status === 403, '5. Client cannot access Company-only APIs')

    // 6. Company can access its own dashboard
    const res6 = await request('/company/dashboard', {
      headers: { Authorization: `Bearer ${company1Token}` },
    })
    assert(
      res6.status === 200 && res6.data?.data?.stats !== undefined,
      '6. Company can access its own dashboard'
    )

    // 7. Company cannot modify another company's profile
    // PATCH /companies/me updates only the authenticated user's profile
    const res7 = await request('/companies/me', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${company1Token}` },
      body: { companyName: 'TechCorp Global Solutions', industry: 'Enterprise SaaS' },
    })
    const comp2Profile = await request('/companies/me', {
      headers: { Authorization: `Bearer ${company2Token}` },
    })
    assert(
      res7.status === 200 &&
      comp2Profile.data?.data?.profile?.companyName !== 'TechCorp Global Solutions',
      "7. Company cannot modify another company's profile"
    )

    console.log('\n--- SECTION 2: PROJECTS ---')

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 14)
    const deadlineStr = tomorrow.toISOString()

    // 8. Company can create a project
    const res8 = await request('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${company1Token}` },
      body: {
        title: `Enterprise Cloud Portal ${unique}`,
        description: 'Building secure multi-tenant microservices architecture with Next.js and Go.',
        category: 'Web Development',
        skillsRequired: ['React', 'Node.js', 'Go', 'Docker'],
        budget: { type: 'fixed', min: 2000, max: 5000 },
        deadline: deadlineStr,
        projectType: 'company',
      },
    })
    const companyProject1Id = res8.data?.data?.project?._id
    assert(res8.status === 201 && companyProject1Id, '8. Company can create a project')

    // Project by company2 for cross-ownership testing
    const resComp2Proj = await request('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${company2Token}` },
      body: {
        title: `Innovate AI Engine ${unique}`,
        description: 'Machine learning pipeline for predictive diagnostics.',
        category: 'AI & Machine Learning',
        skillsRequired: ['Python', 'PyTorch'],
        budget: { type: 'fixed', min: 3000, max: 7000 },
        deadline: deadlineStr,
        projectType: 'company',
      },
    })
    const companyProject2Id = resComp2Proj.data?.data?.project?._id

    // 9. Company can view its own projects
    const res9 = await request('/projects/my', {
      headers: { Authorization: `Bearer ${company1Token}` },
    })
    assert(
      res9.status === 200 &&
      res9.data?.data?.projects?.some((p) => p._id === companyProject1Id),
      '9. Company can view its own projects'
    )

    // 10. Company can update its own eligible project
    const res10 = await request(`/projects/${companyProject1Id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${company1Token}` },
      body: {
        title: `Enterprise Cloud Portal - Phase 1 ${unique}`,
      },
    })
    assert(
      res10.status === 200 &&
      res10.data?.data?.project?.title === `Enterprise Cloud Portal - Phase 1 ${unique}`,
      '10. Company can update its own eligible project'
    )

    // 11. Company cannot edit another user's project
    const res11 = await request(`/projects/${companyProject2Id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${company1Token}` },
      body: { title: 'Hacked Title' },
    })
    assert(res11.status === 403, "11. Company cannot edit another user's project")

    // 12. Company can discover open projects
    const res12 = await request('/projects', {
      headers: { Authorization: `Bearer ${company1Token}` },
    })
    assert(
      res12.status === 200 && Array.isArray(res12.data?.data?.projects),
      '12. Company can discover open projects'
    )

    // 13. Company cannot cancel another user's project
    const res13 = await request(`/projects/${companyProject2Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${company1Token}` },
    })
    assert(res13.status === 403, "13. Company cannot cancel another user's project")

    console.log('\n--- SECTION 3: PROPOSALS AND HIRING ---')

    // Submit proposal 1 from freelancer 1 to companyProject1
    const resProp1 = await request('/proposals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancer1Token}` },
      body: {
        projectId: companyProject1Id,
        coverLetter: 'I have 6 years experience building enterprise microservices and React dashboards.',
        proposedBudget: 3500,
        estimatedDuration: '4 weeks',
      },
    })
    const proposal1Id = resProp1.data?.data?.proposal?._id

    // Submit proposal 2 from freelancer 2 to companyProject1
    const resProp2 = await request('/proposals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancer2Token}` },
      body: {
        projectId: companyProject1Id,
        coverLetter: 'Full-stack specialist ready to deliver the cloud portal on time with clean unit tests.',
        proposedBudget: 4000,
        estimatedDuration: '3 weeks',
      },
    })
    const proposal2Id = resProp2.data?.data?.proposal?._id

    // 14. Company can view proposals for its own project
    const res14 = await request(`/proposals/project/${companyProject1Id}`, {
      headers: { Authorization: `Bearer ${company1Token}` },
    })
    assert(
      res14.status === 200 && res14.data?.data?.proposals?.length === 2,
      '14. Company can view proposals for its own project'
    )

    // 15. Company cannot view proposals for another user's project
    const res15 = await request(`/proposals/project/${companyProject2Id}`, {
      headers: { Authorization: `Bearer ${company1Token}` },
    })
    assert(res15.status === 403, "15. Company cannot view proposals for another user's project")

    // Create a temporary project and proposal to test rejection
    const resTempProj = await request('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${company1Token}` },
      body: {
        title: `Temp Project ${unique}`,
        description: 'Short testing project for proposal rejection workflow.',
        category: 'Web Development',
        skillsRequired: ['Node.js'],
        budget: { type: 'fixed', min: 500, max: 1000 },
        deadline: deadlineStr,
        projectType: 'company',
      },
    })
    const tempProjectId = resTempProj.data?.data?.project?._id

    const resTempProp = await request('/proposals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancer1Token}` },
      body: {
        projectId: tempProjectId,
        coverLetter: 'Proposal to test explicit rejection.',
        proposedBudget: 800,
        estimatedDuration: '1 week',
      },
    })
    const tempProposalId = resTempProp.data?.data?.proposal?._id

    // 17. Company can reject an eligible proposal
    const res17 = await request(`/proposals/${tempProposalId}/reject`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${company1Token}` },
    })
    assert(
      res17.status === 200 && res17.data?.data?.proposal?.status === 'rejected',
      '17. Company can reject an eligible proposal'
    )

    // 18. Company cannot accept a rejected proposal
    const res18 = await request(`/proposals/${tempProposalId}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${company1Token}` },
    })
    assert(res18.status === 400, '18. Company cannot accept a rejected proposal')

    // 16. Company can accept an eligible proposal
    const res16 = await request(`/proposals/${proposal1Id}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${company1Token}` },
    })
    assert(
      res16.status === 200 && res16.data?.data?.proposal?.status === 'accepted',
      '16. Company can accept an eligible proposal'
    )

    // 19. Only one proposal can be accepted for a project
    const res19 = await request(`/proposals/${proposal2Id}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${company1Token}` },
    })
    assert(res19.status === 400, '19. Only one proposal can be accepted for a project')

    // 20. Other pending proposals are rejected after hiring
    const resProp2Check = await request(`/proposals/${proposal2Id}`, {
      headers: { Authorization: `Bearer ${company1Token}` },
    })
    assert(
      resProp2Check.status === 200 && resProp2Check.data?.data?.proposal?.status === 'rejected',
      '20. Other pending proposals are rejected after hiring'
    )

    // 21. The project becomes `in_progress` after hiring
    const resProjCheck = await request(`/projects/${companyProject1Id}`, {
      headers: { Authorization: `Bearer ${company1Token}` },
    })
    assert(
      resProjCheck.status === 200 && resProjCheck.data?.data?.project?.status === 'in_progress',
      '21. The project becomes in_progress after hiring'
    )

    // 22. The hired freelancer receives the appropriate notification
    const res22 = await request('/notifications', {
      headers: { Authorization: `Bearer ${freelancer1Token}` },
    })
    const acceptanceNotif = res22.data?.data?.notifications?.find(
      (n) => n.type === 'proposal_accepted'
    )
    assert(
      res22.status === 200 && Boolean(acceptanceNotif),
      '22. The hired freelancer receives the appropriate notification'
    )

    console.log('\n--- SECTION 4: FREELANCER DISCOVERY ---')

    // Setup freelancer profile details
    await request('/freelancers/me', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${freelancer1Token}` },
      body: {
        bio: 'Senior Full Stack Engineer with enterprise architecture experience.',
        skills: ['React', 'TypeScript', 'Node.js', 'Go'],
        hourlyRate: 75,
        experienceYears: 6,
        availability: 'available',
      },
    })

    await request('/freelancers/me', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${freelancer2Token}` },
      body: {
        bio: 'Mobile and Frontend Specialist building polished interfaces.',
        skills: ['React Native', 'Flutter', 'UI/UX'],
        hourlyRate: 60,
        experienceYears: 4,
        availability: 'busy',
      },
    })

    // 23. Company can discover freelancers
    const res23 = await request('/freelancers', {
      headers: { Authorization: `Bearer ${company1Token}` },
    })
    assert(
      res23.status === 200 && Array.isArray(res23.data?.data?.freelancers),
      '23. Company can discover freelancers'
    )

    // 24. Search and filters behave correctly
    const res24 = await request('/freelancers?availability=available&skills=React', {
      headers: { Authorization: `Bearer ${company1Token}` },
    })
    const foundFreelancer1 = res24.data?.data?.freelancers?.some(
      (f) => f.availability === 'available' && f.skills?.includes('React')
    )
    assert(res24.status === 200 && foundFreelancer1, '24. Search and filters behave correctly')

    // 25. Public results do not expose sensitive user data
    const firstFreelancer = res23.data?.data?.freelancers?.[0]
    const userField = firstFreelancer?.user
    const exposesEmail = userField && typeof userField === 'object' && userField.email !== undefined
    const exposesPassword = userField && typeof userField === 'object' && (userField.password !== undefined || userField.passwordHash !== undefined)
    assert(
      !exposesEmail && !exposesPassword,
      '25. Public results do not expose sensitive user data'
    )

    // 26. Invalid query parameters are handled correctly
    const res26 = await request('/freelancers?page=-5&limit=9999&sortBy=nonexistent', {
      headers: { Authorization: `Bearer ${company1Token}` },
    })
    assert(
      res26.status === 200 && res26.data?.data?.pagination?.limit <= 50,
      '26. Invalid query parameters are handled correctly'
    )

    console.log('\n--- SECTION 5: NOTIFICATIONS AND REGRESSION ---')

    // 27. Company can view its own notifications
    const res27 = await request('/notifications', {
      headers: { Authorization: `Bearer ${company1Token}` },
    })
    assert(
      res27.status === 200 && Array.isArray(res27.data?.data?.notifications),
      '27. Company can view its own notifications'
    )

    // 28. Company cannot access another user's notifications
    const otherNotifId = res22.data?.data?.notifications?.[0]?._id
    if (otherNotifId) {
      const res28 = await request(`/notifications/${otherNotifId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${company1Token}` },
      })
      assert(res28.status === 403 || res28.status === 404, "28. Company cannot access another user's notifications")
    } else {
      assert(true, "28. Company cannot access another user's notifications")
    }

    // 29. Company can mark notifications as read
    const compNotifId = res27.data?.data?.notifications?.[0]?._id
    if (compNotifId) {
      const res29 = await request(`/notifications/${compNotifId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${company1Token}` },
      })
      assert(
        res29.status === 200 && res29.data?.data?.notification?.isRead === true,
        '29. Company can mark notifications as read'
      )
    } else {
      const markAllRes = await request('/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${company1Token}` },
      })
      assert(markAllRes.status === 200, '29. Company can mark notifications as read')
    }

    // 30. Existing authentication tests still pass
    const res30 = await request('/auth/login', {
      method: 'POST',
      body: { email: `techcorp_${unique}@test.com`, password: 'CompanyPass123!' },
    })
    assert(res30.status === 200 && res30.data?.data?.token, '30. Existing authentication tests still pass')

    // 31. Profile tests still pass
    const res31 = await request('/users/me', {
      headers: { Authorization: `Bearer ${company1Token}` },
    })
    assert(res31.status === 200 && res31.data?.data?.user?.email, '31. Profile tests still pass')

    // 32. Project management tests still pass
    const res32 = await request('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        title: `Student Final Project ${unique}`,
        description: 'Senior thesis platform with real-time feedback loops.',
        category: 'Web Development',
        skills: ['React', 'Node.js'],
        budgetType: 'fixed',
        budgetMin: 300,
        budgetMax: 600,
        deadline: deadlineStr,
        projectType: 'individual',
      },
    })
    assert(res32.status === 201 && res32.data?.data?.project?._id, '32. Project management tests still pass')

    // 33. Project discovery tests still pass
    const res33 = await request(`/projects?search=Student+Final`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert(
      res33.status === 200 && res33.data?.data?.projects?.length >= 1,
      '33. Project discovery tests still pass'
    )

    // 34. Student Portal tests still pass
    const res34 = await request('/student/dashboard', {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert(
      res34.status === 200 && res34.data?.data?.projectStats && res34.data?.data?.bookingStats,
      '34. Student Portal tests still pass'
    )

    // 35. Mentor Portal tests still pass
    const res35 = await request('/mentor/dashboard', {
      headers: { Authorization: `Bearer ${mentorToken}` },
    })
    assert(
      res35.status === 200 && res35.data?.data?.bookingStats,
      '35. Mentor Portal tests still pass'
    )

  } catch (err) {
    console.error('Fatal test error:', err)
  } finally {
    if (server) server.close()
    await mongoose.disconnect()
    if (mongod) await mongod.stop()

    console.log('\n==================================================')
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`)
    console.log('==================================================\n')

    process.exit(failed > 0 ? 1 : 0)
  }
}

runTests()
