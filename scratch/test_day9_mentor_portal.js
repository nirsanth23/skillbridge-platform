import 'dotenv/config'
import http from 'http'
import mongoose from 'mongoose'
import app from '../src/app.js'

const API_BASE = 'http://127.0.0.1:5010/api'
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
  console.log('--- RUNNING DAY 9: MENTOR PORTAL TEST SUITE ---')
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

    server = app.listen(5010)
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

    const student = await registerUser('Alice Student', `alice_${unique}@test.com`, 'StudentPass123!', 'student')
    const student2 = await registerUser('Bob Student', `bob_${unique}@test.com`, 'StudentPass123!', 'student')
    const mentor1 = await registerUser('Dr. Sarah Mentor', `sarah_${unique}@test.com`, 'MentorPass123!', 'mentor')
    const mentor2 = await registerUser('Prof. Alex Mentor', `alex_${unique}@test.com`, 'MentorPass123!', 'mentor')
    const freelancer = await registerUser('Frank Freelancer', `frank_${unique}@test.com`, 'FreelancerPass123!', 'freelancer')
    const company = await registerUser('Acme Corp', `acme_${unique}@test.com`, 'CompanyPass123!', 'company')
    const client = await registerUser('Charlie Client', `charlie_${unique}@test.com`, 'ClientPass123!', 'client')

    const studentToken = student.token
    const student2Token = student2.token
    const mentor1Token = mentor1.token
    const mentor2Token = mentor2.token
    const freelancerToken = freelancer.token
    const companyToken = company.token
    const clientToken = client.token

    console.log('\n--- SECTION 1: AUTHORIZATION ---')

    // 1. Unauthenticated mentor endpoint returns 401
    const res1 = await request('/mentor/dashboard')
    assert(res1.status === 401, '1. Unauthenticated mentor endpoint returns 401')

    // 2. Student cannot access mentor-only endpoints -> 403
    const res2 = await request('/mentor/dashboard', { headers: { Authorization: `Bearer ${studentToken}` } })
    assert(res2.status === 403, '2. Student cannot access mentor-only endpoints -> 403')

    // 3. Freelancer cannot access mentor-only endpoints -> 403
    const res3 = await request('/mentor/dashboard', { headers: { Authorization: `Bearer ${freelancerToken}` } })
    assert(res3.status === 403, '3. Freelancer cannot access mentor-only endpoints -> 403')

    // 4. Company cannot access mentor-only endpoints -> 403
    const res4 = await request('/mentor/dashboard', { headers: { Authorization: `Bearer ${companyToken}` } })
    assert(res4.status === 403, '4. Company cannot access mentor-only endpoints -> 403')

    // 5. Client cannot access mentor-only endpoints -> 403
    const res5 = await request('/mentor/dashboard', { headers: { Authorization: `Bearer ${clientToken}` } })
    assert(res5.status === 403, '5. Client cannot access mentor-only endpoints -> 403')

    // 6. Mentor can access their own dashboard and profile
    const res6a = await request('/mentor/dashboard', { headers: { Authorization: `Bearer ${mentor1Token}` } })
    const res6b = await request('/mentors/me', { headers: { Authorization: `Bearer ${mentor1Token}` } })
    assert(res6a.status === 200 && res6b.status === 200, '6. Mentor can access their own dashboard and profile')

    // Prepare bookings for testing
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 2)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Student books mentor2
    const bookMentor2Res = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        mentorId: mentor2.userId,
        date: tomorrowStr,
        startTime: '14:00',
        endTime: '15:00',
        topic: 'AI Career Guidance',
        notes: 'Discussion on ML roles.',
      },
    })
    const mentor2BookingId = bookMentor2Res.data?.data?.booking?._id

    // 7. Mentor cannot view another mentor's private booking
    const res7 = await request(`/bookings/${mentor2BookingId}`, {
      headers: { Authorization: `Bearer ${mentor1Token}` },
    })
    assert(res7.status === 403, "7. Mentor cannot view another mentor's private booking -> 403")

    console.log('\n--- SECTION 2: BOOKINGS ---')

    // Student books mentor1 (Booking A)
    const book1Res = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        mentorId: mentor1.userId,
        date: tomorrowStr,
        startTime: '10:00',
        endTime: '11:00',
        topic: 'System Design Interview Prep',
        notes: 'Scalability architectures.',
      },
    })
    const bookingAId = book1Res.data?.data?.booking?._id

    // Student books mentor1 (Booking B - to be rejected)
    const book2Res = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        mentorId: mentor1.userId,
        date: tomorrowStr,
        startTime: '11:30',
        endTime: '12:30',
        topic: 'Frontend Optimization Session',
      },
    })
    const bookingBId = book2Res.data?.data?.booking?._id

    // 8. Mentor can view their own booking requests
    const res8 = await request('/bookings/mentor/requests', {
      headers: { Authorization: `Bearer ${mentor1Token}` },
    })
    assert(
      res8.status === 200 && Array.isArray(res8.data?.data?.bookings) && res8.data.data.bookings.length >= 2,
      '8. Mentor can view their own booking requests'
    )

    // 9. Mentor cannot accept another mentor's booking
    const res9 = await request(`/bookings/${mentor2BookingId}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${mentor1Token}` },
    })
    assert(res9.status === 403, "9. Mentor cannot accept another mentor's booking -> 403")

    // 10. Mentor can accept an eligible pending request
    const res10 = await request(`/bookings/${bookingAId}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${mentor1Token}` },
    })
    assert(
      res10.status === 200 && res10.data?.data?.booking?.status === 'confirmed',
      '10. Mentor can accept an eligible pending request',
      `got status: ${res10.status}, data: ${JSON.stringify(res10.data)}`
    )

    // 11. Mentor can reject an eligible pending request
    const res11 = await request(`/bookings/${bookingBId}/reject`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${mentor1Token}` },
      body: { reason: 'Schedule conflict' },
    })
    assert(
      res11.status === 200 && res11.data?.data?.booking?.status === 'rejected',
      '11. Mentor can reject an eligible pending request',
      `got status: ${res11.status}, data: ${JSON.stringify(res11.data)}`
    )

    // 12. Mentor cannot accept an already rejected booking
    const res12 = await request(`/bookings/${bookingBId}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${mentor1Token}` },
    })
    assert(res12.status === 400, '12. Mentor cannot accept an already rejected booking -> 400')

    // Student books mentor1 (Booking C - to test completing pending booking)
    const book3Res = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        mentorId: mentor1.userId,
        date: tomorrowStr,
        startTime: '16:00',
        endTime: '17:00',
        topic: 'Mock Coding Interview',
      },
    })
    const bookingCId = book3Res.data?.data?.booking?._id

    // 13. Mentor cannot complete a pending booking
    const res13 = await request(`/bookings/${bookingCId}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${mentor1Token}` },
    })
    assert(res13.status === 400, '13. Mentor cannot complete a pending booking -> 400')

    // 14. Mentor can complete an eligible session (Booking A is confirmed)
    const res14 = await request(`/bookings/${bookingAId}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${mentor1Token}` },
    })
    assert(
      res14.status === 200 && res14.data?.data?.booking?.status === 'completed',
      '14. Mentor can complete an eligible session'
    )

    // 15. Invalid booking ID returns 400
    const res15 = await request('/bookings/invalid-id-123/accept', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${mentor1Token}` },
    })
    assert(res15.status === 400, '15. Invalid booking ID returns 400')

    // 16. Missing booking returns 404
    const res16 = await request('/bookings/507f1f77bcf86cd799439011', {
      headers: { Authorization: `Bearer ${mentor1Token}` },
    })
    assert(res16.status === 404, '16. Missing booking returns 404')

    // 17. Invalid state transition returns an appropriate error (cannot complete cancelled session)
    const cancelRes = await request(`/bookings/${bookingCId}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${mentor1Token}` },
    })
    const res17 = await request(`/bookings/${bookingCId}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${mentor1Token}` },
    })
    assert(
      cancelRes.status === 200 && res17.status === 400,
      '17. Invalid state transition returns an appropriate error (completing cancelled booking -> 400)'
    )

    // 18. Existing Student Portal booking behaviour still works
    const res18 = await request('/bookings/my', {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert(
      res18.status === 200 && Array.isArray(res18.data?.data?.bookings) && res18.data.data.bookings.length >= 3,
      '18. Existing Student Portal booking behaviour still works'
    )

    console.log('\n--- SECTION 3: REVIEWS AND NOTIFICATIONS ---')

    // Student submits review for completed session with mentor1
    const reviewRes = await request('/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        mentorId: mentor1.userId,
        bookingId: bookingAId,
        rating: 5,
        comment: 'Outstanding mentoring session on system design! Very practical advice.',
      },
    })

    // 19. Mentor can view their own reviews
    const res19 = await request('/reviews/my', {
      headers: { Authorization: `Bearer ${mentor1Token}` },
    })
    assert(
      res19.status === 200 && res19.data?.data?.reviews?.length >= 1 && res19.data?.data?.stats?.averageRating === 5,
      '19. Mentor can view their own reviews'
    )

    // 20. Mentor cannot alter rating metrics directly
    const res20 = await request('/mentors/me', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${mentor1Token}` },
      body: {
        bio: 'Senior Software Architect and Tech Lead',
        hourlyRate: 75,
        rating: 1.0, // should be ignored / protected
        reviewCount: 999, // should be ignored / protected
        completedSessions: 888, // should be ignored / protected
      },
    })
    const mentorProfileCheck = await request('/mentors/me', {
      headers: { Authorization: `Bearer ${mentor1Token}` },
    })
    const profileData = mentorProfileCheck.data?.data?.profile
    assert(
      res20.status === 200 &&
      profileData.rating === 5 &&
      profileData.reviewCount === 1 &&
      profileData.completedSessions === 1,
      '20. Mentor cannot alter rating metrics directly (remains protected)'
    )

    // 21. Mentor can view their own notifications
    const res21 = await request('/notifications', {
      headers: { Authorization: `Bearer ${mentor1Token}` },
    })
    assert(
      res21.status === 200 && res21.data?.data?.notifications?.length >= 1,
      '21. Mentor can view their own notifications'
    )

    // 22. Mentor cannot access another user's notifications
    const studentNotifRes = await request('/notifications', {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    const studentNotifId = studentNotifRes.data?.data?.notifications?.[0]?._id
    const res22 = await request(`/notifications/${studentNotifId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${mentor1Token}` },
    })
    assert(res22.status === 403 || res22.status === 404, "22. Mentor cannot access another user's notifications")

    // 23. Mark-as-read operations enforce ownership
    const mentorNotifId = res21.data?.data?.notifications?.[0]?._id
    const res23 = await request(`/notifications/${mentorNotifId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${mentor1Token}` },
    })
    assert(
      res23.status === 200 && res23.data?.data?.notification?.isRead === true,
      '23. Mark-as-read operations enforce ownership'
    )

    console.log('\n--- SECTION 4: REGRESSION TESTS ---')

    // 24. Authentication tests still pass
    const res24 = await request('/auth/login', {
      method: 'POST',
      body: { email: `sarah_${unique}@test.com`, password: 'MentorPass123!' },
    })
    assert(res24.status === 200 && res24.data?.data?.token, '24. Authentication tests still pass')

    // 25. User profile tests still pass
    const res25 = await request('/users/me', {
      headers: { Authorization: `Bearer ${mentor1Token}` },
    })
    assert(res25.status === 200 && res25.data?.data?.user?.email, '25. User profile tests still pass')

    // 26. Freelancer, mentor and company profile tests still pass
    const res26a = await request('/freelancers/me', { headers: { Authorization: `Bearer ${freelancerToken}` } })
    const res26b = await request('/mentors/me', { headers: { Authorization: `Bearer ${mentor1Token}` } })
    const res26c = await request('/companies/me', { headers: { Authorization: `Bearer ${companyToken}` } })
    assert(
      res26a.status === 200 && res26b.status === 200 && res26c.status === 200,
      '26. Freelancer, mentor and company profile tests still pass'
    )

    // 27. Project management tests still pass
    const res27 = await request('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        title: `SkillBridge Project ${unique}`,
        description: 'Building modern mentor platform capabilities for engineering mentors.',
        category: 'Web Development',
        skillsRequired: ['React', 'Node.js', 'MongoDB'],
        budget: { type: 'fixed', min: 400, max: 900 },
        deadline: tomorrowStr,
      },
    })
    assert(res27.status === 201 && res27.data?.data?.project?._id, '27. Project management tests still pass')

    // 28. Project discovery tests still pass
    const res28 = await request('/projects?search=SkillBridge', {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert(res28.status === 200 && res28.data?.data?.projects?.length >= 1, '28. Project discovery tests still pass')

    // 29. Student Portal tests still pass
    const res29 = await request('/student/dashboard', {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert(
      res29.status === 200 && res29.data?.data?.projectStats && res29.data?.data?.bookingStats,
      '29. Student Portal tests still pass'
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
