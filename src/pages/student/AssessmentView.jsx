import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';

const AssessmentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const timeRemainingRef = useRef(0);
  const assessmentRef = useRef(null);
  const submittingRef = useRef(false);

  const fetchAssessment = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAssessmentById(id);
      if (response.data.success) {
        const found = response.data.data;
        setAssessment(found);
        assessmentRef.current = found;
        if (found.submitted && found.submission) {
          setSubmission(found.submission);
          setStarted(true);
        } else if (found.windowStatus === 'live') {
          setTimeRemaining(found.duration * 60);
          timeRemainingRef.current = found.duration * 60;
          const saved = sessionStorage.getItem(`assessment-${id}-answers`);
          if (saved) setAnswers(JSON.parse(saved));
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  const submitAssessment = useCallback(async (autoSubmit = false) => {
    if (submittingRef.current || !assessmentRef.current) return;
    submittingRef.current = true;
    try {
      setSubmitting(true);
      const answerArray = Object.keys(answers).map((questionId) => ({
        questionId,
        answer: answers[questionId],
      }));

      const response = await studentAPI.submitAssessment(id, {
        answers: answerArray,
        timeTaken: assessmentRef.current.duration * 60 - timeRemainingRef.current,
      });

      if (response.data.success) {
        sessionStorage.removeItem(`assessment-${id}-answers`);
        setSubmission(response.data.data);
        await fetchAssessment();
        if (autoSubmit) alert('Time is up! Your assessment has been automatically submitted.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }, [answers, fetchAssessment, id]);

  useEffect(() => {
    if (!started || submission || !assessment?.duration || assessment.windowStatus !== 'live') {
      return undefined;
    }

    const timer = setInterval(() => {
      timeRemainingRef.current = Math.max(0, timeRemainingRef.current - 1);
      setTimeRemaining(timeRemainingRef.current);
      if (timeRemainingRef.current <= 0) {
        submitAssessment(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [started, submission, assessment, submitAssessment]);

  useEffect(() => {
    if (started && !submission) {
      sessionStorage.setItem(`assessment-${id}-answers`, JSON.stringify(answers));
    }
  }, [answers, started, submission, id]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const unansweredCount = assessment?.questions?.filter((_, index) => answers[index] === undefined || answers[index] === '').length || 0;

  const handleSubmit = async () => {
    if (unansweredCount > 0) {
      if (!window.confirm(`${unansweredCount} question(s) unanswered. Submit anyway?`)) return;
    } else if (!window.confirm('Are you sure you want to submit?')) {
      return;
    }
    await submitAssessment(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => navigate('/student/assessments')}>← Back to Assessments</Button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Assessment not found'}
        </div>
      </div>
    );
  }

  if (!submission && assessment.windowStatus === 'upcoming') {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => navigate('/student/assessments')}>← Back</Button>
        <Card>
          <h1 className="text-2xl font-bold text-text-base mb-2">{assessment.title}</h1>
          <Badge variant="warning" className="mb-4">Not yet available</Badge>
          <p className="text-text-muted">
            Opens on {assessment.startDate ? new Date(assessment.startDate).toLocaleString() : 'TBD'}
          </p>
        </Card>
      </div>
    );
  }

  if (!submission && assessment.windowStatus === 'closed') {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => navigate('/student/assessments')}>← Back</Button>
        <Card>
          <h1 className="text-2xl font-bold text-text-base mb-2">{assessment.title}</h1>
          <Badge variant="danger" className="mb-4">Assessment closed</Badge>
          <p className="text-text-muted">The submission window has ended.</p>
        </Card>
      </div>
    );
  }

  if (!started && !submission) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => navigate('/student/assessments')}>← Back</Button>
        <Card>
          <h1 className="text-2xl font-bold text-text-base mb-2">{assessment.title}</h1>
          <p className="text-text-muted mb-4">{assessment.description}</p>
          <ul className="text-sm text-text-muted space-y-1 mb-6">
            <li>Questions: {assessment.questions?.length || 0}</li>
            <li>Duration: {assessment.duration} minutes</li>
            <li>Passing marks: {assessment.passingMarks} / {assessment.totalMarks}</li>
          </ul>
          <Button onClick={() => setStarted(true)}>Start Assessment</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={() => navigate('/student/assessments')}>← Back</Button>
        {!submission && started && timeRemaining > 0 && (
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold text-brand-700">Time: {formatTime(timeRemaining)}</div>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        )}
      </div>

      <Card>
        <h1 className="text-2xl font-bold text-text-base mb-2">{assessment.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
          <span>📝 {assessment.questions?.length || 0} questions</span>
          <span>⏱️ {assessment.duration} minutes</span>
          <span>📊 Total: {assessment.totalMarks}</span>
        </div>
        {submission && (
          <div className="mt-4 p-4 bg-info-50 border border-info-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold text-text-base">Your Score</p>
              <p className="text-2xl font-bold text-brand-700">
                {submission.score} / {submission.totalMarks} ({submission.percentage?.toFixed(1)}%)
              </p>
            </div>
            <Badge variant={submission.passed ? 'success' : 'danger'}>
              {submission.passed ? 'PASSED' : 'FAILED'}
            </Badge>
          </div>
        )}
      </Card>

      {!submission ? (
        <Card title="Questions">
          {unansweredCount > 0 && (
            <p className="text-sm text-warning-700 mb-4">{unansweredCount} unanswered</p>
          )}
          <div className="space-y-6">
            {assessment.questions?.map((question, index) => (
              <div key={index} className="border border-line-soft rounded-lg p-4">
                <p className="font-medium text-text-base mb-3">{index + 1}. {question.question}</p>
                {question.type === 'mcq' && (
                  <div className="space-y-2 ml-4">
                    {question.options?.map((option, optIndex) => (
                      <label key={optIndex} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={answers[index] === option}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}
                {question.type === 'true-false' && (
                  <div className="space-y-2 ml-4">
                    {['true', 'false'].map((value) => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={value}
                          checked={answers[index] === value}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                        />
                        <span className="capitalize">{value}</span>
                      </label>
                    ))}
                  </div>
                )}
                {(question.type === 'short-answer' || question.type === 'fill-in-the-blank') && (
                  <textarea
                    className="input-field w-full ml-4"
                    rows={3}
                    value={answers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder="Type your answer..."
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card title="Your Answers">
          <div className="space-y-6">
            {assessment.questions?.map((question, index) => {
              const answer = submission.answers?.find((a) => a.questionId === index);
              return (
                <div key={index} className="border border-line-soft rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-text-base">{index + 1}. {question.question}</p>
                    {answer && (
                      <Badge variant={answer.isCorrect ? 'success' : 'danger'}>
                        {answer.isCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-text-muted">Your answer: {answer?.answer || 'Not answered'}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AssessmentView;
