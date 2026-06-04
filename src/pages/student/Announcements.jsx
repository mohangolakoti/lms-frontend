import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAnnouncements();
      if (response.data.success) {
        setAnnouncements(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>

      {announcements.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">No announcements</p>
            <p className="text-sm">Check back later for important updates and news!</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card
              key={announcement._id}
              className={announcement.pinned ? 'border-brand-300 bg-brand-50' : ''}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                    {announcement.pinned && (
                      <Badge variant="primary">Pinned</Badge>
                    )}
                    {announcement.courseId && (
                      <Badge variant="info">Course: {announcement.courseId?.title || 'N/A'}</Badge>
                    )}
                  </div>
                  <p className="text-gray-700 mb-3">{announcement.message}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>By: {announcement.createdBy?.name || 'Admin'}</span>
                    <span>{new Date(announcement.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;

