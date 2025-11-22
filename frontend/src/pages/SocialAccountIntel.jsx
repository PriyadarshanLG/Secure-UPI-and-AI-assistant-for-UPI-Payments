import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../utils/api';

const SocialAccountIntel = () => {
  const outletContext = typeof useOutletContext === 'function' ? useOutletContext() : {};
  const theme = outletContext?.theme || 'dark';
  const isDark = theme === 'dark';

  const [screenshotFile, setScreenshotFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  /**
   * Sends the uploaded screenshot to the backend so OCR + heuristics can
   * synthesize multi-signal features automatically.
   */
  const handleScreenshotSubmit = async (e) => {
    e.preventDefault();

    if (!screenshotFile) {
      setError('Please select a profile screenshot image (PNG or JPG).');
      return;
    }

    setUploading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('screenshot', screenshotFile);

      const response = await api.post('/social-accounts/analyze-screenshot', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(response.data);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to analyze screenshot';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'
      } relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30"></div>
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z' fill='none' stroke='%2306b6d4' stroke-width='1'/%3E%3C/svg%3E\")",
          backgroundSize: '120px 120px',
        }}
      ></div>
      <div className="absolute top-[-10%] left-1/3 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 px-4 py-8 w-full max-w-4xl mx-auto space-y-8">
        <div
          className={`${
            isDark ? 'bg-slate-950/80' : 'bg-white'
          } backdrop-blur-xl border-2 border-cyan-500/60 rounded-2xl px-6 py-6 shadow-2xl shadow-cyan-500/30`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold font-mono mb-2">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 bg-clip-text text-transparent">
                  [0x09] FAKE ACCOUNT INTEL
                </span>
              </h1>
              <p className={`${isDark ? 'text-slate-300' : 'text-gray-700'} font-mono text-sm`}>
                Upload a social profile screenshot—OCR extracts stats, heuristics build signals, and the risk engine returns an explainable verdict.
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-emerald-900/60 border-2 border-emerald-400 px-4 py-2 rounded-lg">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="font-mono text-sm text-emerald-200 font-bold">SCREEN_MODE</span>
            </div>
          </div>

          <form onSubmit={handleScreenshotSubmit} className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-cyan-500/60 rounded-xl p-6 text-center cursor-pointer hover:border-cyan-300 transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
              />
              <svg className="w-12 h-12 text-cyan-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm font-mono text-cyan-200">
                {screenshotFile ? screenshotFile.name : 'Drop or click to upload profile screenshot (PNG/JPG, ≤10MB)'}
              </p>
              <p className="text-[10px] font-mono text-slate-500 mt-2">
                Tip: include username, avatar, follower stats, and bio for highest accuracy.
              </p>
            </label>
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-mono font-bold py-3 rounded-lg border-2 border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-60"
            >
              {uploading ? '[ANALYZING_SCREENSHOT...]' : '[RUN_SCREENSHOT_ANALYZER]'}
            </button>
          </form>
        </div>

        <div
          className={`${
            isDark ? 'bg-slate-950/70 border-purple-500/40' : 'bg-white border-purple-200'
          } border-2 rounded-2xl p-6 shadow-xl`}
        >
          <p className="text-xs font-mono text-purple-400 uppercase tracking-widest mb-3">How it works</p>
          <ul className="space-y-3 text-sm font-mono text-slate-300">
            <li>• OCR extracts usernames, follower counts, bios, and link text from the screenshot.</li>
            <li>• Lightweight heuristics turn the OCR output into nine detector signal families.</li>
            <li>• The existing explainable risk model assigns a score, risk tier, and reasons.</li>
            <li>• Uploaded images are deleted after processing to avoid residual PII storage.</li>
          </ul>
        </div>

        {error && (
          <div className="p-4 bg-red-900/40 border-2 border-red-500/60 rounded-xl font-mono text-sm text-red-200">
            [ERROR] {error}
          </div>
        )}

        {result && (
          <div
            className={`${
              isDark ? 'bg-slate-950/80' : 'bg-white'
            } backdrop-blur-xl border-2 border-cyan-500/60 rounded-2xl px-6 py-6 shadow-2xl shadow-cyan-500/30 space-y-6`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-cyan-500/30 pb-4">
              <div className="flex-1">
                <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">Account Status</p>
                <h2 className={`text-6xl font-mono font-black mb-2 ${
                  result.accountVerdict === 'FAKE' 
                    ? 'text-red-500' 
                    : 'text-green-500'
                }`}>
                  {result.accountVerdict || (result.isFake ? 'FAKE' : 'REAL')}
                </h2>
                {result.fakeReason && (
                  <p className="text-sm font-mono text-red-400 mt-1 mb-2">
                    ⚠️ {result.fakeReason}
                  </p>
                )}
                {result.stats && (
                  <div className="flex gap-4 mt-2 text-xs font-mono">
                    <span className="text-slate-400">
                      Followers: <span className="text-cyan-300">{result.stats.followers}</span>
                    </span>
                    <span className="text-slate-400">
                      Following: <span className="text-cyan-300">{result.stats.following}</span>
                    </span>
                    <span className="text-slate-400">
                      Posts: <span className="text-cyan-300">{result.stats.posts}</span>
                    </span>
                  </div>
                )}
                <p className="text-sm font-mono text-slate-400 mt-2">{result.metadata?.evaluatedAt}</p>
                {result.metadata?.source && (
                  <p className="text-[10px] font-mono text-slate-500 mt-1">SOURCE: {result.metadata.source.toUpperCase()}</p>
                )}
                {result.metadata?.instagramValidation?.username && result.metadata.instagramValidation.username !== 'unknown' && (
                  <p className="text-xs font-mono text-cyan-300 mt-2">
                    @{result.metadata.instagramValidation.username}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-xs font-mono text-slate-500">RISK SCORE</p>
                  <p className="text-3xl font-mono font-black text-cyan-300">{result.riskScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-mono text-slate-500">CONFIDENCE</p>
                  <p className="text-2xl font-mono font-black text-emerald-300">
                    {Math.round((result.metadata?.confidence || 0) * 100)}%
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-gray-50 border-gray-200'
              } border-2 rounded-xl p-4`}
            >
              <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">Analysis Summary</p>
              <p className={`text-lg font-mono font-bold mb-2 ${
                result.accountVerdict === 'FAKE' || result.isFake
                  ? 'text-red-400' 
                  : 'text-green-400'
              }`}>
                This Instagram account is {result.accountVerdict || (result.isFake ? 'FAKE' : 'REAL')}
              </p>
              <p className="text-sm font-mono text-slate-300 mt-2">{result.recommendedAction}</p>
            </div>

            {result.reasons && result.reasons.length > 0 && (
              <div>
                <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">Top Reasons</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.reasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className={`${
                        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-gray-50 border-gray-200'
                      } border-2 rounded-lg p-3 font-mono text-sm`}
                    >
                      #{idx + 1} {reason}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">Signal Breakdown</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(result.breakdown || {}).map(([section, details]) => (
                  <div
                    key={section}
                    className={`${
                      isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-gray-50 border-gray-200'
                    } border-2 rounded-lg p-4`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-slate-400 uppercase">{section}</span>
                      <span className="text-xl font-mono font-bold text-cyan-300">{details.score}</span>
                    </div>
                    <ul className="text-xs font-mono text-slate-300 space-y-1">
                      {details.evidence && details.evidence.length > 0 ? (
                        details.evidence.slice(0, 3).map((item, idx) => <li key={idx}>- {item}</li>)
                      ) : (
                        <li className="text-slate-500">No notable evidence</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialAccountIntel;





