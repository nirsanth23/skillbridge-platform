import 'dotenv/config'
import http from 'http'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import app from '../src/app.js'
import User from '../src/modules/users/user.model.js'
import Project from '../src/modules/projects/project.model.js'
import Proposal from '../src/modules/proposals/proposal.model.js'
import Report from '../src/modules/admin/report.model.js'
import { generateToken } from '../src/modules/auth/auth.service.js'

const TEST_PORT = 5014
const API_BASE = `http://127.0.0.1:${TEST_PORT}/api`
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
  console.log('--- RUNNING DAY 13: ADMIN PORTAL TEST SUITE ---')
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

    server = app.listen(TEST_PORT)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const unique = Date.now()

    // 1. Helper to register standard users via public auth
    const registerUser = async (name, email, password, role) => {
      const res = await request('/auth/register', {
        method: 'POST',
        body: { name, email, password, role },
      })
      return {
        token: res.data?.data?.token,
        userId: res.data?.data?.user?.id || res.data?.data?.user?._id,
        res,
      }
    }

    // Helper to create admin in DB (since public registration as admin is prohibited)
    const createAdminUser = async (name, email, password) => {
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(password, salt)
      const admin = await User.create({
        name,
        email,
        passwordHash,
        role: 'admin',
        status: 'active',
        isVerified: true,
      })
      const token = generateToken(admin)
      return {
        token,
        userId: admin._id.toString(),
        admin,
      }
    }

    // Provision test users
    console.log('Provisioning test users across roles...')
    const studentUser = await registerUser('Test Student', `student_${unique}@test.com`, 'password123', 'student')
    const mentorUser = await registerUser('Test Mentor', `mentor_${unique}@test.com`, 'password123', 'mentor')
    const companyUser = await registerUser('Test Company', `company_${unique}@test.com`, 'password123', 'company')
    const freelancerUser = await registerUser('Test Freelancer', `freelancer_${unique}@test.com`, 'password123', 'freelancer')
    const clientUser = await registerUser('Test Client', `client_${unique}@test.com`, 'password123', 'client')

    const admin1 = await createAdminUser('Primary Admin', `admin1_${unique}@test.com`, 'adminpassword123')
    const admin2 = await createAdminUser('Secondary Admin', `admin2_${unique}@test.com`, 'adminpassword123')

    // ==========================================
    // SUITE 1: Authorization & Security
    // ==========================================
    console.log('\n--- SUITE 1: Authorization & Security ---')

    // 1.1 Public registration as admin is prohibited
    const fakeAdminReg = await registerUser('Hacker Admin', `fakeadmin_${unique}@test.com`, 'hack12345', 'admin')
    assert(fakeAdminReg.res.status === 400, '1. Public registration with role "admin" is rejected with 400')
    assert(fakeAdminReg.res.data?.errors?.role?.includes('prohibited'), '2. Prohibited admin registration returns clear security validation message')

    // 1.2 Unauthenticated requests to admin routes get 401
    const unauthDashboard = await request('/admin/dashboard')
    assert(unauthDashboard.status === 401, '3. Unauthenticated request to GET /api/admin/dashboard returns 401')

    const unauthUsers = await request('/admin/users')
    assert(unauthUsers.status === 401, '4. Unauthenticated request to GET /api/admin/users returns 401')

    // 1.3 Non-admin authenticated roles get 403 Forbidden
    const studentAccess = await request('/admin/dashboard', {
      headers: { Authorization: `Bearer ${studentUser.token}` },
    })
    assert(studentAccess.status === 403, '5. Student role receives 403 Forbidden on admin dashboard')

    const clientAccess = await request('/admin/users', {
      headers: { Authorization: `Bearer ${clientUser.token}` },
    })
    assert(clientAccess.status === 403, '6. Client role receives 403 Forbidden on admin users endpoint')

    const freelancerAccess = await request('/admin/verifications', {
      headers: { Authorization: `Bearer ${freelancerUser.token}` },
    })
    assert(freelancerAccess.status === 403, '7. Freelancer role receives 403 Forbidden on admin verifications')

    const mentorAccess = await request('/admin/platform', {
      headers: { Authorization: `Bearer ${mentorUser.token}` },
    })
    assert(mentorAccess.status === 403, '8. Mentor role receives 403 Forbidden on admin platform endpoint')

    const companyAccess = await request('/admin/reports', {
      headers: { Authorization: `Bearer ${companyUser.token}` },
    })
    assert(companyAccess.status === 403, '9. Company role receives 403 Forbidden on admin reports')

    // 1.4 Admin with valid credentials receives 200 OK
    const adminDashboard = await request('/admin/dashboard', {
      headers: { Authorization: `Bearer ${admin1.token}` },
    })
    assert(adminDashboard.status === 200, '10. Genuine authenticated admin receives 200 OK on dashboard')
    assert(adminDashboard.data?.success === true, '11. Admin dashboard response indicates success')

    // ==========================================
    // SUITE 2: User Management
    // ==========================================
    console.log('\n--- SUITE 2: User Management ---')

    // 2.1 List users with pagination and ensure no password hash
    const usersListRes = await request('/admin/users?page=1&limit=10', {
      headers: { Authorization: `Bearer ${admin1.token}` },
    })
    assert(usersListRes.status === 200, '12. Admin can list users with pagination')
    const users = usersListRes.data?.data?.users || []
    assert(users.length >= 7, '13. User list includes registered test users and admins')
    
    // Check security: no password hashes or sensitive fields in users list
    const hasPasswordHash = users.some((u) => u.passwordHash || u.password)
    assert(!hasPasswordHash, '14. User listing strictly omits passwordHash and passwords')

    // 2.2 Search users by email
    const searchRes = await request(`/admin/users?search=freelancer_${unique}`, {
      headers: { Authorization: `Bearer ${admin1.token}` },
    })
    assert(searchRes.status === 200 && searchRes.data?.data?.users?.length === 1, '15. Admin can search users by email/name accurately')

    // 2.3 Filter users by role
    const filterRoleRes = await request('/admin/users?role=freelancer', {
      headers: { Authorization: `Bearer ${admin1.token}` },
    })
    const allFreelancers = filterRoleRes.data?.data?.users?.every((u) => u.role === 'freelancer')
    assert(filterRoleRes.status === 200 && allFreelancers, '16. Admin can filter users by role')

    // 2.4 Get safe user details by ID
    const userDetailRes = await request(`/admin/users/${freelancerUser.userId}`, {
      headers: { Authorization: `Bearer ${admin1.token}` },
    })
    assert(userDetailRes.status === 200, '17. Admin can retrieve single user details by ID')
    assert(userDetailRes.data?.data?.user?.email === `freelancer_${unique}@test.com`, '18. User details contains correct profile information')
    assert(!userDetailRes.data?.data?.user?.passwordHash, '19. Single user detail strictly omits passwordHash')

    // 2.5 Invalid user ID returns 404/400
    const invalidIdRes = await request('/admin/users/60c72b2f9b1d8b0015f8dead', {
      headers: { Authorization: `Bearer ${admin1.token}` },
    })
    assert(invalidIdRes.status === 404, '20. Nonexistent user ID returns 404 Not Found')

    // 2.6 Admin cannot deactivate their own account
    const selfDeactivateRes = await request(`/admin/users/${admin1.userId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${admin1.token}` },
      body: { status: 'deactivated', reason: 'Attempting suicide' },
    })
    assert(selfDeactivateRes.status === 400, '21. Admin is prevented from deactivating their own account (returns 400)')
    assert(selfDeactivateRes.data?.message?.includes('own account'), '22. Self-deactivation returns clear error message')

    // 2.7 Secondary admin deactivates student user
    const deactivateStudentRes = await request(`/admin/users/${studentUser.userId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${admin1.token}` },
      body: { status: 'deactivated', reason: 'Policy violation' },
    })
    assert(deactivateStudentRes.status === 200, '23. Admin can deactivate another user account')
    assert(deactivateStudentRes.data?.data?.user?.status === 'deactivated', '24. Student status transitioned to deactivated')

    // Verify record was NOT physically deleted
    const studentInDb = await User.findById(studentUser.userId)
    assert(studentInDb !== null && studentInDb.status === 'deactivated', '25. Account is preserved in database (not physically deleted)')

    // 2.8 Prevent deactivating the last active administrator
    // Deactivate admin2 using admin1
    const deactivateAdmin2Res = await request(`/admin/users/${admin2.userId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${admin1.token}` },
      body: { status: 'deactivated' },
    })
    assert(deactivateAdmin2Res.status === 200, '26. Admin1 can deactivate Admin2 when multiple active admins exist')

    // Now try to deactivate admin1 (who is now the sole active admin)
    // First, let's reactivate admin2 just to test the last admin rule with a clear scenario
    await User.findByIdAndUpdate(admin2.userId, { status: 'deactivated' })
    const lastAdminAttempt = await request(`/admin/users/${admin1.userId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${admin1.token}` },
      body: { status: 'suspended' },
    })
    // Should be blocked both by self-protection and last active admin guard
    assert(lastAdminAttempt.status === 400, '27. Last active administrator status change is blocked with 400')

    // Reactivate admin2
    await request(`/admin/users/${admin2.userId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${admin1.token}` },
      body: { status: 'active' },
    })

    // ==========================================
    // SUITE 3: Verification Management
    // ==========================================
    console.log('\n--- SUITE 3: Verification Management ---')

    // 3.1 List verification candidates
    const verificationsRes = await request('/admin/verifications?status=all', {
      headers: { Authorization: `Bearer ${admin1.token}` },
    })
    assert(verificationsRes.status === 200, '28. Admin can list verification candidates')
    assert(Array.isArray(verificationsRes.data?.data?.candidates), '29. Verification endpoint returns candidates list')

    // 3.2 Approve verification for freelancer
    const approveVerifyRes = await request(`/admin/verifications/${freelancerUser.userId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${admin1.token}` },
      body: { isVerified: true },
    })
    assert(approveVerifyRes.status === 200, '30. Admin can approve verification for a user')
    assert(approveVerifyRes.data?.data?.user?.isVerified === true, '31. User isVerified property updated to true')

    // 3.3 Revoke verification
    const revokeVerifyRes = await request(`/admin/verifications/${freelancerUser.userId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${admin1.token}` },
      body: { isVerified: false },
    })
    assert(revokeVerifyRes.status === 200, '32. Admin can revoke verification')
    assert(revokeVerifyRes.data?.data?.user?.isVerified === false, '33. User isVerified successfully revoked')

    // 3.4 Non-admin cannot modify verification
    const nonAdminVerify = await request(`/admin/verifications/${freelancerUser.userId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${freelancerUser.token}` },
      body: { isVerified: true },
    })
    assert(nonAdminVerify.status === 403, '34. Non-admin is blocked with 403 from modifying verification')

    // ==========================================
    // SUITE 4: Reports & Moderation
    // ==========================================
    console.log('\n--- SUITE 4: Reports & Moderation ---')

    // 4.1 Authenticated client submits a report against a user/project
    const submitReportRes = await request('/admin/reports', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientUser.token}` },
      body: {
        targetType: 'user',
        targetId: freelancerUser.userId,
        reason: 'Spam or unsolicited advertising',
        details: 'Sent 10 consecutive spam proposals with external links.',
      },
    })
    assert(submitReportRes.status === 201, '35. Authenticated user can submit a moderation report')
    const reportId = submitReportRes.data?.data?.report?._id
    assert(reportId !== undefined, '36. Submitted report returns created report ID')

    // 4.2 Non-admin cannot list reports
    const nonAdminReports = await request('/admin/reports', {
      headers: { Authorization: `Bearer ${clientUser.token}` },
    })
    assert(nonAdminReports.status === 403, '37. Non-admin is blocked with 403 from listing reports')

    // 4.3 Admin lists reports
    const adminReportsRes = await request('/admin/reports?status=pending', {
      headers: { Authorization: `Bearer ${admin1.token}` },
    })
    assert(adminReportsRes.status === 200, '38. Admin can list reports')
    assert(adminReportsRes.data?.data?.reports?.length >= 1, '39. Admin sees the submitted report in list')

    // 4.4 Admin gets single report by ID
    const singleReportRes = await request(`/admin/reports/${reportId}`, {
      headers: { Authorization: `Bearer ${admin1.token}` },
    })
    assert(singleReportRes.status === 200, '40. Admin can fetch single report details')
    assert(singleReportRes.data?.data?.report?.reporter?.email === `client_${unique}@test.com`, '41. Report populates reporter details safely')

    // 4.5 Admin transitions report status to 'under_review' then 'resolved'
    const reviewReportRes = await request(`/admin/reports/${reportId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${admin1.token}` },
      body: {
        status: 'under_review',
        adminNotes: 'Investigating proposal logs.',
      },
    })
    assert(reviewReportRes.status === 200, '42. Admin can mark report as under_review')
    assert(reviewReportRes.data?.data?.report?.status === 'under_review', '43. Report status updated to under_review')

    const resolveReportRes = await request(`/admin/reports/${reportId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${admin1.token}` },
      body: {
        status: 'resolved',
        adminNotes: 'Warned user regarding spam policies.',
      },
    })
    assert(resolveReportRes.status === 200, '44. Admin can resolve report')
    assert(resolveReportRes.data?.data?.report?.status === 'resolved', '45. Report status updated to resolved')

    // 4.6 Invalid report status transition is rejected
    const invalidStatusRes = await request(`/admin/reports/${reportId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${admin1.token}` },
      body: { status: 'invalid_status_code' },
    })
    assert(invalidStatusRes.status === 400, '46. Invalid report status transition is rejected with 400')

    // ==========================================
    // SUITE 5: Dashboard & Platform Metrics
    // ==========================================
    console.log('\n--- SUITE 5: Dashboard & Platform Metrics ---')

    // Create a sample project to test project counters
    const newProject = await Project.create({
      title: 'Admin Verification Project',
      description: 'Project used to verify database aggregation metrics in admin dashboard.',
      owner: clientUser.userId,
      category: 'Web Development',
      budget: { min: 500, max: 1500, type: 'fixed' },
      skillsRequired: ['React', 'Node.js'],
      status: 'open',
    })

    const newProposal = await Proposal.create({
      project: newProject._id,
      freelancer: freelancerUser.userId,
      coverLetter: 'Proposal to test admin aggregation count.',
      proposedBudget: 1000,
      estimatedDuration: '7 days',
      status: 'pending',
    })

    const dashRes = await request('/admin/dashboard', {
      headers: { Authorization: `Bearer ${admin1.token}` },
    })
    assert(dashRes.status === 200, '47. Admin can query dashboard statistics')
    const metrics = dashRes.data?.data?.metrics || {}
    assert(metrics.users?.total >= 7, '48. Total user count matches database reality')
    assert(metrics.users?.byRole?.admin >= 2, '49. Admin count accurately matches database')
    assert(metrics.projects?.total >= 1, '50. Total project count matches database')
    assert(metrics.projects?.byStatus?.open >= 1, '51. Open projects count matches database')
    assert(metrics.proposals?.total >= 1, '52. Total proposals count matches database')
    assert(metrics.reports?.total >= 1, '53. Total reports count matches database')

    // Query Platform Overview
    const platformRes = await request('/admin/platform', {
      headers: { Authorization: `Bearer ${admin1.token}` },
    })
    assert(platformRes.status === 200, '54. Admin can query platform analytics overview')
    assert(platformRes.data?.data?.overview?.roleDistribution?.length > 0, '55. Platform analytics returns real role distribution')
    assert(platformRes.data?.data?.overview?.projectDistribution !== undefined, '56. Platform analytics returns real project status distribution')

    // ==========================================
    // SUITE 6: Portal Regression Tests
    // ==========================================
    console.log('\n--- SUITE 6: Multi-Portal Regression Tests ---')

    // Student Dashboard
    const studentDash = await request('/student/dashboard', {
      headers: { Authorization: `Bearer ${studentUser.token}` },
    })
    // Note: earlier we deactivated studentUser, let's reactivate for regression test
    await User.findByIdAndUpdate(studentUser.userId, { status: 'active' })
    const studentDashActive = await request('/student/dashboard', {
      headers: { Authorization: `Bearer ${studentUser.token}` },
    })
    assert(studentDashActive.status === 200, '57. Regression: Student portal dashboard remains 200 OK')

    // Mentor Dashboard
    const mentorDash = await request('/mentor/dashboard', {
      headers: { Authorization: `Bearer ${mentorUser.token}` },
    })
    assert(mentorDash.status === 200, '58. Regression: Mentor portal dashboard remains 200 OK')

    // Company Dashboard
    const companyDash = await request('/company/dashboard', {
      headers: { Authorization: `Bearer ${companyUser.token}` },
    })
    assert(companyDash.status === 200, '59. Regression: Company portal dashboard remains 200 OK')

    // Freelancer Dashboard
    const freelancerDash = await request('/freelancers/dashboard', {
      headers: { Authorization: `Bearer ${freelancerUser.token}` },
    })
    assert(freelancerDash.status === 200, '60. Regression: Freelancer portal dashboard remains 200 OK')

    // Client Dashboard
    const clientDash = await request('/client/dashboard', {
      headers: { Authorization: `Bearer ${clientUser.token}` },
    })
    assert(clientDash.status === 200, '61. Regression: Client portal dashboard remains 200 OK')

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
