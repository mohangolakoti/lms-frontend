import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInstructorCourses } from '../../hooks/useCourses';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Select from '../../components/Select';
import MultiSelect from '../../components/MultiSelect';
import LoadingSpinner from '../../components/LoadingSpinner';
import { adminAPI, instructorAPI } from '../../services/api';

const Courses = () => {
  const { courses, loading, error, refetch } = useInstructorCourses();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    term: 'both',
    level: 'Beginner',
    thumbnailUrl: '',
    batches: [],
  });
  const [formError, setFormError] = useState('');
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);
      const response = await adminAPI.getBatches({ limit: 100 });
      const payload = response?.data?.data;
      const items = Array.isArray(payload) ? payload : (payload?.data || []);
      setBatches(items);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      title: '',
      description: '',
      term: 'both',
      level: 'Beginner',
      thumbnailUrl: '',
      batches: [],
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.batches || formData.batches.length === 0) {
      setFormError('Please select at least one batch');
      return;
    }

    try {
      await instructorAPI.createCourse(formData);
      setShowModal(false);
      refetch();
    } catch (error) {
      setFormError(error.response?.data?.error || 'Failed to create course');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <Button onClick={handleOpenModal}>Create Course</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">No courses yet. Create your first course to get started!</p>
            <Button onClick={handleOpenModal}>Create Course</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course._id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📚</span>
                </div>
                <Badge variant={course.visibility === 'published' ? 'success' : 'warning'}>
                  {course.visibility}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
              <div className="flex items-center justify-between mb-4">
                <Badge variant={course.level === 'Beginner' ? 'success' : course.level === 'Intermediate' ? 'warning' : 'danger'}>
                  {course.level}
                </Badge>
                <Badge variant="primary">{course.term}</Badge>
              </div>
              <div className="mb-4 text-sm text-gray-500">
                <p>{course.modules?.length || 0} Modules</p>
              </div>
              <Link to={`/instructor/courses/${course._id}`}>
                <Button className="w-full">Manage Course →</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Course"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {formError}
            </div>
          )}
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
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Term"
              name="term"
              value={formData.term}
              onChange={(e) => setFormData({ ...formData, term: e.target.value })}
              options={[
                { value: 'longTerm', label: 'Long Term' },
                { value: 'shortTerm', label: 'Short Term' },
                { value: 'both', label: 'Both' },
              ]}
              required
            />
            <Select
              label="Level"
              name="level"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              options={[
                { value: 'Beginner', label: 'Beginner' },
                { value: 'Intermediate', label: 'Intermediate' },
                { value: 'Advanced', label: 'Advanced' },
              ]}
              required
            />
          </div>
          <MultiSelect
            label="Batches"
            value={formData.batches}
            onChange={(values) => setFormData({ ...formData, batches: values })}
            options={batches.map((batch) => ({
              value: batch._id,
              label: batch.name,
              disabled: !batch.isActive,
            }))}
            helperText="Students from selected batches can access this course"
            required
            disabled={loadingBatches}
            placeholder="Search batches..."
          />
          <Input
            label="Thumbnail URL"
            name="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </form>
      </Modal>
    </div>
  );
};

export default Courses;

