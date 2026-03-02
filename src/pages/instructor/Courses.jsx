import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInstructorCourses } from '../../hooks/useCourses';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

const Courses = () => {
  const { courses, loading, error } = useInstructorCourses();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <p>No courses assigned yet. Contact an administrator to assign courses.</p>
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
    </div>
  );
};

export default Courses;

