import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { instructorAPI } from '../../services/api';
import { useInstructorCourses } from '../../hooks/useCourses';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Select from '../../components/Select';
import LoadingSpinner from '../../components/LoadingSpinner';

const AssessmentSubmissions = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { courses } = useInstructorCourses();
  const [submissions, setSubmissions] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const [savingFeedback, setSavingFeedback] = useState({});
  const [passFilter, setPassFilter] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  const canGrade = useMemo(() => {
    if (!assessment) return false;
    const courseId = assessment.courseId?._id || assessment.courseId;
    const course = courses.find((item) => item._id === courseId);
    return course?.instructorRole === 'editor';
  }, [assessment, courses]);

  useEffect(() => {
    fetchSubmissions();
  }, [assessmentId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await instructorAPI.getSubmissions(assessmentId);
      if (response.data.success) {
        const { assessment: assessmentData, submissions: submissionRows } = response.data.data;
        setAssessment(assessmentData);
        setSubmissions(submissionRows);
        const initialDrafts = {};
        submissionRows.forEach((submission) => {
          initialDrafts[submission._id] = submission.feedback || '';
        });
        setFeedbackDrafts(initialDrafts);
      }
    } catch (fetchError) {
      setError(fetchError.response?.data?.error || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = useMemo(() => {
    let rows = [...submissions];
    if (passFilter === 'passed') rows = rows.filter((row) => row.passed);
    if (passFilter === 'failed') rows = rows.filter((row) => !row.passed);

    rows.sort((a, b) => {
      if (sortBy === 'score_desc') return (b.percentage || 0) - (a.percentage || 0);
      if (sortBy === 'score_asc') return (a.percentage || 0) - (b.percentage || 0);
      if (sortBy === 'date_asc') return new Date(a.submittedAt) - new Date(b.submittedAt);
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    });
    return rows;
  }, [submissions, passFilter, sortBy]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getQuestionLabel = (questionId) => {
    const question = assessment?.questions?.[questionId];
    if (!question) return `Question ${questionId + 1}`;
    return `Q${(question.order ?? questionId) + 1}: ${question.question}`;
  };

  const handleSaveFeedback = async (submissionId) => {
    if (!canGrade) return;
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

  if (error && !assessment) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => navigate('/instructor/assessments')}>
          ← Back to Assessments
        </Button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/instructor/assessments')}>
            ← Back to Assessments
          </Button>
          <h1 className="page-title">Assessment Submissions</h1>
        </div>
        {!canGrade && <Badge variant="info">Viewer access — feedback is read-only</Badge>}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {assessment && (
        <Card>
          <h2 className="text-xl font-semibold text-text-base">{assessment.title}</h2>
          {assessment.description && <p className="text-text-muted mt-1">{assessment.description}</p>}
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted pt-2">
            <span>📝 {assessment.questions?.length || 0} questions</span>
            <span>⏱️ {assessment.duration || 0} minutes</span>
            <span>📊 Total Marks: {assessment.totalMarks}</span>
            <span>✅ Passing: {assessment.passingMarks}</span>
          </div>
        </Card>
      )}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Select
            label="Filter by result"
            value={passFilter}
            onChange={(e) => setPassFilter(e.target.value)}
            options={[
              { value: '', label: 'All submissions' },
              { value: 'passed', label: 'Passed' },
              { value: 'failed', label: 'Failed' },
            ]}
          />
          <Select
            label="Sort by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'date_desc', label: 'Submitted (newest)' },
              { value: 'date_asc', label: 'Submitted (oldest)' },
              { value: 'score_desc', label: 'Score (high to low)' },
              { value: 'score_asc', label: 'Score (low to high)' },
            ]}
          />
        </div>

        <h3 className="text-lg font-semibold text-text-base mb-4">
          Submissions ({filteredSubmissions.length})
        </h3>

        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p>No submissions match your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <div key={submission._id} className="border border-line-soft rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-text-base">{submission.userId?.name || 'Unknown Student'}</h4>
                      <Badge variant={submission.passed ? 'success' : 'danger'}>
                        {submission.passed ? 'PASSED' : 'FAILED'}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-muted mb-3">
                      {submission.userId?.email || 'No email'}
                      {submission.userId?.batch && <span className="ml-2">• Batch: {submission.userId.batch}</span>}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-text-muted">Score</p>
                        <p className="font-semibold">{submission.score} / {submission.totalMarks}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">Percentage</p>
                        <p className="font-semibold">{submission.percentage?.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-text-muted">Time Taken</p>
                        <p className="font-semibold">{formatTime(submission.timeTaken || 0)}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">Submitted</p>
                        <p className="font-semibold">{formatDate(submission.submittedAt)}</p>
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-brand-50 border border-brand-200 rounded space-y-2">
                      <p className="text-sm font-medium text-text-base">Instructor Feedback</p>
                      <textarea
                        className="input-field w-full"
                        rows={3}
                        value={feedbackDrafts[submission._id] || ''}
                        onChange={(e) => setFeedbackDrafts((prev) => ({ ...prev, [submission._id]: e.target.value }))}
                        placeholder="Add grading feedback..."
                        disabled={!canGrade}
                      />
                      {canGrade && (
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            onClick={() => handleSaveFeedback(submission._id)}
                            disabled={!!savingFeedback[submission._id]}
                          >
                            {savingFeedback[submission._id] ? 'Saving...' : 'Save Feedback'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-line-soft">
                  <details>
                    <summary className="cursor-pointer text-sm font-medium text-brand-700">
                      View Answers ({submission.answers?.length || 0})
                    </summary>
                    <div className="mt-3 space-y-3">
                      {submission.answers?.map((answer, index) => (
                        <div key={index} className="pl-4 border-l-2 border-line-soft">
                          <div className="flex items-start justify-between mb-1 gap-2">
                            <p className="text-sm font-medium text-text-base">{getQuestionLabel(answer.questionId)}</p>
                            <Badge variant={answer.isCorrect ? 'success' : 'danger'} className="text-xs">
                              {answer.isCorrect ? '✓' : '✗'} {answer.marksObtained}/{assessment?.questions?.[answer.questionId]?.marks || 0}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-muted">
                            <span className="font-medium">Answer:</span> {String(answer.answer)}
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
