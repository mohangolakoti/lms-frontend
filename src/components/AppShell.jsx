import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from './Button';
import Logo from './Logo';

const AppShell = ({
  children,
  user,
  onLogout,
  menuItems = [],
  userFallback = 'U',
  lessonMode = false,
}) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (lessonMode) {
    return <div className="min-h-screen bg-surface-page">{children}</div>;
  }

  return (
    <div className="app-shell">
      <div className={`fixed inset-y-0 left-0 z-50 app-sidebar transform transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
      } w-64 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-line-soft">
            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden lg:block">
                <Logo
                  variant={sidebarCollapsed ? 'logo-only' : 'compact'}
                  alt="SiliconMeta Learning"
                  className={sidebarCollapsed ? 'h-9 w-9' : 'h-8 w-auto max-w-[10rem]'}
                />
              </div>
              <div className="lg:hidden">
                <Logo variant="short" alt="SiliconMeta Learning" className="h-8 w-auto max-w-[8rem]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSidebarCollapsed((current) => !current)}
                className="hidden lg:inline-flex text-text-subtle hover:text-text-base px-2 py-1 rounded-lg hover:bg-surface-muted"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? '›' : '‹'}
              </button>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-text-subtle hover:text-text-base"
                aria-label="Close sidebar"
              >
                ✕
              </button>
            </div>
          </div>

          <nav className={`flex-1 py-6 space-y-2 overflow-y-auto ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  aria-label={item.label}
                  className={`sidebar-link ${isActive ? 'active' : ''} ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className={`text-sm ${sidebarCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className={`py-4 border-t border-line-soft ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
            <div className={`flex items-center gap-3 mb-3 ${sidebarCollapsed ? 'lg:justify-center' : ''}`}>
              <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || userFallback}
              </div>
              <div className={`flex-1 min-w-0 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                <p className="text-sm font-medium text-text-base truncate">{user?.name || 'Account'}</p>
                <p className="text-xs text-text-subtle truncate">{user?.email || ''}</p>
              </div>
            </div>
            <Button variant="outline" className={`w-full ${sidebarCollapsed ? 'lg:px-2' : ''}`} onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className={`${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'} transition-all duration-300`}>
        <header className="app-header h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-text-subtle hover:text-text-base"
            aria-label="Open sidebar"
          >
            ☰
          </button>
          <div className="flex items-center gap-4 min-w-0">
            <div className="hidden md:block lg:hidden">
              <Logo variant="compact" alt="SiliconMeta Learning" className="h-8 w-auto max-w-[10rem]" />
            </div>
            <div className="hidden lg:block">
              <Logo variant="product" alt="SiliconMeta Learning" className="h-10 w-auto max-w-[12rem]" />
            </div>
            <div className="md:hidden">
              <Logo variant="short" alt="SiliconMeta Learning" className="h-8 w-auto max-w-[8rem]" />
            </div>
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
