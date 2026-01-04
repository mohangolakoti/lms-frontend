import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCourseDetails } from '../../hooks/useCourses';
import CoursePlayer from '../../components/CoursePlayer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

const LessonView = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { course, loading, error, refetch } = useCourseDetails(courseId, 'student');
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);

  useEffect(() => {
    if (course && lessonId) {
      // Find the lesson
      for (const module of course.modules || []) {
        const lesson = module.lessons?.find(l => l._id === lessonId);
        if (lesson) {
          setCurrentLesson(lesson);
          setCurrentModule(module);
          break;
        }
      }
    }
  }, [course, lessonId]);

  const handleProgressUpdate = () => {
    refetch();
  };

  const getNextLesson = () => {
    if (!course || !currentLesson || !currentModule) return null;

    const moduleIndex = course.modules.findIndex(m => m._id === currentModule._id);
    const lessonIndex = currentModule.lessons.findIndex(l => l._id === lessonId);

    // Check if there's a next lesson in current module
    if (lessonIndex < currentModule.lessons.length - 1) {
      return {
        lesson: currentModule.lessons[lessonIndex + 1],
        module: currentModule,
      };
    }

    // Check next module
    if (moduleIndex < course.modules.length - 1) {
      const nextModule = course.modules[moduleIndex + 1];
      if (nextModule.lessons && nextModule.lessons.length > 0) {
        return {
          lesson: nextModule.lessons[0],
          module: nextModule,
        };
      }
    }

    return null;
  };

  const getPrevLesson = () => {
    if (!course || !currentLesson || !currentModule) return null;

    const moduleIndex = course.modules.findIndex(m => m._id === currentModule._id);
    const lessonIndex = currentModule.lessons.findIndex(l => l._id === lessonId);

    // Check if there's a previous lesson in current module
    if (lessonIndex > 0) {
      return {
        lesson: currentModule.lessons[lessonIndex - 1],
        module: currentModule,
      };
    }

    // Check previous module
    if (moduleIndex > 0) {
      const prevModule = course.modules[moduleIndex - 1];
      if (prevModule.lessons && prevModule.lessons.length > 0) {
        return {
          lesson: prevModule.lessons[prevModule.lessons.length - 1],
          module: prevModule,
        };
      }
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !course || !currentLesson) {
    return (
      <div className="space-y-6">
        <Link to={`/student/courses/${courseId}`}>
          <Button variant="secondary">← Back to Course</Button>
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Lesson not found'}
        </div>
      </div>
    );
  }

  const nextLesson = getNextLesson();
  const prevLesson = getPrevLesson();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to={`/student/courses/${courseId}`}>
          <Button variant="secondary">← Back to Course</Button>
        </Link>
        <div className="flex gap-2">
          {prevLesson && (
            <Button
              variant="outline"
              onClick={() => navigate(`/student/courses/${courseId}/lessons/${prevLesson.lesson._id}`)}
            >
              ← Previous
            </Button>
          )}
          {nextLesson && (
            <Button
              onClick={() => navigate(`/student/courses/${courseId}/lessons/${nextLesson.lesson._id}`)}
            >
              Next →
            </Button>
          )}
        </div>
      </div>

      <Card>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentLesson.title}</h1>
        {currentLesson.description && (
          <p className="text-gray-600 mb-4">{currentLesson.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Module: {currentModule.title}</span>
          <span>Type: {currentLesson.type}</span>
          {currentLesson.durationSeconds && (
            <span>Duration: {Math.floor(currentLesson.durationSeconds / 60)} min</span>
          )}
        </div>
      </Card>

      <Card>
        <CoursePlayer
          lesson={currentLesson}
          courseId={courseId}
          onProgressUpdate={handleProgressUpdate}
        />
      </Card>
    </div>
  );
};

export default LessonView;

