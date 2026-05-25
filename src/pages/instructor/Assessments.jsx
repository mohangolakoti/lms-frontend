import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInstructorAssessments } from '../../hooks/useAssessments';
import { useInstructorCourses } from '../../hooks/useCourses';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Select from '../../components/Select';
import LoadingSpinner from '../../components/LoadingSpinner';
import { instructorAPI } from '../../services/api';

const Assessments = () => {
  const { assessments, loading, error, refetch } = useInstructorAssessments();
  const { courses } = useInstructorCourses();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    questions: [],
    duration: 60,
    totalMarks: 100,
    passingMarks: 50,
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    type: 'mcq',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
  });
  const [formError, setFormError] = useState('');

  const handleAddQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.correctAnswer) {
      alert('Please fill in question and correct answer');
      return;
    }
    setFormData({
      ...formData,
      questions: [...formData.questions, { ...currentQuestion }],
    });
    setCurrentQuestion({
      question: '',
      type: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
    });
  };

  const handleRemoveQuestion = (index) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate courseId
    if (!formData.courseId || formData.courseId.trim() === '') {
      setFormError('Please select a course');
      return;
    }

    if (formData.questions.length === 0) {
      setFormError('Please add at least one question');
      return;
    }

    try {
      await instructorAPI.createAssessment(formData);
      setShowModal(false);
      setFormData({
        courseId: '',
        title: '',
        description: '',
        questions: [],
        duration: 60,
        totalMarks: 100,
        passingMarks: 50,
      });
      refetch();
    } catch (error) {
      setFormError(error.response?.data?.error || 'Failed to create assessment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
        <Button onClick={() => setShowModal(true)}>Create Assessment</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        {loading ? (
          <LoadingSpinner />
        ) : assessments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No assessments yet. Create your first assessment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div
                key={assessment._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{assessment.title}</h3>
                    {assessment.description && (
                      <p className="text-sm text-gray-600 mb-2">{assessment.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📚 {assessment.courseId?.title || 'Course'}</span>
                      <span>📝 {assessment.questions?.length || 0} questions</span>
                      <span>⏱️ {assessment.duration || 0} min</span>
                      <span>📊 {assessment.totalMarks} marks</span>
                      <Badge variant={assessment.visibility === 'published' ? 'success' : 'warning'}>
                        {assessment.visibility}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/instructor/assessments/${assessment._id}/submissions`}>
                    <Button variant="outline">View Submissions →</Button>
                  </Link>
                  <Link to={`/instructor/assessments/${assessment._id}/analytics`}>
                    <Button variant="secondary">View Analytics</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setFormData({
            courseId: '',
            title: '',
            description: '',
            questions: [],
            duration: 60,
            totalMarks: 100,
            passingMarks: 50,
          });
          setFormError('');
        }}
        title="Create Assessment"
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {formError}
            </div>
          )}
          <Select
            label="Course"
            name="courseId"
            value={formData.courseId}
            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
            options={courses.map((c) => ({ value: c._id, label: c.title }))}
            required
          />
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              required
            />
            <Input
              label="Total Marks"
              name="totalMarks"
              type="number"
              value={formData.totalMarks}
              onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) || 0 })}
              required
            />
            <Input
              label="Passing Marks"
              name="passingMarks"
              type="number"
              value={formData.passingMarks}
              onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Add Questions</h3>
            <div className="space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <Input
                label="Question"
                name="question"
                value={currentQuestion.question}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
              />
              <Select
                label="Type"
                name="type"
                value={currentQuestion.type}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })}
                options={[
                  { value: 'mcq', label: 'Multiple Choice' },
                  { value: 'true-false', label: 'True/False' },
                  { value: 'short-answer', label: 'Short Answer' },
                ]}
              />
              {currentQuestion.type === 'mcq' && (
                <div className="space-y-2">
                  {currentQuestion.options.map((opt, idx) => (
                    <Input
                      key={idx}
                      label={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...currentQuestion.options];
                        newOptions[idx] = e.target.value;
                        setCurrentQuestion({ ...currentQuestion, options: newOptions });
                      }}
                    />
                  ))}
                  <Input
                    label="Correct Answer"
                    value={currentQuestion.correctAnswer}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                    placeholder="Enter the correct option"
                  />
                </div>
              )}
              {(currentQuestion.type === 'true-false' || currentQuestion.type === 'short-answer') && (
                <Input
                  label="Correct Answer"
                  value={currentQuestion.correctAnswer}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                />
              )}
              <Input
                label="Marks"
                name="marks"
                type="number"
                value={currentQuestion.marks}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) || 1 })}
              />
              <Button type="button" variant="outline" onClick={handleAddQuestion}>
                Add Question
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Added Questions ({formData.questions.length})</p>
              {formData.questions.map((q, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-white border rounded">
                  <span className="text-sm">{idx + 1}. {q.question}</span>
                  <Button
                    type="button"
                    variant="danger"
                    className="text-xs py-1 px-2"
                    onClick={() => handleRemoveQuestion(idx)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Assessments;

