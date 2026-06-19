import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentCourses } from '../../hooks/useCourses';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

const Courses = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { courses, pagination, loading, error } = useStudentCourses({ page, limit: 12, search });

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title mb-2">Courses</h1>
          <p className="text-text-muted">Track your assigned courses and continue exactly where you left off.</p>
        </div>
        <input
          type="search"
          className="input-field w-full md:w-72"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {courses.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-text-subtle">
            <p>No courses found.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course._id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📚</span>
                </div>
                <Badge variant={course.level === 'Beginner' ? 'success' : course.level === 'Intermediate' ? 'warning' : 'danger'}>
                  {course.level}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold text-text-base mb-2">{course.title}</h3>
              <p className="text-sm text-text-muted mb-4 line-clamp-2">{course.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-text-subtle">
                  <span>👨‍🏫</span>
                  <span>{course.instructorId?.name || 'Instructor'}</span>
                </div>
                <Badge variant="primary">{course.term}</Badge>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-text-muted">Progress</span>
                  <span className="font-medium">{Math.round(course.progress || 0)}%</span>
                </div>
                <div className="w-full bg-surface-muted rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${course.progress || 0}%` }} />
                </div>
              </div>
              <Button className="w-full" onClick={() => navigate(`/student/courses/${course._id}`)}>
                {course.completed ? 'Review Course' : 'Continue Learning →'}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" disabled={!pagination.hasPrevPage} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-text-muted">Page {pagination.page} of {pagination.pages}</span>
          <Button variant="outline" disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Courses;
