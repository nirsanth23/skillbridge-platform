import {
  AlertCircle,
  MessageSquare,
  Star,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import reviewService from '../../services/review.service'

export const MentorReviews = () => {
  const [reviewsData, setReviewsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await reviewService.getMyReviews()
      setReviewsData(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-44 bg-slate-200 rounded-xl" />
        <div className="h-44 bg-slate-200 rounded-3xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  const { reviews = [], stats = {} } = reviewsData || {}
  const { averageRating = 0, totalReviews = 0, distribution = {} } = stats

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2.5">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          <span>Reviews & Ratings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Verified student feedback and ratings received from completed mentorship sessions.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Ratings Aggregate Summary */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Average Rating Block */}
          <div className="text-center md:text-left md:border-r md:border-slate-100 md:pr-6 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Overall Score
            </span>
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <span className="text-4xl sm:text-5xl font-black text-slate-900">
                {averageRating ? averageRating.toFixed(1) : '5.0'}
              </span>
              <div>
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(averageRating || 5)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>
          </div>

          {/* Star Distribution Progress Bars */}
          <div className="md:col-span-2 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = distribution[stars] || 0
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
              return (
                <div key={stars} className="flex items-center space-x-3 text-xs">
                  <div className="flex items-center space-x-1 w-12 text-slate-600 font-semibold">
                    <span>{stars}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-400 text-[11px] font-medium">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Reviews Feed */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  {rev.reviewer?.profileImage ? (
                    <img
                      src={rev.reviewer.profileImage}
                      alt={rev.reviewer.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                      {rev.reviewer?.name?.charAt(0) || 'S'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {rev.reviewer?.name || 'Verified Student'}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span>•</span>
                      <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No reviews received yet</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            As you conduct mentorship calls and mark sessions as completed, students will leave ratings and feedback about their experience.
          </p>
        </div>
      )}
    </div>
  )
}

export default MentorReviews
