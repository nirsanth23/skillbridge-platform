import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute'
import Navbar from './components/layout/Navbar'
import StudentLayout from './components/layout/StudentLayout'
import { AuthProvider } from './context/AuthContext'
import useAuth from './hooks/useAuth'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Profile from './pages/profile/Profile'
import CreateProject from './pages/projects/CreateProject'
import EditProject from './pages/projects/EditProject'
import MyProjects from './pages/projects/MyProjects'
import ProjectDetails from './pages/projects/ProjectDetails'
import Projects from './pages/projects/Projects'
import BookMentor from './pages/student/BookMentor'
import MentorDetails from './pages/student/MentorDetails'
import MentorDiscovery from './pages/student/MentorDiscovery'
import MyBookings from './pages/student/MyBookings'
import Notifications from './pages/student/Notifications'
import ProjectProposals from './pages/student/ProjectProposals'
import StudentDashboard from './pages/student/StudentDashboard'
import MentorLayout from './components/layout/MentorLayout'
import MentorDashboard from './pages/mentor/MentorDashboard'
import MentorProfile from './pages/mentor/MentorProfile'
import BookingRequests from './pages/mentor/BookingRequests'
import MySessions from './pages/mentor/MySessions'
import BookingDetails from './pages/mentor/BookingDetails'
import MentorReviews from './pages/mentor/MentorReviews'
import MentorNotifications from './pages/mentor/MentorNotifications'
import CompanyLayout from './components/layout/CompanyLayout'
import CompanyDashboard from './pages/company/CompanyDashboard'
import CompanyProfile from './pages/company/CompanyProfile'
import CompanyProjects from './pages/company/CompanyProjects'
import CompanyProjectProposals from './pages/company/CompanyProjectProposals'
import FindFreelancers from './pages/company/FindFreelancers'
import FreelancerDetails from './pages/company/FreelancerDetails'
import CompanyNotifications from './pages/company/CompanyNotifications'
import FreelancerLayout from './components/layout/FreelancerLayout'
import FreelancerDashboard from './pages/freelancer/FreelancerDashboard'
import FreelancerProfile from './pages/freelancer/FreelancerProfile'
import FindProjects from './pages/freelancer/FindProjects'
import MyProposals from './pages/freelancer/MyProposals'
import ActiveProjects from './pages/freelancer/ActiveProjects'
import FreelancerNotifications from './pages/freelancer/FreelancerNotifications'
import ClientLayout from './components/layout/ClientLayout'
import ClientDashboard from './pages/client/ClientDashboard'
import ClientProjects from './pages/client/ClientProjects'
import ClientProjectProposals from './pages/client/ClientProjectProposals'
import ClientFindFreelancers from './pages/client/FindFreelancers'
import ClientFreelancerDetails from './pages/client/FreelancerDetails'
import ClientNotifications from './pages/client/ClientNotifications'
import AdminLayout from './components/layout/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminUserDetails from './pages/admin/AdminUserDetails'
import AdminVerifications from './pages/admin/AdminVerifications'
import AdminReports from './pages/admin/AdminReports'
import AdminPlatform from './pages/admin/AdminPlatform'

const AppContent = () => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()
  const isPortal =
    location.pathname.startsWith('/student') ||
    location.pathname.startsWith('/mentor') ||
    location.pathname.startsWith('/company') ||
    location.pathname.startsWith('/freelancer') ||
    location.pathname.startsWith('/client') ||
    location.pathname.startsWith('/admin')

  // Helper default redirect based on role
  const getDefaultHome = () => {
    if (isAuthenticated) {
      if (user?.role === 'student') {
        return '/student/dashboard'
      }
      if (user?.role === 'mentor') {
        return '/mentor/dashboard'
      }
      if (user?.role === 'company') {
        return '/company/dashboard'
      }
      if (user?.role === 'freelancer') {
        return '/freelancer/dashboard'
      }
      if (user?.role === 'client') {
        return '/client/dashboard'
      }
      if (user?.role === 'admin') {
        return '/admin/dashboard'
      }
    }
    return '/projects'
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {!isPortal && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Portal Protected Nested Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="projects" element={<MyProjects />} />
            <Route path="projects/new" element={<CreateProject />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="projects/:id/edit" element={<EditProject />} />
            <Route path="projects/:id/proposals" element={<ProjectProposals />} />
            <Route path="proposals" element={<ProjectProposals />} />
            <Route path="find-projects" element={<Projects />} />
            <Route path="mentors" element={<MentorDiscovery />} />
            <Route path="mentors/:id" element={<MentorDetails />} />
            <Route path="mentors/:id/book" element={<BookMentor />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Mentor Portal Protected Nested Routes */}
          <Route
            path="/mentor"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/mentor/dashboard" replace />} />
            <Route path="dashboard" element={<MentorDashboard />} />
            <Route path="profile" element={<MentorProfile />} />
            <Route path="requests" element={<BookingRequests />} />
            <Route path="sessions" element={<MySessions />} />
            <Route path="sessions/:id" element={<BookingDetails />} />
            <Route path="reviews" element={<MentorReviews />} />
            <Route path="notifications" element={<MentorNotifications />} />
          </Route>

          {/* Company Portal Protected Nested Routes */}
          <Route
            path="/company"
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/company/dashboard" replace />} />
            <Route path="dashboard" element={<CompanyDashboard />} />
            <Route path="profile" element={<CompanyProfile />} />
            <Route path="find-projects" element={<Projects />} />
            <Route path="projects" element={<CompanyProjects />} />
            <Route path="projects/new" element={<CreateProject />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="projects/:id/edit" element={<EditProject />} />
            <Route path="projects/:id/proposals" element={<CompanyProjectProposals />} />
            <Route path="proposals" element={<CompanyProjectProposals />} />
            <Route path="freelancers" element={<FindFreelancers />} />
            <Route path="freelancers/:id" element={<FreelancerDetails />} />
            <Route path="notifications" element={<CompanyNotifications />} />
          </Route>

          {/* Freelancer Portal Protected Nested Routes */}
          <Route
            path="/freelancer"
            element={
              <ProtectedRoute allowedRoles={['freelancer']}>
                <FreelancerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/freelancer/dashboard" replace />} />
            <Route path="dashboard" element={<FreelancerDashboard />} />
            <Route path="profile" element={<FreelancerProfile />} />
            <Route path="find-projects" element={<FindProjects />} />
            <Route path="proposals" element={<MyProposals />} />
            <Route path="active-projects" element={<ActiveProjects />} />
            <Route path="notifications" element={<FreelancerNotifications />} />
          </Route>

          {/* Client Portal Protected Nested Routes */}
          <Route
            path="/client"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/client/dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="projects" element={<ClientProjects />} />
            <Route path="projects/new" element={<CreateProject />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="projects/:id/edit" element={<EditProject />} />
            <Route path="projects/:id/proposals" element={<ClientProjectProposals />} />
            <Route path="proposals" element={<ClientProjectProposals />} />
            <Route path="freelancers" element={<ClientFindFreelancers />} />
            <Route path="freelancers/:id" element={<ClientFreelancerDetails />} />
            <Route path="notifications" element={<ClientNotifications />} />
          </Route>

          {/* Admin Portal Protected Nested Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:id" element={<AdminUserDetails />} />
            <Route path="verifications" element={<AdminVerifications />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="platform" element={<AdminPlatform />} />
          </Route>

          {/* Global Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-projects"
            element={
              <ProtectedRoute>
                <MyProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/create"
            element={
              <ProtectedRoute>
                <CreateProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/edit"
            element={
              <ProtectedRoute>
                <EditProject />
              </ProtectedRoute>
            }
          />

          {/* Default & Catch-all Fallbacks */}
          <Route path="/" element={<Navigate to={getDefaultHome()} replace />} />
          <Route path="*" element={<Navigate to={getDefaultHome()} replace />} />
        </Routes>
      </main>
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

