import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Transaction Analysis', href: '/evidence/upload', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Link Checker', href: '/links/check', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
    { name: 'SMS Checker', href: '/sms/check', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { name: 'Voice Detector', href: '/voice/detect', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
    { name: 'Fake Account Intel', href: '/social/accounts', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z M19 10a7 7 0 11-14 0 7 7 0 0114 0z' },
  ];

  const isActive = (path) => location.pathname === path;
  const isDashboard = location.pathname === '/dashboard';
  
  // Check if current page is a public page (Landing, Login, Register)
  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);

  // Theme state for dashboard (dark / light)
  const [theme, setTheme] = useState('dark');

  // Load stored theme preference
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('secure-upi-theme');
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored);
      }
    } catch {
      // Ignore if localStorage is not available
    }
  }, []);

  // Persist theme preference
  useEffect(() => {
    try {
      window.localStorage.setItem('secure-upi-theme', theme);
    } catch {
      // Ignore errors
    }
  }, [theme]);

  // Scroll to top on route change (only if no hash) - SIMPLIFIED
  useEffect(() => {
    // Only scroll to top if there's no hash in the URL
    if (!window.location.hash) {
      // Simple, direct scroll - no animation to prevent conflicts
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark'
          ? 'bg-slate-950'
          : 'bg-gray-50'
      }`}
    >
      {!isPublicPage && (
        <nav className={`${theme === 'dark' ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-r from-gray-50 via-white to-gray-50'} border-b-2 ${theme === 'dark' ? 'border-cyan-500/40' : 'border-cyan-500/30'} relative overflow-hidden`}>
        {/* Animated grid pattern background */}
        <div className={`absolute inset-0 ${theme === 'dark' ? 'opacity-10' : 'opacity-5'}`} style={{
          backgroundImage: `linear-gradient(${theme === 'dark' ? '#06b6d4' : '#0891b2'} 1px, transparent 1px), linear-gradient(90deg, ${theme === 'dark' ? '#06b6d4' : '#0891b2'} 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}></div>
        
        {/* Top scan line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse"></div>
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>

        <div className="w-full px-3 sm:px-4 lg:px-6 relative z-10">
          <div className="flex items-center justify-between h-20 gap-2">
            {/* Left: Logo with Terminal Prompt Style */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <Link to="/dashboard" className="group relative">
                {/* Hex code indicator */}
                <div className={`absolute -left-8 top-1/2 -translate-y-1/2 text-[8px] font-mono ${theme === 'dark' ? 'text-cyan-500/50' : 'text-cyan-600/50'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  0x01
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Terminal prompt indicator */}
                  <div className={`flex items-center space-x-1 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'} font-mono text-xs`}>
                    <span className="animate-pulse">●</span>
                    <span className="hidden sm:inline">root@</span>
                  </div>
                  
                  {/* Logo icon with circuit board style */}
                  <div className={`relative ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} border-2 ${theme === 'dark' ? 'border-cyan-500/60' : 'border-cyan-500/50'} p-2 rounded group-hover:border-cyan-400 transition-all shadow-lg`}>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  
                  {/* Brand text with ASCII art style */}
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-mono font-black ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-600'} tracking-tight`}>
                        {'>'} SECURE_ME
                      </span>
                      <span className={`text-xs font-mono ${theme === 'dark' ? 'text-green-400' : 'text-green-600'} animate-pulse`}>
                        [ONLINE]
                      </span>
                    </div>
                    <div className={`text-[10px] font-mono ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'} flex items-center space-x-1`}>
                      <span>└─</span>
                      <span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>AI_FRAUD_DETECTION</span>
                      <span className={theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}>v2.0.1</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Center: Navigation with Hex Codes */}
            <div className="hidden lg:flex items-center space-x-0.5 flex-1 justify-center">
              {navigation.map((item, idx) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative px-2 sm:px-2.5 py-2.5 text-[10px] font-mono font-bold transition-all group ${
                    isActive(item.href)
                      ? theme === 'dark'
                        ? 'bg-cyan-500/20 text-cyan-300 border-l-2 border-r-2 border-cyan-500'
                        : 'bg-cyan-50 text-cyan-700 border-l-2 border-r-2 border-cyan-500'
                      : theme === 'dark'
                        ? 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/30 border-l-2 border-r-2 border-transparent hover:border-cyan-500/30'
                        : 'text-gray-500 hover:text-cyan-600 hover:bg-gray-100 border-l-2 border-r-2 border-transparent hover:border-cyan-500/30'
                  }`}
                >
                  {/* Hex code prefix */}
                  <div className={`absolute -top-1 left-1 text-[7px] ${theme === 'dark' ? 'text-cyan-500/40' : 'text-cyan-600/40'} font-mono`}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  
                  {/* Active indicator line */}
                  {isActive(item.href) && (
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-500'} animate-pulse`}></div>
                  )}
                  
                  <span className="relative z-10 block leading-tight">
                    {item.name.split(' ')[0]}
                    <br />
                    <span className="text-[8px] opacity-70">{item.name.split(' ').slice(1).join(' ')}</span>
                  </span>
                </Link>
              ))}
            </div>

            {/* Right: System Status & Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {/* Educate Me Button */}
              <button
                type="button"
                onClick={() => {
                  if (location.pathname === '/dashboard') {
                    // Scroll to education section if on dashboard - SIMPLIFIED
                    const educationSection = document.getElementById('scam-education-section');
                    if (educationSection) {
                      educationSection.scrollIntoView({ behavior: 'auto', block: 'start' });
                    }
                  } else {
                    // Navigate to dashboard first, then scroll
                    navigate('/dashboard#scam-education-section');
                  }
                }}
                className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded border-2 text-[10px] font-mono font-bold transition-all group ${
                  theme === 'dark'
                    ? 'border-blue-500/60 bg-slate-900/80 text-blue-300 hover:bg-slate-800 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/30'
                    : 'border-blue-500/50 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-400'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>EDUCATE</span>
              </button>

              {/* System Status Indicator */}
              <div className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded border ${theme === 'dark' ? 'bg-slate-900/80 border-green-500/50' : 'bg-green-50 border-green-500/50'}`}>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className={`text-[10px] font-mono font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
                  SYS_OK
                </span>
              </div>

              {/* Theme Toggle - Icon Only */}
              <button
                type="button"
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-lg border-2 transition-all opacity-60 hover:opacity-100 hover:scale-110 ${
                  theme === 'dark'
                    ? 'border-yellow-500/60 bg-slate-900/80 text-yellow-300 hover:bg-slate-800 hover:border-yellow-400'
                    : 'border-yellow-500/50 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:border-yellow-400'
                }`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* User Profile - Terminal Style */}
              <Link
                to="/profile"
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded border-2 transition-all group ${
                  theme === 'dark'
                    ? 'border-cyan-500/40 bg-slate-900/80 hover:border-cyan-400 hover:bg-slate-800'
                    : 'border-cyan-500/30 bg-white hover:border-cyan-400 hover:bg-gray-50'
                }`}
              >
                <div className={`w-7 h-7 rounded border-2 ${theme === 'dark' ? 'border-cyan-400/50 bg-slate-800' : 'border-cyan-500/50 bg-gray-100'} flex items-center justify-center`}>
                  <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="hidden lg:block">
                  <div className={`text-[10px] font-mono font-bold ${theme === 'dark' ? 'text-cyan-300' : 'text-gray-900'}`}>
                    {user?.name?.toUpperCase().split(' ')[0] || 'USER'}
                  </div>
                  <div className={`text-[8px] font-mono ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                    ID: {user?.id?.toString().slice(0, 6) || '000000'}
                  </div>
                </div>
              </Link>

              {/* Logout Button - Terminal Style */}
              <button
                type="button"
                onClick={handleLogout}
                className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded border-2 text-[10px] font-mono font-bold transition-all group ${
                  theme === 'dark'
                    ? 'border-red-500/60 bg-slate-900/80 text-red-300 hover:bg-slate-800 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/30'
                    : 'border-red-500/50 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-400'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>LOGOUT</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2 rounded border-2 transition-all ${
                  theme === 'dark'
                    ? 'text-cyan-300 border-cyan-500/40 hover:bg-slate-800 hover:border-cyan-400'
                    : 'text-gray-600 border-gray-300 hover:bg-gray-100 hover:border-cyan-500'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu - Terminal Style */}
          {mobileMenuOpen && (
            <div className={`lg:hidden border-t-2 ${theme === 'dark' ? 'border-cyan-500/30 bg-slate-900/90' : 'border-cyan-500/20 bg-gray-50'} py-3 backdrop-blur-xl px-3 sm:px-4`}>
              <div className="space-y-0.5">
                {navigation.map((item, idx) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-2.5 text-xs font-mono font-semibold transition-all ${
                      isActive(item.href)
                        ? theme === 'dark'
                          ? 'bg-cyan-500/20 text-cyan-300 border-l-4 border-cyan-500'
                          : 'bg-cyan-50 text-cyan-700 border-l-4 border-cyan-500'
                        : theme === 'dark'
                          ? 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/50 border-l-4 border-transparent hover:border-cyan-500/40'
                          : 'text-gray-600 hover:text-cyan-600 hover:bg-gray-50 border-l-4 border-transparent hover:border-cyan-500/30'
                    }`}
                  >
                    <span className={`text-[10px] ${theme === 'dark' ? 'text-cyan-500/50' : 'text-cyan-600/50'}`}>
                      [{String(idx + 1).padStart(2, '0')}]
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span>{item.name.toUpperCase().replace(/\s/g, '_')}</span>
                  </Link>
                ))}
                
                {/* Mobile Menu - Additional Actions */}
                <div className="pt-3 mt-3 border-t-2 border-cyan-500/20 space-y-2 px-4">
                  {/* Educate Me Button Mobile */}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (location.pathname === '/dashboard') {
                        // SIMPLIFIED - no requestAnimationFrame
                        const educationSection = document.getElementById('scam-education-section');
                        if (educationSection) {
                          educationSection.scrollIntoView({ behavior: 'auto', block: 'start' });
                        }
                      } else {
                        navigate('/dashboard#scam-education-section');
                      }
                    }}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded border-2 text-xs font-mono font-bold transition-all ${
                      theme === 'dark'
                        ? 'border-blue-500/60 bg-slate-900/80 text-blue-300 hover:bg-slate-800 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/30'
                        : 'border-blue-500/50 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-400'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>EDUCATE_ME</span>
                  </button>

                  {/* Theme Toggle Mobile - Icon Only */}
                  <button
                    type="button"
                    onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                    className={`w-full flex items-center justify-center py-2.5 rounded border-2 transition-all opacity-60 hover:opacity-100 ${
                      theme === 'dark'
                        ? 'border-yellow-500/60 bg-slate-900/80 text-yellow-300 hover:bg-slate-800 hover:border-yellow-400'
                        : 'border-yellow-500/50 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:border-yellow-400'
                    }`}
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Logout Mobile */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded border-2 text-xs font-mono font-bold transition-all ${
                      theme === 'dark'
                        ? 'border-red-500/60 bg-slate-900/80 text-red-300 hover:bg-slate-800 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/30'
                        : 'border-red-500/50 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-400'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>LOGOUT</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      )}
      
      <main className="py-0">
        <Outlet context={{ theme, setTheme }} />
      </main>
      
      {location.pathname === '/' && (
        <footer className={`${theme === 'dark' ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'} border-t-2 ${theme === 'dark' ? 'border-cyan-500/40' : 'border-cyan-500/30'} relative overflow-hidden mt-auto`}>
          {/* Grid Pattern Background */}
          <div className={`absolute inset-0 ${theme === 'dark' ? 'opacity-10' : 'opacity-5'}`} style={{
            backgroundImage: `linear-gradient(${theme === 'dark' ? '#06b6d4' : '#0891b2'} 1px, transparent 1px), linear-gradient(90deg, ${theme === 'dark' ? '#06b6d4' : '#0891b2'} 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}></div>
          
          {/* Diagonal Lines Overlay */}
          <div className={`absolute inset-0 ${theme === 'dark' ? 'opacity-5' : 'opacity-3'}`} style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${theme === 'dark' ? '#06b6d4' : '#0891b2'} 10px, ${theme === 'dark' ? '#06b6d4' : '#0891b2'} 20px)`,
          }}></div>
          
          {/* Bottom Gradient Bar */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${theme === 'dark' ? 'bg-gradient-to-r from-blue-900 via-cyan-500 to-blue-900' : 'bg-gradient-to-r from-blue-200 via-cyan-400 to-blue-200'}`}></div>
          
          {/* Scan Line Effect */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent animate-pulse"></div>
          
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Left Column - Brand Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-green-400' : 'bg-green-500'} animate-pulse`}></div>
                  <h3 className={`text-sm font-mono font-bold ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-600'}`}>
                    SECURE_ME
                  </h3>
                </div>
                <p className={`text-xs font-mono leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                  Advanced AI-powered fraud detection system protecting digital transactions and content integrity.
                </p>
                <div className={`flex items-center space-x-2 text-xs font-mono ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                  <span>Version:</span>
                  <span className={theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}>v2.4.1</span>
                </div>
              </div>
              
              {/* Center Column - Quick Links */}
              <div className="space-y-3">
                <h3 className={`text-sm font-mono font-bold ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-600'}`}>
                  QUICK_LINKS
                </h3>
                <div className="space-y-2">
                  <Link to="/dashboard" className={`block text-xs font-mono hover:underline transition-all ${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-gray-600 hover:text-cyan-600'}`}>
                    {'>'} Dashboard
                  </Link>
                  <Link to="/evidence/upload" className={`block text-xs font-mono hover:underline transition-all ${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-gray-600 hover:text-cyan-600'}`}>
                    {'>'} Transaction Analysis
                  </Link>
                  <Link to="/links/check" className={`block text-xs font-mono hover:underline transition-all ${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-gray-600 hover:text-cyan-600'}`}>
                    {'>'} Link Scanner
                  </Link>
                  <Link to="/profile" className={`block text-xs font-mono hover:underline transition-all ${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-gray-600 hover:text-cyan-600'}`}>
                    {'>'} Profile Settings
                  </Link>
                </div>
              </div>
              
              {/* Right Column - System Status */}
              <div className="space-y-3">
                <h3 className={`text-sm font-mono font-bold ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-600'}`}>
                  SYSTEM_STATUS
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>AI Engine:</span>
                    <span className={`text-xs font-mono font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>ONLINE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Database:</span>
                    <span className={`text-xs font-mono font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>SYNCED</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>ML Service:</span>
                    <span className={`text-xs font-mono font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Uptime:</span>
                    <span className={`text-xs font-mono font-bold ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>99.9%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Divider */}
            <div className={`h-px ${theme === 'dark' ? 'bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent' : 'bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent'} mb-4`}></div>
            
            {/* Copyright & Legal */}
            <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
              <p className={`text-xs font-mono text-center md:text-left ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                <span className={theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}>{'>'}</span>
                {' '}
                <span className={theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}>© {new Date().getFullYear()} SECURE_ME</span>
                {' '}
                <span className={theme === 'dark' ? 'text-slate-600' : 'text-gray-400'}>|</span>
                {' '}
                <span className={theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}>ALL_RIGHTS_RESERVED</span>
                {' '}
                <span className={theme === 'dark' ? 'text-slate-600' : 'text-gray-400'}>|</span>
            {' '}
            <span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>POWERED_BY_AI_&_ML</span>
          </p>
              
              <div className="flex items-center space-x-4">
                <span className={`text-xs font-mono ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
                  <span className={theme === 'dark' ? 'text-cyan-500' : 'text-cyan-600'}>[</span>
                  <span className={theme === 'dark' ? 'text-green-400' : 'text-green-600'}>SECURE</span>
                  <span className={theme === 'dark' ? 'text-cyan-500' : 'text-cyan-600'}>]</span>
                </span>
                <span className={`text-xs font-mono ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
                  <span className={theme === 'dark' ? 'text-cyan-500' : 'text-cyan-600'}>[</span>
                  <span className={theme === 'dark' ? 'text-green-400' : 'text-green-600'}>ENCRYPTED</span>
                  <span className={theme === 'dark' ? 'text-cyan-500' : 'text-cyan-600'}>]</span>
                </span>
              </div>
            </div>
        </div>
      </footer>
      )}
    </div>
  );
};

export default Layout;


