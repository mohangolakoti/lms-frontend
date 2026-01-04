import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCourseDetails } from '../../hooks/useCourses';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { course, loading, error } = useCourseDetails(id, 'student');

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
        <Link to="/student/courses">
          <Button variant="secondary">← Back to Courses</Button>
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Course not found'}
        </div>
      </div>
    );
  }

  const progress = course.progress || { overallCoursePercentage: 0, completed: false };

  return (
    <div className="space-y-6">
      <Link to="/student/courses">
        <Button variant="secondary">← Back to Courses</Button>
      </Link>

      <div className="bg-gradient-to-r from-primary-400 to-primary-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-primary-100 mb-4">{course.description}</p>
        <div className="flex items-center gap-4 text-sm">
          <span>{course.modules?.length || 0} Chapters</span>
          <span>•</span>
          <span>Level: {course.level}</span>
          <span>•</span>
          <span>{course.term}</span>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Course Content</h2>
          <Badge variant={progress.completed ? 'success' : 'primary'}>
            {Math.round(progress.overallCoursePercentage)}% Complete
          </Badge>
        </div>

        <div className="space-y-4">
          {course.modules?.map((module, moduleIndex) => {
            const moduleProgress = module.completionPercentage || 0;
            return (
              <div key={module._id || moduleIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    {moduleIndex + 1}. {module.title}
                  </h3>
                  <Badge variant={moduleProgress === 100 ? 'success' : 'primary'}>
                    {Math.round(moduleProgress)}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  {module.lessons?.map((lesson, lessonIndex) => {
                    const isCompleted = lesson.completed || false;
                    return (
                      <div
                        key={lesson._id || lessonIndex}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isCompleted
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-pointer'
                        }`}
                        onClick={() => navigate(`/student/courses/${id}/lessons/${lesson._id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {isCompleted ? '✓' : '○'}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">{lesson.title}</p>
                            <p className="text-xs text-gray-500">{lesson.type}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="text-xs py-1 px-2">
                          {isCompleted ? 'Review' : 'Start'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default CourseDetail;

