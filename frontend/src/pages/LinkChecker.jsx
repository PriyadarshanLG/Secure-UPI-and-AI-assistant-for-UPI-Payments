import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../utils/api';

const LinkChecker = () => {
  const outletContext = useOutletContext ? useOutletContext() : {};
  const theme = outletContext?.theme || 'dark';
  const isDark = theme === 'dark';
  
  const [url, setUrl] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [scanProgress, setScanProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL to check');
      return;
    }

    setChecking(true);
    setError('');
    setResult(null);
    setScanProgress(0);

    // Simulate scanning progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await api.post('/links/check', { url: url.trim() });
      clearInterval(progressInterval);
      setScanProgress(100);
      setResult(response.data);
    } catch (err) {
      clearInterval(progressInterval);
      setScanProgress(0);
      console.error('Link check error:', err);
      
      let errorMessage = 'Failed to check link';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setTimeout(() => {
        setChecking(false);
        setScanProgress(0);
      }, 500);
    }
  };

  const getStatusColor = (status) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'SAFE':
        return {
          bg: 'bg-green-900/30',
          border: 'border-green-500/60',
          text: 'text-green-400',
          glow: 'shadow-green-500/40',
          badge: 'bg-green-500',
          icon: 'text-white'
        };
      case 'SUSPICIOUS':
        return {
          bg: 'bg-yellow-900/30',
          border: 'border-yellow-500/60',
          text: 'text-yellow-400',
          glow: 'shadow-yellow-500/40',
          badge: 'bg-yellow-500',
          icon: 'text-gray-900'
        };
      case 'UNSAFE':
      case 'MALICIOUS':
        return {
          bg: 'bg-red-900/30',
          border: 'border-red-500/60',
          text: 'text-red-400',
          glow: 'shadow-red-500/40',
          badge: 'bg-red-500',
          icon: 'text-white'
        };
      default:
        return {
          bg: 'bg-slate-900/30',
          border: 'border-slate-500/60',
          text: 'text-slate-400',
          glow: 'shadow-slate-500/40',
          badge: 'bg-slate-500',
          icon: 'text-white'
        };
    }
  };

  const getStatusDisplay = (status) => {
    const statusUpper = status?.toUpperCase();
    return statusUpper === 'UNSAFE' ? 'UNSAFE' : statusUpper;
  };

  /**
   * Normalizes backend threat payloads (objects or strings) into a render-friendly shape.
   */
  const formatThreat = (threat) => {
    if (!threat) {
      return { title: 'UNKNOWN_THREAT', platform: null, description: null };
    }

    if (typeof threat === 'string') {
      return { title: threat, platform: null, description: null };
    }

    const platform = threat.platform || threat.platformType || null;
    const detailSource = threat.details ?? threat.metadata ?? null;
    let description = null;

    if (typeof detailSource === 'string') {
      description = detailSource;
    } else if (detailSource && typeof detailSource === 'object') {
      try {
        description = JSON.stringify(detailSource);
      } catch (err) {
        description = 'Additional details available';
      }
    }

    return {
      title: threat.type || 'UNKNOWN_THREAT',
      platform,
      description,
    };
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'} relative overflow-hidden`}>
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40"></div>
      
      {/* Hexagonal Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z' fill='none' stroke='%2306b6d4' stroke-width='1'/%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px'
      }}></div>

      {/* Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 px-4 py-8 w-full">
        {/* Header */}
        <div className={`mb-8 ${isDark ? 'bg-slate-950/80' : 'bg-white'} backdrop-blur-xl border-2 border-green-500/60 rounded-xl px-6 py-6 shadow-2xl shadow-green-500/40`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold font-mono mb-2">
                <span className="bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent">
                  [LINK_SCANNER]
                </span>
              </h1>
              <p className={`${isDark ? 'text-slate-400' : 'text-gray-700'} font-mono text-sm`}>{'>'} Malware & Phishing Detection System</p>
            </div>
            <div className="flex items-center space-x-2 bg-green-900/60 border-2 border-green-400 px-4 py-2 rounded-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-mono text-sm text-green-200 font-bold">SCANNING_ACTIVE</span>
            </div>
          </div>
          <p className={`${isDark ? 'text-slate-300' : 'text-gray-700'} text-sm leading-relaxed`}>
            Advanced AI-powered detection for malicious links, phishing sites, and security threats. 
            Uses Google Safe Browsing API and multiple threat intelligence sources.
          </p>
        </div>

        {/* Scanner Interface */}
        <div className={`${isDark ? 'bg-slate-950/80' : 'bg-white'} backdrop-blur-xl border-2 border-cyan-500/60 rounded-xl shadow-2xl shadow-cyan-500/40 overflow-hidden mb-6`}>
          {/* Terminal Header */}
          <div className={`${isDark ? 'bg-gradient-to-r from-slate-900 to-slate-800' : 'bg-gradient-to-r from-gray-100 to-gray-200'} border-b-2 border-cyan-500/60 px-6 py-4 flex items-center justify-between`}>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full border border-red-700"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-700"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full border border-green-700 animate-pulse"></div>
              <span className="ml-4 font-mono text-xs font-bold text-cyan-300">root@link-scanner:~$</span>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-green-400 font-mono text-sm font-bold mb-3 uppercase tracking-wider">
                  {'>'} Enter URL to Scan
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className={`w-full ${isDark ? 'bg-slate-900/50 border-slate-700 text-slate-100 placeholder-slate-600' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'} border-2 rounded-lg px-4 py-4 font-mono focus:outline-none focus:border-green-500 focus:shadow-lg focus:shadow-green-500/30 transition-all`}
                    placeholder="https://example.com"
                    disabled={checking}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <svg className={`w-6 h-6 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {checking && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cyan-400 font-mono text-sm font-bold">[SCANNING...]</span>
                    <span className="text-cyan-400 font-mono text-sm">{scanProgress}%</span>
                  </div>
                  <div className={`w-full ${isDark ? 'bg-slate-900' : 'bg-gray-200'} rounded-full h-3 overflow-hidden border-2 border-cyan-500/40`}>
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${scanProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-900/30 border-2 border-red-500/60 rounded-lg backdrop-blur-xl">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-300 font-mono text-sm font-bold">[ERROR] {error}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!url.trim() || checking}
                className="w-full bg-gradient-to-r from-green-500 to-cyan-600 text-white font-bold font-mono py-4 px-4 rounded-lg hover:shadow-2xl hover:shadow-green-500/50 focus:outline-none focus:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-green-400/50 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  {checking ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>[SCANNING_URL...]</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>[INITIATE_SCAN]</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className={`${isDark ? 'bg-slate-950/80' : 'bg-white'} backdrop-blur-xl border-2 ${getStatusColor(result.status).border} rounded-xl shadow-2xl ${getStatusColor(result.status).glow} overflow-hidden`}>
            <div className={`${isDark ? 'bg-gradient-to-r from-slate-900 to-slate-800' : 'bg-gradient-to-r from-gray-100 to-gray-200'} border-b-2 border-cyan-500/60 px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${result.status?.toLowerCase() === 'safe' ? 'from-green-500 to-emerald-600' : result.status?.toLowerCase() === 'suspicious' ? 'from-yellow-500 to-orange-600' : 'from-red-500 to-pink-600'} shadow-lg border-2 border-white/20`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold font-mono ${isDark ? 'text-slate-50' : 'text-gray-900'}`}>[SCAN_COMPLETE]</h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} font-mono`}>{new Date(result.checkedAt).toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Safety Score Badge - Prominent Display */}
                <div className={`px-6 py-4 rounded-xl ${getStatusColor(result.status).badge} shadow-2xl border-2 border-white/30`}>
                  <div className="text-center">
                    <div className={`text-4xl font-black font-mono ${getStatusColor(result.status).icon}`}>
                      {result.safetyScore || 0}%
                    </div>
                    <div className={`text-xs font-bold font-mono ${getStatusColor(result.status).icon} opacity-90 mt-1`}>
                      SAFETY
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* URL Display */}
              <div className={`${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-300'} p-4 rounded-lg border-2`}>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'} font-mono mb-2`}>SCANNED URL:</p>
                <p className="text-sm text-cyan-400 font-mono break-all">{result.url}</p>
              </div>

              {/* Status Badge with Color-Coded Button */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Display */}
                <div className={`px-6 py-4 rounded-xl ${getStatusColor(result.status).badge} shadow-lg border-2 border-white/30 flex items-center justify-center`}>
                  <div className="text-center">
                    <span className={`${getStatusColor(result.status).icon} font-mono text-2xl font-black uppercase tracking-wider`}>
                      {getStatusDisplay(result.status)}
                    </span>
                  </div>
                </div>

                {/* Safety Score Details */}
                <div className={`px-6 py-4 ${getStatusColor(result.status).bg} border-2 ${getStatusColor(result.status).border} rounded-xl backdrop-blur-xl`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${getStatusColor(result.status).text} opacity-70 font-mono mb-1`}>SAFETY SCORE</p>
                      <p className={`text-3xl font-bold font-mono ${getStatusColor(result.status).text}`}>
                        {result.safetyScore || 0}<span className="text-xl">/100</span>
                      </p>
                    </div>
                    {result.status?.toLowerCase() === 'safe' ? (
                      <svg className={`w-12 h-12 ${getStatusColor(result.status).text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : result.status?.toLowerCase() === 'suspicious' ? (
                      <svg className={`w-12 h-12 ${getStatusColor(result.status).text}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className={`w-12 h-12 ${getStatusColor(result.status).text}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Threats */}
              {result.threats && result.threats.length > 0 && (
                <div className="p-6 bg-red-900/30 border-2 border-red-500/60 rounded-lg">
                  <h4 className="font-bold text-red-300 font-mono mb-4 flex items-center text-lg">
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    [THREATS_DETECTED] ({result.threats.length})
                  </h4>
                  <ul className="space-y-2">
                    {result.threats.map((threat, index) => {
                      const formatted = formatThreat(threat);
                      return (
                        <li key={index} className="flex items-start space-x-3 p-3 bg-red-900/20 rounded border border-red-500/40">
                          <span className="text-red-400 font-mono font-bold">#{index + 1}</span>
                          <div className="text-red-300 font-mono text-sm space-y-1">
                            <p className="font-semibold">{formatted.title}</p>
                            {formatted.platform && (
                              <p className="text-red-200 text-xs uppercase tracking-wide">
                                Platform: {formatted.platform}
                              </p>
                            )}
                            {formatted.description && (
                              <p className="text-red-100 text-xs break-words">
                                {formatted.description}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {result.warnings && result.warnings.length > 0 && (
                <div className="p-6 bg-yellow-900/30 border-2 border-yellow-500/60 rounded-lg">
                  <h4 className="font-bold text-yellow-300 font-mono mb-4 flex items-center text-lg">
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    [WARNINGS] ({result.warnings.length})
                  </h4>
                  <ul className="space-y-2">
                    {result.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start space-x-3 p-3 bg-yellow-900/20 rounded border border-yellow-500/40">
                        <span className="text-yellow-400 font-mono font-bold">⚠</span>
                        <span className="text-yellow-300 font-mono text-sm">{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Safe Message */}
              {result.status?.toLowerCase() === 'safe' && (
                <div className="p-6 bg-green-900/30 border-2 border-green-500/60 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-xl font-bold text-green-300 font-mono">[URL_SAFE]</h4>
                      <p className="text-green-400 font-mono text-sm mt-1">
                        {result.recommendations?.[0] || 'This link appears safe to open.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendation */}
              <div className={`p-6 rounded-lg border-2 ${getStatusColor(result.status).border} ${getStatusColor(result.status).bg}`}>
                <h4 className={`font-bold ${getStatusColor(result.status).text} font-mono mb-3 text-lg`}>[RECOMMENDATION]</h4>
                <div className="space-y-2">
                  {result.recommendations && result.recommendations.length > 0 ? (
                    result.recommendations.map((rec, index) => (
                      <p key={index} className={`${getStatusColor(result.status).text} font-mono text-sm leading-relaxed flex items-start space-x-2`}>
                        <span className="mt-0.5">•</span>
                        <span>{rec}</span>
                      </p>
                    ))
                  ) : (
                    <p className={`${getStatusColor(result.status).text} font-mono text-sm leading-relaxed`}>
                      {result.recommendation || 'No specific recommendations available.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setUrl('');
                    setResult(null);
                    setError('');
                  }}
                  className={`px-6 py-3 ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-400'} rounded-lg transition-colors font-mono font-medium border-2 hover:border-cyan-500`}
                >
                  [SCAN_ANOTHER]
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkChecker;
