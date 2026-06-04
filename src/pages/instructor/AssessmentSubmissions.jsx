import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { instructorAPI } from '../../services/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

const AssessmentSubmissions = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const [savingFeedback, setSavingFeedback] = useState({});

  useEffect(() => {
    fetchSubmissions();
  }, [assessmentId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch submissions
      const response = await instructorAPI.getSubmissions(assessmentId);
      
      if (response.data.success) {
        const { assessment, submissions } = response.data.data;
        setAssessment(assessment);
        setSubmissions(submissions);
        const initialDrafts = {};
        submissions.forEach((submission) => {
          initialDrafts[submission._id] = submission.feedback || '';
        });
        setFeedbackDrafts(initialDrafts);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError(error.response?.data?.error || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleSaveFeedback = async (submissionId) => {
    try {
      setSavingFeedback((prev) => ({ ...prev, [submissionId]: true }));
      await instructorAPI.gradeSubmission(submissionId, {
        feedback: feedbackDrafts[submissionId] || '',
      });
      await fetchSubmissions();
    } catch (saveError) {
      setError(saveError.response?.data?.error || 'Failed to save feedback');
    } finally {
      setSavingFeedback((prev) => ({ ...prev, [submissionId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link to="/instructor/assessments">
          <Button variant="secondary">← Back to Assessments</Button>
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/instructor/assessments">
            <Button variant="secondary">← Back to Assessments</Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Submissions</h1>
        </div>
      </div>

      {assessment && (
        <Card>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">{assessment.title}</h2>
            {assessment.description && (
              <p className="text-gray-600">{assessment.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
              <span>📝 {assessment.questions?.length || 0} questions</span>
              <span>⏱️ {assessment.duration || 0} minutes</span>
              <span>📊 Total Marks: {assessment.totalMarks}</span>
              <span>✅ Passing: {assessment.passingMarks}</span>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Submissions ({submissions.length})
          </h3>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No submissions yet for this assessment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {submission.userId?.name || 'Unknown Student'}
                      </h4>
                      <Badge variant={submission.passed ? 'success' : 'danger'}>
                        {submission.passed ? 'PASSED' : 'FAILED'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {submission.userId?.email || 'No email'}
                      {submission.userId?.batch && (
                        <span className="ml-2">• Batch: {submission.userId.batch}</span>
                      )}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Score</p>
                        <p className="font-semibold text-gray-900">
                          {submission.score} / {submission.totalMarks}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Percentage</p>
                        <p className="font-semibold text-gray-900">
                          {submission.percentage?.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Time Taken</p>
                        <p className="font-semibold text-gray-900">
                          {formatTime(submission.timeTaken || 0)}
                          {assessment?.duration && (
                            <span className="text-gray-500 text-xs ml-1">
                              / {assessment.duration}m
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Submitted</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(submission.submittedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded space-y-2">
                      <p className="text-sm font-medium text-gray-700">Instructor Feedback</p>
                      <textarea
                        className="input-field w-full"
                        rows={3}
                        value={feedbackDrafts[submission._id] || ''}
                        onChange={(e) => setFeedbackDrafts((prev) => ({ ...prev, [submission._id]: e.target.value }))}
                        placeholder="Add grading feedback..."
                      />
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          onClick={() => handleSaveFeedback(submission._id)}
                          disabled={!!savingFeedback[submission._id]}
                        >
                          {savingFeedback[submission._id] ? 'Saving...' : 'Save Feedback'}
                        </Button>
                      </div>
                    </div>

                    {submission.gradedBy && (
                      <div className="mt-2 text-xs text-gray-500">
                        Graded on {formatDate(submission.gradedAt)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-brand-700 hover:text-brand-800">
                      View Answers ({submission.answers?.length || 0} questions)
                    </summary>
                    <div className="mt-3 space-y-3">
                      {submission.answers?.map((answer, index) => (
                        <div key={index} className="pl-4 border-l-2 border-gray-200">
                          <div className="flex items-start justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900">
                              Question {answer.questionId + 1}
                            </p>
                            <Badge variant={answer.isCorrect ? 'success' : 'danger'} className="text-xs">
                              {answer.isCorrect ? '✓' : '✗'} {answer.marksObtained}/{assessment?.questions?.[answer.questionId]?.marks || 0}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Answer:</span> {answer.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AssessmentSubmissions;
