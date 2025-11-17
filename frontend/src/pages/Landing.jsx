import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';

const Landing = () => {
  const outletContext = useOutletContext ? useOutletContext() : {};
  const [theme, setTheme] = useState(() => {
    try {
      const stored = window.localStorage.getItem('secure-upi-theme');
      return stored === 'light' || stored === 'dark' ? stored : 'dark';
    } catch {
      return 'dark';
    }
  });
  const isDark = theme === 'dark';
  
  const { isAuthenticated } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [glitchText, setGlitchText] = useState('SECURE_ME');
  const [matrixRain, setMatrixRain] = useState([]);
  const heroRef = useRef(null);
  const canvasRef = useRef(null);

  // Sync with outletContext theme if available
  useEffect(() => {
    if (outletContext?.theme) {
      setTheme(outletContext.theme);
    }
  }, [outletContext?.theme]);

  // Persist theme preference
  useEffect(() => {
    try {
      window.localStorage.setItem('secure-upi-theme', theme);
    } catch {
      // Ignore errors
    }
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    // Also update outletContext if available
    if (outletContext?.setTheme) {
      outletContext.setTheme(newTheme);
    }
  };

  useEffect(() => {
    setIsVisible(true);
    
    // Initialize matrix rain
    const columns = Math.floor(window.innerWidth / 20);
    const drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -100);
    }
    setMatrixRain(drops);

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Glitch effect on text
    const glitchInterval = setInterval(() => {
      const chars = '!<>-_\\/[]{}—=+*^?#________';
      const glitched = 'SECURE_ME'.split('').map((char, i) => 
        Math.random() > 0.9 ? chars[Math.floor(Math.random() * chars.length)] : char
      ).join('');
      setGlitchText(glitched);
      setTimeout(() => setGlitchText('SECURE_ME'), 50);
    }, 3000);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(glitchInterval);
    };
  }, []);

  const features = [
    {
      icon: '🤖',
      title: 'AI_NEURAL_NET',
      description: 'Military-grade machine learning algorithms that evolve with emerging threat patterns',
      gradient: 'from-cyan-500 via-blue-500 to-purple-600',
      code: '0x01',
      status: 'ACTIVE'
    },
    {
      icon: '⚡',
      title: 'QUANTUM_SPEED',
      description: 'Sub-millisecond transaction verification with distributed processing nodes',
      gradient: 'from-green-500 via-emerald-500 to-cyan-600',
      code: '0x02',
      status: 'ONLINE'
    },
    {
      icon: '🛡️',
      title: 'CRYPTO_VAULT',
      description: 'AES-256 encryption with zero-knowledge architecture for maximum privacy',
      gradient: 'from-purple-500 via-pink-500 to-red-600',
      code: '0x03',
      status: 'SECURE'
    },
    {
      icon: '📊',
      title: 'DATA_MINING',
      description: 'Real-time pattern recognition across millions of transaction signatures',
      gradient: 'from-orange-500 via-yellow-500 to-red-600',
      code: '0x04',
      status: 'SCANNING'
    },
    {
      icon: '🎯',
      title: 'PRECISION_99.9',
      description: 'Industry-leading accuracy with adaptive learning algorithms',
      gradient: 'from-blue-500 via-indigo-500 to-purple-600',
      code: '0x05',
      status: 'LOCKED'
    },
    {
      icon: '🚀',
      title: 'INSTANT_ALERT',
      description: 'Multi-channel notification system with predictive threat analysis',
      gradient: 'from-pink-500 via-rose-500 to-purple-600',
      code: '0x06',
      status: 'LIVE'
    }
  ];

  const stats = [
    { value: '50K+', label: 'PROTECTED_NODES', icon: '👥', hex: '0xA1' },
    { value: '₹500CR', label: 'FRAUD_BLOCKED', icon: '💰', hex: '0xB2' },
    { value: '99.9%', label: 'ACCURACY_RATE', icon: '🎯', hex: '0xC3' },
    { value: '<100MS', label: 'RESPONSE_TIME', icon: '⚡', hex: '0xD4' }
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Theme Toggle Button - Top Right Corner */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 flex items-center justify-center w-8 h-8 rounded-lg opacity-40 hover:opacity-100 transition-all duration-300 hover:scale-110"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Matrix Rain Background */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${isDark ? '#0f0' : '#00ff00'} 2px, ${isDark ? '#0f0' : '#00ff00'} 4px)`,
          backgroundSize: '100% 4px',
          animation: 'matrix-scroll 20s linear infinite'
        }}></div>
      </div>

      {/* Cyber Grid */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(${isDark ? 'rgba(0, 255, 255, 0.1)' : 'rgba(0, 150, 150, 0.1)'} 1px, transparent 1px),
            linear-gradient(90deg, ${isDark ? 'rgba(0, 255, 255, 0.1)' : 'rgba(0, 150, 150, 0.1)'} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `translateY(${scrollY * 0.5}px) perspective(500px) rotateX(60deg)`,
          transformOrigin: 'center top'
        }}
      ></div>

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${isDark ? '#0ff' : '#00bfbf'} 2px, ${isDark ? '#0ff' : '#00bfbf'} 4px)`,
        animation: 'scanline 8s linear infinite'
      }}></div>

      {/* Glowing Orbs with Neon Colors */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,255,0.3) 0%, transparent 70%)',
            left: `${mousePosition.x * 0.02}px`,
            top: `${mousePosition.y * 0.02}px`,
          }}
        ></div>
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,0,0.3) 0%, transparent 70%)',
            right: `${mousePosition.x * 0.01}px`,
            bottom: `${mousePosition.y * 0.01}px`,
            animationDelay: '1s'
          }}
        ></div>
        <div 
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(255,0,255,0.3) 0%, transparent 70%)',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`,
            animationDelay: '0.5s'
          }}
        ></div>
      </div>

      {/* Hexagon Pattern Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z' fill='none' stroke='%2300ffff' stroke-width='1'/%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px'
      }}></div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section 
          ref={heroRef}
          className="min-h-screen flex items-center justify-center px-4 pt-8 pb-20"
        >
          <div className={`max-w-7xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Terminal Status Bar */}
            <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-lg backdrop-blur-xl border mb-8 font-mono animate-float ${
              isDark 
                ? 'bg-black/50 border-cyan-500/50 shadow-lg shadow-cyan-500/50' 
                : 'bg-white/50 border-cyan-600/50 shadow-lg shadow-cyan-600/30'
            }`}>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className={`text-xs font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                SYSTEM_STATUS
              </span>
              <span className={`text-xs ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>:</span>
              <span className={`text-xs font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                ONLINE
              </span>
              <span className={`text-xs ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>|</span>
              <span className={`text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                AI_CORE
              </span>
              <span className={`text-xs ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>:</span>
              <span className={`text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                ACTIVE
              </span>
            </div>

            {/* Glitch Text Heading */}
            <div className="mb-8">
              <div className={`text-sm font-mono mb-2 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                {'>'} INITIALIZING_SECURITY_PROTOCOL...
              </div>
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-4 leading-tight font-mono relative">
                <span className="absolute inset-0 animate-glitch-1" style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
                  color: isDark ? '#ff0080' : '#cc0066'
                }}>
                  [{glitchText}]
                </span>
                <span className="absolute inset-0 animate-glitch-2" style={{
                  clipPath: 'polygon(0 60%, 100% 60%, 100% 100%, 0 100%)',
                  color: isDark ? '#00ffff' : '#00cccc'
                }}>
                  [{glitchText}]
                </span>
                <span className={`relative ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  [{glitchText}]
                </span>
        </h1>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-mono">
                <span className={`${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{'>> '}</span>
                <span className="bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-text">
                  FRAUD_DETECTION_SYSTEM
                </span>
              </div>
            </div>

            {/* Terminal Description */}
            <div className={`max-w-4xl mx-auto mb-12 font-mono text-left ${isDark ? 'bg-black/50' : 'bg-white/50'} backdrop-blur-xl border ${isDark ? 'border-cyan-500/30' : 'border-cyan-600/30'} rounded-lg p-6 shadow-lg ${isDark ? 'shadow-cyan-500/20' : 'shadow-cyan-600/20'}`}>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className={`text-xs ml-2 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>root@secure-upi:~$</span>
              </div>
              <p className={`text-base sm:text-lg leading-relaxed ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                <span className={isDark ? 'text-cyan-400' : 'text-cyan-600'}>$</span> cat system_info.txt<br/>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{'> '}</span>Protect your transactions with 
                <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}> MILITARY-GRADE_AI</span>
                <br/>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{'> '}</span>Real-time analysis with 
                <span className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}> QUANTUM_SPEED</span>
                <br/>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{'> '}</span>Security powered by 
                <span className={`font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}> NEURAL_NETWORKS</span>
          </p>
        </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
                  className={`group relative px-12 py-6 text-xl font-bold font-mono rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 border-2 ${
                    isDark
                      ? 'border-cyan-500 bg-black text-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/50'
                      : 'border-cyan-600 bg-white text-cyan-600 hover:shadow-2xl hover:shadow-cyan-600/30'
                  }`}
                >
                  <div className={`absolute inset-0 ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-600/20'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  <span className="relative flex items-center space-x-2">
                    <span>{'['} ACCESS_DASHBOARD {']'}</span>
                    <span className="animate-pulse">→</span>
                  </span>
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                    className={`group relative px-12 py-6 text-xl font-bold font-mono rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 border-2 ${
                      isDark
                        ? 'border-green-500 bg-green-500/20 text-green-400 hover:shadow-2xl hover:shadow-green-500/50'
                        : 'border-green-600 bg-green-50 text-green-600 hover:shadow-2xl hover:shadow-green-600/30'
                    }`}
                  >
                    <div className={`absolute inset-0 ${isDark ? 'bg-green-500/30' : 'bg-green-600/30'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                    <span className="relative flex items-center space-x-2">
                      <span>{'['} INITIALIZE_ACCOUNT {']'}</span>
                      <span className="animate-pulse">→</span>
                    </span>
              </Link>
              <Link
                to="/login"
                    className={`group relative px-12 py-6 text-xl font-bold font-mono rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 backdrop-blur-xl border-2 ${
                      isDark 
                        ? 'bg-black/50 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/10 hover:shadow-lg hover:shadow-cyan-500/30' 
                        : 'bg-white/50 text-cyan-600 border-cyan-600/50 hover:bg-cyan-50 hover:shadow-lg hover:shadow-cyan-600/20'
                    }`}
                  >
                    <span className="relative flex items-center space-x-2">
                      <span>{'['} LOGIN_SYSTEM {']'}</span>
                      <span>↗</span>
                    </span>
              </Link>
            </>
          )}
        </div>

            {/* Stats Grid with Hex Codes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className={`backdrop-blur-xl rounded-lg p-6 border-2 transition-all duration-300 hover:scale-105 cursor-pointer font-mono relative overflow-hidden group ${
                    isDark 
                      ? 'bg-black/50 border-cyan-500/30 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/50' 
                      : 'bg-white/50 border-cyan-600/30 hover:border-cyan-600 hover:shadow-lg hover:shadow-cyan-600/30'
                  }`}
                  style={{
                    animation: `float 3s ease-in-out infinite`,
                    animationDelay: `${idx * 0.2}s`
                  }}
                >
                  {/* Corner Brackets */}
                  <div className={`absolute top-2 left-2 text-xs ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`}>┌</div>
                  <div className={`absolute top-2 right-2 text-xs ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`}>┐</div>
                  <div className={`absolute bottom-2 left-2 text-xs ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`}>└</div>
                  <div className={`absolute bottom-2 right-2 text-xs ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`}>┘</div>
                  
                  {/* Hex Code */}
                  <div className={`text-[10px] mb-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{stat.hex}</div>
                  
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className={`text-2xl sm:text-3xl font-black mb-1 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                    {stat.value}
                  </div>
                  <div className={`text-[10px] font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-20">
              <div className={`text-sm font-mono mb-3 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                {'>'} LOADING_SYSTEM_MODULES...
              </div>
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 font-mono">
                <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{'['}</span>
                <span className="bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-text">
                  CORE_MODULES
                </span>
                <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{']'}</span>
              </h2>
              <p className={`text-lg font-mono max-w-3xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className={isDark ? 'text-green-400' : 'text-green-600'}>$</span> Six powerful modules engineered for maximum security
            </p>
          </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className={`group relative backdrop-blur-xl rounded-lg p-8 border-2 transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden ${
                    isDark 
                      ? 'bg-black/50 border-cyan-500/30 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/50' 
                      : 'bg-white/50 border-cyan-600/30 hover:border-cyan-600 hover:shadow-lg hover:shadow-cyan-600/30'
                  }`}
                  style={{
                    animationDelay: feature.code
                  }}
                >
                  {/* Corner Brackets */}
                  <div className={`absolute top-3 left-3 text-sm font-mono ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`}>╔</div>
                  <div className={`absolute top-3 right-3 text-sm font-mono ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`}>╗</div>
                  <div className={`absolute bottom-3 left-3 text-sm font-mono ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`}>╚</div>
                  <div className={`absolute bottom-3 right-3 text-sm font-mono ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`}>╝</div>

                  {/* Animated Gradient Line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  
                  {/* Header with Status */}
                  <div className="relative flex items-center justify-between mb-6">
                    <div className={`text-xs font-mono font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                      {feature.code}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className={`text-xs font-mono font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        {feature.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br ${feature.gradient} text-white text-3xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg`}>
                      {feature.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className={`text-xl font-black mb-4 font-mono ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                    {'>'} {feature.title}
                  </h3>
                  <p className={`text-sm leading-relaxed font-mono ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>

                  {/* Footer */}
                  <div className={`mt-6 flex items-center space-x-2 font-mono text-sm font-bold ${isDark ? 'text-green-400' : 'text-green-600'} group-hover:translate-x-2 transition-transform duration-300`}>
                    <span>{'['}</span>
                    <span>DEPLOY</span>
                    <span>{']'}</span>
                    <span className="animate-pulse">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <div className={`backdrop-blur-xl rounded-lg p-12 md:p-20 border-2 relative overflow-hidden ${
              isDark 
                ? 'bg-black/50 border-cyan-500/30 shadow-lg shadow-cyan-500/20' 
                : 'bg-white/50 border-cyan-600/30 shadow-lg shadow-cyan-600/20'
            }`}>
              {/* Corner Brackets */}
              <div className={`absolute top-6 left-6 text-2xl font-mono ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`}>╔═</div>
              <div className={`absolute top-6 right-6 text-2xl font-mono ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`}>═╗</div>
              <div className={`absolute bottom-6 left-6 text-2xl font-mono ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`}>╚═</div>
              <div className={`absolute bottom-6 right-6 text-2xl font-mono ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`}>═╝</div>
              
              <div className="relative z-10 text-center">
                <div className={`text-sm font-mono mb-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                  {'>'} NETWORK_STATUS
          </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-8 font-mono">
                  <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {'['} TRUSTED_BY {'['}
                  </span>
                  <span className="block bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-text">
                    50,000+ USERS
                  </span>
                  <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {']'}
                  </span>
                </h2>
                <p className={`text-lg md:text-xl mb-12 max-w-3xl mx-auto font-mono ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className={isDark ? 'text-green-400' : 'text-green-600'}>$</span> Join the network protecting millions in transactions
                </p>
                
                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center gap-6 mb-12">
                  {[
                    { text: 'AWARD_WINNING', icon: '🏆' },
                    { text: 'BANK_SECURITY', icon: '🔒' },
                    { text: 'QUANTUM_FAST', icon: '⚡' },
                    { text: '5_STAR_RATED', icon: '⭐' }
                  ].map((badge, idx) => (
                    <div
                      key={idx}
                      className={`backdrop-blur-xl rounded-lg px-6 py-4 border-2 font-mono font-bold text-sm flex items-center space-x-2 ${
                        isDark 
                          ? 'bg-black/50 border-green-500/50 text-green-400 hover:shadow-lg hover:shadow-green-500/30' 
                          : 'bg-white/50 border-green-600/50 text-green-600 hover:shadow-lg hover:shadow-green-600/20'
                      } transition-all hover:scale-105`}
                    >
                      <span>{badge.icon}</span>
                      <span>{'['}</span>
                      <span>{badge.text}</span>
                      <span>{']'}</span>
                    </div>
                  ))}
                </div>

                {/* Final CTA */}
                {!isAuthenticated && (
                  <Link
                    to="/register"
                    className={`inline-flex items-center space-x-3 px-12 py-6 text-xl font-bold font-mono rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                      isDark
                        ? 'bg-green-500/20 border-green-500 text-green-400 hover:shadow-2xl hover:shadow-green-500/50'
                        : 'bg-green-50 border-green-600 text-green-600 hover:shadow-2xl hover:shadow-green-600/30'
                    }`}
                  >
                    <span>{'['} DEPLOY_NOW {']'}</span>
                    <span className="text-2xl animate-pulse">→</span>
                  </Link>
                )}
          </div>
        </div>
      </div>
        </section>

        {/* Footer */}
        <footer className={`${isDark ? 'bg-gradient-to-b from-black via-slate-950 to-black' : 'bg-gradient-to-b from-slate-100 via-cyan-50/30 to-slate-100'} border-t-2 ${isDark ? 'border-cyan-500/40' : 'border-cyan-600/50'} relative overflow-hidden`}>
          {/* Grid Pattern Background */}
          <div className={`absolute inset-0 ${isDark ? 'opacity-10' : 'opacity-15'}`} style={{
            backgroundImage: `linear-gradient(${isDark ? '#00ffff' : '#0891b2'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#00ffff' : '#0891b2'} 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}></div>
          
          {/* Diagonal Lines Overlay */}
          <div className={`absolute inset-0 ${isDark ? 'opacity-5' : 'opacity-10'}`} style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${isDark ? '#00ffff' : '#0891b2'} 10px, ${isDark ? '#00ffff' : '#0891b2'} 20px)`,
          }}></div>
          
          {/* Bottom Gradient Bar */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${isDark ? 'bg-gradient-to-r from-blue-900 via-cyan-500 to-blue-900' : 'bg-gradient-to-r from-blue-200 via-cyan-400 to-blue-200 opacity-30'}`}></div>
          
          {/* Scan Line Effect */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent animate-pulse"></div>
          
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {/* Column 1 - About */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-green-400' : 'bg-green-500'} animate-pulse`}></div>
                  <h3 className={`text-sm font-mono font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                    ABOUT_SYSTEM
                  </h3>
                </div>
                <p className={`text-xs font-mono leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>
                  Advanced AI-powered fraud detection platform protecting digital transactions with military-grade security and real-time threat analysis.
                </p>
                <div className={`flex items-center space-x-2 text-xs font-mono ${isDark ? 'text-slate-500' : 'text-gray-700'}`}>
                  <span>Version:</span>
                  <span className={isDark ? 'text-cyan-400' : 'text-cyan-700'}>v2.4.1</span>
                </div>
                <div className={`flex items-center space-x-2 text-xs font-mono ${isDark ? 'text-slate-500' : 'text-gray-700'}`}>
                  <span>Status:</span>
                  <span className={`${isDark ? 'text-green-400' : 'text-green-700'}`}>OPERATIONAL</span>
                </div>
              </div>
              
              {/* Column 2 - Quick Links */}
              <div className="space-y-4">
                <h3 className={`text-sm font-mono font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  QUICK_LINKS
                </h3>
                <div className="space-y-2">
                  <Link to="/dashboard" className={`block text-xs font-mono hover:underline transition-all ${isDark ? 'text-slate-400 hover:text-cyan-400' : 'text-gray-700 hover:text-cyan-700'}`}>
                    {'>'} Dashboard
                  </Link>
                  <Link to="/evidence/upload" className={`block text-xs font-mono hover:underline transition-all ${isDark ? 'text-slate-400 hover:text-cyan-400' : 'text-gray-700 hover:text-cyan-700'}`}>
                    {'>'} Transaction Analysis
                  </Link>
                  <Link to="/links/check" className={`block text-xs font-mono hover:underline transition-all ${isDark ? 'text-slate-400 hover:text-cyan-400' : 'text-gray-700 hover:text-cyan-700'}`}>
                    {'>'} Link Scanner
                  </Link>
                  <Link to="/sms/check" className={`block text-xs font-mono hover:underline transition-all ${isDark ? 'text-slate-400 hover:text-cyan-400' : 'text-gray-700 hover:text-cyan-700'}`}>
                    {'>'} SMS Analyzer
                  </Link>
                  <Link to="/deepfake/detect" className={`block text-xs font-mono hover:underline transition-all ${isDark ? 'text-slate-400 hover:text-cyan-400' : 'text-gray-700 hover:text-cyan-700'}`}>
                    {'>'} Deepfake Detector
                  </Link>
                  <Link to="/voice/detect" className={`block text-xs font-mono hover:underline transition-all ${isDark ? 'text-slate-400 hover:text-cyan-400' : 'text-gray-700 hover:text-cyan-700'}`}>
                    {'>'} Voice Analyzer
                  </Link>
                </div>
              </div>
              
              {/* Column 3 - Features */}
              <div className="space-y-4">
                <h3 className={`text-sm font-mono font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  FEATURES
                </h3>
                <div className="space-y-2">
                  <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>
                    {'>'} AI Neural Networks
                  </div>
                  <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>
                    {'>'} Real-time Analysis
                  </div>
                  <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>
                    {'>'} Quantum Speed Processing
                  </div>
                  <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>
                    {'>'} AES-256 Encryption
                  </div>
                  <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>
                    {'>'} Pattern Recognition
                  </div>
                  <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>
                    {'>'} Threat Intelligence
                  </div>
                </div>
              </div>
              
              {/* Column 4 - Contact & Support */}
              <div className="space-y-4">
                <h3 className={`text-sm font-mono font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  SUPPORT
                </h3>
                <div className="space-y-2">
                  <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>
                    <span className={isDark ? 'text-cyan-400' : 'text-cyan-700'}>Email:</span> support@secure-me.com
                  </div>
                  <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>
                    <span className={isDark ? 'text-cyan-400' : 'text-cyan-700'}>Response:</span> {'<'} 24 hours
                  </div>
                  <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>
                    <span className={isDark ? 'text-cyan-400' : 'text-cyan-700'}>Status:</span> 24/7 Monitoring
                  </div>
                </div>
                
                <div className="pt-4 border-t border-cyan-500/20">
                  <h4 className={`text-xs font-mono font-bold mb-2 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                    SYSTEM_STATUS
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>AI Engine:</span>
                      <span className={`text-xs font-mono font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>ONLINE</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>Database:</span>
                      <span className={`text-xs font-mono font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>SYNCED</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>Uptime:</span>
                      <span className={`text-xs font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>99.9%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Divider */}
            <div className={`h-px ${isDark ? 'bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent' : 'bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent'} mb-6`}></div>
            
            {/* Bottom Section - Copyright & Legal */}
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              {/* Copyright */}
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
                <p className={`text-xs font-mono text-center md:text-left ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  <span className={isDark ? 'text-cyan-400' : 'text-cyan-700'}>{'>'}</span>
                  {' '}
                  <span className={isDark ? 'text-slate-300' : 'text-gray-800'}>© {new Date().getFullYear()} SECURE_ME</span>
                  {' '}
                  <span className={isDark ? 'text-slate-600' : 'text-gray-500'}>|</span>
                  {' '}
                  <span className={isDark ? 'text-slate-300' : 'text-gray-800'}>ALL_RIGHTS_RESERVED</span>
                  {' '}
                  <span className={isDark ? 'text-slate-600' : 'text-gray-500'}>|</span>
                  {' '}
                  <span className={isDark ? 'text-purple-400' : 'text-purple-700'}>POWERED_BY_AI_&_ML</span>
                </p>
              </div>
              
              {/* Security Badges & Links */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-gray-600'}`}>
                  <span className={isDark ? 'text-cyan-500' : 'text-cyan-700'}>[</span>
                  <span className={isDark ? 'text-green-400' : 'text-green-700'}>SECURE</span>
                  <span className={isDark ? 'text-cyan-500' : 'text-cyan-700'}>]</span>
                </span>
                <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-gray-600'}`}>
                  <span className={isDark ? 'text-cyan-500' : 'text-cyan-700'}>[</span>
                  <span className={isDark ? 'text-green-400' : 'text-green-700'}>ENCRYPTED</span>
                  <span className={isDark ? 'text-cyan-500' : 'text-cyan-700'}>]</span>
                </span>
                <Link to="/login" className={`text-xs font-mono hover:underline transition-all ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-700 hover:text-cyan-800'}`}>
                  {'>'} Login
                </Link>
                <span className={isDark ? 'text-slate-600' : 'text-gray-500'}>|</span>
                <Link to="/register" className={`text-xs font-mono hover:underline transition-all ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-700 hover:text-cyan-800'}`}>
                  {'>'} Register
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes matrix-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes gradient-text {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glitch-1 {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        @keyframes glitch-2 {
          0% { transform: translate(0); }
          20% { transform: translate(2px, -2px); }
          40% { transform: translate(2px, 2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(-2px, 2px); }
          100% { transform: translate(0); }
        }
        .animate-gradient-text {
          background-size: 200% 200%;
          animation: gradient-text 3s ease infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-glitch-1 {
          animation: glitch-1 0.3s ease-in-out infinite;
        }
        .animate-glitch-2 {
          animation: glitch-2 0.3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Landing;
