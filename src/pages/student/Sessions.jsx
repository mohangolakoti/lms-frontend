import { useEffect, useState } from 'react';
import { authAPI } from '../../services/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revokingAll, setRevokingAll] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authAPI.getSessions();
      if (response.data.success) {
        setSessions(response.data.data || []);
      }
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || fetchError.response?.data?.error || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSession = async (sessionId) => {
    try {
      await authAPI.revokeSession(sessionId);
      await fetchSessions();
    } catch (revokeError) {
      setError(revokeError.response?.data?.message || revokeError.response?.data?.error || 'Failed to revoke session');
    }
  };

  const handleRevokeAll = async () => {
    try {
      setRevokingAll(true);
      await authAPI.revokeAllSessions();
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (revokeError) {
      setError(revokeError.response?.data?.message || revokeError.response?.data?.error || 'Failed to revoke all sessions');
    } finally {
      setRevokingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Devices</h1>
          <p className="text-sm text-gray-600 mt-1">Review and revoke active login sessions.</p>
        </div>
        <Button variant="danger" onClick={handleRevokeAll} disabled={revokingAll}>
          {revokingAll ? 'Revoking...' : 'Revoke All Sessions'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        {sessions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No active sessions found.</div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.sessionId} className="border border-gray-200 rounded-lg p-4 flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{session.userAgent || 'Unknown device'}</p>
                  <p className="text-sm text-gray-600">IP: {session.ipAddress || 'N/A'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last used: {new Date(session.lastUsedAt).toLocaleString()}
                  </p>
                </div>
                <Button variant="outline" onClick={() => handleRevokeSession(session.sessionId)}>
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Sessions;
