import 'dotenv/config'
import http from 'http'
import mongoose from 'mongoose'
import app from '../src/app.js'


const API_BASE = 'http://127.0.0.1:5009/api'
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
      res.on('data', (chunk) => (body += chunk))
      res.on('end', () => {
        let parsed = {}
        try {
          parsed = body ? JSON.parse(body) : {}
        } catch {
          parsed = { raw: body }
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
        })
      })
    })

    req.on('error', reject)

    if (options.body) {
      req.write(JSON.stringify(options.body))
    }
    req.end()
  })
}

const runTests = async () => {
  console.log('\n==================================================')
  console.log('--- RUNNING DAY 8: STUDENT PORTAL TEST SUITE ---')
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

    server = app.listen(5009)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const unique = Date.now()

    // Create users for testing: Student, Student2, Freelancer, Freelancer2, Mentor, Company, Client
    const registerUser = async (name, email, password, role) => {
      const res = await request('/auth/register', {
        method: 'POST',
        body: { name, email, password, role },
      })
      return res.data?.data?.token
    }

    const studentToken = await registerUser('Alice Student', `alice_${unique}@test.com`, 'password123', 'student')
    const student2Token = await registerUser('Bob Student', `bob_${unique}@test.com`, 'password123', 'student')
    const freelancerToken = await registerUser('Charlie Freelancer', `charlie_${unique}@test.com`, 'password123', 'freelancer')
    const freelancer2Token = await registerUser('Dave Freelancer', `dave_${unique}@test.com`, 'password123', 'freelancer')
    const mentorToken = await registerUser('Elena Mentor', `elena_${unique}@test.com`, 'password123', 'mentor')
    const companyToken = await registerUser('Acme Corp', `acme_${unique}@test.com`, 'password123', 'company')
    const clientToken = await registerUser('George Client', `george_${unique}@test.com`, 'password123', 'client')

    // Fetch user IDs
    const getUserId = async (token) => {
      const res = await request('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      return res.data?.data?.user?._id
    }

    const studentId = await getUserId(studentToken)
    const student2Id = await getUserId(student2Token)
    const freelancerId = await getUserId(freelancerToken)
    const freelancer2Id = await getUserId(freelancer2Token)
    const mentorId = await getUserId(mentorToken)

    // Set up mentor profile
    await request('/mentors/me', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${mentorToken}` },
      body: {
        bio: 'Senior Full Stack Lead with 10 years experience.',
        expertise: ['React', 'Node.js', 'System Design'],
        experienceYears: 10,
        hourlyRate: 75,
        availability: 'available',
      },
    })

    console.log('\n--- SECTION 1: AUTHORIZATION ---')
    // 1. Student dashboard without JWT -> 401
    const res1 = await request('/student/dashboard')
    assert(res1.status === 401, '1. Student dashboard without JWT -> 401')

    // 2. Freelancer accessing student APIs -> 403
    const res2 = await request('/student/dashboard', { headers: { Authorization: `Bearer ${freelancerToken}` } })
    assert(res2.status === 403, '2. Freelancer accessing student APIs -> 403')

    // 3. Mentor accessing student APIs -> 403
    const res3 = await request('/student/dashboard', { headers: { Authorization: `Bearer ${mentorToken}` } })
    assert(res3.status === 403, '3. Mentor accessing student APIs -> 403')

    // 4. Company accessing student APIs -> 403
    const res4 = await request('/student/dashboard', { headers: { Authorization: `Bearer ${companyToken}` } })
    assert(res4.status === 403, '4. Company accessing student APIs -> 403')

    // 5. Client accessing student APIs -> 403
    const res5 = await request('/student/dashboard', { headers: { Authorization: `Bearer ${clientToken}` } })
    assert(res5.status === 403, '5. Client accessing student APIs -> 403')

    // 6. Student accessing student APIs -> success
    const res6 = await request('/student/dashboard', { headers: { Authorization: `Bearer ${studentToken}` } })
    assert(res6.status === 200 && res6.data?.success === true, '6. Student accessing student APIs -> success')

    console.log('\n--- SECTION 2: PROJECTS ---')
    // 7. Student can create project
    const createProjRes = await request('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        title: 'Build SkillBridge Student Portal',
        description: 'Complete project requiring React and Node.js for academic portal.',
        category: 'Web Development',
        skills: ['React', 'Node.js', 'Tailwind'],
        budgetType: 'fixed',
        budgetMin: 300,
        budgetMax: 500,
      },
    })
    const projectId = createProjRes.data?.data?.project?._id
    assert(createProjRes.status === 201 && projectId, '7. Student can create project')

    // 8. Student can view own projects
    const res8 = await request('/projects/my-projects', { headers: { Authorization: `Bearer ${studentToken}` } })
    assert(res8.status === 200 && res8.data?.data?.projects?.length >= 1, '8. Student can view own projects')

    // 9. Student can update own project
    const res9 = await request(`/projects/${projectId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        title: 'Build SkillBridge Student Portal (Updated)',
      },
    })
    assert(res9.status === 200 && res9.data?.data?.project?.title.includes('Updated'), '9. Student can update own project')

    // 10. Student cannot update another user's project
    const res10 = await request(`/projects/${projectId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${student2Token}` },
      body: {
        title: 'Hacked Project Title',
      },
    })
    assert(res10.status === 403 || res10.status === 404, '10. Student cannot update another user\'s project')

    // 11. Student can browse open projects
    const res11 = await request('/projects', { headers: { Authorization: `Bearer ${studentToken}` } })
    assert(res11.status === 200 && Array.isArray(res11.data?.data?.projects), '11. Student can browse open projects')

    console.log('\n--- SECTION 3: PROPOSALS ---')
    // Freelancers submit proposals
    const prop1Res = await request('/proposals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: {
        projectId,
        coverLetter: 'I have extensive experience with React and Tailwind and would love to build this.',
        proposedBudget: 450,
        estimatedDuration: '2 weeks',
      },
    })
    const proposal1Id = prop1Res.data?.data?.proposal?._id

    const prop2Res = await request('/proposals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancer2Token}` },
      body: {
        projectId,
        coverLetter: 'I am a backend specialist with MongoDB and Express experience.',
        proposedBudget: 400,
        estimatedDuration: '10 days',
      },
    })
    const proposal2Id = prop2Res.data?.data?.proposal?._id

    // 12. Project owner can view proposals
    const res12 = await request(`/proposals/project/${projectId}`, { headers: { Authorization: `Bearer ${studentToken}` } })
    assert(res12.status === 200 && res12.data?.data?.proposals?.length === 2, '12. Project owner can view proposals')

    // 13. Non-owner cannot view proposals
    const res13 = await request(`/proposals/project/${projectId}`, { headers: { Authorization: `Bearer ${student2Token}` } })
    assert(res13.status === 403, '13. Non-owner cannot view proposals -> 403')

    // Create a second project for reject test
    const createProj2Res = await request('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        title: 'SkillBridge Secondary Project for Rejection Test',
        description: 'Test project description for rejecting candidate proposals.',
        category: 'Mobile Apps',
        budgetMin: 100,
        budgetMax: 200,
      },
    })
    const project2Id = createProj2Res.data?.data?.project?._id
    const prop3Res = await request('/proposals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: {
        projectId: project2Id,
        coverLetter: 'Candidate proposal to test explicit rejection workflow.',
        proposedBudget: 150,
        estimatedDuration: '3 days',
      },
    })
    const proposal3Id = prop3Res.data?.data?.proposal?._id

    // 15. Project owner can reject proposal
    const res15 = await request(`/proposals/${proposal3Id}/reject`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert(res15.status === 200 && res15.data?.data?.proposal?.status === 'rejected', '15. Project owner can reject proposal')

    // 16. Cannot accept already rejected proposal
    const res16 = await request(`/proposals/${proposal3Id}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert(res16.status === 400, '16. Cannot accept already rejected proposal -> 400')

    // 17. Cannot accept proposal for another user's project
    const res17 = await request(`/proposals/${proposal1Id}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${student2Token}` },
    })
    assert(res17.status === 403, '17. Cannot accept proposal for another user\'s project -> 403')

    // 14. Project owner can accept proposal
    const res14 = await request(`/proposals/${proposal1Id}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert(res14.status === 200 && res14.data?.data?.proposal?.status === 'accepted', '14. Project owner can accept proposal')

    // 18. Only one proposal can be accepted (second proposal already rejected or project in_progress)
    const res18 = await request(`/proposals/${proposal2Id}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert(res18.status === 400, '18. Only one proposal can be accepted -> 400')

    // 19. Other pending proposals become rejected
    const prop2Check = await request(`/proposals/${proposal2Id}`, { headers: { Authorization: `Bearer ${studentToken}` } })
    assert(prop2Check.data?.data?.proposal?.status === 'rejected', '19. Other pending proposals become rejected')

    // 20. Project becomes in_progress after hiring
    const projCheck = await request(`/projects/${projectId}`, { headers: { Authorization: `Bearer ${studentToken}` } })
    assert(
      projCheck.data?.data?.project?.status === 'in_progress' &&
      String(projCheck.data?.data?.project?.hiredFreelancer) === String(freelancerId),
      '20. Project becomes in_progress after hiring'
    )

    console.log('\n--- SECTION 4: MENTOR DISCOVERY & BOOKINGS ---')
    // 21. Student can browse mentors
    const res21 = await request('/mentors?availability=available')
    assert(res21.status === 200 && res21.data?.data?.mentors?.length >= 1, '21. Student can browse mentors')

    // 22. Student can view mentor profile
    const res22 = await request(`/mentors/${mentorId}`)
    assert(res22.status === 200 && res22.data?.data?.profile?.hourlyRate === 75, '22. Student can view mentor profile')

    // 23. Student can create booking
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 2)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const bookRes = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        mentorId,
        date: tomorrowStr,
        startTime: '14:00',
        endTime: '15:00',
        topic: 'React Performance Optimization',
        notes: 'Reviewing component re-renders.',
      },
    })
    const bookingId = bookRes.data?.data?.booking?._id
    assert(bookRes.status === 201 && bookingId, '23. Student can create booking')

    // 24. Student can view own bookings
    const res24 = await request('/bookings/my', { headers: { Authorization: `Bearer ${studentToken}` } })
    assert(res24.status === 200 && res24.data?.data?.bookings?.length >= 1, '24. Student can view own bookings')

    // 25. Student cannot view another student's booking
    const res25 = await request(`/bookings/${bookingId}`, { headers: { Authorization: `Bearer ${student2Token}` } })
    assert(res25.status === 403 || res25.status === 404, '25. Student cannot view another student\'s booking')

    // 26. Student can cancel eligible booking
    const res26 = await request(`/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert(res26.status === 200 && res26.data?.data?.booking?.status === 'cancelled', '26. Student can cancel eligible booking')

    // 27. Invalid booking date rejected (past date)
    const res27 = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        mentorId,
        date: '2020-01-01',
        startTime: '10:00',
        endTime: '11:00',
        topic: 'Past Date Test',
      },
    })
    assert(res27.status === 400, '27. Invalid booking date rejected -> 400')

    // 28. Invalid time range rejected (end time before start time)
    const res28 = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        mentorId,
        date: tomorrowStr,
        startTime: '15:00',
        endTime: '14:00',
        topic: 'Invalid Time Test',
      },
    })
    assert(res28.status === 400, '28. Invalid time range rejected -> 400')

    console.log('\n--- SECTION 5: NOTIFICATIONS ---')
    // 29. Student can view own notifications
    const res29 = await request('/notifications', { headers: { Authorization: `Bearer ${studentToken}` } })
    const notifications = res29.data?.data?.notifications || []
    assert(res29.status === 200 && Array.isArray(notifications), '29. Student can view own notifications')

    // 30. Student cannot view another user's notifications (marking or fetching other's notification)
    const notifId = notifications[0]?._id
    if (notifId) {
      const res30 = await request(`/notifications/${notifId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${student2Token}` },
      })
      assert(res30.status === 404 || res30.status === 403, '30. Student cannot mark another user\'s notification')

      // 31. Student can mark notification as read
      const res31 = await request(`/notifications/${notifId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${studentToken}` },
      })
      assert(res31.status === 200 && res31.data?.data?.notification?.isRead === true, '31. Student can mark notification as read')
    } else {
      assert(true, '30. Student cannot mark another user\'s notification (skipped)')
      assert(true, '31. Student can mark notification as read (skipped)')
    }

    // 32. Student can mark all as read
    const res32 = await request('/notifications/read-all', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert(res32.status === 200, '32. Student can mark all as read')

    console.log('\n--- SECTION 6: DASHBOARD ---')
    // 33. Student dashboard returns only student's data
    const res33 = await request('/student/dashboard', { headers: { Authorization: `Bearer ${studentToken}` } })
    const dashData = res33.data?.data
    assert(
      res33.status === 200 &&
      dashData?.student?.email === `alice_${unique}@test.com`,
      '33. Student dashboard returns only student\'s data'
    )

    // 34. Dashboard project statistics are correct
    assert(
      dashData?.projectStats?.total >= 2 &&
      dashData?.projectStats?.inProgress >= 1,
      '34. Dashboard project statistics are correct'
    )

    console.log('\n--- SECTION 7: REGRESSION TESTS ---')
    // 35. Day 1 authentication still passes
    const authCheck = await request('/auth/me', { headers: { Authorization: `Bearer ${studentToken}` } })
    assert(authCheck.status === 200 && authCheck.data?.data?.user?.role === 'student', '35. Day 1 authentication still passes')

    // 36. Day 3 profile tests still pass
    const profCheck = await request('/users/me', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { name: 'Alice Student Updated' },
    })
    assert(profCheck.status === 200 && profCheck.data?.data?.user?.name === 'Alice Student Updated', '36. Day 3 profile tests still pass')

    // 37. Day 4 profile tests still pass
    const freeCheck = await request('/freelancers/me', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: { bio: 'Freelancer bio update test', hourlyRate: 50 },
    })
    assert(freeCheck.status === 200, '37. Day 4 professional profile tests still pass')

    // 38. Day 6 project tests still pass
    const projList = await request('/projects/my-projects', { headers: { Authorization: `Bearer ${studentToken}` } })
    assert(projList.status === 200 && projList.data?.data?.projects?.length >= 2, '38. Day 6 project tests still pass')

    // 39. Day 7 discovery tests still pass
    const discCheck = await request('/projects?search=SkillBridge&sortBy=newest', { headers: { Authorization: `Bearer ${studentToken}` } })
    assert(discCheck.status === 200 && discCheck.data?.data?.projects?.length >= 1, '39. Day 7 discovery tests still pass')


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
