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

const AppContent = () => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()
  const isStudentPortal = location.pathname.startsWith('/student')

  // Helper default redirect based on role
  const getDefaultHome = () => {
    if (isAuthenticated && user?.role === 'student') {
      return '/student/dashboard'
    }
    return '/projects'
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {!isStudentPortal && <Navbar />}
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

