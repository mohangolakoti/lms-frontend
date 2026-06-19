import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI, authAPI } from '../../services/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';

const StudentProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, calendarRes, bookmarksRes, sessionsRes] = await Promise.all([
        studentAPI.getProfile(),
        studentAPI.getCalendar(),
        studentAPI.getBookmarks(),
        authAPI.getSessions(),
      ]);
      setProfile(profileRes.data.data);
      setCalendar(calendarRes.data.data || []);
      setBookmarks(bookmarksRes.data.data || []);
      setSessions(sessionsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    await authAPI.revokeSession(sessionId);
    loadProfileData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const user = profile?.user;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-base">My Profile</h1>
        <p className="text-sm text-text-muted mt-1">Account details, bookmarks, calendar, and active sessions.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      <Card title="Account">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="text-text-muted">Name:</span> <span className="font-medium">{user?.name}</span></div>
          <div><span className="text-text-muted">Email:</span> <span className="font-medium">{user?.email}</span></div>
          <div><span className="text-text-muted">Batch:</span> <span className="font-medium">{user?.batchId?.name || 'Not assigned'}</span></div>
          <div><span className="text-text-muted">Term:</span> <span className="font-medium">{user?.batch || 'N/A'}</span></div>
          <div><span className="text-text-muted">Courses completed:</span> <span className="font-medium">{profile?.stats?.completedCourses || 0}</span></div>
          <div><span className="text-text-muted">Learning streak:</span> <span className="font-medium">{profile?.stats?.currentStreakDays || 0} days</span></div>
        </div>
      </Card>

      <Card title="Saved Lessons">
        {bookmarks.length === 0 ? (
          <p className="text-sm text-text-subtle">No bookmarked lessons yet.</p>
        ) : (
          <div className="space-y-2">
            {bookmarks.map((bookmark) => (
              <div key={bookmark._id} className="flex items-center justify-between p-3 border border-line-soft rounded-lg">
                <div>
                  <p className="font-medium text-text-base">{bookmark.lessonTitle}</p>
                  <p className="text-xs text-text-muted">{bookmark.courseTitle}</p>
                </div>
                <Button variant="outline" onClick={() => navigate(`/student/courses/${bookmark.courseId}/lessons/${bookmark.lessonId}`)}>
                  Open
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Learning Calendar">
        {calendar.length === 0 ? (
          <p className="text-sm text-text-subtle">No upcoming events.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {calendar.slice(0, 20).map((event, index) => (
              <div key={`${event.type}-${index}`} className="flex items-center justify-between p-3 border border-line-soft rounded-lg text-sm">
                <div>
                  <p className="font-medium text-text-base">{event.title}</p>
                  {event.courseTitle && <p className="text-xs text-text-muted">{event.courseTitle}</p>}
                </div>
                <Badge variant="info">{new Date(event.date).toLocaleDateString()}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Active Sessions">
        {sessions.length === 0 ? (
          <p className="text-sm text-text-subtle">No active sessions.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.sessionId} className="flex items-start justify-between p-3 border border-line-soft rounded-lg">
                <div>
                  <p className="font-medium text-text-base">{session.userAgent || 'Unknown device'}</p>
                  <p className="text-xs text-text-muted">IP: {session.ipAddress || 'N/A'}</p>
                  <p className="text-xs text-text-subtle">Last used: {new Date(session.lastUsedAt).toLocaleString()}</p>
                </div>
                <Button variant="outline" onClick={() => handleRevokeSession(session.sessionId)}>Revoke</Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentProfile;
