import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import api from '../utils/api';

const EvidenceUpload = () => {
  const outletContext = useOutletContext ? useOutletContext() : {};
  const theme = outletContext?.theme || 'dark';
  const isDark = theme === 'dark';
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  
  // Manual input fields
  const [manualData, setManualData] = useState({
    upiId: '',
    amount: '',
    referenceId: '',
    merchantName: ''
  });
  const [useManualInput, setUseManualInput] = useState(false);
  const navigate = useNavigate();

  // Determine whether authenticity analysis was limited (e.g., ML service offline)
  const deriveImageStatus = (analysis) => {
    if (!analysis) {
      return {
        limited: false,
        hasEditSignals: false,
        indicatorTexts: [],
        mlUnavailableIndicator: false,
      };
    }

    const indicatorTexts = Array.isArray(analysis.editIndicators)
      ? analysis.editIndicators
      : [];

    const mlUnavailableIndicator = indicatorTexts.some(
      (indicator) =>
        typeof indicator === 'string' &&
        indicator.toLowerCase().includes('ml service unavailable')
    );

    const limited = Boolean(
      analysis.analysisLimited ||
        analysis.mlServiceAvailable === false ||
        mlUnavailableIndicator
    );

    const hasEditSignals =
      !limited &&
      (analysis.isEdited === true ||
        (analysis.editConfidence && analysis.editConfidence > 0.5) ||
        (analysis.forgeryScore && analysis.forgeryScore >= 40));

    return {
      limited,
      hasEditSignals,
      indicatorTexts,
      mlUnavailableIndicator,
    };
  };

  const analysisState = deriveImageStatus(result);

  // Check if we have manual data (used for button enable/disable)
  // Only count as valid if fields have non-empty, non-whitespace values
  const hasManualData = Boolean(
    (manualData.upiId && manualData.upiId.trim()) || 
    (manualData.amount && manualData.amount.toString().trim()) || 
    (manualData.referenceId && manualData.referenceId.trim()) || 
    (manualData.merchantName && manualData.merchantName.trim())
  );

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file && !hasManualData) {
      setError('Please either upload a file OR enter transaction details manually');
      return;
    }

    setUploading(true);
    setError('');
    setResult(null);
    setScanProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => prev >= 90 ? 90 : prev + 10);
    }, 200);

    try {
      const formData = new FormData();
      
      // Add file if provided
      if (file) {
        formData.append('image', file);
      }
      
      // Only add transaction ID if provided
      if (transactionId && transactionId.trim()) {
        formData.append('transactionId', transactionId.trim());
      }
      
      // Add manual data if at least one field is filled
      if (hasManualData) {
        // Only include non-empty fields in manual data
        const cleanManualData = {};
        if (manualData.upiId && manualData.upiId.trim()) {
          cleanManualData.upiId = manualData.upiId.trim();
        }
        if (manualData.amount && manualData.amount.toString().trim()) {
          cleanManualData.amount = manualData.amount.toString().trim();
        }
        if (manualData.referenceId && manualData.referenceId.trim()) {
          cleanManualData.referenceId = manualData.referenceId.trim();
        }
        if (manualData.merchantName && manualData.merchantName.trim()) {
          cleanManualData.merchantName = manualData.merchantName.trim();
        }
        
        // Only add if we have at least one field
        if (Object.keys(cleanManualData).length > 0) {
          formData.append('manualData', JSON.stringify(cleanManualData));
          
          // If no file, indicate manual-only mode
          if (!file) {
            formData.append('manualOnly', 'true');
          }
        } else if (!file) {
          // No file and no valid manual data - this shouldn't happen due to button disable
          // but handle it gracefully
          clearInterval(progressInterval);
          setError('Please provide at least one transaction detail (UPI ID, Amount, or Reference ID)');
          setUploading(false);
          return;
        }
      } else if (!file) {
        // No file and no manual data - this shouldn't happen due to button disable
        clearInterval(progressInterval);
        setError('Please either upload a file OR enter transaction details manually');
        setUploading(false);
        return;
      }

      // Debug: Log what we're sending
      console.log('Submitting upload request...');
      console.log('Has file:', !!file);
      console.log('Has manual data:', hasManualData);
      if (hasManualData) {
        const cleanManualData = {};
        if (manualData.upiId && manualData.upiId.trim()) cleanManualData.upiId = manualData.upiId.trim();
        if (manualData.amount && manualData.amount.toString().trim()) cleanManualData.amount = manualData.amount.toString().trim();
        if (manualData.referenceId && manualData.referenceId.trim()) cleanManualData.referenceId = manualData.referenceId.trim();
        if (manualData.merchantName && manualData.merchantName.trim()) cleanManualData.merchantName = manualData.merchantName.trim();
        console.log('Manual data to send:', cleanManualData);
      }
      
      const response = await api.post('/evidence/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout for large files and ML processing
      });

      clearInterval(progressInterval);
      setScanProgress(100);
      console.log('Upload successful:', response.data);
      setResult({
        ...response.data.evidence,
        isDuplicate: response.data.isDuplicate,
        message: response.data.message,
      });
      
      // Reset form
      setFile(null);
      setPreview(null);
      setTransactionId('');
      setManualData({ upiId: '', amount: '', referenceId: '', merchantName: '' });
      setUseManualInput(false);
    } catch (err) {
      clearInterval(progressInterval);
      setScanProgress(0);
      console.error('Upload error:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      
      // Better error message formatting - show actual backend error
      let errorMessage = 'Upload failed';
      
      // Check for network errors first
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'Request timeout. The server is taking too long to respond. Please try again.';
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || !err.response) {
        errorMessage = 'Network Error: Cannot connect to backend server.\n\n' +
                      'Please start the backend server:\n' +
                      'In PowerShell: .\\start-backend.bat\n' +
                      'Or in CMD: start-backend.bat\n' +
                      'Or manually: cd backend && npm start\n\n' +
                      'The server should run on http://localhost:5000';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        // Include details if available
        if (err.response.data.details) {
          errorMessage += ` (${err.response.data.details})`;
        }
      } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = err.response.data.errors.map(e => e.msg || e.message || String(e)).join(', ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage = 'Validation Error: Please check your input and try again';
        if (err.response?.data?.details) {
          errorMessage += ` - ${err.response.data.details}`;
        }
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
        if (err.response?.data?.details) {
          errorMessage += ` - ${err.response.data.details}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error('Final error message:', errorMessage);
      console.error('Error code:', err.code);
      console.error('Error response status:', err.response?.status);
      setError(errorMessage);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setScanProgress(0);
      }, 500);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'} relative overflow-hidden`}>
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40"></div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 px-4 py-8 w-full">
        {/* Header */}
        <div className={`mb-8 ${isDark ? 'bg-slate-950/80' : 'bg-white'} backdrop-blur-xl border-2 border-cyan-500/60 rounded-xl px-6 py-6 shadow-2xl shadow-cyan-500/40`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold font-mono mb-2">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                  [EVIDENCE_UPLOAD]
                </span>
              </h1>
              <p className={`${isDark ? 'text-slate-400' : 'text-gray-700'} font-mono text-sm`}>{'>'} Transaction Analysis & Fraud Detection</p>
            </div>
            <div className="flex items-center space-x-2 bg-cyan-900/60 border-2 border-cyan-400 px-4 py-2 rounded-lg">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="font-mono text-sm text-cyan-200 font-bold">OCR_READY</span>
            </div>
          </div>
          <p className={`${isDark ? 'text-slate-300' : 'text-gray-800'} text-sm leading-relaxed border-l-2 border-cyan-500 pl-4`}>
            AI-Powered Fraud Detection System. Upload transaction screenshots for comprehensive analysis including 
            forgery detection, OCR extraction, and transaction validation.
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
              <span className="ml-4 font-mono text-xs font-bold text-cyan-300">root@evidence-analyzer:~$</span>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Transaction ID */}
              <div className="mb-6">
                <label className="block text-cyan-400 font-mono text-sm font-bold mb-2 uppercase tracking-wider">
                  {'>'} Transaction ID <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>(Optional)</span>
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                    className={`w-full ${isDark ? 'bg-slate-900/50 border-slate-700 text-slate-100 placeholder-slate-600' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'} border-2 rounded-lg px-4 py-3 font-mono focus:outline-none focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/30 transition-all`}
                  placeholder="Enter transaction ID"
                />
              </div>

              {/* Screenshot Upload */}
              <div className="mb-6">
                <label className="block text-cyan-400 font-mono text-sm font-bold mb-3 uppercase tracking-wider">
                  {'>'} Screenshot Image
                </label>
                <div className={`mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-gray-300 bg-gray-50'} rounded-lg hover:border-cyan-500 transition-colors`}>
                  <div className="space-y-2 text-center w-full">
                    {preview ? (
                      <div className="relative">
                        <img src={preview} alt="Preview" className="max-h-96 mx-auto rounded-lg border-2 border-cyan-500/40" />
                        <div className="absolute top-2 right-2 bg-cyan-500/90 text-white px-3 py-1 rounded-lg text-xs font-mono font-bold">
                          [PREVIEW]
                        </div>
                      </div>
                    ) : (
                      <>
                        <svg
                          className={`mx-auto h-16 w-16 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className={`flex text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'} justify-center font-mono`}>
                          <label className={`relative cursor-pointer ${isDark ? 'bg-slate-800' : 'bg-gray-100'} rounded-md font-medium text-cyan-400 hover:text-cyan-300 px-4 py-2 border-2 border-cyan-500/40 hover:border-cyan-500 transition-all`}>
                            <span>[SELECT_FILE]</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-3 flex items-center">or drag and drop</p>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-600'} font-mono`}>PNG, JPG, GIF up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
                {file && (
                  <p className={`mt-3 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} font-mono flex items-center space-x-2`}>
                    <span className="text-cyan-400">[FILE]</span>
                    <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </p>
                )}
              </div>

              {/* Manual Input Toggle */}
              <div className="mb-6">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={useManualInput}
                    onChange={(e) => setUseManualInput(e.target.checked)}
                    className="mr-3 h-5 w-5 text-cyan-600 focus:ring-cyan-500 border-slate-700 rounded bg-slate-900"
                  />
                  <span className={`text-sm font-mono ${isDark ? 'text-slate-300' : 'text-gray-700'} group-hover:text-cyan-400 transition-colors`}>
                    [MANUAL_MODE] Enter transaction details manually (if OCR fails)
                  </span>
                </label>
              </div>

              {/* Manual Input Fields */}
              {useManualInput && (
                <div className={`mb-6 p-6 ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-300'} rounded-lg border-2`}>
                  <h3 className="text-sm font-mono font-bold mb-4 text-cyan-400 uppercase tracking-wider">[MANUAL_TRANSACTION_DETAILS]</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-2 uppercase`}>
                        UPI ID
                      </label>
                      <input
                        type="text"
                        value={manualData.upiId}
                        onChange={(e) => setManualData({...manualData, upiId: e.target.value})}
                        className={`w-full ${isDark ? 'bg-slate-950/50 border-slate-700 text-slate-100 placeholder-slate-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border-2 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500`}
                        placeholder="user@paytm"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-2 uppercase`}>
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={manualData.amount}
                        onChange={(e) => setManualData({...manualData, amount: e.target.value})}
                        className={`w-full ${isDark ? 'bg-slate-950/50 border-slate-700 text-slate-100 placeholder-slate-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border-2 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500`}
                        placeholder="500"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-2 uppercase`}>
                        Reference/UTR ID
                      </label>
                      <input
                        type="text"
                        value={manualData.referenceId}
                        onChange={(e) => setManualData({...manualData, referenceId: e.target.value})}
                        className={`w-full ${isDark ? 'bg-slate-950/50 border-slate-700 text-slate-100 placeholder-slate-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border-2 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500`}
                        placeholder="441634252587"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-2 uppercase`}>
                        Merchant Name
                      </label>
                      <input
                        type="text"
                        value={manualData.merchantName}
                        onChange={(e) => setManualData({...manualData, merchantName: e.target.value})}
                        className={`w-full ${isDark ? 'bg-slate-950/50 border-slate-700 text-slate-100 placeholder-slate-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border-2 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500`}
                        placeholder="Merchant Name"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {uploading && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cyan-400 font-mono text-sm font-bold">[ANALYZING...]</span>
                    <span className="text-cyan-400 font-mono text-sm">{scanProgress}%</span>
                  </div>
                  <div className={`w-full ${isDark ? 'bg-slate-900' : 'bg-gray-200'} rounded-full h-3 overflow-hidden border-2 border-cyan-500/40`}>
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ease-out"
                      style={{ width: `${scanProgress}%` }}
                    ></div>
                  </div>
                  <p className={`mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'} font-mono animate-pulse`}>
                    Running OCR, Forgery Detection, Transaction Validation...
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
                disabled={(!file && !hasManualData) || uploading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold font-mono py-4 px-4 rounded-lg hover:shadow-2xl hover:shadow-cyan-500/50 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-cyan-400/50 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  {uploading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>[UPLOADING_&_ANALYZING...]</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>[UPLOAD_&_ANALYZE]</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className={`${isDark ? 'bg-slate-950/80' : 'bg-white'} backdrop-blur-xl border-2 ${
            result.fraudDetected
              ? 'border-red-500/60 shadow-red-500/40'
              : result.forgeryVerdict === 'tampered'
              ? 'border-yellow-500/60 shadow-yellow-500/40'
              : 'border-green-500/60 shadow-green-500/40'
          } rounded-xl shadow-2xl overflow-hidden`}>
            <div className={`${isDark ? 'bg-gradient-to-r from-slate-900 to-slate-800' : 'bg-gradient-to-r from-gray-100 to-gray-200'} border-b-2 border-cyan-500/60 px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-5xl">{result.fraudDetected ? '🚨' : result.forgeryVerdict === 'tampered' ? '⚠️' : '✅'}</span>
                  <div>
                    <h3 className={`text-2xl font-bold font-mono ${isDark ? 'text-slate-50' : 'text-gray-900'}`}>[ANALYSIS_COMPLETE]</h3>
                    {result.isDuplicate && (
                      <span className="inline-block mt-1 px-3 py-1 bg-blue-500/20 border border-blue-500/60 text-blue-300 text-xs font-mono font-bold rounded-lg">
                        ⚡ PREVIOUSLY_ANALYZED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Image Status - Edited vs Original - PROMINENT DISPLAY (TOP PRIORITY) */}
              {/* Always show edit detection - use forgery score as fallback */}
              {(result.isEdited !== undefined || 
                result.editConfidence !== undefined || 
                result.forgeryScore !== undefined
              ) && (
                <div className={`p-8 rounded-xl border-4 shadow-2xl ${
                  analysisState.hasEditSignals
                    ? 'bg-gradient-to-br from-red-900/40 via-red-800/30 to-red-900/40 border-red-500/80'
                    : analysisState.limited
                      ? 'bg-gradient-to-br from-yellow-900/40 via-yellow-800/30 to-yellow-900/40 border-yellow-500/80'
                      : 'bg-gradient-to-br from-green-900/40 via-green-800/30 to-green-900/40 border-green-500/80'
                }`}>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center space-x-6">
                      <div className={`text-6xl ${
                        analysisState.hasEditSignals
                          ? 'text-red-400'
                          : analysisState.limited
                            ? 'text-yellow-300'
                            : 'text-green-400'
                      } animate-pulse`}>
                        {analysisState.hasEditSignals
                          ? '✂️'
                          : analysisState.limited
                            ? '⚠️'
                            : '✅'}
                      </div>
                      <div>
                        <h4 className={`text-3xl font-bold font-mono mb-2 ${
                          analysisState.hasEditSignals
                            ? 'text-red-200'
                            : analysisState.limited
                              ? 'text-yellow-200'
                              : 'text-green-200'
                        }`}>
                          {analysisState.hasEditSignals
                            ? '[IMAGE_IS_EDITED]'
                            : analysisState.limited
                              ? '[AUTHENTICITY_UNAVAILABLE]'
                              : '[IMAGE_IS_ORIGINAL]'}
                        </h4>
                        <p className={`text-base ${isDark ? 'text-slate-200' : 'text-gray-800'} font-mono`}>
                          {analysisState.hasEditSignals
                            ? '⚠️ This screenshot has been MODIFIED or EDITED. It may not be authentic.'
                            : analysisState.limited
                              ? '⚠️ Authenticity engine could not run full edit detection. Please re-run after starting the ML service.'
                              : '✓ This screenshot appears to be ORIGINAL and UNEDITED. High authenticity.'}
                        </p>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <p className={`text-sm font-mono font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'} mb-1`}>
                        {analysisState.limited ? 'STATUS' : 'CONFIDENCE'}
                      </p>
                      <p className={`text-4xl font-bold font-mono ${
                        analysisState.hasEditSignals
                          ? 'text-red-300'
                          : analysisState.limited
                            ? 'text-yellow-300'
                            : 'text-green-300'
                      }`}>
                        {analysisState.limited
                          ? '--'
                          : `${(
                              (result.editConfidence ||
                                (analysisState.hasEditSignals ? 0.75 : 0.85)) * 100
                            ).toFixed(0)}%`}
                      </p>
                      <p className={`text-xs font-mono mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        {analysisState.hasEditSignals
                          ? 'Edit Detection'
                          : analysisState.limited
                            ? 'Limited Analysis'
                            : 'Originality Verified'}
                      </p>
                    </div>
                  </div>
                  
                  {(analysisState.hasEditSignals && 
                    result.editIndicators && result.editIndicators.length > 0) && (
                    <div className="mt-6 pt-6 border-t-2 border-red-500/60">
                      <p className={`text-base font-bold ${isDark ? 'text-red-200' : 'text-red-700'} mb-3 font-mono`}>
                        [EDIT_DETECTION_REASONS]
                      </p>
                      <ul className="space-y-2">
                        {result.editIndicators.map((indicator, idx) => (
                          <li key={idx} className={`flex items-start space-x-3 p-3 ${isDark ? 'bg-red-900/30' : 'bg-red-100'} rounded-lg border border-red-500/40`}>
                            <span className={`text-lg font-mono ${isDark ? 'text-red-400' : 'text-red-600'}`}>▸</span>
                            <span className={`font-mono text-sm ${isDark ? 'text-red-200' : 'text-red-800'}`}>{indicator}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {(!analysisState.hasEditSignals && result.editIndicators && result.editIndicators.length > 0) && (
                    <div className={`mt-6 pt-6 border-t-2 ${
                      analysisState.limited ? 'border-yellow-500/60' : 'border-green-500/60'
                    }`}>
                      <p className={`text-base font-bold ${
                        analysisState.limited
                          ? isDark ? 'text-yellow-200' : 'text-yellow-700'
                          : isDark ? 'text-green-200' : 'text-green-700'
                      } mb-3 font-mono`}>
                        {analysisState.limited ? '[AUTHENTICITY_WARNING]' : '[AUTHENTICITY_VERIFICATION]'}
                      </p>
                      <ul className="space-y-2">
                        {result.editIndicators.map((indicator, idx) => (
                          <li
                            key={idx}
                            className={`flex items-start space-x-3 p-3 ${
                              analysisState.limited
                                ? isDark ? 'bg-yellow-900/30' : 'bg-yellow-100'
                                : isDark ? 'bg-green-900/30' : 'bg-green-100'
                            } rounded-lg border ${
                              analysisState.limited ? 'border-yellow-500/40' : 'border-green-500/40'
                            }`}
                          >
                            <span className={`text-lg font-mono ${
                              analysisState.limited
                                ? isDark ? 'text-yellow-300' : 'text-yellow-600'
                                : isDark ? 'text-green-400' : 'text-green-600'
                            }`}>
                              {analysisState.limited ? '⚠️' : '✓'}
                            </span>
                            <span className={`font-mono text-sm ${
                              analysisState.limited
                                ? isDark ? 'text-yellow-100' : 'text-yellow-900'
                                : isDark ? 'text-green-200' : 'text-green-800'
                            }`}>
                              {indicator}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {/* Fraud Alert */}
              {result.fraudDetected && (
                <div className="p-6 bg-red-900/30 border-2 border-red-500/60 rounded-lg">
                  <div className="flex items-center mb-3">
                    <span className="text-3xl mr-3">🚨</span>
                    <h4 className="text-xl font-bold text-red-300 font-mono">[FRAUD_DETECTED]</h4>
                  </div>
                  <p className="text-red-300 font-mono text-sm mb-3 leading-relaxed">
                    This transaction appears to be fraudulent or contains fake information.
                  </p>
                  {result.fraudIndicators && result.fraudIndicators.length > 0 && (
                    <div className="mt-4">
                      <p className="font-bold text-red-300 mb-2 font-mono text-sm">[FRAUD_INDICATORS]</p>
                      <ul className="space-y-2">
                        {result.fraudIndicators.map((indicator, idx) => (
                          <li key={idx} className="flex items-start space-x-3 p-3 bg-red-900/20 rounded border border-red-500/40">
                            <span className="text-red-400 font-mono font-bold">▸</span>
                            <span className="text-red-300 font-mono text-sm">{indicator}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {result.message && (
                <div className="p-3 bg-blue-900/20 border border-blue-500/60 text-blue-300 text-sm rounded font-mono">
                  [INFO] {result.message}
                </div>
              )}


              {/* Image Forensics */}
              <div className={`${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-300'} p-6 rounded-lg border-2`}>
                <h4 className="font-bold mb-4 font-mono text-cyan-400 text-lg">[IMAGE_FORENSICS]</h4>
                <div className="space-y-3">
                  {analysisState.limited && (
                    <p className="font-mono text-xs text-yellow-400">
                      Verdict and score are limited because the ML authenticity service was unavailable.
                    </p>
                  )}
                  <p className="font-mono text-sm">
                    <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>Verdict:</span>{' '}
                    <span
                      className={`font-bold ${
                        analysisState.limited
                          ? 'text-yellow-400'
                          : result.forgeryVerdict === 'tampered' || result.forgeryVerdict === 'TAMPERED'
                            ? 'text-red-400'
                            : result.forgeryVerdict === 'clean' || result.forgeryVerdict === 'CLEAN'
                              ? 'text-green-400'
                              : 'text-yellow-400'
                      }`}
                    >
                      {analysisState.limited ? 'UNKNOWN' : (result.forgeryVerdict?.toUpperCase() || 'UNKNOWN')}
                    </span>
                  </p>
                  <p className="font-mono text-sm">
                    <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>Forgery Score:</span>{' '}
                    <span className={`font-semibold ${
                      analysisState.limited
                        ? 'text-yellow-400'
                        : result.forgeryScore >= 40
                          ? 'text-red-400'
                          : result.forgeryScore >= 20
                            ? 'text-yellow-400'
                            : 'text-green-400'
                    }`}>
                      {analysisState.limited ? '--' : `${result.forgeryScore || 0}/100`}
                    </span>
                    {analysisState.limited && (
                      <span className="ml-2 text-yellow-400 font-bold">⚠️ LIMITED_RESULT</span>
                    )}
                    {!analysisState.limited && result.forgeryScore >= 40 && (
                      <span className="ml-2 text-red-400 font-bold">⚠️ HIGH_RISK</span>
                    )}
                  </p>
                  {result.confidence && (
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} font-mono`}>
                      <span>Confidence:</span> {analysisState.limited ? '--' : `${(result.confidence * 100).toFixed(0)}%`}
                    </p>
                  )}
                </div>
              </div>

              {/* Transaction Validation */}
              {result.transactionValidation && result.transactionValidation.validations && (
                <div className={`${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-300'} p-6 rounded-lg border-2`}>
                  <h4 className="font-bold mb-4 font-mono text-cyan-400 text-lg">[TRANSACTION_VALIDATION]</h4>
                  
                  {/* Overall Status */}
                  <div className={`mb-4 p-4 ${isDark ? 'bg-slate-950/50 border-slate-700' : 'bg-white border-gray-300'} rounded-lg border-2`}>
                    <p className="font-mono text-sm">
                      Overall Status: {' '}
                      <span className={`font-bold ${
                        result.transactionValidation.verdict === 'FRAUD_DETECTED' ? 'text-red-400' :
                        result.transactionValidation.verdict === 'SUSPICIOUS' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {result.transactionValidation.verdict}
                      </span>
                    </p>
                    <p className="text-sm text-slate-400 mt-2 font-mono">
                      {result.transactionValidation.recommendation}
                    </p>
                  </div>

                  {/* UPI ID Validation */}
                  {result.transactionValidation.validations.upi_id && (
                    <div className="text-sm mb-3 p-4 bg-slate-950/50 rounded-lg border border-slate-700">
                      <p className="font-mono font-bold text-cyan-400 mb-2">UPI ID: {result.transactionValidation.validations.upi_id.upi_id}</p>
                      <p className={`font-mono ${result.transactionValidation.validations.upi_id.valid ? 'text-green-400' : 'text-red-400'}`}>
                        {result.transactionValidation.validations.upi_id.valid ? '✓ Valid' : '✗ ' + result.transactionValidation.validations.upi_id.reason}
                      </p>
                      {result.transactionValidation.validations.upi_id.warnings && result.transactionValidation.validations.upi_id.warnings.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {result.transactionValidation.validations.upi_id.warnings.map((warn, idx) => (
                            <p key={idx} className="text-xs text-yellow-400 font-mono">⚠ {warn}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Transaction ID Validation */}
                  {result.transactionValidation.validations.transaction_id && (
                    <div className="text-sm mb-3 p-4 bg-slate-950/50 rounded-lg border border-slate-700">
                      <p className="font-mono font-bold text-cyan-400 mb-2">Transaction ID: {result.transactionValidation.validations.transaction_id.transaction_id}</p>
                      <p className={`font-mono ${result.transactionValidation.validations.transaction_id.valid ? 'text-green-400' : 'text-red-400'}`}>
                        {result.transactionValidation.validations.transaction_id.valid ? '✓ Valid' : '✗ ' + result.transactionValidation.validations.transaction_id.reason}
                      </p>
                    </div>
                  )}

                  {/* Amount Validation */}
                  {result.transactionValidation.validations.amount && (
                    <div className="text-sm p-4 bg-slate-950/50 rounded-lg border border-slate-700">
                      <p className="font-mono font-bold text-cyan-400 mb-2">Amount: ₹{result.transactionValidation.validations.amount.amount}</p>
                      <p className={`font-mono ${result.transactionValidation.validations.amount.valid ? 'text-green-400' : 'text-yellow-400'}`}>
                        {result.transactionValidation.validations.amount.valid ? '✓ Valid' : '⚠ ' + result.transactionValidation.validations.amount.reason}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* OCR Text */}
              {result.ocrText && (
                <div className={`${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-300'} p-6 rounded-lg border-2`}>
                  <h4 className="font-bold mb-3 font-mono text-cyan-400 text-lg">[EXTRACTED_TEXT_OCR]</h4>
                  <pre className={`text-xs ${isDark ? 'text-slate-300 bg-slate-950/80 border-slate-700' : 'text-gray-700 bg-white border-gray-300'} p-4 rounded-lg whitespace-pre-wrap font-mono border max-h-64 overflow-y-auto`}>
                    {result.ocrText}
                  </pre>
                </div>
              )}

              {result.uploadedBy && (
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'} font-mono`}>
                  <span className="text-cyan-400">[UPLOADED_BY]</span> {result.uploadedBy}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvidenceUpload;
