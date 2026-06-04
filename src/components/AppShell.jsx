import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from './Button';

const AppShell = ({
  children,
  user,
  onLogout,
  menuItems = [],
  appLabel = 'LMS',
  userFallback = 'U',
  lessonMode = false,
}) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (lessonMode) {
    return <div className="min-h-screen bg-surface-page">{children}</div>;
  }

  return (
    <div className="app-shell">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 app-sidebar transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-line-soft">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm font-bold">LMS</span>
              </div>
              <span className="text-xl font-semibold text-text-base">{appLabel}</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-text-subtle hover:text-text-base"
            >
              ✕
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t border-line-soft">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || userFallback}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-base truncate">{user?.name || appLabel}</p>
                <p className="text-xs text-text-subtle truncate">{user?.email || ''}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="lg:pl-64 transition-all duration-300">
        <header className="app-header h-16 flex items-center justify-between px-6 sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-text-subtle hover:text-text-base"
          >
            ☰
          </button>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase() || userFallback}
            </div>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AppShell;
