import axios from 'axios';
import axiosRetry from 'axios-retry';

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const isLocalFrontend = typeof window !== 'undefined'
  && ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(window.location.hostname);

// In local development, prefer Vite proxy to avoid CORS entirely.
const API_BASE_URL = import.meta.env.DEV && isLocalFrontend
  ? '/api'
  : (configuredApiBaseUrl || 'http://localhost:3000/api');

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send HttpOnly cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send HttpOnly cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure automatic retry with exponential backoff to handle transient network/server hiccups
const retryConfig = {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx status codes (e.g. rate limit, bad gateway, cold starts)
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500;
  },
};

axiosRetry(api, retryConfig);
axiosRetry(refreshClient, retryConfig);

let refreshRequest = null;

// Request interceptor to add token if it exists in localStorage (legacy/hybrid fallback support)
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
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const requestUrl = originalRequest.url || '';
    const isAuthEndpoint = requestUrl.includes('/auth/login')
      || requestUrl.includes('/auth/register')
      || requestUrl.includes('/auth/refresh')
      || requestUrl.includes('/auth/forgotpassword')
      || requestUrl.includes('/auth/resetpassword');

    // 401 unauthorized: attempt to rotate tokens via HttpOnly cookies
    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        if (!refreshRequest) {
          // Send cookie-based POST request without body
          refreshRequest = refreshClient.post('/auth/refresh');
        }

        const refreshResponse = await refreshRequest;
        const { token, refreshToken: rotatedRefreshToken, user } = refreshResponse.data.data || {};

        // If backend returned a bearer token in the body, update localStorage as a fallback
        if (token) {
          localStorage.setItem('token', token);
        }
        if (rotatedRefreshToken) {
          localStorage.setItem('refreshToken', rotatedRefreshToken);
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Fall through to logout
      } finally {
        refreshRequest = null;
      }
    }

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  refreshToken: () => api.post('/auth/refresh'), // Cookie-based refresh
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  getSessions: () => api.get('/auth/sessions'),
  revokeSession: (sessionId) => api.delete(`/auth/sessions/${sessionId}`),
  revokeAllSessions: () => api.delete('/auth/sessions'),
  forgotPassword: (email) => api.post('/auth/forgotpassword', { email }),
  resetPassword: (token, password) => api.post(`/auth/resetpassword/${token}`, { password }),
  updatePassword: (currentPassword, newPassword) => 
    api.put('/auth/updatepassword', { currentPassword, newPassword }),
};

// Student API
export const studentAPI = {
  getDashboard: () => api.get('/students/dashboard'),
  getLearningPath: () => api.get('/students/learning-path'),
  getProfile: () => api.get('/students/profile'),
  getCalendar: () => api.get('/students/calendar'),
  getBookmarks: () => api.get('/students/bookmarks'),
  toggleBookmark: (data) => api.post('/students/bookmarks', data),
  getCourses: (params) => api.get('/students/courses', { params }),
  getCourseDetails: (courseId) => api.get(`/students/courses/${courseId}`),
  getCourseResume: (courseId) => api.get(`/students/courses/${courseId}/resume`),
  updateLessonProgress: (courseId, lessonId, data) =>
    api.put(`/students/courses/${courseId}/lessons/${lessonId}/progress`, data),
  getLessonNote: (courseId, lessonId) =>
    api.get(`/students/courses/${courseId}/lessons/${lessonId}/note`),
  saveLessonNote: (courseId, lessonId, content) =>
    api.put(`/students/courses/${courseId}/lessons/${lessonId}/note`, { content }),
  getAssessments: (params) => api.get('/students/assessments', { params }),
  getAssessmentById: (assessmentId) => api.get(`/students/assessments/${assessmentId}`),
  submitAssessment: (assessmentId, data) =>
    api.post(`/students/assessments/${assessmentId}/submit`, data),
  getAnnouncements: () => api.get('/students/announcements'),
  markAnnouncementRead: (announcementId) =>
    api.put(`/students/announcements/${announcementId}/read`),
  getNotifications: (params) => api.get('/students/notifications', { params }),
  getUnreadNotificationCount: () => api.get('/students/notifications/unread-count'),
  markNotificationRead: (notificationId) =>
    api.put(`/students/notifications/${notificationId}/read`),
  markAllNotificationsRead: () => api.put('/students/notifications/read-all'),
  getNotificationPreferences: () => api.get('/students/notifications/preferences'),
  updateNotificationPreferences: (channels) =>
    api.put('/students/notifications/preferences', { channels }),
  getMyCertificates: () => api.get('/certificates/my'),
  downloadCertificate: (certificateNumber) =>
    api.get(`/certificates/download/${certificateNumber}`, { responseType: 'blob' }),
  verifyCertificate: (certificateNumber) => api.get(`/certificates/verify/${certificateNumber}`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getOperationalReports: () => api.get('/admin/reports/operational'),
  getStudents: (params) => api.get('/admin/students', { params }),
  exportStudents: (params) => api.get('/admin/students/export', { params, responseType: 'blob' }),
  bulkUpdateStudents: (data) => api.post('/admin/students/bulk-actions', data),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getStudent: (id) => api.get(`/admin/students/${id}`),
  updateStudentStatus: (id, status) => 
    api.put(`/admin/students/${id}/status`, { status }),
  approveStudent: (id) => api.put(`/admin/students/${id}/approve`),
  rejectStudent: (id, data = {}) => api.put(`/admin/students/${id}/reject`, data),
  updateStudentAcademic: (id, data) => api.put(`/admin/students/${id}/update-academic`, data),
  getBatches: (params) => api.get('/admin/batches', { params }),
  createBatch: (data) => api.post('/admin/batches', data),
  updateBatchStatus: (id, isActive) => api.put(`/admin/batches/${id}/status`, { isActive }),
  deleteBatch: (id) => api.delete(`/admin/batches/${id}`),
  restoreBatch: (id) => api.put(`/admin/batches/${id}/restore`),
  getCourses: (params) => api.get('/admin/courses', { params }),
  createCourse: (data) => api.post('/admin/courses', data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  getCourseAnalytics: (id) => api.get(`/admin/courses/${id}/analytics`),
  getAnnouncements: (params) => api.get('/admin/announcements', { params }),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),
  getInstructors: () => api.get('/admin/instructors'),
  createInstructor: (data) => api.post('/admin/instructors', data),
  updateInstructorStatus: (id, status) => api.put(`/admin/instructors/${id}/status`, { status }),
  getHealth: () => api.get('/health'),
  getCertificateTemplates: () => api.get('/certificates/templates'),
  createCertificateTemplate: (formData) =>
    api.post('/certificates/templates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  previewCertificate: (data) => api.post('/certificates/preview', data),
  generateCertificates: (data) => api.post('/certificates/generate', data),
  getCertificateJobs: (params) => api.get('/certificates/jobs', { params }),
  getCertificateJob: (jobId) => api.get(`/certificates/jobs/${jobId}`),
  getCertificates: (params) => api.get('/certificates/admin', { params }),
  revokeCertificate: (certificateId, reason) =>
    api.put(`/certificates/admin/${certificateId}/revoke`, { reason }),
};

// Instructor API
export const instructorAPI = {
  getDashboard: () => api.get('/instructors/dashboard'),
  getCourses: () => api.get('/instructors/courses'),
  getCourse: (courseId) => api.get(`/instructors/courses/${courseId}`),
  createCourse: (data) => api.post('/instructors/courses', data),
  updateCourse: (id, data) => api.put(`/instructors/courses/${id}`, data),
  addModule: (courseId, data) => api.post(`/instructors/courses/${courseId}/modules`, data),
  updateModule: (courseId, moduleId, data) => 
    api.put(`/instructors/courses/${courseId}/modules/${moduleId}`, data),
  deleteModule: (courseId, moduleId) => 
    api.delete(`/instructors/courses/${courseId}/modules/${moduleId}`),
  reorderModules: (courseId, moduleOrder) =>
    api.put(`/instructors/courses/${courseId}/modules/reorder`, { moduleOrder }),
  addLesson: (courseId, moduleId, data) => 
    api.post(`/instructors/courses/${courseId}/modules/${moduleId}/lessons`, data),
  updateLesson: (courseId, moduleId, lessonId, data) => 
    api.put(`/instructors/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, data),
  deleteLesson: (courseId, moduleId, lessonId) => 
    api.delete(`/instructors/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`),
  reorderLessons: (courseId, moduleId, lessonOrder) =>
    api.put(`/instructors/courses/${courseId}/modules/${moduleId}/lessons/reorder`, { lessonOrder }),
  createAssessment: (data) => api.post('/instructors/assessments', data),
  updateAssessment: (assessmentId, data) => api.put(`/instructors/assessments/${assessmentId}`, data),
  deleteAssessment: (assessmentId) => api.delete(`/instructors/assessments/${assessmentId}`),
  duplicateAssessment: (assessmentId) => api.post(`/instructors/assessments/${assessmentId}/duplicate`),
  getAssessments: (params) => api.get('/instructors/assessments', { params }),
  getAssessmentAnalytics: (assessmentId) => api.get(`/instructors/assessments/${assessmentId}/analytics`),
  getCourseProgress: (courseId, params) => api.get(`/instructors/courses/${courseId}/progress`, { params }),
  exportCourseProgress: (courseId, params) =>
    api.get(`/instructors/courses/${courseId}/progress/export`, { params, responseType: 'blob' }),
  getSubmissions: (assessmentId) => api.get(`/instructors/assessments/${assessmentId}/submissions`),
  gradeSubmission: (submissionId, data) => 
    api.put(`/instructors/submissions/${submissionId}/grade`, data),
};

export default api;

