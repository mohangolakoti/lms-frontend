import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

export const useBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getBatches({ isActive: true });
      if (response.data.success) {
        setBatches(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  };

  return { batches, loading, error, refetch: fetchBatches };
};
