import { Link } from 'react-router-dom';
import { useStudentCourses } from '../../hooks/useCourses';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

const Courses = () => {
  const { courses, loading, error } = useStudentCourses();

  if (loading) {
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Courses</h1>
        <p className="text-gray-600">Step up and skill up! Interact live with passionate practitioners, learn without limits, and bloom your dreams.</p>
      </div>

      {courses.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <p>No courses assigned yet. Check back later!</p>
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
                <Badge variant={course.level === 'Beginner' ? 'success' : course.level === 'Intermediate' ? 'warning' : 'danger'}>
                  {course.level}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>👨‍🏫</span>
                  <span>{course.instructorId?.name || 'Instructor'}</span>
                </div>
                <Badge variant="primary">{course.term}</Badge>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{Math.round(course.progress || 0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-400 h-2 rounded-full"
                    style={{ width: `${course.progress || 0}%` }}
                  />
                </div>
              </div>
              <Link to={`/student/courses/${course._id}`}>
                <Button className="w-full">
                  {course.completed ? 'Review Course' : 'Continue Learning →'}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;

