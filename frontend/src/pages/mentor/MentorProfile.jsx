import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle2,
  DollarSign,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import useAuth from '../../hooks/useAuth'
import mentorService from '../../services/mentor.service'

export const MentorProfile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form Fields
  const [bio, setBio] = useState('')
  const [experienceYears, setExperienceYears] = useState(0)
  const [hourlyRate, setHourlyRate] = useState(0)
  const [availability, setAvailability] = useState('available')
  const [expertise, setExpertise] = useState([])
  const [mentoringTopics, setMentoringTopics] = useState([])

  // Temporary chip inputs
  const [newSkill, setNewSkill] = useState('')
  const [newTopic, setNewTopic] = useState('')

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await mentorService.getMyProfile()
      const data = res.data?.profile || {}
      setProfile(data)
      setBio(data.bio || '')
      setExperienceYears(data.experienceYears || 0)
      setHourlyRate(data.hourlyRate || 0)
      setAvailability(data.availability || 'available')
      setExpertise(data.expertise || [])
      setMentoringTopics(data.mentoringTopics || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load mentor profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleAddSkill = (e) => {
    e.preventDefault()
    const trimmed = newSkill.trim()
    if (trimmed && !expertise.includes(trimmed)) {
      setExpertise([...expertise, trimmed])
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setExpertise(expertise.filter((s) => s !== skillToRemove))
  }

  const handleAddTopic = (e) => {
    e.preventDefault()
    const trimmed = newTopic.trim()
    if (trimmed && !mentoringTopics.includes(trimmed)) {
      setMentoringTopics([...mentoringTopics, trimmed])
      setNewTopic('')
    }
  }

  const handleRemoveTopic = (topicToRemove) => {
    setMentoringTopics(mentoringTopics.filter((t) => t !== topicToRemove))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const payload = {
        bio,
        experienceYears: Number(experienceYears),
        hourlyRate: Number(hourlyRate),
        availability,
        expertise,
        mentoringTopics,
      }

      const res = await mentorService.updateProfile(payload)
      setProfile(res.data?.profile || {})
      setSuccess('Mentor profile updated successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update mentor profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
        <div className="h-10 w-48 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2.5">
          <Sparkles className="w-6 h-6 text-emerald-600" />
          <span>Mentor Profile Management</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Customize your mentoring topics, professional biography, hourly rates, and real-time availability.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Read-Only Verified Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Rating */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {profile?.rating ? profile.rating.toFixed(1) : '5.0'}
          </p>
          <span className="text-[11px] text-slate-500">Read-only verified score</span>
        </div>

        {/* Reviews */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reviews</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {profile?.reviewCount ?? 0}
          </p>
          <span className="text-[11px] text-slate-500">Student feedback</span>
        </div>

        {/* Completed Sessions */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sessions</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {profile?.completedSessions ?? 0}
          </p>
          <span className="text-[11px] text-slate-500">Conducted calls</span>
        </div>

        {/* Verification Status */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                profile?.verificationStatus === 'verified'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {profile?.verificationStatus || 'unverified'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Platform verification</span>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
        {/* User Identity Snapshot */}
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xl flex items-center justify-center shadow-sm">
              {user?.name?.charAt(0) || 'M'}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-md uppercase tracking-wider">
              Registered Mentor
            </span>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Professional Biography
          </label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Introduce your background, achievements, engineering domains, and what students can learn from your mentoring sessions..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            maxLength={2000}
          />
          <span className="text-[11px] text-slate-400 block text-right">{bio.length} / 2000 characters</span>
        </div>

        {/* Two Columns: Rate & Experience & Availability */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Hourly Rate */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Hourly Rate ($/hr)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="0"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="50"
              />
            </div>
          </div>

          {/* Experience Years */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Experience (Years)
            </label>
            <input
              type="number"
              min="0"
              max="70"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="5"
            />
          </div>

          {/* Availability Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Availability
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              <option value="available">Available for Bookings</option>
              <option value="busy">Busy (Limited Slots)</option>
              <option value="not_available">Not Available</option>
            </select>
          </div>
        </div>

        {/* Expertise Chips */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Domains & Technical Expertise
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {expertise.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-rose-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {expertise.length === 0 && (
              <span className="text-xs text-slate-400 italic">No expertise tags added yet.</span>
            )}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill (e.g. Distributed Systems, System Design, React)..."
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddSkill(e)
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition inline-flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Mentoring Topics */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Mentoring Topics & Session Types
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {mentoringTopics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold rounded-lg"
              >
                <span>{topic}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTopic(topic)}
                  className="hover:text-rose-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {mentoringTopics.length === 0 && (
              <span className="text-xs text-slate-400 italic">No mentoring topics listed.</span>
            )}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Add topic (e.g. Resume Review, Mock Technical Interview, Cloud Architecture)..."
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTopic(e)
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddTopic}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition inline-flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-sm transition inline-flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default MentorProfile
