import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
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

const isDirectVideoUrl = (url) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url || '');

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
    return { type: VIDEO_SOURCE_TYPES.DIRECT, src: url };
  }

  return { type: VIDEO_SOURCE_TYPES.UNSUPPORTED };
};

const CoursePlayer = ({ lesson, courseId, onProgressUpdate, mode = 'student' }) => {
  const { user } = useAuth();
  const isPreview = mode === 'preview';
  const videoRef = useRef(null);
  const lastWatchedRef = useRef(0);
  const dwellSecondsRef = useRef(0);
  const [completed, setCompleted] = useState(lesson.completed || false);
  const progressIntervalRef = useRef(null);
  const dwellIntervalRef = useRef(null);
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
    lastWatchedRef.current = lesson.lastWatchedSecond || 0;
    setCompleted(lesson.completed || false);
    dwellSecondsRef.current = 0;
  }, [lesson._id, lesson.lastWatchedSecond, lesson.completed]);

  const persistProgress = useCallback(async (payload) => {
    if (isPreview) return;
    try {
      await studentAPI.updateLessonProgress(courseId, lesson._id, payload);
      if (payload.completed && onProgressUpdate) onProgressUpdate();
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  }, [courseId, lesson._id, isPreview, onProgressUpdate]);

  useEffect(() => {
    if (isPreview || lesson.type !== 'video' || videoSource.type !== VIDEO_SOURCE_TYPES.DIRECT || !videoRef.current) {
      return undefined;
    }

    if (lesson.lastWatchedSecond && videoRef.current) {
      videoRef.current.currentTime = lesson.lastWatchedSecond;
    }

    progressIntervalRef.current = setInterval(async () => {
      if (videoRef.current && !videoRef.current.paused) {
        const currentTime = Math.floor(videoRef.current.currentTime);
        if (currentTime !== lastWatchedRef.current) {
          lastWatchedRef.current = currentTime;
          await persistProgress({
            lastWatchedSecond: currentTime,
            completed: videoRef.current.ended,
          });
          if (videoRef.current.ended && !completed) {
            setCompleted(true);
          }
        }
      }
    }, 5000);

    const handleEnded = async () => {
      if (!completed) {
        setCompleted(true);
        await persistProgress({
          completed: true,
          lastWatchedSecond: Math.floor(videoRef.current?.duration || lastWatchedRef.current),
        });
      }
    };

    videoRef.current.addEventListener('ended', handleEnded);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (videoRef.current) videoRef.current.removeEventListener('ended', handleEnded);
    };
  }, [lesson._id, lesson.type, videoSource.type, isPreview, completed, persistProgress, lesson.lastWatchedSecond]);

  useEffect(() => {
    if (isPreview || completed) return undefined;

    const usesDwellTracking = lesson.type === 'pdf'
      || (lesson.type === 'video' && videoSource.type !== VIDEO_SOURCE_TYPES.DIRECT);

    if (!usesDwellTracking) return undefined;

    dwellIntervalRef.current = setInterval(async () => {
      dwellSecondsRef.current += 30;
      lastWatchedRef.current = dwellSecondsRef.current;
      await persistProgress({ lastWatchedSecond: dwellSecondsRef.current });
    }, 30000);

    return () => {
      if (dwellIntervalRef.current) clearInterval(dwellIntervalRef.current);
    };
  }, [lesson._id, lesson.type, videoSource.type, isPreview, completed, persistProgress]);

  const handleMarkComplete = async () => {
    const payload = {
      completed: true,
      lastWatchedSecond: lesson.type === 'video' && videoRef.current
        ? Math.floor(videoRef.current.currentTime)
        : Math.max(lastWatchedRef.current, dwellSecondsRef.current, 1),
    };
    await persistProgress(payload);
    setCompleted(true);
  };

  const renderResources = () => {
    if (!lesson.resources?.length) return null;
    return (
      <div className="mt-4 border-t border-line-soft pt-4">
        <h4 className="text-sm font-semibold text-text-base mb-2">Resources</h4>
        <ul className="space-y-2">
          {lesson.resources.map((resource, index) => (
            <li key={index}>
              <a href={resource} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline text-sm">
                Download resource {index + 1}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderContent = () => {
    if (lesson.type === 'video') {
      return (
        <div className="relative w-full" style={{ userSelect: 'none' }}>
          <div className="relative w-full aspect-video bg-black/5">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-text-muted">
                Loading video...
              </div>
            )}
            {videoSource.type === VIDEO_SOURCE_TYPES.DIRECT && (
              <video
                ref={videoRef}
                src={videoSource.src}
                controls
                preload="metadata"
                controlsList="nodownload noplaybackrate"
                className="w-full h-full"
                onLoadedData={() => setIsLoading(false)}
                onCanPlay={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
                onContextMenu={(e) => e.preventDefault()}
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
                allow="autoplay; fullscreen"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
              />
            )}
            {videoSource.type === VIDEO_SOURCE_TYPES.UNSUPPORTED && (
              <div className="absolute inset-0 flex flex-col gap-3 items-center justify-center text-sm text-text-muted">
                <p>This video source is not supported in embedded mode.</p>
                {lesson.url && (
                  <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                    Open lesson in new tab
                  </a>
                )}
              </div>
            )}

          </div>
          <Watermark user={user} preview={isPreview} />
        </div>
      );
    }

    if (lesson.type === 'pdf') {
      return (
        <div className="relative w-full" style={{ height: '80vh', userSelect: 'none' }}>
          <iframe
            src={`${lesson.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            className="w-full h-full border-0"
            title={lesson.title}
            onContextMenu={(e) => e.preventDefault()}
          />
          <Watermark user={user} preview={isPreview} />
        </div>
      );
    }

    if (lesson.type === 'quiz') {
      return (
        <div className="p-6">
          <div className="bg-info-50 border border-info-200 rounded-lg p-4 mb-4">
            <p className="text-info-800">Complete this quiz lesson to continue your progress.</p>
          </div>
          {lesson.assessmentId ? (
            <Link to={`/student/assessments/${lesson.assessmentId}`} className="btn-primary inline-block">
              Open Assessment
            </Link>
          ) : (
            <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="btn-primary inline-block">
              Open Quiz
            </a>
          )}
        </div>
      );
    }

    return <div className="text-text-muted">Unsupported lesson type</div>;
  };

  return (
    <div className="relative" style={{ userSelect: 'none' }}>
      {renderContent()}
      {renderResources()}
      {!isPreview && (
        <div className="mt-4 flex items-center justify-between">
          <div>
            {completed && (
              <span className="px-3 py-1 bg-success-100 text-success-800 rounded-full text-sm font-medium">
                ✓ Completed
              </span>
            )}
          </div>
          {!completed && (
            <button type="button" onClick={handleMarkComplete} className="btn-primary">
              Mark as Complete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const Watermark = ({ user, preview = false }) => {
  if (!user) return null;
  const watermarkText = user.email || user.id || 'SiliconMeta Learning';
  const opacity = preview ? 0.1 : 0.2;

  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        style={{ zIndex: 9999, opacity, userSelect: 'none' }}
      >
        <div className="text-6xl font-bold text-gray-800 transform -rotate-45" style={{ whiteSpace: 'nowrap' }}>
          {watermarkText}
        </div>
      </div>
      <div className="absolute top-4 right-4 pointer-events-none" style={{ zIndex: 10000, opacity: 0.5 }}>
        <div className="text-sm font-semibold text-gray-700 bg-white bg-opacity-75 px-3 py-1 rounded">
          {watermarkText}
        </div>
      </div>
    </>
  );
};

export default CoursePlayer;
