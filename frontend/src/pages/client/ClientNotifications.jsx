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

export const ClientNotifications = () => {
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
        return <FileText className="w-4 h-4 text-blue-600" />
      case 'proposal_accepted':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />
      case 'proposal_rejected':
        return <AlertCircle className="w-4 h-4 text-rose-600" />
      case 'project_created':
      case 'project_completed':
        return <Briefcase className="w-4 h-4 text-indigo-600" />
      default:
        return <Bell className="w-4 h-4 text-blue-600" />
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
            <Bell className="w-6 h-6 text-blue-600" />
            <span>Client Notifications</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time updates regarding proposals received, freelancer hiring, and project milestones.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-700 text-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
            filter === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
            filter === 'unread'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Notifications</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filter === 'unread'
              ? 'You have caught up with all your notifications!'
              : 'You have not received any notifications yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 ${
                notification.isRead
                  ? 'bg-white border-slate-200'
                  : 'bg-blue-50/40 border-blue-200 shadow-2xs'
              }`}
            >
              <div className="flex items-start space-x-3.5 min-w-0">
                <div
                  className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${
                    notification.isRead ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {!notification.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notification._id)}
                  disabled={processingId === notification._id}
                  className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium whitespace-nowrap transition flex-shrink-0"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ClientNotifications
