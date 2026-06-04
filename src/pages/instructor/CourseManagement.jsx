import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { instructorAPI } from '../../services/api';
import CoursePlayer from '../../components/CoursePlayer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Select from '../../components/Select';
import LoadingSpinner from '../../components/LoadingSpinner';

const sortCourseModules = (courseData) => {
  const sortedModules = (courseData.modules || []).sort((a, b) => a.order - b.order);
  return {
    ...courseData,
    modules: sortedModules.map((module) => ({
      ...module,
      lessons: (module.lessons || []).sort((a, b) => a.order - b.order),
    })),
  };
};

const CourseManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: '' });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    type: 'video',
    url: '',
    durationSeconds: 0,
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await instructorAPI.getCourse(id);
      if (response.data.success) {
        setCourse(sortCourseModules(response.data.data));
      }
    } catch (fetchError) {
      setError(fetchError.response?.data?.error || 'Failed to fetch course');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const instructorRole = course?.instructorRole || 'viewer';
  const canEdit = instructorRole === 'editor';

  const handleOpenPreview = (module, lesson) => {
    setPreviewTarget({ module, lesson });
  };

  const handleClosePreview = () => {
    setPreviewTarget(null);
  };

  const handleAddModule = async () => {
    try {
      const nextOrder = (course.modules?.length || 0) + 1;
      await instructorAPI.addModule(id, { ...moduleForm, order: nextOrder });
      setShowModuleModal(false);
      setModuleForm({ title: '' });
      setSuccessMessage('Module added successfully');
      fetchCourse();
    } catch (addError) {
      setErrorMessage(addError.response?.data?.error || 'Failed to add module');
    }
  };

  const handleEditModule = async () => {
    try {
      await instructorAPI.updateModule(id, editingModuleId, { title: moduleForm.title });
      setShowModuleModal(false);
      setModuleForm({ title: '' });
      setEditingModuleId(null);
      setIsEditingModule(false);
      setSuccessMessage('Module updated successfully');
      fetchCourse();
    } catch (editError) {
      setErrorMessage(editError.response?.data?.error || 'Failed to update module');
    }
  };

  const handleOpenEditModule = (module) => {
    setEditingModuleId(module._id);
    setModuleForm({ title: module.title });
    setIsEditingModule(true);
    setShowModuleModal(true);
  };

  const handleAddLesson = async () => {
    try {
      const nextOrder = (selectedModule.lessons?.length || 0) + 1;
      await instructorAPI.addLesson(id, selectedModule._id, {
        ...lessonForm,
        order: nextOrder,
      });
      setShowLessonModal(false);
      setLessonForm({ title: '', description: '', type: 'video', url: '', durationSeconds: 0 });
      setSelectedModule(null);
      setSuccessMessage('Lesson added successfully');
      fetchCourse();
    } catch (addError) {
      setErrorMessage(addError.response?.data?.error || 'Failed to add lesson');
    }
  };

  const handleEditLesson = async () => {
    try {
      await instructorAPI.updateLesson(id, selectedModule._id, editingLessonId, lessonForm);
      setShowLessonModal(false);
      setLessonForm({ title: '', description: '', type: 'video', url: '', durationSeconds: 0 });
      setSelectedModule(null);
      setEditingLessonId(null);
      setIsEditingLesson(false);
      setSuccessMessage('Lesson updated successfully');
      fetchCourse();
    } catch (editError) {
      setErrorMessage(editError.response?.data?.error || 'Failed to update lesson');
    }
  };

  const handleOpenEditLesson = (module, lesson) => {
    setSelectedModule(module);
    setEditingLessonId(lesson._id);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      type: lesson.type,
      url: lesson.url,
      durationSeconds: lesson.durationSeconds || 0,
    });
    setIsEditingLesson(true);
    setShowLessonModal(true);
  };

  const executeDeleteModule = async (moduleId) => {
    try {
      await instructorAPI.deleteModule(id, moduleId);
      if (previewTarget?.module?._id === moduleId) {
        setPreviewTarget(null);
      }
      setSuccessMessage('Module deleted successfully');
      fetchCourse();
    } catch (deleteError) {
      setErrorMessage(deleteError.response?.data?.error || 'Failed to delete module');
    }
  };

  const executeDeleteLesson = async (moduleId, lessonId) => {
    try {
      await instructorAPI.deleteLesson(id, moduleId, lessonId);
      if (previewTarget?.lesson?._id === lessonId) {
        setPreviewTarget(null);
      }
      setSuccessMessage('Lesson deleted successfully');
      fetchCourse();
    } catch (deleteError) {
      setErrorMessage(deleteError.response?.data?.error || 'Failed to delete lesson');
    }
  };

  const handleUpdateCourse = async (field, value) => {
    try {
      await instructorAPI.updateCourse(id, { [field]: value });
      fetchCourse();
    } catch (updateError) {
      setErrorMessage(updateError.response?.data?.error || 'Failed to update course');
    }
  };

  const reorderModules = async (fromIndex, toIndex) => {
    if (!course?.modules || toIndex < 0 || toIndex >= course.modules.length) return;
    const ordered = [...course.modules].sort((a, b) => a.order - b.order);
    const [moved] = ordered.splice(fromIndex, 1);
    ordered.splice(toIndex, 0, moved);
    const moduleOrder = ordered.map((module) => module._id);
    try {
      await instructorAPI.reorderModules(id, moduleOrder);
      setSuccessMessage('Modules reordered successfully');
      fetchCourse();
    } catch (reorderError) {
      setErrorMessage(reorderError.response?.data?.error || 'Failed to reorder modules');
    }
  };

  const reorderLessons = async (moduleId, fromIndex, toIndex) => {
    const module = (course?.modules || []).find((item) => item._id === moduleId);
    if (!module || !module.lessons || toIndex < 0 || toIndex >= module.lessons.length) return;
    const ordered = [...module.lessons].sort((a, b) => a.order - b.order);
    const [moved] = ordered.splice(fromIndex, 1);
    ordered.splice(toIndex, 0, moved);
    const lessonOrder = ordered.map((lesson) => lesson._id);
    try {
      await instructorAPI.reorderLessons(id, moduleId, lessonOrder);
      setSuccessMessage('Lessons reordered successfully');
      fetchCourse();
    } catch (reorderError) {
      setErrorMessage(reorderError.response?.data?.error || 'Failed to reorder lessons');
    }
  };

  const handleModalClose = () => {
    if (showModuleModal) {
      setShowModuleModal(false);
      setModuleForm({ title: '' });
      setEditingModuleId(null);
      setIsEditingModule(false);
    }
    if (showLessonModal) {
      setShowLessonModal(false);
      setLessonForm({ title: '', description: '', type: 'video', url: '', durationSeconds: 0 });
      setSelectedModule(null);
      setEditingLessonId(null);
      setIsEditingLesson(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => navigate('/instructor/courses')}>
          ← Back to Courses
        </Button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Course not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="secondary" onClick={() => navigate('/instructor/courses')}>
        ← Back to Courses
      </Button>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="page-title">{course.title}</h1>
            <p className="text-text-muted mt-1">{course.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={instructorRole === 'editor' ? 'success' : 'info'}>
                {instructorRole === 'editor' ? 'Editor Access' : 'Viewer Access'}
              </Badge>
              <Badge variant={course.visibility === 'published' ? 'success' : 'warning'}>
                {course.visibility}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {canEdit ? (
              <select
                className="input-field"
                value={course.visibility}
                onChange={(e) => handleUpdateCourse('visibility', e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            ) : null}
          </div>
        </div>
      </Card>

      <Card
        title="Course Content"
        action={canEdit ? (
          <Button
            className="text-xs py-1 px-2"
            onClick={() => {
              setShowModuleModal(true);
              setIsEditingModule(false);
              setEditingModuleId(null);
              setModuleForm({ title: '' });
            }}
          >
            Add Module
          </Button>
        ) : null}
      >
        {course.modules?.length ? (
          <div className="space-y-3">
            {course.modules.map((module, moduleIndex) => (
              <div key={module._id} className="border border-line-soft rounded-lg p-4">
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div>
                    <p className="font-semibold text-text-base">
                      {module.order}. {module.title}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {module.lessons?.length || 0} lesson{(module.lessons?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {canEdit && (
                    <div className="flex flex-wrap gap-1">
                      <Button variant="outline" className="text-xs py-1 px-2" onClick={() => handleOpenEditModule(module)}>
                        Edit
                      </Button>
                      <Button variant="outline" className="text-xs py-1 px-2" onClick={() => reorderModules(moduleIndex, moduleIndex - 1)} disabled={moduleIndex === 0}>
                        Up
                      </Button>
                      <Button variant="outline" className="text-xs py-1 px-2" onClick={() => reorderModules(moduleIndex, moduleIndex + 1)} disabled={moduleIndex === course.modules.length - 1}>
                        Down
                      </Button>
                      <Button
                        variant="outline"
                        className="text-xs py-1 px-2"
                        onClick={() => {
                          setSelectedModule(module);
                          setShowLessonModal(true);
                          setIsEditingLesson(false);
                          setEditingLessonId(null);
                          setLessonForm({ title: '', description: '', type: 'video', url: '', durationSeconds: 0 });
                        }}
                      >
                        + Lesson
                      </Button>
                      <Button
                        variant="danger"
                        className="text-xs py-1 px-2"
                        onClick={() => setConfirmAction({
                          title: 'Delete Module',
                          message: 'Delete this module and all its lessons?',
                          onConfirm: () => executeDeleteModule(module._id),
                        })}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {(module.lessons || []).map((lesson, lessonIndex) => (
                    <div
                      key={lesson._id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-line-soft bg-surface-subtle p-3 flex-wrap"
                    >
                      <div className="flex-1 min-w-[200px]">
                        <span className="text-sm font-medium text-text-base">
                          {lesson.order}. {lesson.title}
                        </span>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="info">{lesson.type}</Badge>
                          {lesson.durationSeconds > 0 && (
                            <Badge variant="secondary">{Math.floor(lesson.durationSeconds / 60)} min</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Button
                          variant="outline"
                          className="text-xs py-1 px-2"
                          onClick={() => handleOpenPreview(module, lesson)}
                        >
                          Preview
                        </Button>
                        {canEdit && (
                          <>
                            <Button variant="outline" className="text-xs py-1 px-2" onClick={() => handleOpenEditLesson(module, lesson)}>
                              Edit
                            </Button>
                            <Button variant="outline" className="text-xs py-1 px-2" onClick={() => reorderLessons(module._id, lessonIndex, lessonIndex - 1)} disabled={lessonIndex === 0}>
                              Up
                            </Button>
                            <Button variant="outline" className="text-xs py-1 px-2" onClick={() => reorderLessons(module._id, lessonIndex, lessonIndex + 1)} disabled={lessonIndex === (module.lessons.length - 1)}>
                              Down
                            </Button>
                            <Button
                              variant="danger"
                              className="text-xs py-1 px-2"
                              onClick={() => setConfirmAction({
                                title: 'Delete Lesson',
                                message: 'Delete this lesson permanently?',
                                onConfirm: () => executeDeleteLesson(module._id, lesson._id),
                              })}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {!module.lessons?.length && (
                    <p className="text-xs text-text-muted px-1">No lessons yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-text-muted">
            <p>{canEdit ? 'No modules yet. Add your first module to get started.' : 'This course has no content yet.'}</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={!!previewTarget}
        onClose={handleClosePreview}
        title={previewTarget ? `Preview: ${previewTarget.lesson.title}` : 'Lesson Preview'}
        size="xl"
        footer={
          <Button variant="secondary" onClick={handleClosePreview}>
            Close Preview
          </Button>
        }
      >
        {previewTarget && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-text-muted">{previewTarget.module.title}</p>
              <h2 className="text-xl font-semibold text-text-base">{previewTarget.lesson.title}</h2>
              {previewTarget.lesson.description && (
                <p className="text-sm text-text-muted mt-1">{previewTarget.lesson.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="info">{previewTarget.lesson.type}</Badge>
                {previewTarget.lesson.durationSeconds > 0 && (
                  <Badge variant="secondary">{Math.floor(previewTarget.lesson.durationSeconds / 60)} min</Badge>
                )}
              </div>
            </div>

            <CoursePlayer lesson={previewTarget.lesson} courseId={id} mode="preview" />

            {previewTarget.lesson.url && (
              <div className="pt-2 border-t border-line-soft">
                <a
                  href={previewTarget.lesson.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-700 hover:text-brand-800 underline"
                >
                  Open in new tab (fallback)
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showModuleModal}
        onClose={handleModalClose}
        title={isEditingModule ? 'Edit Module' : 'Add Module'}
        footer={
          <>
            <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
            <Button onClick={isEditingModule ? handleEditModule : handleAddModule}>
              {isEditingModule ? 'Save Changes' : 'Add Module'}
            </Button>
          </>
        }
      >
        <Input
          label="Module Title"
          name="title"
          value={moduleForm.title}
          onChange={(e) => setModuleForm({ title: e.target.value })}
          required
        />
      </Modal>

      <Modal
        isOpen={showLessonModal}
        onClose={handleModalClose}
        title={isEditingLesson ? 'Edit Lesson' : 'Add Lesson'}
        footer={
          <>
            <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
            <Button onClick={isEditingLesson ? handleEditLesson : handleAddLesson}>
              {isEditingLesson ? 'Save Changes' : 'Add Lesson'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Lesson Title" name="title" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} required />
          <Textarea label="Description" name="description" value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} />
          <Select
            label="Type"
            name="type"
            value={lessonForm.type}
            onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}
            options={[
              { value: 'video', label: 'Video' },
              { value: 'pdf', label: 'PDF' },
              { value: 'quiz', label: 'Quiz' },
            ]}
            required
          />
          <Input label="URL" name="url" value={lessonForm.url} onChange={(e) => setLessonForm({ ...lessonForm, url: e.target.value })} placeholder="https://example.com/video.mp4" required />
          {lessonForm.type === 'video' && (
            <Input label="Duration (seconds)" name="durationSeconds" type="number" value={lessonForm.durationSeconds} onChange={(e) => setLessonForm({ ...lessonForm, durationSeconds: parseInt(e.target.value, 10) || 0 })} />
          )}
        </div>
      </Modal>

      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.title || 'Confirm'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={async () => {
                await confirmAction?.onConfirm?.();
                setConfirmAction(null);
              }}
            >
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-text-base">{confirmAction?.message}</p>
      </Modal>
    </div>
  );
};

export default CourseManagement;
