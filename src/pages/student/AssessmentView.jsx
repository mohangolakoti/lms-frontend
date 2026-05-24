import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  useEffect(() => {
    if (assessment && !submission && assessment.duration) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [assessment, submission]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAssessmentById(id);
      if (response.data.success) {
        const found = response.data.data;
        setAssessment(found);
        if (found.submitted && found.submission) {
          setSubmission(found.submission);
        } else {
          setTimeRemaining(found.duration * 60); // Convert to seconds
        }
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    if (window.confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
      await submitAssessment();
    }
  };

  const handleAutoSubmit = async () => {
    await submitAssessment(true);
  };

  const submitAssessment = async (autoSubmit = false) => {
    try {
      setSubmitting(true);
      const answerArray = Object.keys(answers).map(questionId => ({
        questionId,
        answer: answers[questionId],
      }));

      const response = await studentAPI.submitAssessment(id, {
        answers: answerArray,
        timeTaken: assessment.duration * 60 - timeRemaining,
      });

      if (response.data.success) {
        setSubmission(response.data.data);
        if (autoSubmit) {
          alert('Time is up! Your assessment has been automatically submitted.');
        }
        fetchAssessment(); // Refresh to get updated data
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
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
        <Link to="/student/assessments">
          <Button variant="secondary">← Back to Assessments</Button>
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Assessment not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/student/assessments">
          <Button variant="secondary">← Back to Assessments</Button>
        </Link>
        {!submission && timeRemaining > 0 && (
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold text-primary-600">
              Time Remaining: {formatTime(timeRemaining)}
            </div>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </Button>
          </div>
        )}
      </div>

      <Card>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{assessment.title}</h1>
        {assessment.description && (
          <p className="text-gray-600 mb-4">{assessment.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>📚 {assessment.courseId?.title || 'Course'}</span>
          <span>📝 {assessment.questions?.length || 0} questions</span>
          <span>⏱️ {(assessment.duration || 0)} minutes</span>
          <span>📊 Total Marks: {assessment.totalMarks}</span>
          <span>✅ Passing: {assessment.passingMarks}</span>
        </div>
        {submission && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Your Score</p>
                <p className="text-2xl font-bold text-primary-600">
                  {submission.score} / {submission.totalMarks} ({submission.percentage?.toFixed(1)}%)
                </p>
              </div>
              <Badge variant={submission.passed ? 'success' : 'danger'}>
                {submission.passed ? 'PASSED' : 'FAILED'}
              </Badge>
            </div>
          </div>
        )}
      </Card>

      {!submission ? (
        <Card title="Questions">
          {assessment.questions && assessment.questions.length > 0 ? (
            <div className="space-y-6">
              {assessment.questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="font-semibold text-gray-900">{index + 1}.</span>
                    <div className="flex-1">
                      <p className="text-gray-900 mb-2">{question.question}</p>
                      {question.marks && (
                        <span className="text-xs text-gray-500">({question.marks} marks)</span>
                      )}
                    </div>
                  </div>
                  {question.type === 'mcq' && question.options && (
                    <div className="space-y-2 ml-6">
                      {question.options.map((option, optIndex) => (
                        <label key={optIndex} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            checked={answers[index] === option}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            className="text-primary-400 focus:ring-primary-400"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {question.type === 'true-false' && (
                    <div className="space-y-2 ml-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value="true"
                          checked={answers[index] === 'true'}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                          className="text-primary-400 focus:ring-primary-400"
                        />
                        <span>True</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value="false"
                          checked={answers[index] === 'false'}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                          className="text-primary-400 focus:ring-primary-400"
                        />
                        <span>False</span>
                      </label>
                    </div>
                  )}
                  {(question.type === 'short-answer' || question.type === 'essay') && (
                    <div className="ml-6">
                      <textarea
                        className="input-field w-full"
                        rows={question.type === 'essay' ? 6 : 3}
                        value={answers[index] || ''}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        placeholder="Type your answer here..."
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No questions available</p>
          )}
        </Card>
      ) : (
        <Card title="Your Answers">
          <div className="space-y-6">
            {assessment.questions?.map((question, index) => {
              // Match answer by index since questions don't have _id
              const answer = submission.answers?.find(a => a.questionId === index);
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="font-semibold text-gray-900">{index + 1}.</span>
                    <div className="flex-1">
                      <p className="text-gray-900 mb-2">{question.question}</p>
                    </div>
                    {answer && (
                      <Badge variant={answer.isCorrect ? 'success' : 'danger'}>
                        {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </Badge>
                    )}
                  </div>
                  <div className="ml-6 space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Your Answer:</p>
                      <p className="text-gray-900">{answer?.answer || 'Not answered'}</p>
                    </div>
                    {answer && (
                      <p className="text-sm text-gray-500">
                        Marks: {answer.marksObtained} / {question.marks}
                      </p>
                    )}
                  </div>
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

