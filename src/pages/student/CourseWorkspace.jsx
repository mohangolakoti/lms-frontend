import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCourseDetails } from '../../hooks/useCourses';
import { studentAPI } from '../../services/api';
import CoursePlayer from '../../components/CoursePlayer';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';

const CourseWorkspace = ({ lessonId: lessonIdProp }) => {
  const { id, courseId: courseIdParam, lessonId: lessonIdParam } = useParams();
  const courseId = id || courseIdParam;
  const activeLessonId = lessonIdProp || lessonIdParam;
  const navigate = useNavigate();
  const { course, loading, error, refetch } = useCourseDetails(courseId, 'student');
  const [openModuleIndex, setOpenModuleIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [bookmarked, setBookmarked] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const activeLessonRef = useRef(null);

  const modules = course?.modules || [];
  const progress = course?.progress || { overallCoursePercentage: 0, completed: false };
  const currentLesson = activeLessonId
    ? modules.flatMap((m) => m.lessons || []).find((l) => l._id === activeLessonId)
    : null;
  const currentModule = activeLessonId
    ? modules.find((m) => m.lessons?.some((l) => l._id === activeLessonId))
    : modules[openModuleIndex];

  useEffect(() => {
    if (activeLessonId && currentModule) {
      const moduleIndex = modules.findIndex((m) => m._id === currentModule._id);
      if (moduleIndex >= 0) {
        setOpenModuleIndex(moduleIndex);
      }
    }
  }, [activeLessonId, currentModule, modules]);

  useEffect(() => {
    if (!activeLessonId || !courseId) return undefined;

    const loadNote = async () => {
      try {
        const response = await studentAPI.getLessonNote(courseId, activeLessonId);
        setNoteContent(response.data.data?.content || '');
      } catch {
        setNoteContent('');
      }
    };

    const loadBookmarks = async () => {
      try {
        const response = await studentAPI.getBookmarks();
        const items = response.data.data || [];
        setBookmarked(items.some((b) => b.lessonId === activeLessonId));
      } catch {
        setBookmarked(false);
      }
    };

    loadNote();
    loadBookmarks();
  }, [activeLessonId, courseId]);

  useEffect(() => {
    if (progress.completed && activeLessonId) {
      const key = `course-complete-modal-${courseId}`;
      if (!sessionStorage.getItem(key)) {
        setShowCompletionModal(true);
        sessionStorage.setItem(key, '1');
      }
    }
  }, [progress.completed, activeLessonId, courseId]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!activeLessonId) return;
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
      if (event.key === 'ArrowLeft') {
        const prev = getAdjacentLesson(-1);
        if (prev) navigate(`/student/courses/${courseId}/lessons/${prev.lesson._id}`);
      }
      if (event.key === 'ArrowRight') {
        const next = getAdjacentLesson(1);
        if (next) navigate(`/student/courses/${courseId}/lessons/${next.lesson._id}`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const getAdjacentLesson = (direction) => {
    if (!course || !currentModule || !activeLessonId) return null;
    const moduleIndex = modules.findIndex((m) => m._id === currentModule._id);
    const lessonIndex = currentModule.lessons.findIndex((l) => l._id === activeLessonId);

    if (direction === -1) {
      if (lessonIndex > 0) return { lesson: currentModule.lessons[lessonIndex - 1], module: currentModule };
      if (moduleIndex > 0) {
        const prevModule = modules[moduleIndex - 1];
        if (prevModule.lessons?.length) {
          return { lesson: prevModule.lessons[prevModule.lessons.length - 1], module: prevModule };
        }
      }
    } else {
      if (lessonIndex < currentModule.lessons.length - 1) {
        return { lesson: currentModule.lessons[lessonIndex + 1], module: currentModule };
      }
      if (moduleIndex < modules.length - 1) {
        const nextModule = modules[moduleIndex + 1];
        if (nextModule.lessons?.length) return { lesson: nextModule.lessons[0], module: nextModule };
      }
    }
    return null;
  };

  const handleProgressUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleSaveNote = async () => {
    if (!activeLessonId) return;
    await studentAPI.saveLessonNote(courseId, activeLessonId, noteContent);
  };

  const handleToggleBookmark = async () => {
    if (!activeLessonId || !currentLesson) return;
    const response = await studentAPI.toggleBookmark({
      courseId,
      lessonId: activeLessonId,
      lessonTitle: currentLesson.title,
      courseTitle: course.title,
    });
    setBookmarked(response.data.data?.bookmarked);
  };

  const handleContinueLearning = async () => {
    try {
      const response = await studentAPI.getCourseResume(courseId);
      const target = response.data.data?.continueLesson;
      if (target?.lessonId) {
        navigate(`/student/courses/${courseId}/lessons/${target.lessonId}`);
      }
    } catch {
      const firstModule = modules[0];
      const firstLesson = firstModule?.lessons?.[0];
      if (firstLesson) navigate(`/student/courses/${courseId}/lessons/${firstLesson._id}`);
    }
  };

  const toggleModule = (moduleIndex) => {
    setOpenModuleIndex((currentIndex) => (currentIndex === moduleIndex ? -1 : moduleIndex));
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
      <div className="space-y-6 p-6">
        <Link to="/student/courses">
          <Button variant="secondary">← Back to Courses</Button>
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Course not found'}
        </div>
      </div>
    );
  }

  const prevLesson = getAdjacentLesson(-1);
  const nextLesson = getAdjacentLesson(1);

  return (
    <div className="min-h-screen bg-surface-page">
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white p-4 md:p-6 rounded-2xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/student/courses" className="text-brand-100 text-sm hover:text-white">← All Courses</Link>
            <h1 className="text-2xl md:text-3xl font-semibold mt-1">{course.title}</h1>
            <p className="text-brand-100 text-sm mt-1 line-clamp-2">{course.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={progress.completed ? 'success' : 'primary'}>
              {Math.round(progress.overallCoursePercentage || 0)}% complete
            </Badge>
            {!activeLessonId && (
              <Button onClick={handleContinueLearning}>Continue Learning →</Button>
            )}
            <Button variant="outline" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              ☰ Chapters
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-0 lg:gap-6 p-4 lg:p-6">
        <aside className="hidden lg:block w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl border border-line-soft p-4 lg:sticky lg:top-6 max-h-[calc(100vh-220px)] overflow-y-auto">
            <h2 className="text-lg font-semibold text-text-base mb-3">Course Content</h2>
            <div className="space-y-2">
              {modules.map((module, moduleIndex) => {
                const isExpanded = openModuleIndex === moduleIndex;
                return (
                  <div key={module._id} className="border border-line-soft rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleModule(moduleIndex)}
                      className="w-full text-left p-3 bg-surface-muted hover:bg-brand-50 flex items-center justify-between"
                    >
                      <span className="font-medium text-sm text-text-base">{module.title}</span>
                      <span className="flex items-center gap-2 text-xs text-text-muted">
                        <span>{Math.round(module.completionPercentage || 0)}%</span>
                        <span>{isExpanded ? '▾' : '▸'}</span>
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="divide-y divide-line-soft">
                        {(module.lessons || []).map((lesson, lessonIndex) => {
                          const isActive = activeLessonId === lesson._id;
                          return (
                            <button
                              key={lesson._id}
                              ref={isActive ? activeLessonRef : null}
                              type="button"
                              onClick={() => navigate(`/student/courses/${courseId}/lessons/${lesson._id}`)}
                              className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 ${
                                isActive ? 'bg-brand-50 border-l-4 border-brand-500' : 'hover:bg-surface-muted'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                lesson.completed ? 'bg-success-600 text-white' : 'bg-surface-muted text-text-muted'
                              }`}>
                                {lesson.completed ? '✓' : lessonIndex + 1}
                              </span>
                              <span className="truncate">{lesson.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close sidebar"
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute right-0 top-0 h-full w-[88vw] max-w-sm bg-white shadow-2xl border-l border-line-soft overflow-y-auto">
              <div className="p-4 border-b border-line-soft flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-base">Course Content</h2>
                <Button variant="secondary" onClick={() => setSidebarOpen(false)}>Close</Button>
              </div>
              <div className="p-4 space-y-2">
                {modules.map((module, moduleIndex) => {
                  const isExpanded = openModuleIndex === moduleIndex;
                  return (
                    <div key={module._id} className="border border-line-soft rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleModule(moduleIndex)}
                        className="w-full text-left p-3 bg-surface-muted hover:bg-brand-50 flex items-center justify-between"
                      >
                        <span className="font-medium text-sm text-text-base">{module.title}</span>
                        <span className="flex items-center gap-2 text-xs text-text-muted">
                          <span>{Math.round(module.completionPercentage || 0)}%</span>
                          <span>{isExpanded ? '▾' : '▸'}</span>
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="divide-y divide-line-soft">
                          {(module.lessons || []).map((lesson, lessonIndex) => {
                            const isActive = activeLessonId === lesson._id;
                            return (
                              <button
                                key={lesson._id}
                                ref={isActive ? activeLessonRef : null}
                                type="button"
                                onClick={() => {
                                  navigate(`/student/courses/${courseId}/lessons/${lesson._id}`);
                                  setSidebarOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 ${
                                  isActive ? 'bg-brand-50 border-l-4 border-brand-500' : 'hover:bg-surface-muted'
                                }`}
                              >
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                  lesson.completed ? 'bg-success-600 text-white' : 'bg-surface-muted text-text-muted'
                                }`}>
                                  {lesson.completed ? '✓' : lessonIndex + 1}
                                </span>
                                <span className="truncate">{lesson.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </aside>
          </div>
        )}

        <main className="flex-1 min-w-0 space-y-4">
          {activeLessonId && currentLesson ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-text-muted">{currentModule?.title}</p>
                  <h2 className="text-xl font-semibold text-text-base">{currentLesson.title}</h2>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleToggleBookmark}>
                    {bookmarked ? '★ Saved' : '☆ Save'}
                  </Button>
                  {prevLesson && (
                    <Button variant="outline" onClick={() => navigate(`/student/courses/${courseId}/lessons/${prevLesson.lesson._id}`)}>
                      ← Prev
                    </Button>
                  )}
                  {nextLesson && (
                    <Button onClick={() => navigate(`/student/courses/${courseId}/lessons/${nextLesson.lesson._id}`)}>
                      Next →
                    </Button>
                  )}
                </div>
              </div>

              <Card>
                <CoursePlayer
                  lesson={currentLesson}
                  courseId={courseId}
                  onProgressUpdate={handleProgressUpdate}
                />
              </Card>

              <Card title="My Notes">
                <textarea
                  className="input-field w-full"
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write notes for this lesson..."
                />
                <div className="mt-3 flex justify-end">
                  <Button variant="outline" onClick={handleSaveNote}>Save Notes</Button>
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-text-base">
                  {currentModule ? currentModule.title : 'Select a chapter'}
                </h2>
                <p className="text-sm text-text-muted">
                  {currentModule?.lessons?.length || 0} lessons in this chapter
                </p>
              </div>
              <div className="space-y-3">
                {(currentModule?.lessons || []).map((lesson, lessonIndex) => (
                  <div
                    key={lesson._id}
                    className="flex items-center justify-between p-4 rounded-lg border border-line-soft bg-surface-muted"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        lesson.completed ? 'bg-success-600 text-white' : 'bg-white text-text-muted border border-line-soft'
                      }`}>
                        {lesson.completed ? '✓' : lessonIndex + 1}
                      </span>
                      <div>
                        <p className="font-medium text-text-base">{lesson.title}</p>
                        <p className="text-xs text-text-subtle">{lesson.type}</p>
                      </div>
                    </div>
                    <Button onClick={() => navigate(`/student/courses/${courseId}/lessons/${lesson._id}`)}>
                      {lesson.completed ? 'Review' : 'Start'} →
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </main>
      </div>

      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-semibold text-text-base mb-2">Course Completed!</h3>
            <p className="text-text-muted mb-4">Great work — you finished all lessons in this course.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCompletionModal(false)}>Close</Button>
              <Button onClick={() => navigate('/student/certificates')}>View Certificates</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseWorkspace;
