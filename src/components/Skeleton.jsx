import React from 'react';

/**
 * Reusable, customizable Skeleton loading component with pulse animations.
 * Provides presets for common LMS layout components (stat cards, course cards, list rows, text block).
 */
const Skeleton = ({ type = 'text', count = 1, className = '' }) => {
  const renderPulse = (key) => {
    switch (type) {
      case 'statCard':
        return (
          <div key={key} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 animate-pulse shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
              <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-28"></div>
          </div>
        );

      case 'courseCard':
        return (
          <div key={key} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm animate-pulse">
            <div className="aspect-video w-full bg-slate-200 dark:bg-slate-700"></div>
            <div className="p-5">
              <div className="flex justify-between items-center mb-3">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
              </div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-slate-100 dark:bg-slate-700/50 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-100 dark:bg-slate-700/50 rounded w-2/3 mb-4"></div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                </div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-24"></div>
              </div>
            </div>
          </div>
        );

      case 'listRow':
        return (
          <div key={key} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
              <div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-36 mb-2"></div>
                <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-24"></div>
              </div>
            </div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16"></div>
          </div>
        );

      case 'text':
      default:
        return (
          <div key={key} className={`space-y-2.5 animate-pulse ${className}`}>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-full"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-5/6"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-2/3"></div>
          </div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => renderPulse(i))}
    </>
  );
};

export default Skeleton;
export { Skeleton };
