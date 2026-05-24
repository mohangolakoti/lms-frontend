import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../services/api';

const VIDEO_SOURCE_TYPES = {
  YOUTUBE: 'youtube',
  GOOGLE_DRIVE: 'google_drive',
  DIRECT: 'direct',
  UNSUPPORTED: 'unsupported',
};

const getYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{6,})/i,
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{6,})/i,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,})/i,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,})/i,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
};

const getGoogleDriveFileId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:drive\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/i,
    /(?:drive\.google\.com\/open\?id=)([a-zA-Z0-9_-]+)/i,
    /(?:drive\.google\.com\/uc\?id=)([a-zA-Z0-9_-]+)/i,
    /(?:drive\.google\.com\/uc\?export=download&id=)([a-zA-Z0-9_-]+)/i,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
};

const isDirectVideoUrl = (url) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
};

const getVideoSource = (url) => {
  const youtubeId = getYouTubeId(url);
  if (youtubeId) {
    return {
      type: VIDEO_SOURCE_TYPES.YOUTUBE,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?autoplay=0&controls=1&rel=0`,
    };
  }

  const driveId = getGoogleDriveFileId(url);
  if (driveId) {
    return {
      type: VIDEO_SOURCE_TYPES.GOOGLE_DRIVE,
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
    };
  }

  if (isDirectVideoUrl(url)) {
    return {
      type: VIDEO_SOURCE_TYPES.DIRECT,
      src: url,
    };
  }

  return { type: VIDEO_SOURCE_TYPES.UNSUPPORTED };
};

const CoursePlayer = ({ lesson, courseId, onProgressUpdate }) => {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [lastWatchedSecond, setLastWatchedSecond] = useState(0);
  const [completed, setCompleted] = useState(lesson.completed || false);
  const progressIntervalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoSource = useMemo(() => getVideoSource(lesson?.url), [lesson?.url]);

  useEffect(() => {
    setIsLoading(true);
  }, [lesson?.url]);

  useEffect(() => {
    if (videoSource.type === VIDEO_SOURCE_TYPES.UNSUPPORTED) {
      setIsLoading(false);
    }
  }, [videoSource.type]);

  useEffect(() => {
    setLastWatchedSecond(lesson.lastWatchedSecond || 0);
    setCompleted(lesson.completed || false);
  }, [lesson._id, lesson.lastWatchedSecond, lesson.completed]);

  useEffect(() => {
    if (lesson.type === 'video' && videoSource.type === VIDEO_SOURCE_TYPES.DIRECT && videoRef.current) {
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
  }, [lesson, courseId, lastWatchedSecond, completed, onProgressUpdate, videoSource.type]);

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
          <div className="relative w-full aspect-video bg-black/5">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                Loading video...
              </div>
            )}
            {videoSource.type === VIDEO_SOURCE_TYPES.DIRECT && (
              <video
                ref={videoRef}
                src={videoSource.src}
                controls
                preload="metadata"
                controlsList="nodownload noplaybackrate nofullscreen"
                disablePictureInPicture
                className="w-full h-full"
                style={{ 
                  pointerEvents: 'auto',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
                onLoadedData={() => setIsLoading(false)}
                onCanPlay={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
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
            )}
            {videoSource.type === VIDEO_SOURCE_TYPES.YOUTUBE && (
              <iframe
                src={videoSource.embedUrl}
                className="w-full h-full border-0"
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
              />
            )}
            {videoSource.type === VIDEO_SOURCE_TYPES.GOOGLE_DRIVE && (
              <iframe
                src={videoSource.embedUrl}
                className="w-full h-full border-0"
                title={lesson.title}
                allow="autoplay"
                onLoad={() => setIsLoading(false)}
              />
            )}
            {videoSource.type === VIDEO_SOURCE_TYPES.UNSUPPORTED && (
              <div className="absolute inset-0 flex flex-col gap-3 items-center justify-center text-sm text-gray-600">
                <p>This video source is not supported in embedded mode.</p>
                {lesson.url && (
                  <a
                    href={lesson.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Open lesson in new tab
                  </a>
                )}
              </div>
            )}
          </div>
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

