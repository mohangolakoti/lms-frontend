import { useState, useEffect } from 'react';
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
import MultiSelect from '../../components/MultiSelect';
import { adminAPI } from '../../services/api';

const DEFAULT_ROLE = 'viewer';

const Courses = () => {
  const [listFilters, setListFilters] = useState({
    search: '',
    visibility: '',
    batchId: '',
    page: 1,
    limit: 20,
  });
  const { courses, pagination, loading, error, refetch } = useAdminCourses(listFilters);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    term: 'both',
    level: 'Beginner',
    thumbnailUrl: '',
    courseInstructors: [],
    batches: [],
  });
  const [instructorSearch, setInstructorSearch] = useState('');
  const [formError, setFormError] = useState('');

  const selectedInstructorIds = formData.courseInstructors.map((entry) => entry.instructorId);
  const filteredInstructors = instructors.filter((instructor) => {
    const term = instructorSearch.trim().toLowerCase();
    if (!term) return true;
    return (
      instructor.name.toLowerCase().includes(term)
      || instructor.email.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    fetchInstructors();
    fetchBatches();
  }, []);

  const fetchInstructors = async () => {
    try {
      setLoadingInstructors(true);
      const response = await adminAPI.getInstructors();
      if (response.data.success) {
        setInstructors(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
    } finally {
      setLoadingInstructors(false);
    }
  };

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

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      const mappedInstructors = (course.courseInstructors || [])
        .map((entry) => ({
          instructorId: entry.instructorId?._id || entry.instructorId,
          role: entry.role || DEFAULT_ROLE,
        }))
        .filter((entry) => entry.instructorId);

      const fallbackInstructor = course.instructorId?._id || course.instructorId;
      const normalizedCourseInstructors = mappedInstructors.length > 0
        ? mappedInstructors
        : (fallbackInstructor ? [{ instructorId: fallbackInstructor, role: 'editor' }] : []);

      setFormData({
        title: course.title,
        description: course.description,
        term: course.term,
        level: course.level,
        thumbnailUrl: course.thumbnailUrl || '',
        courseInstructors: normalizedCourseInstructors,
        batches: (course.batches || []).map((batch) => batch._id || batch),
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        description: '',
        term: 'both',
        level: 'Beginner',
        thumbnailUrl: '',
        courseInstructors: [],
        batches: [],
      });
    }
    setInstructorSearch('');
    setShowModal(true);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.batches || formData.batches.length === 0) {
      setFormError('Please select at least one batch');
      return;
    }

    if (!formData.courseInstructors || formData.courseInstructors.length === 0) {
      setFormError('Please assign at least one instructor');
      return;
    }

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

  const handleToggleVisibility = async (course) => {
    try {
      await adminAPI.updateCourse(course._id, {
        visibility: course.visibility === 'published' ? 'draft' : 'published',
      });
      refetch();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update course visibility');
    }
  };

  const columns = [
    {
      header: 'Title',
      accessor: 'title',
    },
    {
      header: 'Instructors',
      accessor: 'courseInstructors',
      render: (course) => {
        const assigned = (course.courseInstructors || []).map((entry) => {
          const name = entry.instructorId?.name || 'Unknown';
          return `${name} (${entry.role})`;
        });

        if (assigned.length > 0) return assigned.join(', ');
        return course.instructorId?.name || 'N/A';
      },
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
            variant="secondary"
            className="text-xs py-1 px-2"
            onClick={() => handleToggleVisibility(course)}
          >
            {course.visibility === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
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
        <h1 className="page-title">Courses</h1>
        <Button onClick={() => handleOpenModal()}>Create Course</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Input
            placeholder="Search courses..."
            value={listFilters.search}
            onChange={(e) => setListFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
          />
          <Select
            value={listFilters.visibility}
            onChange={(e) => setListFilters((prev) => ({ ...prev, visibility: e.target.value, page: 1 }))}
            options={[
              { value: '', label: 'All Visibility' },
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Draft' },
            ]}
          />
          <Select
            value={listFilters.batchId}
            onChange={(e) => setListFilters((prev) => ({ ...prev, batchId: e.target.value, page: 1 }))}
            options={[
              { value: '', label: 'All Batches' },
              ...batches.map((batch) => ({ value: batch._id, label: batch.name })),
            ]}
          />
          <Button
            variant="outline"
            onClick={() => setListFilters({ search: '', visibility: '', batchId: '', page: 1, limit: listFilters.limit })}
          >
            Clear
          </Button>
        </div>
        <Table
          columns={columns}
          data={courses}
          loading={loading}
          emptyMessage="No courses found"
        />
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-text-subtle">
            Showing page {pagination?.page || 1} of {pagination?.pages || 1}
            {' '}({pagination?.total || 0} courses)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="text-xs px-3 py-1"
              disabled={!pagination?.hasPrevPage}
              onClick={() => setListFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="text-xs px-3 py-1"
              disabled={!pagination?.hasNextPage}
              onClick={() => setListFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
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
          <MultiSelect
            label="Batches"
            value={formData.batches}
            onChange={(values) => setFormData({ ...formData, batches: values })}
            options={batches.map((batch) => ({
              value: batch._id,
              label: batch.name,
              disabled: !batch.isActive,
            }))}
            helperText="Only students from selected batches can access this course"
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-base mb-2">
              Instructors <span className="text-red-500">*</span>
            </label>

            <div className="border border-line-soft rounded-xl p-3 bg-white">
              <input
                type="text"
                className="input-field mb-3"
                placeholder="Search instructors..."
                value={instructorSearch}
                onChange={(e) => setInstructorSearch(e.target.value)}
                disabled={loadingInstructors}
              />

              <div className="max-h-40 overflow-y-auto border border-line-soft rounded-lg mb-3">
                {filteredInstructors.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-text-subtle">No instructors found</div>
                ) : (
                  filteredInstructors.map((instructor) => {
                    const isSelected = selectedInstructorIds.includes(instructor._id);

                    return (
                      <label
                        key={instructor._id}
                        className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-brand-50/50"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setFormData({
                                ...formData,
                                courseInstructors: formData.courseInstructors.filter(
                                  (entry) => entry.instructorId !== instructor._id,
                                ),
                              });
                              return;
                            }

                            setFormData({
                              ...formData,
                              courseInstructors: [
                                ...formData.courseInstructors,
                                { instructorId: instructor._id, role: DEFAULT_ROLE },
                              ],
                            });
                          }}
                          disabled={loadingInstructors}
                        />
                        <span>{instructor.name} ({instructor.email})</span>
                      </label>
                    );
                  })
                )}
              </div>

              {formData.courseInstructors.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-text-subtle uppercase tracking-wide">
                    Assigned Instructor Roles
                  </div>
                  {formData.courseInstructors.map((entry) => {
                    const instructor = instructors.find((item) => item._id === entry.instructorId);
                    if (!instructor) return null;

                    return (
                      <div key={entry.instructorId} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                        <Input
                          label="Instructor"
                          value={instructor.name}
                          disabled
                        />
                        <Select
                          label="Role"
                          value={entry.role}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              courseInstructors: formData.courseInstructors.map((item) => (
                                item.instructorId === entry.instructorId
                                  ? { ...item, role: e.target.value }
                                  : item
                              )),
                            });
                          }}
                          options={[
                            { value: 'editor', label: 'Editor' },
                            { value: 'viewer', label: 'Viewer' },
                          ]}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Courses;

