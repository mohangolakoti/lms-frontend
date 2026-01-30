import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { instructorAPI } from '../../services/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Select from '../../components/Select';
import LoadingSpinner from '../../components/LoadingSpinner';

const CourseManagement = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: '', order: 1 });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    type: 'video',
    url: '',
    durationSeconds: 0,
    order: 1,
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');


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

  const getAvailablePositions = (items) => {
    if (!items || items.length === 0) return [1];
    return Array.from({ length: items.length + 1 }, (_, i) => i + 1);
  };

  const recalculateOrders = (items, newOrder, currentIndex) => {
    const oldOrder = items[currentIndex].order;
    const newItems = [...items];

    if (newOrder > oldOrder) {
      // Moving down - shift items up
      for (let i = 0; i < newItems.length; i++) {
        if (i === currentIndex) {
          newItems[i].order = newOrder;
        } else if (newItems[i].order > oldOrder && newItems[i].order <= newOrder) {
          newItems[i].order -= 1;
        }
      }
    } else if (newOrder < oldOrder) {
      // Moving up - shift items down
      for (let i = 0; i < newItems.length; i++) {
        if (i === currentIndex) {
          newItems[i].order = newOrder;
        } else if (newItems[i].order >= newOrder && newItems[i].order < oldOrder) {
          newItems[i].order += 1;
        }
      }
    }

    return newItems.sort((a, b) => a.order - b.order);
  };

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await instructorAPI.getCourses();
      if (response.data.success) {
        const found = response.data.data.find(c => c._id === id);
        if (found) {
          // Ensure modules and lessons are sorted by order
          const sortedModules = (found.modules || []).sort((a, b) => a.order - b.order);
          const modulesSortedLessons = sortedModules.map(module => ({
            ...module,
            lessons: (module.lessons || []).sort((a, b) => a.order - b.order),
          }));
          setCourse({ ...found, modules: modulesSortedLessons });
        } else {
          setError('Course not found');
        }
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch course');
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async () => {
    try {
      // Calculate next order
      const nextOrder = (course.modules?.length || 0) + 1;
      await instructorAPI.addModule(id, { ...moduleForm, order: nextOrder });
      setShowModuleModal(false);
      setModuleForm({ title: '', order: 1 });
      setSuccessMessage('Module added successfully');
      fetchCourse();
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to add module');
    }
  };

  const handleEditModule = async () => {
    try {
      await instructorAPI.updateModule(id, editingModuleId, moduleForm);
      setShowModuleModal(false);
      setModuleForm({ title: '', order: 1 });
      setEditingModuleId(null);
      setIsEditingModule(false);
      setSuccessMessage('Module updated successfully');
      fetchCourse();
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to update module');
    }
  };

  const handleOpenEditModule = (module) => {
    setEditingModuleId(module._id);
    setModuleForm({ title: module.title, order: module.order });
    setIsEditingModule(true);
    setShowModuleModal(true);
  };

  const handleAddLesson = async () => {
    try {
      // Calculate next order if creating new lesson
      const nextOrder = (selectedModule.lessons?.length || 0) + 1;
      await instructorAPI.addLesson(id, selectedModule._id, {
        ...lessonForm,
        order: nextOrder,
      });
      setShowLessonModal(false);
      setLessonForm({ title: '', description: '', type: 'video', url: '', durationSeconds: 0, order: 1 });
      setSelectedModule(null);
      setSuccessMessage('Lesson added successfully');
      fetchCourse();
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to add lesson');
    }
  };

  const handleEditLesson = async () => {
    try {
      await instructorAPI.updateLesson(id, selectedModule._id, editingLessonId, lessonForm);
      setShowLessonModal(false);
      setLessonForm({ title: '', description: '', type: 'video', url: '', durationSeconds: 0, order: 1 });
      setSelectedModule(null);
      setEditingLessonId(null);
      setIsEditingLesson(false);
      setSuccessMessage('Lesson updated successfully');
      fetchCourse();
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to update lesson');
    }
  };

  const handleOpenEditLesson = (module, lesson) => {
    setSelectedModule(module);
    setEditingLessonId(lesson._id);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      type: lesson.type,
      url: lesson.url,
      durationSeconds: lesson.durationSeconds,
      order: lesson.order,
    });
    setIsEditingLesson(true);
    setShowLessonModal(true);
  };

  const handleDeleteModule = async (moduleId) => {
    if (window.confirm('Are you sure you want to delete this module? All lessons will be deleted.')) {
      try {
        await instructorAPI.deleteModule(id, moduleId);
        setSuccessMessage('Module deleted successfully');
        fetchCourse();
      } catch (error) {
        setErrorMessage(error.response?.data?.error || 'Failed to delete module');
      }
    }
  };

  const handleDeleteLesson = async (moduleId, lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await instructorAPI.deleteLesson(id, moduleId, lessonId);
        setSuccessMessage('Lesson deleted successfully');
        fetchCourse();
      } catch (error) {
        setErrorMessage(error.response?.data?.error || 'Failed to delete lesson');
      }
    }
  };

  const handleUpdateCourse = async (field, value) => {
    try {
      await instructorAPI.updateCourse(id, { [field]: value });
      fetchCourse();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update course');
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
        <Link to="/instructor/courses">
          <Button variant="secondary">← Back to Courses</Button>
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Course not found'}
        </div>
      </div>
    );
  }

  const modalTitle = isEditingModule
    ? 'Edit Module'
    : isEditingLesson
    ? 'Edit Lesson'
    : showLessonModal
    ? 'Add Lesson'
    : 'Add Module';

  const handleModalClose = () => {
    if (showModuleModal) {
      setShowModuleModal(false);
      setModuleForm({ title: '', order: 1 });
      setEditingModuleId(null);
      setIsEditingModule(false);
    }
    if (showLessonModal) {
      setShowLessonModal(false);
      setLessonForm({ title: '', description: '', type: 'video', url: '', durationSeconds: 0, order: 1 });
      setSelectedModule(null);
      setEditingLessonId(null);
      setIsEditingLesson(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/instructor/courses">
        <Button variant="secondary">← Back to Courses</Button>
      </Link>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg animate-in fade-in">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-in fade-in">
          {errorMessage}
        </div>
      )}


      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600 mt-1">{course.description}</p>
          </div>
          <div className="flex gap-2">
            <select
              className="input-field"
              value={course.visibility}
              onChange={(e) => handleUpdateCourse('visibility', e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </Card>

      <Card
        title="Modules & Lessons"
        action={
          <Button onClick={() => {
            setShowModuleModal(true);
            setIsEditingModule(false);
            setEditingModuleId(null);
            setModuleForm({ title: '', order: 1 });
          }}>
            Add Module
          </Button>
        }
      >
        {course.modules && course.modules.length > 0 ? (
          <div className="space-y-4">
            {course.modules.map((module) => (
              <div key={module._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-gray-900">
                        {module.order}. {module.title}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {module.lessons?.length || 0} lesson{(module.lessons?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="text-xs py-1 px-2"
                      onClick={() => handleOpenEditModule(module)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="text-xs py-1 px-2"
                      onClick={() => {
                        setSelectedModule(module);
                        setShowLessonModal(true);
                        setIsEditingLesson(false);
                        setEditingLessonId(null);
                        setLessonForm({ title: '', description: '', type: 'video', url: '', durationSeconds: 0, order: 1 });
                      }}
                    >
                      Add Lesson
                    </Button>
                    <Button
                      variant="danger"
                      className="text-xs py-1 px-2"
                      onClick={() => handleDeleteModule(module._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                {module.lessons && module.lessons.length > 0 ? (
                  <div className="space-y-2 ml-4">
                    {module.lessons.map((lesson) => (
                      <div
                        key={lesson._id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-sm text-gray-500 font-semibold w-6">{lesson.order}.</span>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">{lesson.title}</span>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="info">{lesson.type}</Badge>
                              {lesson.durationSeconds > 0 && (
                                <Badge variant="secondary">
                                  {Math.floor(lesson.durationSeconds / 60)}m
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="text-xs py-1 px-2"
                            onClick={() => handleOpenEditLesson(module, lesson)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            className="text-xs py-1 px-2"
                            onClick={() => handleDeleteLesson(module._id, lesson._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 ml-4">No lessons yet</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No modules yet. Add your first module to get started!</p>
          </div>
        )}
      </Card>

      {/* Module Modal */}
      <Modal
        isOpen={showModuleModal}
        onClose={handleModalClose}
        title={isEditingModule ? 'Edit Module' : 'Add Module'}
        footer={
          <>
            <Button variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button onClick={isEditingModule ? handleEditModule : handleAddModule}>
              {isEditingModule ? 'Save Changes' : 'Add Module'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Module Title"
            name="title"
            value={moduleForm.title}
            onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
            required
          />
          {isEditingModule && course.modules && (
            <Select
              label="Position"
              name="order"
              value={moduleForm.order}
              onChange={(e) => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) })}
              options={getAvailablePositions(course.modules).map(pos => ({
                value: pos,
                label: `Position ${pos}`,
              }))}
              required
            />
          )}
        </div>
      </Modal>

      {/* Lesson Modal */}
      <Modal
        isOpen={showLessonModal}
        onClose={handleModalClose}
        title={isEditingLesson ? 'Edit Lesson' : 'Add Lesson'}
        footer={
          <>
            <Button variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button onClick={isEditingLesson ? handleEditLesson : handleAddLesson}>
              {isEditingLesson ? 'Save Changes' : 'Add Lesson'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Lesson Title"
            name="title"
            value={lessonForm.title}
            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            name="description"
            value={lessonForm.description}
            onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
          />
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
          <Input
            label="URL"
            name="url"
            value={lessonForm.url}
            onChange={(e) => setLessonForm({ ...lessonForm, url: e.target.value })}
            placeholder="https://example.com/video.mp4"
            required
          />
          {lessonForm.type === 'video' && (
            <Input
              label="Duration (seconds)"
              name="durationSeconds"
              type="number"
              value={lessonForm.durationSeconds}
              onChange={(e) => setLessonForm({ ...lessonForm, durationSeconds: parseInt(e.target.value) || 0 })}
            />
          )}
          {isEditingLesson && selectedModule && selectedModule.lessons && (
            <Select
              label="Position"
              name="order"
              value={lessonForm.order}
              onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) })}
              options={getAvailablePositions(selectedModule.lessons).map(pos => ({
                value: pos,
                label: `Position ${pos}`,
              }))}
              required
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CourseManagement;

