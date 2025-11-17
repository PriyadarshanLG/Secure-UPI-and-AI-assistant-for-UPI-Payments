import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../utils/api';

const SMSChecker = () => {
  const outletContext = useOutletContext ? useOutletContext() : {};
  const theme = outletContext?.theme || 'dark';
  const isDark = theme === 'dark';
  
  const [smsText, setSmsText] = useState('');
  const [senderId, setSenderId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [scanProgress, setScanProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!smsText.trim()) {
      setError('Please enter SMS text to analyze');
      return;
    }

    setAnalyzing(true);
    setError('');
    setResult(null);
    setScanProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => prev >= 90 ? 90 : prev + 15);
    }, 150);

    try {
      const response = await api.post('/sms/analyze', {
        smsText: smsText.trim(),
        senderId: senderId.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
      });
      clearInterval(progressInterval);
      setScanProgress(100);
      setResult(response.data);
    } catch (err) {
      clearInterval(progressInterval);
      setScanProgress(0);
      console.error('SMS analysis error:', err);
      
      let errorMessage = 'Failed to analyze SMS';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = err.response.data.errors.map(e => e.msg || e.message).join(', ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setTimeout(() => {
        setAnalyzing(false);
        setScanProgress(0);
      }, 500);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'safe':
        return { bg: 'bg-green-900/30', border: 'border-green-500/60', text: 'text-green-400', glow: 'shadow-green-500/40' };
      case 'caution':
        return { bg: 'bg-yellow-900/30', border: 'border-yellow-500/60', text: 'text-yellow-400', glow: 'shadow-yellow-500/40' };
      case 'suspicious':
        return { bg: 'bg-orange-900/30', border: 'border-orange-500/60', text: 'text-orange-400', glow: 'shadow-orange-500/40' };
      case 'fraud':
        return { bg: 'bg-red-900/30', border: 'border-red-500/60', text: 'text-red-400', glow: 'shadow-red-500/40' };
      default:
        return { bg: 'bg-slate-900/30', border: 'border-slate-500/60', text: 'text-slate-400', glow: 'shadow-slate-500/40' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'safe': return '✅';
      case 'caution': return '⚠️';
      case 'suspicious': return '🔶';
      case 'fraud': return '🚨';
      default: return '❓';
    }
  };

  const getFraudScoreColor = (score) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-orange-400';
    if (score >= 20) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getConfidenceBadge = (confidence) => {
    const colors = {
      high: 'bg-blue-900/30 border-blue-500/60 text-blue-300',
      medium: 'bg-yellow-900/30 border-yellow-500/60 text-yellow-300',
      low: 'bg-gray-900/30 border-gray-500/60 text-gray-300',
    };
    return colors[confidence] || colors.low;
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'} relative overflow-hidden`}>
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40"></div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 px-4 py-8 w-full">
        {/* Header */}
        <div className={`mb-8 ${isDark ? 'bg-slate-950/80' : 'bg-white'} backdrop-blur-xl border-2 border-purple-500/60 rounded-xl px-6 py-6 shadow-2xl shadow-purple-500/40`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold font-mono mb-2">
                <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  [SMS_ANALYZER]
                </span>
              </h1>
              <p className={`${isDark ? 'text-slate-400' : 'text-gray-700'} font-mono text-sm`}>{'>'} Spam & Fraud Pattern Detection</p>
            </div>
            <div className="flex items-center space-x-2 bg-purple-900/60 border-2 border-purple-400 px-4 py-2 rounded-lg">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="font-mono text-sm text-purple-200 font-bold">AI_ACTIVE</span>
            </div>
          </div>
          <p className={`${isDark ? 'text-slate-300' : 'text-gray-800'} text-sm leading-relaxed border-l-2 border-purple-500 pl-4`}>
            Analyze suspicious SMS messages for fraud indicators. Detects fake bank messages, lottery scams, phishing attempts, and more.
            <span className={`block mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-gray-600'}`}>
              <strong className="text-purple-400">[NOTE]</strong> While we use advanced pattern detection, 100% accuracy cannot be guaranteed.
            </span>
          </p>
        </div>

        {/* Analyzer Interface */}
        <div className={`${isDark ? 'bg-slate-950/80' : 'bg-white'} backdrop-blur-xl border-2 border-cyan-500/60 rounded-xl shadow-2xl shadow-cyan-500/40 overflow-hidden mb-6`}>
          {/* Terminal Header */}
          <div className={`${isDark ? 'bg-gradient-to-r from-slate-900 to-slate-800' : 'bg-gradient-to-r from-gray-100 to-gray-200'} border-b-2 border-cyan-500/60 px-6 py-4 flex items-center justify-between`}>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full border border-red-700"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-700"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full border border-green-700 animate-pulse"></div>
              <span className="ml-4 font-mono text-xs font-bold text-cyan-300">root@sms-analyzer:~$</span>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-purple-400 font-mono text-sm font-bold mb-3 uppercase tracking-wider">
                  {'>'} SMS Message Text <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  className={`w-full ${isDark ? 'bg-slate-900/50 border-slate-700 text-slate-100 placeholder-slate-600' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'} border-2 rounded-lg px-4 py-4 font-mono focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/30 transition-all resize-none`}
                  placeholder="Paste the suspicious SMS message here..."
                  rows={6}
                  disabled={analyzing}
                />
                <p className={`mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-gray-600'} font-mono`}>
                  {smsText.length}/1000 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-cyan-400 font-mono text-sm font-bold mb-2 uppercase tracking-wider">
                    {'>'} Sender ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    className={`w-full ${isDark ? 'bg-slate-900/50 border-slate-700 text-slate-100 placeholder-slate-600' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'} border-2 rounded-lg px-4 py-3 font-mono focus:outline-none focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/30 transition-all`}
                    placeholder="e.g., AXISBK, HDFCBK"
                    disabled={analyzing}
                  />
                </div>
                <div>
                  <label className="block text-cyan-400 font-mono text-sm font-bold mb-2 uppercase tracking-wider">
                    {'>'} Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={`w-full ${isDark ? 'bg-slate-900/50 border-slate-700 text-slate-100 placeholder-slate-600' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'} border-2 rounded-lg px-4 py-3 font-mono focus:outline-none focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/30 transition-all`}
                    placeholder="e.g., +919876543210"
                    disabled={analyzing}
                  />
                </div>
              </div>

              {/* Progress Bar */}
              {analyzing && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-400 font-mono text-sm font-bold">[ANALYZING...]</span>
                    <span className="text-purple-400 font-mono text-sm">{scanProgress}%</span>
                  </div>
                  <div className={`w-full ${isDark ? 'bg-slate-900' : 'bg-gray-200'} rounded-full h-3 overflow-hidden border-2 border-purple-500/40`}>
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out"
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
                disabled={!smsText.trim() || analyzing}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-bold font-mono py-4 px-4 rounded-lg hover:shadow-2xl hover:shadow-purple-500/50 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-purple-400/50 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  {analyzing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>[ANALYZING...]</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>[ANALYZE_SMS_FOR_FRAUD]</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className={`bg-slate-950/80 backdrop-blur-xl border-2 ${getStatusColor(result.status).border} rounded-xl shadow-2xl ${getStatusColor(result.status).glow} overflow-hidden`}>
            <div className={`${isDark ? 'bg-gradient-to-r from-slate-900 to-slate-800' : 'bg-gradient-to-r from-gray-100 to-gray-200'} border-b-2 border-purple-500/60 px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-5xl">{getStatusIcon(result.status)}</span>
                  <div>
                    <h2 className={`text-2xl font-bold font-mono ${isDark ? 'text-slate-50' : 'text-gray-900'}`}>[ANALYSIS_COMPLETE]</h2>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} font-mono`}>
                      Checked: {new Date(result.checkedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold font-mono ${getFraudScoreColor(result.fraudScore)}`}>
                    {result.fraudScore}/100
                  </div>
                  <div className={`text-xs px-3 py-1 rounded-full mt-2 border-2 ${getConfidenceBadge(result.confidence)}`}>
                    {result.confidence.toUpperCase()} CONFIDENCE
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* SMS Preview */}
              <div className={`p-4 ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-300'} rounded-lg border-2`}>
                <p className="text-sm font-mono font-bold mb-2 text-purple-400">[SMS_MESSAGE]</p>
                <p className={`text-sm break-words font-mono ${isDark ? 'bg-slate-950/80 border-slate-600 text-slate-200' : 'bg-white border-gray-300 text-gray-800'} p-4 rounded border`}>{result.smsText}</p>
                {result.senderId && (
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'} mt-3 font-mono`}>
                    <span className="font-bold text-cyan-400">[SENDER]</span> {result.senderId}
                  </p>
                )}
                {result.phoneNumber && (
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'} font-mono`}>
                    <span className="font-bold text-cyan-400">[FROM]</span> {result.phoneNumber}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-6 py-3 rounded-lg font-bold text-lg font-mono border-2 ${getStatusColor(result.status).border} ${getStatusColor(result.status).bg} ${getStatusColor(result.status).text} uppercase tracking-wider`}>
                  STATUS: {result.status}
                </span>
              </div>

              {/* Critical Issues */}
              {result.issues && result.issues.length > 0 && (
                <div className="p-6 bg-red-900/30 border-2 border-red-500/60 rounded-lg">
                  <h3 className="font-bold text-red-300 mb-4 flex items-center font-mono text-lg">
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    [CRITICAL_ISSUES] ({result.issues.length})
                  </h3>
                  <ul className="space-y-2">
                    {result.issues.map((issue, index) => (
                      <li key={index} className="flex items-start space-x-3 p-3 bg-red-900/20 rounded border border-red-500/40">
                        <span className="text-red-400 font-mono font-bold">⚠</span>
                        <span className="text-red-300 font-mono text-sm">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {result.warnings && result.warnings.length > 0 && (
                <div className="p-6 bg-yellow-900/30 border-2 border-yellow-500/60 rounded-lg">
                  <h3 className="font-bold text-yellow-300 mb-4 flex items-center font-mono text-lg">
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    [WARNINGS] ({result.warnings.length})
                  </h3>
                  <ul className="space-y-2">
                    {result.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start space-x-3 p-3 bg-yellow-900/20 rounded border border-yellow-500/40">
                        <span className="text-yellow-400 font-mono font-bold">⚡</span>
                        <span className="text-yellow-300 font-mono text-sm">{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detected Patterns */}
              {result.detectedPatterns && result.detectedPatterns.length > 0 && (
                <div className="p-6 bg-orange-900/30 border-2 border-orange-500/60 rounded-lg">
                  <h3 className="font-bold text-orange-300 mb-4 font-mono text-lg">[DETECTED_SCAM_PATTERNS]</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.detectedPatterns.map((pattern, index) => (
                      <span key={index} className="px-4 py-2 bg-orange-900/40 border border-orange-500/60 text-orange-200 rounded-lg text-sm font-mono font-bold">
                        {pattern.replace('Scams', '').replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* URLs Found */}
              {result.urls && result.urls.length > 0 && (
                <div className="p-6 bg-blue-900/30 border-2 border-blue-500/60 rounded-lg">
                  <h3 className="font-bold text-blue-300 mb-4 font-mono text-lg">[LINKS_FOUND_IN_SMS]</h3>
                  <ul className="space-y-2">
                    {result.urls.map((url, index) => (
                      <li key={index} className="text-sm break-all font-mono text-blue-300 p-3 bg-blue-900/20 rounded border border-blue-500/40">
                        {url}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-blue-300 mt-4 font-mono flex items-center space-x-2">
                    <span className="text-cyan-400">💡</span>
                    <span>Use our <a href="/links/check" className="underline font-bold text-cyan-400 hover:text-cyan-300">Link Safety Checker</a> to verify these URLs</span>
                  </p>
                </div>
              )}

              {/* Recommendation */}
              <div className={`p-6 rounded-lg border-2 ${getStatusColor(result.status).border} ${getStatusColor(result.status).bg}`}>
                <h3 className={`font-bold mb-3 flex items-center font-mono text-lg ${getStatusColor(result.status).text}`}>
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  [RECOMMENDATION]
                </h3>
                <p className={`font-mono text-sm leading-relaxed ${getStatusColor(result.status).text}`}>
                  {result.recommendation}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setSmsText('');
                    setSenderId('');
                    setPhoneNumber('');
                    setResult(null);
                    setError('');
                  }}
                  className={`px-6 py-3 ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-400'} rounded-lg transition-colors font-mono font-medium border-2 hover:border-purple-500`}
                >
                  [ANALYZE_ANOTHER_SMS]
                </button>
                {result.urls && result.urls.length > 0 && (
                  <a
                    href="/links/check"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all font-mono font-medium border-2 border-blue-500/50"
                  >
                    [CHECK_LINKS]
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Example SMS Section */}
        <div className="mt-8 bg-yellow-900/30 border-2 border-yellow-500/60 rounded-xl p-6 backdrop-blur-xl">
          <h3 className="font-bold text-yellow-300 mb-4 flex items-center font-mono text-lg">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            [TEST_WITH_SCAM_EXAMPLES]
          </h3>
          <p className="text-sm text-yellow-200 mb-4 font-mono">
            Click any example below to test the fraud detector:
          </p>
          <div className="grid grid-cols-1 gap-3">
            {[
              { text: 'URGENT! Your bank account will be BLOCKED in 24 hours. Click here to verify: bit.ly/bank-verify', sender: 'BANKALRT', emoji: '🏦', label: 'Fake Bank Account Block Warning' },
              { text: 'Congratulations! You won ₹50,000 in our lottery! Claim your prize now: tinyurl.com/claim-prize', sender: 'LOTTERY', emoji: '🎁', label: 'Lottery/Prize Scam' },
              { text: 'Your UPI is blocked. Verify immediately: paytm-secure.tk/verify. Share OTP: 123456', sender: 'PAYTM', emoji: '💳', label: 'Fake UPI Block Message' },
              { text: 'Aadhaar update required! Your Aadhaar will be deactivated. Update now: aadhaar-gov.ga/update', sender: 'UIDAI', emoji: '🆔', label: 'Fake Government Message' },
              { text: 'Your transaction of ₹5,000 failed. Verify account: sbi-secure.cf/verify', sender: 'SBI', emoji: '🏛️', label: 'Fake Transaction Failure' },
            ].map((example, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSmsText(example.text);
                  setSenderId(example.sender);
                }}
                className={`text-left px-4 py-3 ${isDark ? 'bg-slate-950/80 border-yellow-500/40 hover:bg-yellow-900/20' : 'bg-white border-yellow-500/60 hover:bg-yellow-50'} border-2 rounded-lg text-sm hover:border-yellow-500 transition-all font-mono`}
              >
                <span className="text-yellow-400">{example.emoji}</span> {example.label}
              </button>
            ))}
          </div>
        </div>

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
              <span>Analyzes SMS content for common scam patterns and keywords</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">▸</span>
              <span>Detects fake bank messages, lottery scams, phishing attempts</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">▸</span>
              <span>Checks for suspicious links, poor grammar, and urgency tactics</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">▸</span>
              <span>Validates sender ID and phone number formats</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">▸</span>
              <span>Provides fraud score (0-100) with detailed analysis</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-yellow-400">⚠</span>
              <span className="text-yellow-200"><strong>[NOTE]</strong> While highly accurate, always verify important messages with official sources</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SMSChecker;
