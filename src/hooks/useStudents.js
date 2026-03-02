import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

export const useStudents = (filters = {}) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [filters.status, filters.batch, filters.search, filters.approvalStatus, filters.batchId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStudents(filters);
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  return { students, loading, error, refetch: fetchStudents };
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

