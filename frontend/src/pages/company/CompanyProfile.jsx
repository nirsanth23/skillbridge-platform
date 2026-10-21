import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Globe,
  Lock,
  Mail,
  MapPin,
  Save,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import useAuth from '../../hooks/useAuth'
import companyService from '../../services/company.service'

const COMPANY_SIZE_OPTIONS = [
  { value: '1-10', label: '1 - 10 employees (Startup)' },
  { value: '11-50', label: '11 - 50 employees (Small Business)' },
  { value: '51-200', label: '51 - 200 employees (Mid Size)' },
  { value: '201-500', label: '201 - 500 employees (Large)' },
  { value: '500+', label: '500+ employees (Enterprise)' },
]

export const CompanyProfile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form Fields
  const [companyName, setCompanyName] = useState('')
  const [description, setDescription] = useState('')
  const [industry, setIndustry] = useState('')
  const [website, setWebsite] = useState('')
  const [location, setLocation] = useState('')
  const [companySize, setCompanySize] = useState('11-50')

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await companyService.getMyProfile()
      const data = res.data?.profile || {}
      setProfile(data)
      setCompanyName(data.companyName || '')
      setDescription(data.description || '')
      setIndustry(data.industry || '')
      setWebsite(data.website || '')
      setLocation(data.location || '')
      setCompanySize(data.companySize || '11-50')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load company profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        companyName: companyName.trim(),
        description: description.trim(),
        industry: industry.trim(),
        website: website.trim() || null,
        location: location.trim(),
        companySize,
      }

      const res = await companyService.updateMyProfile(payload)
      setProfile(res.data?.profile || {})
      setSuccess('Company profile updated successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors && Object.values(err.response.data.errors).join(', ')) ||
        'Failed to update profile'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-slate-200 rounded-3xl" />
        <div className="h-96 bg-slate-200 rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2.5">
          <Building2 className="w-6 h-6 text-violet-600" />
          <span>Company Profile Management</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your organization details, branding, and hiring identity across SkillBridge.
        </p>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-700 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Profile Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
        {/* Verification & Account Overview Banner */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-300"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-lg">
                {companyName?.charAt(0)?.toUpperCase() || 'C'}
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">{companyName || 'Your Company'}</h3>
                {profile?.verificationStatus === 'verified' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                    {profile?.verificationStatus || 'unverified'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center space-x-1.5 self-start sm:self-center">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Verification status is managed by platform admins</span>
          </div>
        </div>

        {/* Form Fields Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
            Company Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="companyName"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Innovations Corp"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-slate-900"
              />
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="industry" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Industry
              </label>
              <input
                id="industry"
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Fintech, Healthcare, AI, SaaS"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-slate-900"
              />
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Website URL</span>
              </label>
              <input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-slate-900"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Location</span>
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA or Remote"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-slate-900"
              />
            </div>

            {/* Company Size */}
            <div className="md:col-span-2">
              <label htmlFor="companySize" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Company Size</span>
              </label>
              <select
                id="companySize"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-slate-900 bg-white"
              >
                {COMPANY_SIZE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-xs font-semibold text-slate-700 mb-1.5">
                About the Company
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell freelancers about your company culture, mission, and the type of work you build..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-slate-900 resize-y"
              />
              <p className="text-[11px] text-slate-400 mt-1">Maximum 2,000 characters</p>
            </div>
          </div>
        </div>

        {/* Read-only Account Information */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
            Account Security & Credentials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Account Email</span>
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email}</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Account Role</span>
              <div className="flex items-center space-x-2 text-xs font-semibold text-violet-700 uppercase">
                <Building2 className="w-3.5 h-3.5 text-violet-500" />
                <span>{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
          <button
            type="button"
            onClick={fetchProfile}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default CompanyProfile
