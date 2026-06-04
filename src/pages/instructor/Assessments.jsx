import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { courses } = useInstructorCourses();
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const { assessments, loading, error, refetch } = useInstructorAssessments({
    visibility: visibilityFilter || undefined,
    courseId: courseFilter || undefined,
  });

  const editorCourseIds = useMemo(
    () => new Set(courses.filter((course) => course.instructorRole === 'editor').map((course) => course._id)),
    [courses]
  );

  const canEditAssessment = (assessment) => {
    const courseId = assessment.courseId?._id || assessment.courseId;
    return editorCourseIds.has(String(courseId));
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    questions: [],
    duration: 60,
    totalMarks: 100,
    passingMarks: 50,
  });
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    duration: 60,
    totalMarks: 100,
    passingMarks: 50,
    startDate: '',
    endDate: '',
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    type: 'mcq',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
  });
  const [formError, setFormError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState('');

  const editorCourses = courses.filter((course) => course.instructorRole === 'editor');

  const handleAddQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.correctAnswer) {
      setFormError('Please fill in question and correct answer');
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
    setFormError('');
  };

  const handleRemoveQuestion = (index) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.courseId) {
      setFormError('Please select a course');
      return;
    }
    if (formData.questions.length === 0) {
      setFormError('Please add at least one question');
      return;
    }

    try {
      await instructorAPI.createAssessment(formData);
      setShowCreateModal(false);
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
    } catch (createError) {
      setFormError(createError.response?.data?.error || 'Failed to create assessment');
    }
  };

  const handleToggleVisibility = async (assessment) => {
    if (!canEditAssessment(assessment)) return;
    try {
      setActionLoadingId(assessment._id);
      const nextVisibility = assessment.visibility === 'published' ? 'draft' : 'published';
      await instructorAPI.updateAssessment(assessment._id, { visibility: nextVisibility });
      refetch();
    } catch (toggleError) {
      setFormError(toggleError.response?.data?.error || 'Failed to update assessment visibility');
    } finally {
      setActionLoadingId('');
    }
  };

  const openEditModal = (assessment) => {
    setEditingAssessment(assessment);
    setEditForm({
      title: assessment.title,
      description: assessment.description || '',
      duration: assessment.duration,
      totalMarks: assessment.totalMarks,
      passingMarks: assessment.passingMarks,
      startDate: assessment.startDate ? new Date(assessment.startDate).toISOString().slice(0, 16) : '',
      endDate: assessment.endDate ? new Date(assessment.endDate).toISOString().slice(0, 16) : '',
    });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    try {
      setActionLoadingId(editingAssessment._id);
      await instructorAPI.updateAssessment(editingAssessment._id, {
        title: editForm.title,
        description: editForm.description,
        duration: Number(editForm.duration),
        totalMarks: Number(editForm.totalMarks),
        passingMarks: Number(editForm.passingMarks),
        startDate: editForm.startDate || undefined,
        endDate: editForm.endDate || undefined,
      });
      setShowEditModal(false);
      setEditingAssessment(null);
      refetch();
    } catch (editError) {
      setFormError(editError.response?.data?.error || 'Failed to update assessment');
    } finally {
      setActionLoadingId('');
    }
  };

  const handleDuplicate = async (assessment) => {
    if (!canEditAssessment(assessment)) return;
    try {
      setActionLoadingId(assessment._id);
      await instructorAPI.duplicateAssessment(assessment._id);
      refetch();
    } catch (duplicateError) {
      setFormError(duplicateError.response?.data?.error || 'Failed to duplicate assessment');
    } finally {
      setActionLoadingId('');
    }
  };

  const handleDelete = async (assessment) => {
    try {
      setActionLoadingId(assessment._id);
      await instructorAPI.deleteAssessment(assessment._id);
      setConfirmDelete(null);
      refetch();
    } catch (deleteError) {
      setFormError(deleteError.response?.data?.error || 'Failed to delete assessment');
    } finally {
      setActionLoadingId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="page-title">Assessments</h1>
        {editorCourses.length > 0 && (
          <Button onClick={() => setShowCreateModal(true)}>Create Assessment</Button>
        )}
      </div>

      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {formError}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Select
            label="Filter by course"
            name="courseFilter"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            options={[
              { value: '', label: 'All courses' },
              ...courses.map((course) => ({ value: course._id, label: course.title })),
            ]}
          />
          <Select
            label="Filter by visibility"
            name="visibilityFilter"
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            options={[
              { value: '', label: 'All assessments' },
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
            ]}
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : assessments.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p>No assessments match your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => {
              const editable = canEditAssessment(assessment);
              return (
                <div key={assessment._id} className="border border-line-soft rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3 gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-base mb-2">{assessment.title}</h3>
                      {assessment.description && (
                        <p className="text-sm text-text-muted mb-2">{assessment.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
                        <span>📚 {assessment.courseId?.title || 'Course'}</span>
                        <span>📝 {assessment.questions?.length || 0} questions</span>
                        <span>⏱️ {assessment.duration || 0} min</span>
                        <span>📊 {assessment.totalMarks} marks</span>
                        <Badge variant={assessment.visibility === 'published' ? 'success' : 'warning'}>
                          {assessment.visibility}
                        </Badge>
                        <Badge variant={editable ? 'success' : 'info'}>
                          {editable ? 'Editor' : 'Viewer'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editable && (
                      <>
                        <Button
                          variant={assessment.visibility === 'published' ? 'warning' : 'success'}
                          onClick={() => handleToggleVisibility(assessment)}
                          disabled={actionLoadingId === assessment._id}
                        >
                          {actionLoadingId === assessment._id
                            ? 'Updating...'
                            : (assessment.visibility === 'published' ? 'Unpublish' : 'Publish')}
                        </Button>
                        <Button variant="outline" onClick={() => openEditModal(assessment)}>Edit</Button>
                        <Button variant="outline" onClick={() => handleDuplicate(assessment)} disabled={actionLoadingId === assessment._id}>
                          Duplicate
                        </Button>
                        <Button variant="danger" onClick={() => setConfirmDelete(assessment)} disabled={actionLoadingId === assessment._id}>
                          Delete
                        </Button>
                      </>
                    )}
                    <Button variant="outline" onClick={() => navigate(`/instructor/assessments/${assessment._id}/submissions`)}>
                      Submissions
                    </Button>
                    <Button variant="secondary" onClick={() => navigate(`/instructor/assessments/${assessment._id}/analytics`)}>
                      Analytics
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Assessment"
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Course"
            name="courseId"
            value={formData.courseId}
            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
            options={editorCourses.map((c) => ({ value: c._id, label: c.title }))}
            required
          />
          <Input label="Title" name="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          <Textarea label="Description" name="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Duration (minutes)" type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value, 10) || 0 })} required />
            <Input label="Total Marks" type="number" value={formData.totalMarks} onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value, 10) || 0 })} required />
            <Input label="Passing Marks" type="number" value={formData.passingMarks} onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value, 10) || 0 })} required />
          </div>
          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold">Add Questions</h3>
            <Input label="Question" value={currentQuestion.question} onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })} />
            <Select
              label="Type"
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
              </div>
            )}
            <Input label="Correct Answer" value={currentQuestion.correctAnswer} onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })} />
            <Input label="Marks" type="number" value={currentQuestion.marks} onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value, 10) || 1 })} />
            <Button type="button" variant="outline" onClick={handleAddQuestion}>Add Question</Button>
            <div className="space-y-2">
              {formData.questions.map((q, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{idx + 1}. {q.question}</span>
                  <Button type="button" variant="danger" className="text-xs py-1 px-2" onClick={() => handleRemoveQuestion(idx)}>Remove</Button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Assessment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={actionLoadingId === editingAssessment?._id}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
          <Textarea label="Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Duration (minutes)" type="number" value={editForm.duration} onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })} />
            <Input label="Total Marks" type="number" value={editForm.totalMarks} onChange={(e) => setEditForm({ ...editForm, totalMarks: e.target.value })} />
            <Input label="Passing Marks" type="number" value={editForm.passingMarks} onChange={(e) => setEditForm({ ...editForm, passingMarks: e.target.value })} />
          </div>
          <Input label="Start Date" type="datetime-local" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} />
          <Input label="End Date" type="datetime-local" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} />
        </div>
      </Modal>

      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Assessment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => handleDelete(confirmDelete)} disabled={actionLoadingId === confirmDelete?._id}>
              Delete
            </Button>
          </>
        }
      >
        <p>Delete &quot;{confirmDelete?.title}&quot;? This is only allowed when no submissions exist.</p>
      </Modal>
    </div>
  );
};

export default Assessments;
