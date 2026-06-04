import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
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
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const activeLessonRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (course && lessonId) {
      // Find the lesson and its module
      for (const module of course.modules || []) {
        const lesson = module.lessons?.find(l => l._id === lessonId);
        if (lesson) {
          setCurrentLesson(lesson);
          setCurrentModule(module);
          // Auto-expand the parent module
          setExpandedModuleId(module._id);
          break;
        }
      }
    }
  }, [course, lessonId]);

  // Auto-scroll sidebar to active lesson when it loads
  useEffect(() => {
    if (activeLessonRef.current && sidebarRef.current) {
      setTimeout(() => {
        activeLessonRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 100);
    }
  }, [currentLesson]);

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

  if (error || !course) {
    return (
      <div className="space-y-6">
        <Link to={`/student/courses/${courseId}`}>
          <Button variant="secondary">← Back to Course</Button>
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Course not found'}
        </div>
      </div>
    );
  }

  if (!currentLesson || !currentModule) {
    return (
      <div className="space-y-6">
        <Link to={`/student/courses/${courseId}`}>
          <Button variant="secondary">← Back to Course</Button>
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Lesson not found
        </div>
      </div>
    );
  }

  const nextLesson = getNextLesson();
  const prevLesson = getPrevLesson();

  return (
    <div className="flex gap-6 min-h-screen">
      {/* Left Sidebar - Accordion Module Navigation */}
      <div className="w-80 flex-shrink-0">
        <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-6 max-h-[calc(100vh-100px)] overflow-y-auto" ref={sidebarRef}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📚 Course Content</h2>

          <div className="space-y-2">
            {(course.modules || []).map((module) => {
              const isExpanded = expandedModuleId === module._id;
              const isCurrentModule = currentModule._id === module._id;

              return (
                <div key={module._id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Module Header - Accordion Toggle */}
                  <button
                    onClick={() => setExpandedModuleId(isExpanded ? null : module._id)}
                    className={`w-full text-left p-3 font-medium flex items-center justify-between transition-all ${
                      isCurrentModule
                        ? 'bg-brand-50 text-brand-700 border-b border-brand-200'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-semibold">{module.title}</span>
                    <svg
                      className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>

                  {/* Lessons - Only render when module is expanded */}
                  {isExpanded && module.lessons && module.lessons.length > 0 && (
                    <div className="bg-gray-50 divide-y divide-gray-200">
                      {module.lessons.map((lesson, lessonIndex) => {
                        const isActive = currentLesson._id === lesson._id;
                        const isCompleted = lesson.completed || false;

                        return (
                          <button
                            key={lesson._id || lessonIndex}
                            ref={isActive ? activeLessonRef : null}
                            onClick={() => navigate(`/student/courses/${courseId}/lessons/${lesson._id}`)}
                            className={`w-full text-left px-4 py-3 transition-all text-sm flex items-start gap-3 group ${
                              isActive
                                ? 'bg-brand-100 border-l-4 border-brand-500'
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className={`flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 text-xs font-semibold ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : isActive
                                ? 'bg-brand-600 text-white'
                                : 'bg-gray-300 text-gray-600'
                            }`}>
                              {isCompleted ? '✓' : lessonIndex + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium truncate ${
                                isActive ? 'text-brand-700' : 'text-text-base group-hover:text-brand-600'
                              }`}>
                                {lesson.title}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${
                                lesson.type === 'video' ? 'bg-blue-100 text-blue-700' :
                                lesson.type === 'pdf' ? 'bg-purple-100 text-purple-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {lesson.type}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Empty state for modules without lessons */}
                  {isExpanded && (!module.lessons || module.lessons.length === 0) && (
                    <div className="bg-gray-50 px-4 py-3 text-sm text-gray-500 text-center">
                      No lessons available
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        <div className="space-y-6">
          {/* Navigation Header */}
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

          {/* Lesson Header */}
          <Card>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentLesson.title}</h1>
            {currentLesson.description && (
              <p className="text-gray-600 mb-4">{currentLesson.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>📖 {currentModule.title}</span>
              <span>•</span>
              <span>Type: <span className={`font-medium px-2 py-1 rounded ${
                currentLesson.type === 'video' ? 'bg-blue-100 text-blue-700' :
                currentLesson.type === 'pdf' ? 'bg-purple-100 text-purple-700' :
                'bg-orange-100 text-orange-700'
              }`}>{currentLesson.type}</span></span>
              {currentLesson.durationSeconds && (
                <>
                  <span>•</span>
                  <span>⏱️ {Math.floor(currentLesson.durationSeconds / 60)} min</span>
                </>
              )}
            </div>
          </Card>

          {/* Lesson Content Player */}
          <Card>
            <CoursePlayer
              lesson={currentLesson}
              courseId={courseId}
              onProgressUpdate={handleProgressUpdate}
            />
          </Card>

          {/* Lesson Navigation Footer */}
          {(prevLesson || nextLesson) && (
            <div className="flex justify-between gap-4">
              <div>
                {prevLesson && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/student/courses/${courseId}/lessons/${prevLesson.lesson._id}`)}
                  >
                    ← Previous
                  </Button>
                )}
              </div>
              <div>
                {nextLesson && (
                  <Button
                    onClick={() => navigate(`/student/courses/${courseId}/lessons/${nextLesson.lesson._id}`)}
                  >
                    Next →
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonView;

