import {
  AlertCircle,
  ArrowLeft,
  Mail,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import mentorService from '../../services/mentor.service'

export const MentorDetails = () => {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    const fetchMentorDetails = async () => {
      setLoading(true)
      try {
        const res = await mentorService.getMentorById(id)
        setProfile(res.data?.profile || null)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load mentor profile')
      } finally {
        setLoading(false)
      }
    }
    fetchMentorDetails()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading mentor profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Link
          to="/student/mentors"
          className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Mentors</span>
        </Link>
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error || 'Mentor not found'}</span>
        </div>
      </div>
    )
  }

  const userObj = profile.user || {}

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <Link
        to="/student/mentors"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Mentor Directory</span>
      </Link>

      {/* Mentor Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {userObj.profileImage ? (
          <img
            src={userObj.profileImage}
            alt={userObj.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs flex-shrink-0"
          />
        ) : (
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-3xl flex items-center justify-center flex-shrink-0">
            {userObj.name ? userObj.name.charAt(0).toUpperCase() : 'M'}
          </div>
        )}

        <div className="flex-1 text-center sm:text-left space-y-2.5">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{userObj.name}</h1>
            {userObj.isVerified && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Mentor</span>
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              {profile.experienceYears || 0} Years Experience
            </span>
          </div>

          <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start space-x-1.5">
            <Mail className="w-4 h-4 text-slate-400" />
            <span>{userObj.email}</span>
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs">
            <div className="flex items-center space-x-1 text-amber-500 font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{profile.rating ? profile.rating.toFixed(1) : '5.0'}</span>
              <span className="text-slate-400 font-normal">({profile.reviewCount || 0} reviews)</span>
            </div>

            <span className="text-slate-300">•</span>

            <span className="font-semibold text-slate-700">
              {profile.completedSessions || 0} sessions completed
            </span>
          </div>
        </div>

        {/* Booking Card Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center space-y-2 w-full sm:w-48 flex-shrink-0">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Hourly Rate</span>
          <p className="text-2xl font-extrabold text-slate-900">${profile.hourlyRate || 0}</p>
          <Link
            to={`/student/mentors/${profile._id}/book`}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl text-center shadow-xs transition"
          >
            Book Session
          </Link>
        </div>
      </div>

      {/* Main Content Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Biography */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">About Mentor</h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {profile.bio || 'No biography provided.'}
          </p>
        </div>

        {/* Expertise Skills */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Areas of Expertise</h2>
          {profile.expertise?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.expertise.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No specific expertise tags listed.</p>
          )}
        </div>

        {/* Mentoring Topics */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Mentoring Topics</h2>
          {profile.mentoringTopics?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.mentoringTopics.map((topic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-lg border border-purple-100"
                >
                  {topic}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Available for general engineering topics and portfolio reviews.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default MentorDetails
