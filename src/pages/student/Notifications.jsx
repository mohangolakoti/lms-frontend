import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

const getNotificationLink = (notification) => {
  const payload = notification.payload || {};
  if (payload.assessmentId) return `/student/assessments/${payload.assessmentId}`;
  if (payload.courseId) return `/student/courses/${payload.courseId}`;
  if (payload.announcementId) return '/student/announcements';
  return null;
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({ portal: true, email: true, whatsapp: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, [filter, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (filter === 'read') params.read = true;
      if (filter === 'unread') params.read = false;

      const response = await studentAPI.getNotifications(params);
      if (response.data.success) {
        setNotifications(response.data.data);
        setPagination(response.data.pagination || { pages: 1 });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await studentAPI.getNotificationPreferences();
      if (response.data.success) {
        setPreferences(response.data.data?.channels || preferences);
      }
    } catch (prefError) {
      console.error('Failed to fetch notification preferences', prefError);
    }
  };

  const handleOpenNotification = async (notification) => {
    if (!notification.read) {
      await studentAPI.markNotificationRead(notification._id);
    }
    const link = getNotificationLink(notification);
    if (link) navigate(link);
    else fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await studentAPI.markAllNotificationsRead();
    fetchNotifications();
  };

  const handlePreferenceChange = async (channel, value) => {
    const previous = { ...preferences };
    const next = { ...preferences, [channel]: value };
    setPreferences(next);
    try {
      await studentAPI.updateNotificationPreferences(next);
    } catch {
      setPreferences(previous);
      alert('Failed to update notification preferences');
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-base">Notifications</h1>
          {unreadCount > 0 && filter !== 'read' && (
            <p className="text-sm text-text-muted mt-1">{unreadCount} unread on this page</p>
          )}
        </div>
        <Button variant="outline" onClick={handleMarkAllAsRead}>Mark All Read</Button>
      </div>

      <div className="flex gap-2">
        {['all', 'unread', 'read'].map((value) => (
          <Button key={value} variant={filter === value ? 'primary' : 'secondary'} onClick={() => { setFilter(value); setPage(1); }}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Button>
        ))}
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-text-base mb-3">Notification Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['portal', 'email', 'whatsapp'].map((channel) => (
            <label key={channel} className="flex items-center justify-between p-3 border border-line-soft rounded-lg">
              <span className="text-sm text-text-muted capitalize">{channel}</span>
              <input
                type="checkbox"
                checked={!!preferences[channel]}
                onChange={(e) => handlePreferenceChange(channel, e.target.checked)}
              />
            </label>
          ))}
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      {notifications.length === 0 ? (
        <Card><div className="text-center py-12 text-text-subtle">No notifications</div></Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification._id}
              className={`cursor-pointer ${!notification.read ? 'border-brand-300 bg-brand-50' : ''}`}
            >
              <button type="button" className="w-full text-left" onClick={() => handleOpenNotification(notification)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-text-base">{notification.title}</h3>
                      {!notification.read && <Badge variant="primary">New</Badge>}
                      <Badge variant="info">{notification.type}</Badge>
                    </div>
                    <p className="text-text-muted mb-2">{notification.message}</p>
                    <p className="text-xs text-text-subtle">{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </button>
            </Card>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-3">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-text-muted">Page {page} of {pagination.pages}</span>
          <Button variant="outline" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
