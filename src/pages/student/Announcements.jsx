import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

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
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const filtered = announcements.filter((announcement) => {
    const matchesFilter = filter === 'all'
      || (filter === 'global' && announcement.targetType === 'global')
      || (filter === 'batch' && announcement.targetType === 'batch');
    const matchesSearch = !search.trim()
      || announcement.title.toLowerCase().includes(search.toLowerCase())
      || announcement.message.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-base">Announcements</h1>
        <input
          type="search"
          className="input-field w-full md:w-72"
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        {['all', 'global', 'batch'].map((value) => (
          <button
            key={value}
            type="button"
            className={`px-4 py-2 rounded-xl text-sm ${filter === value ? 'bg-brand-600 text-white' : 'bg-surface-muted text-text-base'}`}
            onClick={() => setFilter(value)}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-text-subtle">No announcements found.</div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((announcement) => (
            <Card key={announcement._id} className={announcement.pinned ? 'border-brand-300 bg-brand-50' : ''}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-text-base">{announcement.title}</h3>
                    {announcement.pinned && <Badge variant="primary">Pinned</Badge>}
                    {announcement.courseId && (
                      <Badge variant="info">Course: {announcement.courseId?.title || 'N/A'}</Badge>
                    )}
                  </div>
                  <p className="text-text-muted mb-3">{announcement.message}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-subtle">
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
