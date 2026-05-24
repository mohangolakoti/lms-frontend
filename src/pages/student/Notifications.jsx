import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, read, unread

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'read') params.read = true;
      if (filter === 'unread') params.read = false;

      const response = await studentAPI.getNotifications(params);
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await studentAPI.markNotificationRead(notificationId);
      fetchNotifications();
    } catch (error) {
      alert('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await studentAPI.markAllNotificationsRead();
      fetchNotifications();
    } catch (error) {
      alert('Failed to mark all notifications as read');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'unread' ? 'primary' : 'secondary'}
          onClick={() => setFilter('unread')}
        >
          Unread
        </Button>
        <Button
          variant={filter === 'read' ? 'primary' : 'secondary'}
          onClick={() => setFilter('read')}
        >
          Read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <p>No notifications</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification._id}
              className={!notification.read ? 'border-primary-300 bg-primary-50' : ''}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                    {!notification.read && (
                      <Badge variant="primary">New</Badge>
                    )}
                    <Badge variant="info">{notification.type}</Badge>
                  </div>
                  <p className="text-gray-700 mb-2">{notification.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <Button
                    variant="outline"
                    className="text-xs py-1 px-2"
                    onClick={() => handleMarkAsRead(notification._id)}
                  >
                    Mark as Read
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

