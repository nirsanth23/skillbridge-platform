import { AlertCircle, CheckCircle2, Code2, DollarSign, ExternalLink, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import freelancerService from '../../services/freelancer.service'

export const FreelancerProfileCard = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newSkill, setNewSkill] = useState('')

  // New portfolio item modal state
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    projectUrl: '',
    githubUrl: '',
  })
  const [showPortfolioModal, setShowPortfolioModal] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await freelancerService.getMyProfile()
        setProfile(data.data.profile)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load freelancer profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleAddSkill = (e) => {
    e.preventDefault()
    if (!newSkill.trim()) return
    const skillToAdd = newSkill.trim()
    if (profile.skills.includes(skillToAdd)) {
      setNewSkill('')
      return
    }
    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, skillToAdd],
    }))
    setNewSkill('')
  }

  const handleRemoveSkill = (skillToRemove) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }))
  }

  const handleAddPortfolioItem = (e) => {
    e.preventDefault()
    if (!portfolioForm.title.trim()) return

    const newItem = {
      title: portfolioForm.title.trim(),
      description: portfolioForm.description.trim(),
      projectUrl: portfolioForm.projectUrl.trim() || null,
      githubUrl: portfolioForm.githubUrl.trim() || null,
    }

    setProfile((prev) => ({
      ...prev,
      portfolio: [...prev.portfolio, newItem],
    }))

    setPortfolioForm({ title: '', description: '', projectUrl: '', githubUrl: '' })
    setShowPortfolioModal(false)
  }

  const handleRemovePortfolioItem = (indexToRemove) => {
    setProfile((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, idx) => idx !== indexToRemove),
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const data = await freelancerService.updateMyProfile({
        bio: profile.bio,
        skills: profile.skills,
        experienceYears: Number(profile.experienceYears) || 0,
        hourlyRate: Number(profile.hourlyRate) || 0,
        availability: profile.availability,
        portfolio: profile.portfolio,
      })
      setProfile(data.data.profile)
      setSuccess('Freelancer profile updated successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update freelancer profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Freelancer Professional Profile</h3>
          <p className="text-xs text-slate-500 mt-0.5">Manage your services, technical skills, hourly rate, and portfolio showcase</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Rating: ⭐ {profile?.rating ? profile.rating.toFixed(1) : '0.0'} ({profile?.reviewCount || 0} reviews)
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {profile?.completedProjects || 0} Completed
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
            Professional Bio
          </label>
          <textarea
            rows={3}
            value={profile?.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Introduce your expertise, primary tech stack, and experience delivering projects..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Experience & Rates & Availability Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Experience (Years)
            </label>
            <input
              type="number"
              min="0"
              max="70"
              value={profile?.experienceYears ?? 0}
              onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Hourly Rate ($/hr)
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
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Availability
            </label>
            <select
              value={profile?.availability || 'available'}
              onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="available">Available for Work</option>
              <option value="busy">Busy / In Progress</option>
              <option value="not_available">Not Available</option>
            </select>
          </div>
        </div>

        {/* Skills Tag Manager */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Skills &amp; Technologies
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {profile?.skills?.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-rose-600 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {profile?.skills?.length === 0 && (
              <span className="text-xs text-slate-400 italic">No skills added yet.</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g. React, Node.js, Python"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(e))}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition"
            >
              Add Skill
            </button>
          </div>
        </div>

        {/* Portfolio Showcase */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Portfolio Projects ({profile?.portfolio?.length || 0})
            </label>
            <button
              type="button"
              onClick={() => setShowPortfolioModal(true)}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile?.portfolio?.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemovePortfolioItem(idx)}
                      className="text-slate-400 hover:text-rose-600 transition ml-2"
                      title="Remove portfolio item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-3 mt-3 pt-2 border-t border-slate-200/60 text-xs">
                  {item.projectUrl && (
                    <a
                      href={item.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-indigo-600 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Live Demo</span>
                    </a>
                  )}
                  {item.githubUrl && (
                    <a
                      href={item.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-slate-700 hover:underline"
                    >
                      <Code2 className="w-3 h-3" />
                      <span>Source</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
          >
            {saving ? 'Saving Changes...' : 'Save Freelancer Profile'}
          </button>
        </div>
      </form>

      {/* Add Portfolio Modal */}
      {showPortfolioModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Portfolio Project</h3>
              <button
                type="button"
                onClick={() => setShowPortfolioModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPortfolioItem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                  placeholder="e.g. Health Tracking Mobile App"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                  placeholder="Brief summary of what you built..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Live Demo URL</label>
                <input
                  type="url"
                  value={portfolioForm.projectUrl}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, projectUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub / Code URL</label>
                <input
                  type="url"
                  value={portfolioForm.githubUrl}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPortfolioModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FreelancerProfileCard
