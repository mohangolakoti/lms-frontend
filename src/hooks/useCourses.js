import { useState, useEffect } from 'react';
import { adminAPI, instructorAPI, studentAPI } from '../services/api';

export const useAdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCourses();
      if (response.data.success) {
        setCourses(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  return { courses, loading, error, refetch: fetchCourses };
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
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  return { courses, loading, error, refetch: fetchCourses };
};

export const useStudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getCourses();
      if (response.data.success) {
        setCourses(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  return { courses, loading, error, refetch: fetchCourses };
};

export const useCourseDetails = (courseId, role = 'student') => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId, role]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      let response;
      if (role === 'student') {
        response = await studentAPI.getCourseDetails(courseId);
      } else {
        // For instructor/admin, we can use instructor API
        response = await instructorAPI.getCourses();
        const found = response.data.data.find(c => c._id === courseId);
        if (found) {
          response.data.data = found;
        }
      }
      if (response.data.success) {
        setCourse(response.data.data.course || response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch course');
    } finally {
      setLoading(false);
    }
  };

  return { course, loading, error, refetch: fetchCourse };
};

