import { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../utils/api';

const VoiceDetector = () => {
  const outletContext = useOutletContext ? useOutletContext() : {};
  const theme = outletContext?.theme || 'dark';
  const isDark = theme === 'dark';
  
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const audioRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (50MB max)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (selectedFile.size > maxSize) {
        setError('File size exceeds 50MB limit');
        return;
      }

      setFile(selectedFile);
      setError('');
      setResult(null);

      // Create audio preview URL
      const url = URL.createObjectURL(selectedFile);
      setAudioUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select an audio file to analyze');
      return;
    }

    setDetecting(true);
    setError('');
    setResult(null);
    setScanProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => prev >= 90 ? 90 : prev + 7);
    }, 250);

    try {
      const formData = new FormData();
      formData.append('audio', file);

      const response = await api.post('/voice/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes
      });

      clearInterval(progressInterval);
      setScanProgress(100);
      setResult(response.data.result);
    } catch (err) {
      clearInterval(progressInterval);
      setScanProgress(0);
      console.error('Voice detection error:', err);
      
      let errorMessage = 'Failed to detect voice deepfake';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.details) {
        errorMessage = Array.isArray(err.response.data.details)
          ? err.response.data.details.join(', ')
          : err.response.data.details;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setTimeout(() => {
        setDetecting(false);
        setScanProgress(0);
      }, 500);
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'deepfake':
      case 'spam':
        return { bg: 'bg-red-900/30', border: 'border-red-500/60', text: 'text-red-400', glow: 'shadow-red-500/40' };
      case 'suspicious':
        return { bg: 'bg-yellow-900/30', border: 'border-yellow-500/60', text: 'text-yellow-400', glow: 'shadow-yellow-500/40' };
      case 'real':
        return { bg: 'bg-green-900/30', border: 'border-green-500/60', text: 'text-green-400', glow: 'shadow-green-500/40' };
      default:
        return { bg: 'bg-slate-900/30', border: 'border-slate-500/60', text: 'text-slate-400', glow: 'shadow-slate-500/40' };
    }
  };

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case 'deepfake': return '🎭';
      case 'spam': return '📞';
      case 'suspicious': return '⚠️';
      case 'real': return '✅';
      default: return '❓';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 60) return 'text-red-400';
    if (score >= 40) return 'text-yellow-400';
    if (score >= 20) return 'text-orange-400';
    return 'text-green-400';
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'} relative overflow-hidden`}>
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40"></div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 px-4 py-8 w-full">
        {/* Header */}
        <div className={`mb-8 ${isDark ? 'bg-slate-950/80' : 'bg-white'} backdrop-blur-xl border-2 border-pink-500/60 rounded-xl px-6 py-6 shadow-2xl shadow-pink-500/40`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold font-mono mb-2">
                <span className="bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  [VOICE_ANALYZER]
                </span>
              </h1>
              <p className={`${isDark ? 'text-slate-400' : 'text-gray-700'} font-mono text-sm`}>{'>'} AI Voice & Spam Call Detection</p>
            </div>
            <div className="flex items-center space-x-2 bg-pink-900/60 border-2 border-pink-400 px-4 py-2 rounded-lg">
              <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
              <span className="font-mono text-sm text-pink-200 font-bold">AUDIO_ENGINE_READY</span>
            </div>
          </div>
          <p className={`${isDark ? 'text-slate-300' : 'text-gray-800'} text-sm leading-relaxed border-l-2 border-pink-500 pl-4`}>
            Advanced AI-powered detection for deepfake voices and spam calls. Uses multiple audio analysis methods including 
            Spectral Analysis, MFCC, Pitch Analysis, Formant Analysis, and Spam Pattern Detection.
          </p>
        </div>

        {/* Upload Interface */}
        <div className={`${isDark ? 'bg-slate-950/80' : 'bg-white'} backdrop-blur-xl border-2 border-cyan-500/60 rounded-xl shadow-2xl shadow-cyan-500/40 overflow-hidden mb-6`}>
          {/* Terminal Header */}
          <div className={`${isDark ? 'bg-gradient-to-r from-slate-900 to-slate-800' : 'bg-gradient-to-r from-gray-100 to-gray-200'} border-b-2 border-cyan-500/60 px-6 py-4 flex items-center justify-between`}>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full border border-red-700"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-700"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full border border-green-700 animate-pulse"></div>
              <span className="ml-4 font-mono text-xs font-bold text-cyan-300">root@voice-analyzer:~$</span>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-pink-400 font-mono text-sm font-bold mb-3 uppercase tracking-wider">
                  {'>'} Upload Audio File
                </label>
                <div className={`mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-gray-300 bg-gray-50'} rounded-lg hover:border-pink-500 transition-colors`}>
                  <div className="space-y-3 text-center w-full">
                    {audioUrl ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <div className="p-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg border-2 border-pink-500/40">
                            <svg className="w-16 h-16 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                            </svg>
                          </div>
                        </div>
                        <audio ref={audioRef} src={audioUrl} controls className="w-full max-w-md mx-auto rounded-lg" style={{ filter: 'hue-rotate(270deg)' }} />
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'} font-mono flex items-center justify-center space-x-2`}>
                          <span className="text-pink-400">[FILE]</span>
                          <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </p>
                      </div>
                    ) : (
                      <>
                        <svg
                          className={`mx-auto h-16 w-16 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                        </svg>
                        <div className={`flex text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'} justify-center font-mono`}>
                          <label className={`relative cursor-pointer ${isDark ? 'bg-slate-800' : 'bg-gray-100'} rounded-md font-medium text-pink-400 hover:text-pink-300 px-4 py-2 border-2 border-pink-500/40 hover:border-pink-500 transition-all`}>
                            <span>[UPLOAD_AUDIO]</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="audio/*"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-3 flex items-center">or drag and drop</p>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-600'} font-mono`}>
                          MP3, WAV, OGG, M4A, AAC, FLAC up to 50MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {detecting && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-pink-400 font-mono text-sm font-bold">[ANALYZING_AUDIO...]</span>
                    <span className="text-pink-400 font-mono text-sm">{scanProgress}%</span>
                  </div>
                  <div className={`w-full ${isDark ? 'bg-slate-900' : 'bg-gray-200'} rounded-full h-3 overflow-hidden border-2 border-pink-500/40`}>
                    <div 
                      className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-300 ease-out"
                      style={{ width: `${scanProgress}%` }}
                    ></div>
                  </div>
                  <p className={`mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'} font-mono animate-pulse`}>
                    Running: Spectral Analysis, MFCC, Pitch Detection, Formant Analysis...
                  </p>
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
                disabled={!file || detecting}
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white font-bold font-mono py-4 px-4 rounded-lg hover:shadow-2xl hover:shadow-pink-500/50 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-pink-400/50 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  {detecting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>[ANALYZING_AUDIO...]</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      <span>[DETECT_AI_VOICE_&_SPAM]</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className={`${isDark ? 'bg-slate-950/80' : 'bg-white'} backdrop-blur-xl border-2 ${getVerdictColor(result.verdict).border} rounded-xl shadow-2xl ${getVerdictColor(result.verdict).glow} overflow-hidden`}>
            <div className={`${isDark ? 'bg-gradient-to-r from-slate-900 to-slate-800' : 'bg-gradient-to-r from-gray-100 to-gray-200'} border-b-2 border-pink-500/60 px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-5xl">{getVerdictIcon(result.verdict)}</span>
                  <div>
                    <h2 className={`text-2xl font-bold font-mono ${isDark ? 'text-slate-50' : 'text-gray-900'}`}>[DETECTION_COMPLETE]</h2>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} font-mono`}>
                      {result.fileName} ({(result.fileSize / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                </div>
                <div className={`text-4xl font-bold font-mono ${getScoreColor(result.deepfakeScore)}`}>
                  {result.deepfakeScore.toFixed(1)}/100
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Warning for Basic Analysis */}
              {result.warning && (
                <div className={`p-4 rounded-lg border-2 ${isDark ? 'bg-yellow-900/30 border-yellow-500/60' : 'bg-yellow-50 border-yellow-300'}`}>
                  <div className="flex items-start space-x-3">
                    <svg className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'} flex-shrink-0 mt-0.5`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className={`font-bold font-mono mb-1 ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                        [BASIC_ANALYSIS_MODE]
                      </h4>
                      <p className={`font-mono text-sm ${isDark ? 'text-yellow-200' : 'text-yellow-700'}`}>
                        {result.warning}
                      </p>
                      {result.technicalDetails?.note && (
                        <p className={`font-mono text-xs mt-2 ${isDark ? 'text-yellow-300/80' : 'text-yellow-600'}`}>
                          {result.technicalDetails.note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Verdict Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-6 py-3 rounded-lg font-bold text-lg font-mono border-2 ${getVerdictColor(result.verdict).border} ${getVerdictColor(result.verdict).bg} ${getVerdictColor(result.verdict).text} uppercase tracking-wider`}>
                  VERDICT: {result.verdict}
                </span>
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} font-mono`}>
                  Confidence: {(result.confidence * 100).toFixed(1)}%
                </span>
              </div>

              {/* Main Result Alerts */}
              {result.isDeepfake && (
                <div className="p-6 bg-red-900/30 border-2 border-red-500/60 rounded-lg">
                  <div className="flex items-center mb-3">
                    <span className="text-3xl mr-3">🚨</span>
                    <h4 className="text-xl font-bold text-red-300 font-mono">
                      {result.isSpam ? '[SPAM_CALL_DETECTED]' : '[AI_VOICE_DETECTED]'}
                    </h4>
                  </div>
                  <p className="text-red-300 font-mono text-sm leading-relaxed">
                    {result.isSpam 
                      ? 'This audio appears to be from a spam or automated call with robotic patterns.'
                      : 'This audio appears to be AI-generated or a deepfake voice.'}
                  </p>
                </div>
              )}

              {result.isSpam && (
                <div className="p-6 bg-orange-900/30 border-2 border-orange-500/60 rounded-lg">
                  <div className="flex items-center mb-3">
                    <span className="text-3xl mr-3">📞</span>
                    <h4 className="text-xl font-bold text-orange-300 font-mono">[SPAM_CALL_INDICATORS]</h4>
                  </div>
                  {result.spamIndicators && result.spamIndicators.length > 0 && (
                    <ul className="space-y-2">
                      {result.spamIndicators.map((indicator, index) => (
                        <li key={index} className="flex items-start space-x-3 p-3 bg-orange-900/20 rounded border border-orange-500/40">
                          <span className="text-orange-400 font-mono font-bold">▸</span>
                          <span className="text-orange-300 font-mono text-sm">{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {!result.isDeepfake && result.verdict === 'real' && (
                <div className="p-6 bg-green-900/30 border-2 border-green-500/60 rounded-lg">
                  <div className="flex items-center mb-3">
                    <span className="text-3xl mr-3">✅</span>
                    <h4 className="text-xl font-bold text-green-300 font-mono">[AUTHENTIC_VOICE]</h4>
                  </div>
                  <p className="text-green-300 font-mono text-sm leading-relaxed">
                    This audio appears to be from a real human voice and not AI-generated.
                  </p>
                </div>
              )}

              {/* Detection Methods */}
              {result.detectionMethods && result.detectionMethods.length > 0 && (
                <div className="p-6 bg-blue-900/30 border-2 border-blue-500/60 rounded-lg">
                  <h3 className="font-bold text-blue-300 mb-4 flex items-center font-mono text-lg">
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    [DETECTION_METHODS_USED] ({result.detectionMethods.length})
                  </h3>
                  <ul className="space-y-2">
                    {result.detectionMethods.map((method, index) => (
                      <li key={index} className="flex items-start space-x-3 p-3 bg-blue-900/20 rounded border border-blue-500/40">
                        <span className="text-blue-400 font-mono font-bold">✓</span>
                        <span className="text-blue-300 font-mono text-sm">{method}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Indicators */}
              {result.indicators && result.indicators.length > 0 && (
                <div className="p-6 bg-yellow-900/30 border-2 border-yellow-500/60 rounded-lg">
                  <h3 className="font-bold text-yellow-300 mb-4 flex items-center font-mono text-lg">
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    [DETECTION_INDICATORS] ({result.indicators.length})
                  </h3>
                  <ul className="space-y-2 max-h-80 overflow-y-auto">
                    {result.indicators.slice(0, 15).map((indicator, index) => (
                      <li key={index} className="flex items-start space-x-3 p-3 bg-yellow-900/20 rounded border border-yellow-500/40">
                        <span className="text-yellow-400 font-mono font-bold">▸</span>
                        <span className="text-yellow-300 font-mono text-sm">{indicator}</span>
                      </li>
                    ))}
                    {result.indicators.length > 15 && (
                      <li className="text-xs text-yellow-400 italic font-mono p-2">
                        ... and {result.indicators.length - 15} more indicators
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Technical Details */}
              {result.technicalDetails && Object.keys(result.technicalDetails).length > 0 && (
                <div className={`p-6 ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-300'} border-2 rounded-lg`}>
                  <h3 className={`font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'} mb-4 font-mono text-lg`}>[TECHNICAL_DETAILS]</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(result.technicalDetails).map(([key, value]) => (
                      <div key={key} className={`flex justify-between p-3 ${isDark ? 'bg-slate-950/50 border-slate-700' : 'bg-white border-gray-300'} rounded border`}>
                        <span className={`${isDark ? 'text-slate-400' : 'text-gray-600'} capitalize font-mono`}>{key.replace(/_/g, ' ')}:</span>
                        <span className="font-mono font-bold text-cyan-400">
                          {typeof value === 'number' ? value.toFixed(2) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setFile(null);
                    if (audioUrl) {
                      URL.revokeObjectURL(audioUrl);
                      setAudioUrl(null);
                    }
                    setResult(null);
                    setError('');
                  }}
                  className={`px-6 py-3 ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-400'} rounded-lg transition-colors font-mono font-medium border-2 hover:border-pink-500`}
                >
                  [ANALYZE_ANOTHER_FILE]
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-900/30 border-2 border-blue-500/60 rounded-xl p-6 backdrop-blur-xl">
          <h3 className="font-bold text-blue-300 mb-4 flex items-center font-mono text-lg">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            [HOW_IT_WORKS]
          </h3>
          <ul className="text-sm text-blue-200 space-y-2 font-mono leading-relaxed">
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">▸</span>
              <span><strong>Spectral Analysis:</strong> Detects unnatural spectral patterns in AI-generated voices</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">▸</span>
              <span><strong>MFCC Analysis:</strong> Mel-frequency cepstral coefficients reveal AI voice synthesis patterns</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">▸</span>
              <span><strong>Pitch Analysis:</strong> Identifies robotic pitch stability or unnatural pitch variations</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">▸</span>
              <span><strong>Formant Analysis:</strong> Detects inconsistent vowel characteristics common in deepfakes</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">▸</span>
              <span><strong>Temporal Consistency:</strong> Analyzes energy and zero-crossing rate patterns over time</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">▸</span>
              <span><strong>Spam Call Detection:</strong> Identifies repetitive patterns, unnatural pauses, and robotic speech</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-yellow-400">⚠</span>
              <span className="text-yellow-200"><strong>[NOTE]</strong> No system can guarantee 100% accuracy. Always verify critical information.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VoiceDetector;
