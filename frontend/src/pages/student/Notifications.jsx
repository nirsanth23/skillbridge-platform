import {
  AlertCircle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import notificationService from '../../services/notification.service'


export const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const fetchNotifications = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await notificationService.getNotifications()
      setNotifications(res.data?.notifications || [])
      setUnreadCount(res.data?.unreadCount || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // Ignore
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
      setSuccess('All notifications marked as read.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark all as read')
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead
    return true
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Bell className="w-6 h-6 text-indigo-600" />
            <span>Activity &amp; Notifications</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Stay updated on candidate bids, mentor bookings, and project milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Filter */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                activeTab === 'unread'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
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

      {/* Loading Spinner */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Fetching notifications...</p>
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 rounded-2xl border transition shadow-2xs flex items-start justify-between gap-4 ${
                notif.isRead
                  ? 'bg-white border-slate-200'
                  : 'bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-100'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    notif.type.includes('accepted')
                      ? 'bg-emerald-100 text-emerald-600'
                      : notif.type.includes('rejected') || notif.type.includes('cancelled')
                      ? 'bg-rose-100 text-rose-600'
                      : notif.type.includes('booking')
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-indigo-100 text-indigo-600'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-900">{notif.title}</h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  <p className="text-[10px] text-slate-400 flex items-center space-x-1 pt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(notif.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </p>
                </div>
              </div>

              {!notif.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notif._id)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition flex-shrink-0 cursor-pointer"
                  title="Mark as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No notifications</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You're all caught up! Updates regarding your projects, proposal reviews, and mentorship bookings will appear here.
          </p>
        </div>
      )}
    </div>
  )
}

export default Notifications
