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
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: '' });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    type: 'video',
    url: '',
    durationSeconds: 0,
  });

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await instructorAPI.getCourses();
      if (response.data.success) {
        const found = response.data.data.find(c => c._id === id);
        if (found) {
          setCourse(found);
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
      await instructorAPI.addModule(id, moduleForm);
      setShowModuleModal(false);
      setModuleForm({ title: '' });
      fetchCourse();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add module');
    }
  };

  const handleAddLesson = async () => {
    try {
      await instructorAPI.addLesson(id, selectedModule._id, lessonForm);
      setShowLessonModal(false);
      setLessonForm({ title: '', description: '', type: 'video', url: '', durationSeconds: 0 });
      setSelectedModule(null);
      fetchCourse();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add lesson');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (window.confirm('Are you sure you want to delete this module? All lessons will be deleted.')) {
      try {
        await instructorAPI.deleteModule(id, moduleId);
        fetchCourse();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete module');
      }
    }
  };

  const handleDeleteLesson = async (moduleId, lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await instructorAPI.deleteLesson(id, moduleId, lessonId);
        fetchCourse();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete lesson');
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

  return (
    <div className="space-y-6">
      <Link to="/instructor/courses">
        <Button variant="secondary">← Back to Courses</Button>
      </Link>

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
          <Button onClick={() => setShowModuleModal(true)}>Add Module</Button>
        }
      >
        {course.modules && course.modules.length > 0 ? (
          <div className="space-y-4">
            {course.modules.map((module, moduleIndex) => (
              <div key={module._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    {moduleIndex + 1}. {module.title}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="text-xs py-1 px-2"
                      onClick={() => {
                        setSelectedModule(module);
                        setShowLessonModal(true);
                      }}
                    >
                      Add Lesson
                    </Button>
                    <Button
                      variant="danger"
                      className="text-xs py-1 px-2"
                      onClick={() => handleDeleteModule(module._id)}
                    >
                      Delete Module
                    </Button>
                  </div>
                </div>
                {module.lessons && module.lessons.length > 0 ? (
                  <div className="space-y-2 ml-4">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson._id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{lessonIndex + 1}.</span>
                          <span className="text-sm font-medium">{lesson.title}</span>
                          <Badge variant="info">{lesson.type}</Badge>
                        </div>
                        <Button
                          variant="danger"
                          className="text-xs py-1 px-2"
                          onClick={() => handleDeleteLesson(module._id, lesson._id)}
                        >
                          Delete
                        </Button>
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
        onClose={() => {
          setShowModuleModal(false);
          setModuleForm({ title: '' });
        }}
        title="Add Module"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModuleModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddModule}>Add</Button>
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

      {/* Lesson Modal */}
      <Modal
        isOpen={showLessonModal}
        onClose={() => {
          setShowLessonModal(false);
          setLessonForm({ title: '', description: '', type: 'video', url: '', durationSeconds: 0 });
          setSelectedModule(null);
        }}
        title="Add Lesson"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowLessonModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLesson}>Add</Button>
          </>
        }
      >
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
      </Modal>
    </div>
  );
};

export default CourseManagement;

