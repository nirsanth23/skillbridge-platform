import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  Edit3,
  Save,
  ShieldAlert,
  Tag,
  User,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import projectService from '../../services/project.service'

const POPULAR_CATEGORIES = [
  'Web Development',
  'Mobile App Development',
  'UI/UX Design',
  'Backend & APIs',
  'AI & Machine Learning',
  'Data Engineering',
  'Cloud & DevOps',
  'Cybersecurity',
  'Academic Mentorship & Research',
]

const PROJECT_STATUSES = [
  { label: 'Open (Accepting proposals)', value: 'open' },
  { label: 'Draft (Hidden)', value: 'draft' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export const EditProject = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budgetType: 'fixed',
    budgetMin: '',
    budgetMax: '',
    deadline: '',
    projectType: 'individual',
    status: 'open',
  })

  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isOwner, setIsOwner] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await projectService.getProjectById(id)
        const project = res.data.project

        const ownerId = project.owner?._id || project.owner
        if (ownerId && user?.id && ownerId.toString() !== user.id.toString()) {
          setIsOwner(false)
          setLoading(false)
          return
        }

        setFormData({
          title: project.title || '',
          description: project.description || '',
          category: project.category || 'Web Development',
          budgetType: project.budgetType || 'fixed',
          budgetMin: project.budgetMin || '',
          budgetMax: project.budgetMax || '',
          deadline: project.deadline ? project.deadline.split('T')[0] : '',
          projectType: project.projectType || 'individual',
          status: project.status || 'open',
        })
        setSkills(project.skills || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load project details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProject()
    }
  }, [id, user])

  const handleAddSkill = (e) => {
    e.preventDefault()
    const trimmed = newSkill.trim()
    if (!trimmed) return
    if (skills.includes(trimmed)) {
      setNewSkill('')
      return
    }
    setSkills([...skills, trimmed])
    setNewSkill('')
  }

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.title.trim().length < 5) {
      setError('Title must be at least 5 characters long')
      return
    }

    if (formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters long')
      return
    }

    if (formData.budgetMin && formData.budgetMax) {
      if (Number(formData.budgetMax) < Number(formData.budgetMin)) {
        setError('Maximum budget cannot be less than minimum budget')
        return
      }
    }

    setSaving(true)
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        skills,
        budgetType: formData.budgetType,
        budgetMin: formData.budgetMin ? Number(formData.budgetMin) : 0,
        budgetMax: formData.budgetMax ? Number(formData.budgetMax) : (formData.budgetMin ? Number(formData.budgetMin) : 0),
        deadline: formData.deadline || null,
        projectType: formData.projectType,
        status: formData.status,
      }

      await projectService.updateProject(id, payload)
      setSuccess('Project updated successfully!')
      setTimeout(() => {
        navigate(`/projects/${id}`)
      }, 1200)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.general || 'Failed to update project'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-slate-500">Loading project data...</p>
        </div>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Unauthorized Access</h2>
          <p className="text-sm text-slate-600">
            You do not have permission to edit this project because you are not the owner.
          </p>
          <div className="pt-2">
            <Link
              to="/projects"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition"
            >
              Back to My Projects
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Link
            to={`/projects/${id}`}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Project Details</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Edit Project</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update project requirements, budget parameters, and operational status
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
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

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Project Title *
              </label>
              <input
                type="text"
                required
                maxLength={150}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Category & Project Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Tag className="w-4 h-4" />
                  </div>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    {POPULAR_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Project Type
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    {formData.projectType === 'company' ? (
                      <Building2 className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option value="individual">Individual Project</option>
                    <option value="company">Company / Enterprise Project</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Description *
              </label>
              <textarea
                rows={5}
                required
                maxLength={5000}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Required Skills &amp; Tech Stack
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((skill) => (
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
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g. React, Python, PostgreSQL"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(e))}
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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

            {/* Budget */}
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Budget &amp; Compensation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pricing Model
                  </label>
                  <select
                    value={formData.budgetType}
                    onChange={(e) => setFormData({ ...formData, budgetType: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Min Budget ($)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={formData.budgetMin}
                      onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Budget ($)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={formData.budgetMax}
                      onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Deadline & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Deadline
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Project Lifecycle Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  {PROJECT_STATUSES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
              <Link
                to={`/projects/${id}`}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
              >
                {saving ? (
                  <span>Saving Changes...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProject
