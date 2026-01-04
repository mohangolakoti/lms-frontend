import { useState } from 'react';
import { adminAPI } from '../../services/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Select from '../../components/Select';
import Modal from '../../components/Modal';
import { useAdminCourses } from '../../hooks/useCourses';

const Announcements = () => {
  const { courses } = useAdminCourses();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target: 'global',
    courseId: '',
    pinned: false,
  });
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');

    if (formData.target === 'course' && !formData.courseId) {
      setFormError('Please select a course');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        target: formData.target,
        pinned: formData.pinned,
      };
      if (formData.target === 'course') {
        payload.courseId = formData.courseId;
      }

      await adminAPI.createAnnouncement(payload);
      setSuccess('Announcement created successfully!');
      setFormData({
        title: '',
        message: '',
        target: 'global',
        courseId: '',
        pinned: false,
      });
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
      }, 1500);
    } catch (error) {
      setFormError(error.response?.data?.error || 'Failed to create announcement');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <Button onClick={() => setShowModal(true)}>Create Announcement</Button>
      </div>

      <Card>
        <p className="text-gray-600">
          Create announcements to communicate with students. You can create global announcements
          or course-specific announcements.
        </p>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setFormData({
            title: '',
            message: '',
            target: 'global',
            courseId: '',
            pinned: false,
          });
          setFormError('');
          setSuccess('');
        }}
        title="Create Announcement"
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
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
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
            label="Message"
            name="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            rows={6}
          />
          <Select
            label="Target"
            name="target"
            value={formData.target}
            onChange={(e) => setFormData({ ...formData, target: e.target.value, courseId: '' })}
            options={[
              { value: 'global', label: 'Global (All Students)' },
              { value: 'course', label: 'Course Specific' },
            ]}
            required
          />
          {formData.target === 'course' && (
            <Select
              label="Course"
              name="courseId"
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              options={courses.map((course) => ({
                value: course._id,
                label: course.title,
              }))}
              required
            />
          )}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="pinned"
              name="pinned"
              checked={formData.pinned}
              onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
              className="h-4 w-4 text-primary-400 focus:ring-primary-400 border-gray-300 rounded"
            />
            <label htmlFor="pinned" className="ml-2 block text-sm text-gray-900">
              Pin this announcement
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Announcements;

