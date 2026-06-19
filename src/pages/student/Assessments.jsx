import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAssessments } from '../../hooks/useAssessments';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'closed', label: 'Missed' },
];

const Assessments = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const statusFilter = activeTab === 'all' ? undefined : activeTab === 'completed' ? 'completed' : activeTab;
  const { assessments, loading, error } = useStudentAssessments(statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  const now = new Date();
  const live = assessments.filter((a) => !a.submitted && a.windowStatus === 'live');
  const completed = assessments.filter((a) => a.submitted);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-base mb-2">Assessments</h1>
        <p className="text-text-muted">Track tests, deadlines, and your results.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-brand-50 border-brand-200">
          <p className="text-sm text-text-muted">Assigned</p>
          <p className="text-2xl font-bold text-text-base">{assessments.length}</p>
        </Card>
        <Card className="bg-success-50 border-success-200">
          <p className="text-sm text-text-muted">Completed</p>
          <p className="text-2xl font-bold text-text-base">{completed.length}</p>
        </Card>
        <Card className="bg-info-50 border-info-200">
          <p className="text-sm text-text-muted">Live Now</p>
          <p className="text-2xl font-bold text-text-base">{live.length}</p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'secondary'}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <Card title="My Tests">
        {assessments.length === 0 ? (
          <div className="text-center py-12 text-text-subtle">No assessments in this view.</div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => {
              const status = assessment.windowStatus || (
                !assessment.submitted && new Date(assessment.endDate || Date.now()) > now ? 'live' : 'closed'
              );

              return (
                <div key={assessment._id} className="border border-line-soft rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-text-base">{assessment.title}</h3>
                        {status === 'live' && !assessment.submitted && <Badge variant="info">LIVE</Badge>}
                        {status === 'upcoming' && <Badge variant="warning">UPCOMING</Badge>}
                        {status === 'closed' && !assessment.submitted && <Badge variant="danger">MISSED</Badge>}
                        {assessment.submitted && (
                          <Badge variant={assessment.submission?.passed ? 'success' : 'danger'}>
                            {assessment.submission?.passed ? 'PASSED' : 'FAILED'}
                          </Badge>
                        )}
                      </div>
                      {assessment.description && (
                        <p className="text-sm text-text-muted mb-2">{assessment.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-subtle">
                        <span>📚 {assessment.courseId?.title || 'Course'}</span>
                        <span>📝 {assessment.questionCount || 0} questions</span>
                        <span>⏱️ {assessment.duration || 0} min</span>
                        {assessment.submitted && assessment.submission && (
                          <span>
                            Score: {assessment.submission.score}/{assessment.totalMarks} ({assessment.submission.percentage?.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-text-subtle">
                      {assessment.startDate && <span>Start: {new Date(assessment.startDate).toLocaleDateString()}</span>}
                      {assessment.endDate && (
                        <span className="ml-4">Due: {new Date(assessment.endDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    <Button
                      variant={assessment.submitted ? 'outline' : 'primary'}
                      onClick={() => navigate(`/student/assessments/${assessment._id}`)}
                    >
                      {assessment.submitted ? 'View Results' : status === 'live' ? 'Start Test →' : 'View'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Assessments;
