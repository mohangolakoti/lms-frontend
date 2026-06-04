import { useState, useEffect } from 'react';
import { studentAPI, instructorAPI } from '../services/api';

export const useStudentAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAssessments();
      if (response.data.success) {
        setAssessments(response.data.data);
      }
    } catch (fetchError) {
      setError(fetchError.response?.data?.error || 'Failed to fetch assessments');
    } finally {
      setLoading(false);
    }
  };

  return { assessments, loading, error, refetch: fetchAssessments };
};

export const useInstructorAssessments = (filters = {}) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssessments();
  }, [filters.courseId, filters.visibility]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await instructorAPI.getAssessments(filters);
      if (response.data.success) {
        setAssessments(response.data.data);
      }
    } catch (fetchError) {
      setError(fetchError.response?.data?.error || 'Failed to fetch assessments');
    } finally {
      setLoading(false);
    }
  };

  return { assessments, loading, error, refetch: fetchAssessments };
};
