import { useState, useEffect, useCallback } from 'react';
import { adminAPI, instructorAPI, studentAPI } from '../services/api';

export const useAdminCourses = (filters = {}) => {
  const [courses, setCourses] = useState([]);
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

  useEffect(() => {
    fetchCourses();
  }, [filters.page, filters.limit, filters.search, filters.visibility, filters.batchId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCourses(filters);
      if (response.data.success) {
        setCourses(response.data.data);
        setPagination(response.data.pagination || pagination);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  return { courses, pagination, loading, error, refetch: fetchCourses };
};

export const useInstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await instructorAPI.getCourses();
      if (response.data.success) {
        setCourses(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  return { courses, loading, error, refetch: fetchCourses };
};

export const useStudentCourses = (filters = {}) => {
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getCourses({
        page: filters.page || 1,
        limit: filters.limit || 12,
        search: filters.search || undefined,
      });
      if (response.data.success) {
        setCourses(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.limit, filters.search]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, pagination, loading, error, refetch: fetchCourses };
};

export const useCourseDetails = (courseId, role = 'student') => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      let response;
      if (role === 'student') {
        response = await studentAPI.getCourseDetails(courseId);
        if (response.data.success) {
          setCourse({
            ...response.data.data.course,
            progress: response.data.data.progress,
          });
        }
      } else {
        response = await instructorAPI.getCourse(courseId);
        if (response.data.success) {
          setCourse(response.data.data.course || response.data.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch course');
    } finally {
      setLoading(false);
    }
  }, [courseId, role]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return { course, loading, error, refetch: fetchCourse };
};
