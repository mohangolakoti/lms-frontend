import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminCourses } from '../../hooks/useCourses';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Courses = () => {
  const { user } = useAuth();
  const { courses, loading, error, refetch } = useAdminCourses();
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    term: 'both',
    level: 'Beginner',
    thumbnailUrl: '',
    instructorId: '',
  });
  const [formError, setFormError] = useState('');

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description,
        term: course.term,
        level: course.level,
        thumbnailUrl: course.thumbnailUrl || '',
        instructorId: course.instructorId?._id || course.instructorId || '',
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        description: '',
        term: 'both',
        level: 'Beginner',
        thumbnailUrl: '',
        instructorId: '',
      });
    }
    setShowModal(true);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      if (editingCourse) {
        await adminAPI.updateCourse(editingCourse._id, formData);
      } else {
        await adminAPI.createCourse(formData);
      }
      setShowModal(false);
      refetch();
    } catch (error) {
      setFormError(error.response?.data?.error || 'Failed to save course');
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await adminAPI.deleteCourse(courseId);
        refetch();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete course');
      }
    }
  };

  const columns = [
    {
      header: 'Title',
      accessor: 'title',
    },
    {
      header: 'Instructor',
      accessor: 'instructorId',
      render: (course) => course.instructorId?.name || 'N/A',
    },
    {
      header: 'Term',
      accessor: 'term',
      render: (course) => (
        <Badge variant={course.term === 'both' ? 'primary' : 'info'}>
          {course.term}
        </Badge>
      ),
    },
    {
      header: 'Level',
      accessor: 'level',
      render: (course) => (
        <Badge variant={course.level === 'Beginner' ? 'success' : course.level === 'Intermediate' ? 'warning' : 'danger'}>
          {course.level}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'visibility',
      render: (course) => (
        <Badge variant={course.visibility === 'published' ? 'success' : 'warning'}>
          {course.visibility}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (course) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/courses/${course._id}/analytics`}>
            <Button variant="outline" className="text-xs py-1 px-2">
              Analytics
            </Button>
          </Link>
          <Button
            variant="outline"
            className="text-xs py-1 px-2"
            onClick={() => handleOpenModal(course)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            className="text-xs py-1 px-2"
            onClick={() => handleDelete(course._id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <Button onClick={() => handleOpenModal()}>Create Course</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <Table
          columns={columns}
          data={courses}
          loading={loading}
          emptyMessage="No courses found"
        />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCourse ? 'Edit Course' : 'Create Course'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingCourse ? 'Update' : 'Create'}
            </Button>
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
          <Input
            label="Thumbnail URL"
            name="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
          <Input
            label="Instructor ID"
            name="instructorId"
            value={formData.instructorId}
            onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
            placeholder="Leave empty to use current user"
          />
        </form>
      </Modal>
    </div>
  );
};

export default Courses;

