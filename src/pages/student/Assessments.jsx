import { Link } from 'react-router-dom';
import { useStudentAssessments } from '../../hooks/useAssessments';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

const Assessments = () => {
  const { assessments, loading, error } = useStudentAssessments();

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
  const upcoming = assessments.filter(a => !a.submitted && new Date(a.endDate || Date.now()) > now);
  const attempted = assessments.filter(a => a.submitted);
  const unattempted = assessments.filter(a => !a.submitted && new Date(a.endDate || Date.now()) <= now);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Assessment Activity</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tests Assigned</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{assessments.length}</p>
            </div>
            <span className="text-3xl">📄</span>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tests Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{attempted.length}</p>
            </div>
            <span className="text-3xl">✅</span>
          </div>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{upcoming.length}</p>
            </div>
            <span className="text-3xl">📅</span>
          </div>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unattempted</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{unattempted.length}</p>
            </div>
            <span className="text-3xl">⚠️</span>
          </div>
        </Card>
      </div>

      {/* Assessments List */}
      <Card title="My Tests">
        {assessments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No assessments assigned yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => {
              const isUpcoming = !assessment.submitted && new Date(assessment.endDate || Date.now()) > now;
              const isOverdue = !assessment.submitted && new Date(assessment.endDate || Date.now()) <= now;

              return (
                <div
                  key={assessment._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{assessment.title}</h3>
                        {isUpcoming && (
                          <Badge variant="info">LIVE</Badge>
                        )}
                        {isOverdue && (
                          <Badge variant="danger">OVERDUE</Badge>
                        )}
                        {assessment.submitted && (
                          <Badge variant={assessment.submission?.passed ? 'success' : 'danger'}>
                            {assessment.submission?.passed ? 'PASSED' : 'FAILED'}
                          </Badge>
                        )}
                      </div>
                      {assessment.description && (
                        <p className="text-sm text-gray-600 mb-2">{assessment.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>📚 {assessment.courseId?.title || 'Course'}</span>
                        <span>📝 {assessment.questions?.length || 0} questions</span>
                        <span>⏱️ {Math.floor((assessment.duration || 0) / 60)} min</span>
                        {assessment.submitted && assessment.submission && (
                          <span>
                            Score: {assessment.submission.score}/{assessment.totalMarks} (
                            {assessment.submission.percentage?.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {assessment.startDate && (
                        <span>Start: {new Date(assessment.startDate).toLocaleDateString()}</span>
                      )}
                      {assessment.endDate && (
                        <span className="ml-4">
                          End: {new Date(assessment.endDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <Link to={`/student/assessments/${assessment._id}`}>
                      <Button variant={assessment.submitted ? 'outline' : 'primary'}>
                        {assessment.submitted ? 'View Results' : 'Start Test →'}
                      </Button>
                    </Link>
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

