import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { instructorAPI } from '../../services/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCard from '../../components/StatCard';

const AssessmentAnalytics = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await instructorAPI.getAssessmentAnalytics(assessmentId);
        if (response.data.success) {
          setAnalytics(response.data.data);
        }
      } catch (fetchError) {
        setError(fetchError.response?.data?.error || 'Failed to load assessment analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [assessmentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate('/instructor/assessments')}>
          ← Back to Assessments
        </Button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Analytics not found'}
        </div>
      </div>
    );
  }

  const { assessment, totals, trend } = analytics;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" onClick={() => navigate('/instructor/assessments')}>
          ← Back to Assessments
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/instructor/assessments/${assessmentId}/submissions`)}>
          View Submissions
        </Button>
      </div>

      <Card>
        <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
        <p className="text-sm text-gray-600 mt-1">Course: {assessment.courseTitle || 'N/A'}</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Attempts" value={totals.totalAttempts || 0} color="blue" />
        <StatCard title="Pass Rate" value={`${(totals.passRate || 0).toFixed(1)}%`} color="green" />
        <StatCard title="Avg Score" value={`${(totals.averageScore || 0).toFixed(1)}%`} color="purple" />
        <StatCard
          title="Avg Time"
          value={`${Math.round(totals.averageTimeTakenMinutes || 0)} min`}
          color="yellow"
        />
      </div>

      <Card title="Pass / Fail Breakdown">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-lg border border-green-200 bg-green-50">
            <p className="text-sm text-gray-600">Passed</p>
            <p className="text-xl font-semibold text-green-700">{totals.passCount || 0}</p>
          </div>
          <div className="p-4 rounded-lg border border-red-200 bg-red-50">
            <p className="text-sm text-gray-600">Failed</p>
            <p className="text-xl font-semibold text-red-700">{totals.failCount || 0}</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">Total Attempts</p>
            <p className="text-xl font-semibold text-gray-800">{totals.totalAttempts || 0}</p>
          </div>
        </div>
      </Card>

      <Card title="Attempt Trend">
        {trend?.length ? (
          <div className="space-y-2">
            {trend.map((point) => (
              <div key={point.date} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <span className="text-sm text-gray-700">{point.date}</span>
                <span className="font-medium text-gray-900">{point.attempts} attempt(s)</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No attempts submitted yet.</p>
        )}
      </Card>
    </div>
  );
};

export default AssessmentAnalytics;
