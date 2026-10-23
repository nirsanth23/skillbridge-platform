import {
  AlertCircle,
  Bell,
  Briefcase,
  CheckCheck,
  CheckCircle2,
  FileText,
  Inbox,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import notificationService from '../../services/notification.service'

export const CompanyNotifications = () => {
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'proposal_received':
        return <FileText className="w-4 h-4 text-violet-600" />
      case 'proposal_accepted':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />
      case 'proposal_rejected':
        return <AlertCircle className="w-4 h-4 text-rose-600" />
      case 'project_created':
      case 'project_completed':
        return <Briefcase className="w-4 h-4 text-indigo-600" />
      default:
        return <Bell className="w-4 h-4 text-violet-600" />
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead
    return true
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2.5">
            <Bell className="w-6 h-6 text-violet-600" />
            <span>Company Notifications</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time updates regarding bids received, applicant hiring, and project milestones.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl text-xs font-bold transition self-start sm:self-center"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Feedback alerts */}
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

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            filter === 'all'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            filter === 'unread'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filter === 'unread'
              ? "You're completely caught up! We will alert you whenever new activity occurs."
              : 'Notifications about your projects, bids, and contracts will appear here.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 shadow-2xs overflow-hidden">
          {filteredNotifications.map((n) => (
            <div
              key={n._id}
              className={`p-5 transition flex items-start justify-between gap-4 ${
                !n.isRead ? 'bg-violet-50/40 hover:bg-violet-50/60' : 'bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    !n.isRead ? 'bg-violet-100' : 'bg-slate-100'
                  }`}
                >
                  {getNotificationIcon(n.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-violet-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    {new Date(n.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkAsRead(n._id)}
                  disabled={processingId === n._id}
                  className="px-3 py-1 bg-white border border-slate-200 hover:border-violet-300 text-slate-600 hover:text-violet-700 rounded-lg text-xs font-semibold transition flex-shrink-0 shadow-2xs"
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

export default CompanyNotifications
