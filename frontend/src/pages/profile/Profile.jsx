import {
  AlertCircle,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  GraduationCap,
  Image as ImageIcon,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User as UserIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import CompanyProfileCard from '../../components/cards/CompanyProfileCard'
import FreelancerProfileCard from '../../components/cards/FreelancerProfileCard'
import MentorProfileCard from '../../components/cards/MentorProfileCard'
import useAuth from '../../hooks/useAuth'
import userService from '../../services/user.service'

const ROLE_BADGES = {
  student: { label: 'Student', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: GraduationCap },
  client: { label: 'Client / Employer', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: UserIcon },
  freelancer: { label: 'Freelancer', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Briefcase },
  mentor: { label: 'Expert Mentor', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: Sparkles },
  company: { label: 'Company Enterprise', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Building2 },
  admin: { label: 'System Admin', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: ShieldCheck },
}

export const Profile = () => {
  const { updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Editable form fields
  const [name, setName] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await userService.getProfile()
        const userObj = data.data.user
        setProfile(userObj)
        setName(userObj.name || '')
        setProfileImage(userObj.profileImage || '')
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch user profile')
      } finally {
        setLoading(false)
      }
    }
    fetchUserProfile()
  }, [])

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, JPEG, WEBP, or GIF).')
      return
    }

    // Validate file size: 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError('Selected image exceeds 5MB limit. Please choose a smaller image.')
      return
    }

    setError('')
    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      if (typeof uploadEvent.target?.result === 'string') {
        setProfileImage(uploadEvent.target.result)
      }
    }
    reader.onerror = () => {
      setError('Failed to read image file from your computer. Please try again.')
    }
    reader.readAsDataURL(file)

    // Reset input value so re-uploading same file works if needed
    e.target.value = ''
  }

  const handleRemoveImage = () => {
    setProfileImage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSaveCommonProfile = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    setSaving(true)
    try {
      const data = await userService.updateProfile({
        name: name.trim(),
        profileImage: profileImage || null,
      })
      const updatedUser = data.data.user
      setProfile(updatedUser)
      setName(updatedUser.name || '')
      setProfileImage(updatedUser.profileImage || '')
      updateUser(updatedUser)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.general || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading your profile...</p>
        </div>
      </div>
    )
  }

  const roleMeta = profile?.role ? ROLE_BADGES[profile.role] || ROLE_BADGES.student : null
  const RoleIcon = roleMeta?.icon

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()} title="Click to upload/change photo">
            {profileImage ? (
              <img
                src={profileImage}
                alt={profile?.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm group-hover:opacity-85 transition"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=6366f1&color=fff&size=128`
                }}
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-3xl flex items-center justify-center shadow-sm group-hover:opacity-90 transition">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="absolute inset-0 bg-slate-900/40 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition text-white">
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-semibold tracking-wide uppercase">Change</span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl font-bold text-slate-900">{profile?.name}</h1>
              {roleMeta && (
                <span className={`inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${roleMeta.bg}`}>
                  {RoleIcon && <RoleIcon className="w-3.5 h-3.5" />}
                  <span>{roleMeta.label}</span>
                </span>
              )}
              {profile?.isVerified && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              )}
            </div>

            <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start space-x-1.5">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{profile?.email}</span>
            </p>

            <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}</span>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                Status: {profile?.status || 'active'}
              </span>
            </div>
          </div>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* 1. Common User Profile Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">Account &amp; Personal Info</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your account display name and profile picture from your computer. Email and security credentials cannot be changed here.
            </p>
          </div>

          <form onSubmit={handleSaveCommonProfile} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Editable Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Editable Profile Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Avatar preview"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-300 shadow-xs flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-indigo-500 hover:text-indigo-600 text-slate-700 text-xs font-medium rounded-lg shadow-2xs transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{profileImage ? 'Change Image' : 'Upload from PC'}</span>
                      </button>

                      {profileImage && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-medium rounded-lg shadow-2xs transition"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, JPEG, WEBP or GIF (Max 5MB)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
              {/* Read-only Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[10px] text-slate-400 flex items-center space-x-1 font-normal">
                    <Lock className="w-3 h-3 inline" /> <span>Read-only</span>
                  </span>
                </label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Read-only Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Account Role</span>
                  <span className="text-[10px] text-slate-400 flex items-center space-x-1 font-normal">
                    <Lock className="w-3 h-3 inline" /> <span>System Assigned</span>
                  </span>
                </label>
                <input
                  type="text"
                  disabled
                  value={profile?.role ? profile.role.toUpperCase() : ''}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 uppercase cursor-not-allowed tracking-wider"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Account Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* 2. Role-Specific Section */}
        {profile?.role === 'freelancer' && <FreelancerProfileCard />}
        {profile?.role === 'mentor' && <MentorProfileCard />}
        {profile?.role === 'company' && <CompanyProfileCard />}

        {profile?.role === 'student' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">Student Learning Hub</h3>
                <p className="text-sm text-slate-600">
                  You are registered as a Student. You have access to top industry mentors, project collaboration opportunities, and interactive skill assessments.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200">
                    Mentorship Ready
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200">
                    Skill Pathways Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {profile?.role === 'client' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">Client / Project Poster</h3>
                <p className="text-sm text-slate-600">
                  You are registered as a Client. You can post verified gigs, hire specialized freelance developers, and manage contracts directly on SkillBridge.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200">
                    Project Hiring Enabled
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200">
                    Direct Escrow Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
