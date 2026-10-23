import {
  AlertCircle,
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  ExternalLink,
  Code2,
  Globe,
  Plus,
  Save,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import useAuth from '../../hooks/useAuth'
import freelancerService from '../../services/freelancer.service'

const COMMON_SKILLS = [
  'React',
  'Node.js',
  'JavaScript',
  'TypeScript',
  'Python',
  'Tailwind CSS',
  'MongoDB',
  'Next.js',
  'Express.js',
  'UI/UX Design',
  'Figma',
  'GraphQL',
  'AWS',
  'Docker',
]

export const FreelancerProfile = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [formData, setFormData] = useState({
    bio: '',
    hourlyRate: 0,
    experienceYears: 0,
    availability: 'available',
    skills: [],
    portfolio: [],
  })

  const [newSkill, setNewSkill] = useState('')
  const [showPortfolioModal, setShowPortfolioModal] = useState(false)
  const [editingPortfolioIndex, setEditingPortfolioIndex] = useState(null)
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    projectUrl: '',
    githubUrl: '',
    imageUrl: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await freelancerService.getMyProfile()
      const p = res.data?.profile || {}
      setFormData({
        bio: p.bio || '',
        hourlyRate: p.hourlyRate || 0,
        experienceYears: p.experienceYears || 0,
        availability: p.availability || 'available',
        skills: p.skills || [],
        portfolio: p.portfolio || [],
      })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to load profile details',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'hourlyRate' || name === 'experienceYears' ? Number(value) : value,
    }))
    if (message.text) setMessage({ type: '', text: '' })
  }

  // Skills handlers
  const handleAddSkill = (skillToAdd) => {
    const clean = (skillToAdd || newSkill).trim()
    if (!clean) return
    if (formData.skills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setNewSkill('')
      return
    }
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, clean],
    }))
    setNewSkill('')
  }

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }))
  }

  // Portfolio handlers
  const openAddPortfolio = () => {
    setEditingPortfolioIndex(null)
    setPortfolioForm({
      title: '',
      description: '',
      projectUrl: '',
      githubUrl: '',
      imageUrl: '',
    })
    setShowPortfolioModal(true)
  }

  const openEditPortfolio = (index) => {
    setEditingPortfolioIndex(index)
    setPortfolioForm(formData.portfolio[index])
    setShowPortfolioModal(true)
  }

  const handleSavePortfolioItem = (e) => {
    e.preventDefault()
    if (!portfolioForm.title.trim()) return

    const updatedPortfolio = [...formData.portfolio]
    if (editingPortfolioIndex !== null) {
      updatedPortfolio[editingPortfolioIndex] = { ...portfolioForm }
    } else {
      updatedPortfolio.push({ ...portfolioForm })
    }

    setFormData((prev) => ({ ...prev, portfolio: updatedPortfolio }))
    setShowPortfolioModal(false)
  }

  const handleRemovePortfolioItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index),
    }))
  }

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      await freelancerService.updateMyProfile(formData)
      setMessage({ type: 'success', text: 'Freelancer profile updated successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile. Please check inputs.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
        <div className="h-44 bg-slate-200 rounded-3xl" />
        <div className="h-96 bg-slate-200 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Info Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-500 shadow-xs"
            />
          ) : (
            <div className="w-20 h-20 bg-teal-100 text-teal-700 font-extrabold text-2xl rounded-2xl flex items-center justify-center border-2 border-teal-300">
              {user?.name?.charAt(0)?.toUpperCase() || 'F'}
            </div>
          )}
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <span className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold rounded-full uppercase tracking-wider">
                  Freelancer
                </span>
                {user?.isVerified && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Keep your professional profile up-to-date to attract more clients and land freelance projects.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {message.text && (
          <div
            className={`p-4 rounded-2xl flex items-center space-x-3 text-sm font-semibold border ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Core Professional Details Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Professional Details</h2>
            <p className="text-xs text-slate-500">Configure your rates, experience, and availability.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Hourly Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Hourly Rate (USD)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">$</span>
                <input
                  type="number"
                  name="hourlyRate"
                  min="0"
                  step="1"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  placeholder="e.g. 45"
                />
              </div>
            </div>

            {/* Experience Years */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Experience (Years)</span>
              </label>
              <input
                type="number"
                name="experienceYears"
                min="0"
                max="70"
                value={formData.experienceYears}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                placeholder="e.g. 3"
              />
            </div>

            {/* Availability */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Availability Status</span>
              </label>
              <select
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
              >
                <option value="available">Available for Projects</option>
                <option value="busy">Busy (Limited availability)</option>
                <option value="not_available">Not Available</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Bio & Summary</label>
              <span className="text-[11px] text-slate-400">{formData.bio.length}/2000</span>
            </div>
            <textarea
              name="bio"
              rows={4}
              maxLength={2000}
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell prospective clients about your expertise, background, technical proficiencies, and work methodology..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition resize-none"
            />
          </div>
        </div>

        {/* Skills Management Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Skills & Tech Stack</h2>
            <p className="text-xs text-slate-500">
              Highlight the key technologies, libraries, and tools you excel at.
            </p>
          </div>

          {/* Add skill input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddSkill()
                }
              }}
              placeholder="Add a new skill (e.g. Next.js, GraphQL, PostgreSQL)..."
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
            <button
              type="button"
              onClick={() => handleAddSkill()}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl flex items-center space-x-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {/* Quick suggestions */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
              Popular Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SKILLS.filter((s) => !formData.skills.includes(s)).slice(0, 8).map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => handleAddSkill(skill)}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium transition flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3 text-slate-400" />
                  <span>{skill}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Current skills tags */}
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Your Skills ({formData.skills.length}):
            </span>
            {formData.skills.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No skills added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs font-semibold shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="p-0.5 text-teal-600 hover:text-rose-600 hover:bg-teal-100 rounded-full transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Showcase Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Portfolio & Case Studies</h2>
              <p className="text-xs text-slate-500">
                Showcase your best past projects, GitHub repos, and live demos.
              </p>
            </div>
            <button
              type="button"
              onClick={openAddPortfolio}
              className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
          </div>

          {formData.portfolio.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <FolderGit2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-semibold text-slate-700 text-sm">No Portfolio Items Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-3">
                Freelancers with 2 or more portfolio projects receive 3x more proposal responses.
              </p>
              <button
                type="button"
                onClick={openAddPortfolio}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl inline-flex items-center space-x-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Project</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.portfolio.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-teal-200 transition space-y-2 group shadow-2xs"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h4>
                    <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => openEditPortfolio(idx)}
                        className="p-1 text-slate-500 hover:text-teal-600 rounded-md transition text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePortfolioItem(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>

                  <div className="pt-2 flex items-center space-x-3 text-xs text-slate-500">
                    {item.projectUrl && (
                      <a
                        href={item.projectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1 hover:text-teal-600 transition"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Live Demo</span>
                      </a>
                    )}
                    {item.githubUrl && (
                      <a
                        href={item.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1 hover:text-teal-600 transition"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Code</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating / Sticky Save Footer */}
        <div className="flex items-center justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-sm flex items-center space-x-2 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      {/* Portfolio Item Modal */}
      {showPortfolioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingPortfolioIndex !== null ? 'Edit Portfolio Project' : 'Add Portfolio Project'}
              </h3>
              <button
                onClick={() => setShowPortfolioModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePortfolioItem} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                  placeholder="e.g. E-Commerce Redesign"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={portfolioForm.description}
                  onChange={(e) =>
                    setPortfolioForm({ ...portfolioForm, description: e.target.value })
                  }
                  placeholder="Describe your role, problems solved, and tech stack used..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={portfolioForm.projectUrl}
                    onChange={(e) =>
                      setPortfolioForm({ ...portfolioForm, projectUrl: e.target.value })
                    }
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GitHub / Code URL
                  </label>
                  <input
                    type="url"
                    value={portfolioForm.githubUrl}
                    onChange={(e) =>
                      setPortfolioForm({ ...portfolioForm, githubUrl: e.target.value })
                    }
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPortfolioModal(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FreelancerProfile
