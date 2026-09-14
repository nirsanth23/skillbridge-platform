import { AlertCircle, Building2, CheckCircle2, Globe, MapPin, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import companyService from '../../services/company.service'

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+']

export const CompanyProfileCard = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await companyService.getMyProfile()
        setProfile(data.data.profile)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load company profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const payload = {
        companyName: profile.companyName?.trim() || 'My Company',
        description: profile.description || '',
        industry: profile.industry || '',
        website: profile.website?.trim() || null,
        location: profile.location || '',
        companySize: profile.companySize || '1-10',
      }

      const data = await companyService.updateMyProfile(payload)
      setProfile(data.data.profile)
      setSuccess('Company profile updated successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.general || 'Failed to update company profile')
    } finally {
      setSaving(false)
    }
  }

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ✓ Verified Business
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            ⏳ Pending Verification
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            ✕ Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Unverified
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-slate-100 bg-teal-50/40 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Company Organization Profile</h3>
          <p className="text-xs text-slate-500 mt-0.5">Manage your organization details, industry, and online presence</p>
        </div>
        <div>
          {getVerificationBadge(profile?.verificationStatus)}
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

        {/* Company Name & Industry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Company / Legal Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                maxLength={150}
                value={profile?.companyName || ''}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                placeholder="Acme Technologies Inc."
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Industry Domain
            </label>
            <input
              type="text"
              maxLength={100}
              value={profile?.industry || ''}
              onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
              placeholder="e.g. Fintech, EdTech, SaaS, Healthcare"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>
        </div>

        {/* Company Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            About Company &amp; Mission
          </label>
          <textarea
            rows={4}
            maxLength={2000}
            value={profile?.description || ''}
            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            placeholder="Tell top talent and mentors about your company vision, product stack, culture, and hiring needs..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>

        {/* Website, Location & Company Size */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Official Website
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={profile?.website || ''}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="https://example.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Headquarters / Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                maxLength={150}
                value={profile?.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="e.g. San Francisco, CA or Remote"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Company Size
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Users className="w-4 h-4" />
              </div>
              <select
                value={profile?.companySize || '1-10'}
                onChange={(e) => setProfile({ ...profile, companySize: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              >
                {COMPANY_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} employees
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition"
          >
            {saving ? 'Saving Changes...' : 'Save Company Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CompanyProfileCard
