import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCourseDetails } from '../../hooks/useCourses';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { course, loading, error } = useCourseDetails(id, 'student');
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);

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
  const modules = course.modules || [];
  const selectedModule = modules[selectedModuleIndex];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/student/courses">
        <Button variant="secondary">← Back to Courses</Button>
      </Link>

      {/* Course Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 text-white shadow-card">
        <h1 className="text-3xl font-semibold mb-2">{course.title}</h1>
        <p className="text-brand-100 mb-4">{course.description}</p>
        <div className="flex items-center gap-4 text-sm">
          <span>📚 {modules.length} Chapters</span>
          <span>•</span>
          <span>Level: {course.level}</span>
          <span>•</span>
          <span>{course.term}</span>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex gap-6 min-h-screen">
        {/* Left Sidebar - Modules Only */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-xl border border-line-soft p-4 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-base">📖 Chapters</h2>
              <Badge variant={progress.completed ? 'success' : 'primary'}>
                {Math.round(progress.overallCoursePercentage)}%
              </Badge>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {modules.map((module, index) => {
                const moduleProgress = module.completionPercentage || 0;
                const isSelected = selectedModuleIndex === index;
                
                return (
                  <button
                    key={module._id || index}
                    onClick={() => setSelectedModuleIndex(index)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-brand-50 border-brand-200 shadow-sm'
                        : 'bg-white border-line-soft hover:bg-brand-50/40 hover:border-brand-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className={`font-medium text-sm ${
                        isSelected ? 'text-brand-700' : 'text-text-base'
                      }`}>
                        {module.title}
                      </h3>
                      <span className={`text-xs font-semibold flex-shrink-0 ${
                        moduleProgress === 100 ? 'text-success-700' : 'text-text-muted'
                      }`}>
                        {Math.round(moduleProgress)}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-surface-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          moduleProgress === 100 ? 'bg-success-600' : 'bg-brand-500'
                        }`}
                        style={{ width: `${moduleProgress}%` }}
                      ></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area - Selected Module Details */}
        <div className="flex-1">
          {selectedModule ? (
            <div className="bg-white rounded-xl border border-line-soft p-6">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-3">
                  <h1 className="text-2xl font-semibold text-text-base">
                    {selectedModuleIndex + 1}. {selectedModule.title}
                  </h1>
                  <Badge variant={selectedModule.completionPercentage === 100 ? 'success' : 'default'}>
                    {Math.round(selectedModule.completionPercentage || 0)}% Complete
                  </Badge>
                </div>
                <p className="text-text-muted text-sm">
                  This chapter contains {selectedModule.lessons?.length || 0} lessons
                </p>
              </div>

              {/* Module Summary Section */}
              <div className="border-t border-line-soft pt-6">
                <h2 className="text-lg font-semibold text-text-base mb-4">📚 Lessons</h2>
                
                {selectedModule.lessons && selectedModule.lessons.length > 0 ? (
                  <div className="space-y-3">
                    {selectedModule.lessons.map((lesson, lessonIndex) => {
                      const isCompleted = lesson.completed || false;
                      
                      return (
                        <div
                          key={lesson._id || lessonIndex}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                            isCompleted
                              ? 'bg-success-50 border-success-100'
                              : 'bg-surface-muted border-line-soft hover:bg-brand-50/40'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                              isCompleted 
                                ? 'bg-success-600 text-white' 
                                : 'bg-border-soft text-text-muted'
                            }`}>
                              {isCompleted ? '✓' : lessonIndex + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-text-base truncate">
                                {lesson.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  lesson.type === 'video' ? 'bg-info-100 text-info-700' :
                                  lesson.type === 'pdf' ? 'bg-brand-100 text-brand-700' :
                                  'bg-warning-100 text-warning-700'
                                }`}>
                                  {lesson.type}
                                </span>
                                {lesson.durationSeconds > 0 && (
                                  <span className="text-xs text-text-subtle">
                                    {Math.floor(lesson.durationSeconds / 60)}m
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant={isCompleted ? 'outline' : 'primary'}
                            className="ml-3 flex-shrink-0"
                            onClick={() => navigate(`/student/courses/${id}/lessons/${lesson._id}`)}
                          >
                            {isCompleted ? 'Review' : 'Start'} →
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-subtle">
                    <p>No lessons available in this chapter yet.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-line-soft p-8 text-center">
              <p className="text-text-subtle">Select a chapter from the sidebar to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
