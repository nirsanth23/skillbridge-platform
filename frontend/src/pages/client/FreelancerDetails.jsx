import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Globe,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import freelancerService from '../../services/freelancer.service'

export const FreelancerDetails = () => {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    const fetchFreelancer = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await freelancerService.getFreelancerById(id)
        if (isMounted) {
          setProfile(res.data?.profile || null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Freelancer profile could not be found')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (id) {
      fetchFreelancer()
    }

    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
        <div className="h-44 bg-slate-200 rounded-3xl" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Link
          to="/client/freelancers"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Freelancer Directory</span>
        </Link>
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-3xl text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error || 'Freelancer profile could not be found'}</span>
        </div>
      </div>
    )
  }

  const userObj = profile.user || {}
  const availabilityBadge = {
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    busy: 'bg-amber-50 text-amber-700 border-amber-200',
    not_available: 'bg-slate-100 text-slate-600 border-slate-200',
  }[profile.availability] || 'bg-slate-100 text-slate-600 border-slate-200'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/client/freelancers"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Freelancer Directory</span>
      </Link>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {userObj.profileImage ? (
          <img
            src={userObj.profileImage}
            alt={userObj.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-blue-100 shadow-xs flex-shrink-0"
          />
        ) : (
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-3xl flex items-center justify-center flex-shrink-0 shadow-sm">
            {userObj.name ? userObj.name.charAt(0).toUpperCase() : 'F'}
          </div>
        )}

        <div className="flex-1 text-center sm:text-left space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <h1 className="text-2xl font-bold text-slate-900">{userObj.name}</h1>
                {userObj.isVerified && (
                  <span className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 capitalize">
                Member of SkillBridge Platform
              </p>
            </div>

            <div className="flex flex-col sm:items-end">
              <span className="text-2xl font-bold text-blue-600">
                ${profile.hourlyRate || 0}
                <span className="text-xs text-slate-400 font-normal"> / hour</span>
              </span>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${availabilityBadge}`}>
                {profile.availability === 'available' ? 'Available Now' : profile.availability || 'Available'}
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-600">
            <div className="flex items-center space-x-1 text-amber-500 font-semibold">
              <Star className="w-4 h-4 fill-current" />
              <span>{profile.rating > 0 ? profile.rating.toFixed(1) : 'New'}</span>
              <span className="text-slate-400 font-normal">({profile.reviewCount || 0} reviews)</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>{profile.experienceYears || 0} Years Experience</span>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Bio */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">About the Freelancer</h2>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
          {profile.bio || 'This freelancer has not provided a detailed bio yet.'}
        </p>

        {/* Skills Section */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Technical Skills & Proficiencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio Links */}
        {profile.portfolio && profile.portfolio.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Portfolio & Reference Links
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {profile.portfolio.map((link, idx) => (
                <a
                  key={idx}
                  href={link.startsWith('http') ? link : `https://${link}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-blue-600 transition truncate"
                >
                  <Globe className="w-4 h-4 flex-shrink-0 text-slate-400" />
                  <span className="truncate">{link}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Client CTA Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-bold text-blue-900">Looking to hire this talent?</h3>
          <p className="text-xs text-blue-700">
            Post an open project listing to invite bids or check your project proposals.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/client/projects/new"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            Post a Project
          </Link>
          <Link
            to="/client/projects"
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold transition"
          >
            My Projects
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FreelancerDetails
