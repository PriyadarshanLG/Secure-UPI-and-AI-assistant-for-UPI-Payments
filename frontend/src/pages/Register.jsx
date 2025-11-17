import { useState, useEffect } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const outletContext = useOutletContext ? useOutletContext() : {};
  const theme = outletContext?.theme || 'dark';
  const isDark = theme === 'dark';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [glitchText, setGlitchText] = useState('REGISTER');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Glitch effect on text
    const glitchInterval = setInterval(() => {
      const chars = '!<>-_\\/[]{}—=+*^?#________';
      const glitched = 'REGISTER'.split('').map((char, i) => 
        Math.random() > 0.9 ? chars[Math.floor(Math.random() * chars.length)] : char
      ).join('');
      setGlitchText(glitched);
      setTimeout(() => setGlitchText('REGISTER'), 50);
    }, 3000);

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(glitchInterval);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.phone
    );
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className={`h-screen fixed inset-0 overflow-hidden flex items-center justify-center px-4 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
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
          backgroundSize: '50px 50px'
        }}
      ></div>

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${isDark ? '#0ff' : '#00bfbf'} 2px, ${isDark ? '#0ff' : '#00bfbf'} 4px)`,
        animation: 'scanline 8s linear infinite'
      }}></div>

      {/* Glowing Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(138,43,226,0.3) 0%, transparent 70%)',
            left: `${mousePosition.x * 0.02}px`,
            top: `${mousePosition.y * 0.02}px`,
          }}
        ></div>
        <div 
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,255,0.3) 0%, transparent 70%)',
            right: `${mousePosition.x * 0.01}px`,
            bottom: `${mousePosition.y * 0.01}px`,
            animationDelay: '1s'
          }}
        ></div>
      </div>

      {/* Hexagon Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z' fill='none' stroke='%2300ffff' stroke-width='1'/%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px'
      }}></div>

      <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Register Container */}
        <div className={`backdrop-blur-xl rounded-lg border-2 overflow-hidden ${
          isDark 
            ? 'bg-black/70 border-purple-500/50 shadow-2xl shadow-purple-500/50' 
            : 'bg-white/70 border-purple-600/50 shadow-2xl shadow-purple-600/30'
        }`}>
          {/* Corner Brackets */}
          <div className={`absolute top-4 left-4 text-xl font-mono ${isDark ? 'text-purple-500' : 'text-purple-600'}`}>╔</div>
          <div className={`absolute top-4 right-4 text-xl font-mono ${isDark ? 'text-purple-500' : 'text-purple-600'}`}>╗</div>
          <div className={`absolute bottom-4 left-4 text-xl font-mono ${isDark ? 'text-purple-500' : 'text-purple-600'}`}>╚</div>
          <div className={`absolute bottom-4 right-4 text-xl font-mono ${isDark ? 'text-purple-500' : 'text-purple-600'}`}>╝</div>

          {/* Header Bar */}
          <div className={`border-b-2 px-6 py-4 flex items-center justify-between ${
            isDark 
              ? 'bg-black/50 border-purple-500/50' 
              : 'bg-gray-100/50 border-purple-600/50'
          }`}>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full border border-red-700 animate-pulse"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-700 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-green-500 rounded-full border border-green-700 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              <span className={`ml-4 font-mono text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                root@secure-me:~/auth/register$
              </span>
            </div>
            <span className={`text-xs font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
              0x02
            </span>
          </div>

          <div className="p-8 relative">
            {/* Title with Glitch Effect */}
            <div className="text-center mb-8">
              <div className={`text-xs font-mono mb-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                {'>'} CREATING_NEW_USER_ACCOUNT...
              </div>
              <h2 className="text-4xl font-black mb-2 font-mono relative">
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
              </h2>
              <p className={`font-mono text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>{'>'}</span> Initialize new user credentials
              </p>
            </div>

            {/* Status Indicator */}
            <div className={`flex items-center justify-between mb-6 p-3 rounded border ${
              isDark 
                ? 'bg-black/30 border-green-500/50' 
                : 'bg-green-50 border-green-600/50'
            }`}>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className={`text-xs font-mono font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  REGISTRATION_OPEN
                </span>
              </div>
              <span className={`text-xs font-mono ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                FREE_TIER
              </span>
            </div>

            {/* Error Message */}
        {error && (
              <div className={`mb-6 p-4 rounded-lg border-2 backdrop-blur-xl ${
                isDark 
                  ? 'bg-red-900/30 border-red-500/60' 
                  : 'bg-red-100 border-red-500/60'
              }`}>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className={`font-mono text-sm font-bold ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                    [ERROR] {error}
                  </span>
                </div>
          </div>
        )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className={`block font-mono text-sm font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-purple-400' : 'text-purple-600'}`} htmlFor="name">
                  {'>'} FULL_NAME
            </label>
                <div className="relative group">
                  <div className={`absolute -inset-0.5 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300 ${
                    isDark ? 'bg-purple-500/30' : 'bg-purple-600/30'
                  }`}></div>
            <input
                    className={`relative w-full rounded-lg px-4 py-3 font-mono border-2 focus:outline-none transition-all ${
                      isDark
                        ? 'bg-black/50 border-purple-500/30 text-purple-400 placeholder-gray-600 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/30'
                        : 'bg-white border-purple-600/30 text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:shadow-lg focus:shadow-purple-600/30'
                    }`}
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
                    placeholder="John Doe"
              required
            />
          </div>
              </div>

              {/* Email Field */}
              <div>
                <label className={`block font-mono text-sm font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-purple-400' : 'text-purple-600'}`} htmlFor="email">
                  {'>'} EMAIL_ADDRESS
            </label>
                <div className="relative group">
                  <div className={`absolute -inset-0.5 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300 ${
                    isDark ? 'bg-purple-500/30' : 'bg-purple-600/30'
                  }`}></div>
            <input
                    className={`relative w-full rounded-lg px-4 py-3 font-mono border-2 focus:outline-none transition-all ${
                      isDark
                        ? 'bg-black/50 border-purple-500/30 text-purple-400 placeholder-gray-600 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/30'
                        : 'bg-white border-purple-600/30 text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:shadow-lg focus:shadow-purple-600/30'
                    }`}
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
                    placeholder="user@domain.com"
              required
            />
          </div>
              </div>

              {/* Phone Field */}
              <div>
                <label className={`block font-mono text-sm font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-purple-400' : 'text-purple-600'}`} htmlFor="phone">
                  {'>'} PHONE_NUMBER <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>(OPTIONAL)</span>
            </label>
                <div className="relative group">
                  <div className={`absolute -inset-0.5 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300 ${
                    isDark ? 'bg-purple-500/30' : 'bg-purple-600/30'
                  }`}></div>
            <input
                    className={`relative w-full rounded-lg px-4 py-3 font-mono border-2 focus:outline-none transition-all ${
                      isDark
                        ? 'bg-black/50 border-purple-500/30 text-purple-400 placeholder-gray-600 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/30'
                        : 'bg-white border-purple-600/30 text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:shadow-lg focus:shadow-purple-600/30'
                    }`}
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
                    placeholder="+91 98765 43210"
            />
          </div>
              </div>

              {/* Password Field */}
              <div>
                <label className={`block font-mono text-sm font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-purple-400' : 'text-purple-600'}`} htmlFor="password">
                  {'>'} PASSWORD_KEY
            </label>
                <div className="relative group">
                  <div className={`absolute -inset-0.5 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300 ${
                    isDark ? 'bg-purple-500/30' : 'bg-purple-600/30'
                  }`}></div>
            <input
                    className={`relative w-full rounded-lg px-4 py-3 font-mono border-2 focus:outline-none transition-all ${
                      isDark
                        ? 'bg-black/50 border-purple-500/30 text-purple-400 placeholder-gray-600 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/30'
                        : 'bg-white border-purple-600/30 text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:shadow-lg focus:shadow-purple-600/30'
                    }`}
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
                    placeholder="••••••••••••"
              required
              minLength={6}
            />
                </div>
                <p className={`text-xs mt-2 font-mono flex items-center space-x-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>MIN_6_CHARACTERS</span>
                </p>
          </div>

              {/* Submit Button */}
            <button
                className={`w-full font-bold font-mono py-4 px-4 rounded-lg focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 group relative overflow-hidden mt-6 ${
                  isDark
                    ? 'border-purple-500 bg-purple-500/20 text-purple-400 hover:shadow-2xl hover:shadow-purple-500/50'
                    : 'border-purple-600 bg-purple-50 text-purple-600 hover:shadow-2xl hover:shadow-purple-600/30'
                }`}
              type="submit"
              disabled={loading}
            >
                <div className={`absolute inset-0 ${isDark ? 'bg-purple-500/30' : 'bg-purple-600/30'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{'['} CREATING_ACCOUNT... {']'}</span>
                    </>
                  ) : (
                    <>
                      <span>{'['} DEPLOY_ACCOUNT {']'}</span>
                      <span className="animate-pulse">→</span>
                    </>
                  )}
                </span>
            </button>
            </form>

            {/* Footer Links */}
            <div className={`mt-8 pt-6 border-t-2 ${isDark ? 'border-purple-500/30' : 'border-purple-600/30'}`}>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <span className={`font-mono ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                  EXISTING_USER?
                </span>
                <Link to="/login" className={`font-mono font-bold group flex items-center space-x-1 transition-colors ${
                  isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'
                }`}>
                  <span>{'['} LOGIN_NOW {']'}</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
            </div>

            {/* Security Notice */}
            <div className={`mt-6 p-4 rounded-lg border ${
              isDark 
                ? 'bg-green-900/20 border-green-500/40' 
                : 'bg-green-50 border-green-500/40'
            }`}>
              <div className="flex items-start space-x-3">
                <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className={`text-xs font-mono leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{'['} PRIVACY {']'}</span> 
                  {' '}Your data is encrypted and securely stored | Zero data sharing policy
                </p>
              </div>
            </div>
      </div>
        </div>

      </div>

      {/* Back to Landing - Outside container */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-20">
        <Link 
          to="/" 
          className={`inline-flex items-center space-x-2 font-mono text-sm font-bold transition-colors ${
            isDark ? 'text-gray-500 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          <span>←</span>
          <span>{'['} RETURN_TO_HOME {']'}</span>
        </Link>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes matrix-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
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
        .animate-glitch-1 {
          animation: glitch-1 0.3s ease-in-out infinite;
        }
        .animate-glitch-2 {
          animation: glitch-2 0.3s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(138, 43, 226, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(138, 43, 226, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(138, 43, 226, 0.7);
        }
      `}</style>
    </div>
  );
};

export default Register;
