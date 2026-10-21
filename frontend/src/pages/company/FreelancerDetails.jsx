import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Clock,
  FolderGit2,
  Globe,
  Plus,
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
    const fetchFreelancer = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await freelancerService.getFreelancerById(id)
        setProfile(res.data?.profile || null)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load freelancer profile')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchFreelancer()
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
          to="/company/freelancers"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800 transition"
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
        to="/company/freelancers"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800 transition"
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
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-violet-100 shadow-xs flex-shrink-0"
          />
        ) : (
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-3xl flex items-center justify-center flex-shrink-0 shadow-sm">
            {userObj.name ? userObj.name.charAt(0).toUpperCase() : 'F'}
          </div>
        )}

        <div className="flex-1 text-center sm:text-left space-y-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{userObj.name || 'Freelancer'}</h1>
            {userObj.isVerified && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Verified
              </span>
            )}
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${availabilityBadge}`}>
              {profile.availability?.replace('_', ' ')}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="font-bold text-slate-800">
                {profile.rating > 0 ? profile.rating.toFixed(1) : 'New Talent'}
              </span>
              <span className="text-slate-400">({profile.reviewCount || 0} reviews)</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>{profile.completedProjects || 0} projects completed</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{profile.experienceYears || 0} years experience</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            {profile.bio || 'Professional software developer ready to build high quality products.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <div className="p-3 bg-violet-50 rounded-2xl border border-violet-100 flex items-center space-x-2">
              <span className="text-xs text-violet-700 font-medium">Hourly Rate:</span>
              <span className="text-base font-extrabold text-violet-900">
                ${profile.hourlyRate || 0} / hr
              </span>
            </div>

            <Link
              to="/company/projects/new"
              className="inline-flex items-center space-x-1.5 px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Post a Project for this Freelancer</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <span>Technical Skills & Expertise</span>
        </h2>
        {profile.skills?.length === 0 ? (
          <p className="text-xs text-slate-400">No specific skills listed yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.skills?.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-violet-50 text-violet-700 border border-violet-100 rounded-xl text-xs font-semibold"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Portfolio Showcase */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <FolderGit2 className="w-5 h-5 text-violet-600" />
          <span>Portfolio & Featured Work</span>
        </h2>

        {!profile.portfolio || profile.portfolio.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No portfolio projects added by this freelancer yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.portfolio.map((item, idx) => (
              <div
                key={item._id || idx}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-violet-200 hover:shadow-xs transition space-y-3"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-36 object-cover rounded-xl border border-slate-200"
                  />
                )}
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-3 pt-2 text-xs font-semibold">
                  {item.projectUrl && (
                    <a
                      href={item.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-violet-600 hover:text-violet-800"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Live Demo</span>
                    </a>
                  )}
                  {item.githubUrl && (
                    <a
                      href={item.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900"
                    >
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FreelancerDetails
