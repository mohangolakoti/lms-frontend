import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../services/api';

const CoursePlayer = ({ lesson, courseId, onProgressUpdate }) => {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [lastWatchedSecond, setLastWatchedSecond] = useState(0);
  const [completed, setCompleted] = useState(lesson.completed || false);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    // Disable text selection
    const handleSelectStart = (e) => {
      e.preventDefault();
      return false;
    };
    
    // Disable drag
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };
    
    // Disable keyboard shortcuts
    const handleKeyDown = (e) => {
      // Disable Ctrl+S, Ctrl+P, Ctrl+U, Ctrl+I, Ctrl+C, Ctrl+A, Ctrl+V
      if (e.ctrlKey || e.metaKey) {
        if (['s', 'p', 'u', 'i', 'c', 'a', 'v'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Print Screen
      if (e.key === 'F12' || 
          e.key === 'PrintScreen' ||
          (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Disable copy
    const handleCopy = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable cut
    const handleCut = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('selectstart', handleSelectStart, true);
    document.addEventListener('dragstart', handleDragStart, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('copy', handleCopy, true);
    document.addEventListener('cut', handleCut, true);

    // Add CSS to prevent selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('selectstart', handleSelectStart, true);
      document.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('copy', handleCopy, true);
      document.removeEventListener('cut', handleCut, true);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.mozUserSelect = '';
      document.body.style.msUserSelect = '';
    };
  }, []);

  useEffect(() => {
    if (lesson.type === 'video' && videoRef.current) {
      // Resume from last watched position
      if (lesson.lastWatchedSecond) {
        videoRef.current.currentTime = lesson.lastWatchedSecond;
      }

      // Update progress every 5 seconds
      progressIntervalRef.current = setInterval(async () => {
        if (videoRef.current && !videoRef.current.paused) {
          const currentTime = Math.floor(videoRef.current.currentTime);
          if (currentTime !== lastWatchedSecond) {
            setLastWatchedSecond(currentTime);
            try {
              await studentAPI.updateLessonProgress(courseId, lesson._id, {
                lastWatchedSecond: currentTime,
                completed: videoRef.current.ended,
              });
              if (videoRef.current.ended && !completed) {
                setCompleted(true);
                if (onProgressUpdate) onProgressUpdate();
              }
            } catch (error) {
              console.error('Failed to update progress:', error);
            }
          }
        }
      }, 5000);

      // Handle video end
      const handleEnded = async () => {
        if (!completed) {
          setCompleted(true);
          try {
            await studentAPI.updateLessonProgress(courseId, lesson._id, {
              completed: true,
              lastWatchedSecond: videoRef.current.duration,
            });
            if (onProgressUpdate) onProgressUpdate();
          } catch (error) {
            console.error('Failed to mark as completed:', error);
          }
        }
      };

      videoRef.current.addEventListener('ended', handleEnded);

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        if (videoRef.current) {
          videoRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, [lesson, courseId, lastWatchedSecond, completed, onProgressUpdate]);

  const handleMarkComplete = async () => {
    try {
      await studentAPI.updateLessonProgress(courseId, lesson._id, {
        completed: true,
        lastWatchedSecond: lesson.type === 'video' && videoRef.current 
          ? videoRef.current.currentTime 
          : 0,
      });
      setCompleted(true);
      if (onProgressUpdate) onProgressUpdate();
    } catch (error) {
      alert('Failed to mark lesson as complete');
    }
  };

  const renderContent = () => {
    if (lesson.type === 'video') {
      return (
        <div className="relative w-full" style={{ userSelect: 'none', position: 'relative' }}>
          <video
            ref={videoRef}
            src={lesson.url}
            controls
            controlsList="nodownload noplaybackrate nofullscreen"
            disablePictureInPicture
            className="w-full h-auto"
            style={{ 
              pointerEvents: 'auto',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }}
            onDragStart={(e) => {
              e.preventDefault();
              return false;
            }}
          />
          <Watermark user={user} />
        </div>
      );
    } else if (lesson.type === 'pdf') {
      return (
        <div className="relative w-full" style={{ height: '80vh', userSelect: 'none', position: 'relative' }}>
          <iframe
            src={`${lesson.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            className="w-full h-full border-0"
            style={{ 
              pointerEvents: 'auto',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
            title={lesson.title}
            onContextMenu={(e) => {
              e.preventDefault();
              return false;
            }}
          />
          <Watermark user={user} />
        </div>
      );
    } else if (lesson.type === 'quiz') {
      return (
        <div className="p-6" style={{ userSelect: 'none' }}>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800">This is a quiz lesson. Please complete it to proceed.</p>
          </div>
          <a
            href={lesson.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-block"
            onClick={(e) => {
              // Track quiz access
              console.log('Quiz accessed');
            }}
          >
            Open Quiz
          </a>
        </div>
      );
    }
    return <div>Unsupported lesson type</div>;
  };

  return (
    <div 
      className="relative" 
      style={{ 
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
    >
      {renderContent()}
      <div className="mt-4 flex items-center justify-between" style={{ userSelect: 'none' }}>
        <div>
          {completed && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              ✓ Completed
            </span>
          )}
        </div>
        {!completed && (
          <button
            onClick={handleMarkComplete}
            className="btn-primary"
            style={{ userSelect: 'none' }}
          >
            Mark as Complete
          </button>
        )}
      </div>
    </div>
  );
};

const Watermark = ({ user }) => {
  if (!user) return null;

  const watermarkText = user.email || user.id || 'LMS';

  return (
    <>
      {/* Main watermark */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        style={{
          zIndex: 9999,
          opacity: 0.2,
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        <div
          className="text-6xl font-bold text-gray-800 transform -rotate-45"
          style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {watermarkText}
        </div>
      </div>
      {/* Corner watermark */}
      <div
        className="absolute top-4 right-4 pointer-events-none"
        style={{
          zIndex: 10000,
          opacity: 0.5,
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        <div
          className="text-sm font-semibold text-gray-700 bg-white bg-opacity-75 px-3 py-1 rounded"
          style={{
            pointerEvents: 'none',
          }}
        >
          {watermarkText}
        </div>
      </div>
    </>
  );
};

export default CoursePlayer;

