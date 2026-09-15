import { AlertCircle, CheckCircle2, DollarSign, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import mentorService from '../../services/mentor.service'

export const MentorProfileCard = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newExpertise, setNewExpertise] = useState('')
  const [newTopic, setNewTopic] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await mentorService.getMyProfile()
        setProfile(data.data.profile)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load mentor profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleAddExpertise = (e) => {
    e.preventDefault()
    if (!newExpertise.trim()) return
    const tag = newExpertise.trim()
    if (profile.expertise.includes(tag)) {
      setNewExpertise('')
      return
    }
    setProfile((prev) => ({
      ...prev,
      expertise: [...prev.expertise, tag],
    }))
    setNewExpertise('')
  }

  const handleRemoveExpertise = (tag) => {
    setProfile((prev) => ({
      ...prev,
      expertise: prev.expertise.filter((t) => t !== tag),
    }))
  }

  const handleAddTopic = (e) => {
    e.preventDefault()
    if (!newTopic.trim()) return
    const topic = newTopic.trim()
    if (profile.mentoringTopics.includes(topic)) {
      setNewTopic('')
      return
    }
    setProfile((prev) => ({
      ...prev,
      mentoringTopics: [...prev.mentoringTopics, topic],
    }))
    setNewTopic('')
  }

  const handleRemoveTopic = (topic) => {
    setProfile((prev) => ({
      ...prev,
      mentoringTopics: prev.mentoringTopics.filter((t) => t !== topic),
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const data = await mentorService.updateMyProfile({
        bio: profile.bio,
        expertise: profile.expertise,
        experienceYears: Number(profile.experienceYears) || 0,
        hourlyRate: Number(profile.hourlyRate) || 0,
        mentoringTopics: profile.mentoringTopics,
        availability: profile.availability,
      })
      setProfile(data.data.profile)
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
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-slate-100 bg-purple-50/40 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Mentor Professional Profile</h3>
          <p className="text-xs text-slate-500 mt-0.5">Define your domain expertise, session rates, and mentorship topics</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Rating: ⭐ {profile?.rating ? profile.rating.toFixed(1) : '0.0'} ({profile?.reviewCount || 0} reviews)
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
            {profile?.completedSessions || 0} Sessions Completed
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
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

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Mentorship Philosophy &amp; Bio
          </label>
          <textarea
            rows={3}
            value={profile?.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Describe your background, leadership experience, and how you guide students & mentees..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        {/* Experience & Fee & Availability */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Industry Experience (Years)
            </label>
            <input
              type="number"
              min="0"
              max="70"
              value={profile?.experienceYears ?? 0}
              onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Session Fee ($/session)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="0"
                value={profile?.hourlyRate ?? 0}
                onChange={(e) => setProfile({ ...profile, hourlyRate: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Availability Status
            </label>
            <select
              value={profile?.availability || 'available'}
              onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            >
              <option value="available">Available for Bookings</option>
              <option value="busy">Limited Slots</option>
              <option value="not_available">Not Available</option>
            </select>
          </div>
        </div>

        {/* Expertise Domains */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Core Expertise Domains
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {profile?.expertise?.map((domain) => (
              <span
                key={domain}
                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold border border-purple-200"
              >
                <span>{domain}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveExpertise(domain)}
                  className="hover:text-rose-600 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newExpertise}
              onChange={(e) => setNewExpertise(e.target.value)}
              placeholder="e.g. System Design, Career Growth, AI Engineering"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpertise(e))}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
            <button
              type="button"
              onClick={handleAddExpertise}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition"
            >
              Add Domain
            </button>
          </div>
        </div>

        {/* Mentoring Topics */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Mentoring Topics &amp; Formats
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {profile?.mentoringTopics?.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200"
              >
                <span>{topic}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTopic(topic)}
                  className="hover:text-rose-600 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="e.g. Mock Technical Interview, Resume Review, 1-on-1 Code Review"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic(e))}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
            <button
              type="button"
              onClick={handleAddTopic}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition"
            >
              Add Topic
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition"
          >
            {saving ? 'Saving Changes...' : 'Save Mentor Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MentorProfileCard
