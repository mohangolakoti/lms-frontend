import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../services/api';

export const useStudents = (filters = {}) => {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search || '');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(filters.search || '');
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters.search]);

  const requestFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearch,
  }), [filters, debouncedSearch]);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getStudents(requestFilters);
      if (response.data.success) {
        setStudents(response.data.data);
        setPagination(response.data.pagination || {
          page: 1,
          limit: 20,
          total: response.data.data?.length || 0,
          pages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        });
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [requestFilters]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, pagination, loading, error, refetch: fetchStudents };
};

export const useStudent = (id) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchStudent();
    }
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStudent(id);
      if (response.data.success) {
        const data = response.data.data;
        if (data?.student) {
          setStudent({
            ...data.student,
            progress: data.progress || [],
          });
        } else {
          setStudent(data);
        }
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch student');
    } finally {
      setLoading(false);
    }
  };

  return { student, loading, error, refetch: fetchStudent };
};

