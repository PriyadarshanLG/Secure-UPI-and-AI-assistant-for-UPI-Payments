import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../utils/api';

const DeepfakeDetector = () => {
  const outletContext = useOutletContext ? useOutletContext() : {};
  const theme = outletContext?.theme || 'dark';
  const isDark = theme === 'dark';
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [scanProgress, setScanProgress] = useState(0);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size (100MB max)
      const maxSize = 100 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setError('File size exceeds 100MB limit. Please select a smaller file.');
        setFile(null);
        setPreview(null);
        return;
      }

      // Validate file type
      const isImage = selectedFile.type.startsWith('image/');
      const isVideo = selectedFile.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        setError('Invalid file type. Please select an image (JPG, PNG, WEBP) or video (MP4, MOV, AVI).');
        setFile(null);
        setPreview(null);
        return;
      }

      setFile(selectedFile);
      setError('');
      setResult(null);
      setScanProgress(0);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select an image or video file to analyze');
      return;
    }

    setDetecting(true);
    setError('');
    setResult(null);
    setScanProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => prev >= 90 ? 90 : prev + 5);
    }, 300);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/deepfake/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes for video processing
      });

      clearInterval(progressInterval);
      setScanProgress(100);
      setResult(response.data.result);
    } catch (err) {
      clearInterval(progressInterval);
      setScanProgress(0);
      console.error('Deepfake detection error:', err);
      
      // Format error message
      let errorMessage = 'Failed to detect deepfake';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        if (err.response.data.details) {
          if (Array.isArray(err.response.data.details)) {
            errorMessage = err.response.data.details.join('\n');
          } else {
            errorMessage += '\n' + err.response.data.details;
          }
        }
      } else if (err.response?.data?.details) {
        errorMessage = Array.isArray(err.response.data.details)
          ? err.response.data.details.join('\n')
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

  // Get verdict styling
  const getVerdictStyle = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case 'deepfake':
        return { 
          bg: 'bg-red-900/30', 
          border: 'border-red-500/60', 
          text: 'text-red-400', 
          icon: '🚨',
          label: 'DEEPFAKE DETECTED',
          glow: 'shadow-red-500/40'
        };
      case 'face_mask_edit':
        return { 
          bg: 'bg-orange-900/30', 
          border: 'border-orange-500/60', 
          text: 'text-orange-400', 
          icon: '🎭',
          label: 'FACE MASK EDIT',
          glow: 'shadow-orange-500/40'
        };
      case 'suspicious':
        return { 
          bg: 'bg-yellow-900/30', 
          border: 'border-yellow-500/60', 
          text: 'text-yellow-400', 
          icon: '⚠️',
          label: 'SUSPICIOUS',
          glow: 'shadow-yellow-500/40'
        };
      case 'real':
        return { 
          bg: 'bg-green-900/30', 
          border: 'border-green-500/60', 
          text: 'text-green-400', 
          icon: '✅',
          label: 'REAL',
          glow: 'shadow-green-500/40'
        };
      default:
        return { 
          bg: 'bg-slate-900/30', 
          border: 'border-slate-500/60', 
          text: 'text-slate-400', 
          icon: '❓',
          label: 'UNKNOWN',
          glow: 'shadow-slate-500/40'
        };
    }
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 60) return 'text-red-400';
    if (score >= 40) return 'text-yellow-400';
    if (score >= 20) return 'text-orange-400';
    return 'text-green-400';
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'} relative overflow-hidden`}>
      {/* Cyber Grid Background */}
      <div className={`absolute inset-0 ${isDark ? 'bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40' : 'bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20'}`}></div>
      
      {/* Hexagonal Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z' fill='none' stroke='%23f97316' stroke-width='1'/%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px'
      }}></div>

      {/* Animated Scan Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500/40 to-transparent animate-pulse"></div>
      </div>

      {/* Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className={`mb-8 ${isDark ? 'bg-slate-950/80' : 'bg-white'} backdrop-blur-xl border-2 border-orange-500/60 rounded-xl px-6 py-6 shadow-2xl shadow-orange-500/40`}>
            <div className="flex items-center space-x-4">
              <div className={`text-5xl ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>🎭</div>
              <div>
                <h1 className={`text-4xl font-bold font-mono mb-2 ${isDark ? 'text-slate-50' : 'text-gray-900'}`}>
                  [0x04] DEEPFAKE DETECTOR
                </h1>
                <p className={`text-lg font-mono ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  AI-Powered Deepfake Detection for Images and Videos
                </p>
              </div>
            </div>
          </div>

          {/* Upload Form */}
          <div className={`${isDark ? 'bg-slate-950/80' : 'bg-white'} backdrop-blur-xl border-2 border-orange-500/60 rounded-xl p-6 mb-6 shadow-2xl shadow-orange-500/40`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Input */}
              <div>
                <label className={`block text-sm font-bold font-mono mb-3 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                  [SELECT_FILE]
                </label>
                <div className={`${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-300'} border-2 rounded-lg p-4`}>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    disabled={detecting}
                    className={`block w-full text-sm font-mono ${isDark ? 'text-slate-300' : 'text-gray-700'} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-orange-500 file:text-white hover:file:bg-orange-600 file:shadow-lg file:shadow-orange-500/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  {file && (
                    <div className={`mt-3 p-3 ${isDark ? 'bg-slate-800/50 border-slate-600' : 'bg-gray-100 border-gray-300'} border rounded-lg`}>
                      <p className={`text-sm font-mono ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                        [FILE] {file.name} ({formatFileSize(file.size)})
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              {preview && (
                <div className="space-y-3">
                  <label className={`block text-sm font-bold font-mono ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                    [PREVIEW]
                  </label>
                  <div className={`rounded-lg overflow-hidden border-2 ${isDark ? 'border-orange-500/60 shadow-orange-500/40' : 'border-orange-300 shadow-orange-300/40'} shadow-xl`}>
                    {file.type.startsWith('image/') ? (
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    ) : (
                      <video 
                        src={preview} 
                        controls 
                        className="w-full h-auto max-h-96"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className={`p-4 rounded-lg border-2 ${isDark ? 'bg-red-900/30 border-red-500/60' : 'bg-red-50 border-red-300'} shadow-lg`}>
                  <p className={`text-sm font-mono whitespace-pre-line ${isDark ? 'text-red-300' : 'text-red-800'}`}>
                    [ERROR] {error}
                  </p>
                </div>
              )}

              {/* Progress Bar */}
              {detecting && (
                <div className="space-y-3">
                  <div className={`flex justify-between text-sm font-mono font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                    <span>[ANALYZING]</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className={`w-full ${isDark ? 'bg-slate-800' : 'bg-gray-200'} rounded-full h-3 border-2 ${isDark ? 'border-slate-600' : 'border-gray-300'}`}>
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full transition-all duration-300 shadow-lg shadow-orange-500/50"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!file || detecting}
                className={`w-full py-4 px-6 rounded-lg font-bold font-mono text-lg transition-all ${
                  !file || detecting
                    ? `${isDark ? 'bg-slate-800 text-slate-500' : 'bg-gray-300 text-gray-500'} cursor-not-allowed border-2 ${isDark ? 'border-slate-700' : 'border-gray-400'}`
                    : `${isDark ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-2xl shadow-orange-500/50 border-2 border-orange-400/60' : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-2xl border-2 border-orange-400'} hover:shadow-orange-500/60`
                }`}
              >
                {detecting ? '[ANALYZING...]' : '[DETECT_DEEPFAKE]'}
              </button>
          </form>
        </div>

          {/* Results */}
          {result && (
            <div className={`${isDark ? 'bg-slate-950/80' : 'bg-white'} backdrop-blur-xl border-2 ${getVerdictStyle(result.verdict).border} rounded-xl overflow-hidden shadow-2xl ${getVerdictStyle(result.verdict).glow}`}>
              {/* Result Header */}
              <div className={`${isDark ? 'bg-gradient-to-r from-slate-900 to-slate-800' : 'bg-gradient-to-r from-gray-100 to-gray-200'} border-b-2 ${getVerdictStyle(result.verdict).border} px-6 py-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-5xl">{getVerdictStyle(result.verdict).icon}</span>
                    <div>
                      <h3 className={`text-2xl font-bold font-mono ${isDark ? 'text-slate-50' : 'text-gray-900'}`}>
                        [DETECTION_COMPLETE]
                      </h3>
                      <p className={`text-sm font-mono ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        {result.fileName} ({formatFileSize(result.fileSize)})
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {/* Verdict Card */}
                <div className={`p-6 rounded-lg border-2 ${getVerdictStyle(result.verdict).bg} ${getVerdictStyle(result.verdict).border} shadow-xl`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-3xl font-bold font-mono mb-3 ${getVerdictStyle(result.verdict).text}`}>
                        {getVerdictStyle(result.verdict).icon} [{getVerdictStyle(result.verdict).label}]
                      </h4>
                      <p className={`text-sm font-mono ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        {result.isDeepfake 
                          ? 'This content appears to be AI-generated or manipulated'
                          : 'This content appears to be authentic'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold font-mono ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>[CONFIDENCE]</p>
                      <p className={`text-4xl font-bold font-mono ${getVerdictStyle(result.verdict).text}`}>
                        {(result.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Deepfake Score */}
                <div className={`${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-300'} p-6 rounded-lg border-2`}>
                  <h4 className={`font-bold mb-4 font-mono text-orange-400 text-lg`}>[DEEPFAKE_SCORE]</h4>
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between p-3 ${isDark ? 'bg-slate-800/50' : 'bg-gray-100'} rounded-lg border ${isDark ? 'border-slate-600' : 'border-gray-300'}`}>
                      <span className={`font-mono text-sm font-bold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Score:</span>
                      <span className={`text-2xl font-bold font-mono ${getScoreColor(result.deepfakeScore)}`}>
                        {result.deepfakeScore.toFixed(1)}/100
                      </span>
                    </div>
                    {result.faceMaskDetected && (
                      <div className={`flex items-center justify-between p-3 ${isDark ? 'bg-slate-800/50' : 'bg-gray-100'} rounded-lg border ${isDark ? 'border-slate-600' : 'border-gray-300'}`}>
                        <span className={`font-mono text-sm font-bold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Face Mask Score:</span>
                        <span className={`text-xl font-bold font-mono text-orange-400`}>
                          {result.faceMaskScore.toFixed(1)}/100
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detection Methods */}
                {result.detectionMethods && result.detectionMethods.length > 0 && (
                  <div className={`${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-300'} p-6 rounded-lg border-2`}>
                    <h4 className={`font-bold mb-4 font-mono text-orange-400 text-lg`}>[DETECTION_METHODS]</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.detectionMethods.map((method, idx) => (
                        <span 
                          key={idx}
                          className={`px-3 py-2 rounded-lg text-sm font-mono font-bold ${isDark ? 'bg-orange-900/30 text-orange-300 border border-orange-500/40 shadow-lg shadow-orange-500/20' : 'bg-orange-100 text-orange-800 border border-orange-300'}`}
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Indicators */}
                {result.indicators && result.indicators.length > 0 && (
                  <div className={`${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-300'} p-6 rounded-lg border-2`}>
                    <h4 className={`font-bold mb-4 font-mono text-orange-400 text-lg`}>[DETECTION_INDICATORS]</h4>
                    <ul className="space-y-2">
                      {result.indicators.slice(0, 10).map((indicator, idx) => (
                        <li key={idx} className={`flex items-start space-x-3 p-3 ${isDark ? 'bg-slate-800/50 border border-slate-600' : 'bg-gray-100 border border-gray-300'} rounded-lg`}>
                          <span className={`font-mono text-lg ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>▸</span>
                          <span className={`font-mono text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technical Details */}
                {result.technicalDetails && Object.keys(result.technicalDetails).length > 0 && (
                  <div className={`${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-300'} p-6 rounded-lg border-2`}>
                    <h4 className={`font-bold mb-4 font-mono text-orange-400 text-lg`}>[TECHNICAL_DETAILS]</h4>
                    <div className="space-y-2">
                      {Object.entries(result.technicalDetails).map(([key, value]) => (
                        <div key={key} className={`flex justify-between p-2 ${isDark ? 'bg-slate-800/30' : 'bg-gray-100'} rounded`}>
                          <span className={`font-mono text-sm font-bold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{key}:</span>
                          <span className={`font-mono text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Frame Analysis (for videos) */}
                {result.frameAnalysis && result.frameAnalysis.length > 0 && (
                  <div className={`${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-300'} p-6 rounded-lg border-2`}>
                    <h4 className={`font-bold mb-4 font-mono text-orange-400 text-lg`}>[FRAME_ANALYSIS]</h4>
                    <div className="space-y-2">
                      {result.frameAnalysis.slice(0, 5).map((frame, idx) => (
                        <div key={idx} className={`p-3 ${isDark ? 'bg-slate-800/50 border border-slate-600' : 'bg-gray-100 border border-gray-300'} rounded-lg`}>
                          <div className="flex justify-between items-center">
                            <span className={`font-mono text-sm font-bold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                              Frame {frame.frame}: {frame.verdict}
                            </span>
                            <span className={`font-mono text-sm font-bold ${getScoreColor(frame.score)}`}>
                              {frame.score.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeepfakeDetector;

