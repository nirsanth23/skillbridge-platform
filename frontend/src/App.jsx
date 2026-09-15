import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute'
import Navbar from './components/layout/Navbar'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Profile from './pages/profile/Profile'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Profile Route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Default & Catch-all Fallbacks */}
              <Route path="/" element={<Navigate to="/profile" replace />} />
              <Route path="*" element={<Navigate to="/profile" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
