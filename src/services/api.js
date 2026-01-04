import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgotpassword', { email }),
  resetPassword: (token, password) => api.put(`/auth/resetpassword/${token}`, { password }),
  updatePassword: (currentPassword, newPassword) => 
    api.put('/auth/updatepassword', { currentPassword, newPassword }),
};

// Student API
export const studentAPI = {
  getDashboard: () => api.get('/students/dashboard'),
  getCourses: () => api.get('/students/courses'),
  getCourseDetails: (courseId) => api.get(`/students/courses/${courseId}`),
  updateLessonProgress: (courseId, lessonId, data) => 
    api.put(`/students/courses/${courseId}/lessons/${lessonId}/progress`, data),
  getAssessments: () => api.get('/students/assessments'),
  submitAssessment: (assessmentId, data) => 
    api.post(`/students/assessments/${assessmentId}/submit`, data),
  getAnnouncements: () => api.get('/students/announcements'),
  getNotifications: (params) => api.get('/students/notifications', { params }),
  markNotificationRead: (notificationId) => 
    api.put(`/students/notifications/${notificationId}/read`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getStudents: (params) => api.get('/admin/students', { params }),
  getStudent: (id) => api.get(`/admin/students/${id}`),
  updateStudentStatus: (id, status) => 
    api.put(`/admin/students/${id}/status`, { status }),
  getCourses: () => api.get('/admin/courses'),
  createCourse: (data) => api.post('/admin/courses', data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  getCourseAnalytics: (id) => api.get(`/admin/courses/${id}/analytics`),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  getInstructors: () => api.get('/admin/instructors'),
};

// Instructor API
export const instructorAPI = {
  getDashboard: () => api.get('/instructors/dashboard'),
  getCourses: () => api.get('/instructors/courses'),
  createCourse: (data) => api.post('/instructors/courses', data),
  updateCourse: (id, data) => api.put(`/instructors/courses/${id}`, data),
  addModule: (courseId, data) => api.post(`/instructors/courses/${courseId}/modules`, data),
  updateModule: (courseId, moduleId, data) => 
    api.put(`/instructors/courses/${courseId}/modules/${moduleId}`, data),
  deleteModule: (courseId, moduleId) => 
    api.delete(`/instructors/courses/${courseId}/modules/${moduleId}`),
  addLesson: (courseId, moduleId, data) => 
    api.post(`/instructors/courses/${courseId}/modules/${moduleId}/lessons`, data),
  updateLesson: (courseId, moduleId, lessonId, data) => 
    api.put(`/instructors/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, data),
  deleteLesson: (courseId, moduleId, lessonId) => 
    api.delete(`/instructors/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`),
  createAssessment: (data) => api.post('/instructors/assessments', data),
  getAssessments: () => api.get('/instructors/assessments'),
  getCourseProgress: (courseId) => api.get(`/instructors/courses/${courseId}/progress`),
  getSubmissions: (assessmentId) => api.get(`/instructors/assessments/${assessmentId}/submissions`),
  gradeSubmission: (submissionId, data) => 
    api.put(`/instructors/submissions/${submissionId}/grade`, data),
};

export default api;

