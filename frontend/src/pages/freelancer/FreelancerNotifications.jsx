import {
  AlertCircle,
  Bell,
  Briefcase,
  Calendar,
  CheckCheck,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  Sparkles,
  Star,
  User,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import notificationService from '../../services/notification.service'

export const FreelancerNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'unread'
  const [processingId, setProcessingId] = useState(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await notificationService.getNotifications()
      setNotifications(res.data?.notifications || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (id) => {
    setProcessingId(id)
    try {
      await notificationService.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      )
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update notification')
    } finally {
      setProcessingId(null)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setSuccess('All notifications marked as read.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark all as read')
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead
    return true
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const getIconForType = (type) => {
    switch (type) {
      case 'proposal_accepted':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />
      case 'proposal_rejected':
        return <Clock className="w-5 h-5 text-rose-500" />
      case 'proposal_received':
        return <FileText className="w-5 h-5 text-teal-600" />
      case 'project_status_changed':
        return <Briefcase className="w-5 h-5 text-indigo-600" />
      case 'review_received':
        return <Star className="w-5 h-5 text-amber-500" />
      default:
        return <Bell className="w-5 h-5 text-slate-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-semibold mb-2">
              <Bell className="w-3.5 h-3.5" />
              <span>Activity Center</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-600 mt-1">
              Stay updated on proposal decisions, contract awards, project progress, and messages.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded-xl transition flex items-center space-x-2 self-start"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all as read ({unreadCount})</span>
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center space-x-2 mt-6 pt-6 border-t border-slate-100">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Activity ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              filter === 'unread'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-800 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-800 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl p-8">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">
            {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
            {filter === 'unread'
              ? 'You have read all your notifications.'
              : 'When clients review your proposals or project status changes, you will see notifications here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-5 rounded-2xl border transition flex items-start justify-between gap-4 ${
                notif.isRead
                  ? 'bg-white border-slate-200'
                  : 'bg-teal-50/50 border-teal-200 shadow-2xs'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`p-2.5 rounded-xl flex-shrink-0 ${
                    notif.isRead ? 'bg-slate-100' : 'bg-white shadow-2xs'
                  }`}
                >
                  {getIconForType(notif.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-slate-900 text-sm">{notif.title}</h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 mt-2 block">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {!notif.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notif._id)}
                  disabled={processingId === notif._id}
                  className="px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 rounded-lg transition self-center flex-shrink-0 disabled:opacity-50"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FreelancerNotifications
