import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async (page = 1, limit = 10, search = '') => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnnouncements({ page, limit, search });
      if (response.data.success) {
        setAnnouncements(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      await adminAPI.deleteAnnouncement(id);
      // Remove from list
      setAnnouncements(announcements.filter(a => a._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error };
    }
  };

  return { 
    announcements, 
    loading, 
    error, 
    pagination,
    fetchAnnouncements, 
    deleteAnnouncement,
  };
};
