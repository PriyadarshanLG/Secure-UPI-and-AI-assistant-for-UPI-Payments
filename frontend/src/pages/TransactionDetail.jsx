import { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import api from '../utils/api';

const TransactionDetail = () => {
  const outletContext = useOutletContext ? useOutletContext() : {};
  const theme = outletContext?.theme || 'dark';
  const isDark = theme === 'dark';
  
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);
  const [assessProgress, setAssessProgress] = useState(0);

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  const fetchTransaction = async () => {
    try {
      const response = await api.get(`/transactions/${id}`);
      setTransaction(response.data.transaction);
    } catch (error) {
      console.error('Failed to fetch transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRiskAssessment = async () => {
    setAssessing(true);
    setAssessProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setAssessProgress(prev => prev >= 90 ? 90 : prev + 15);
    }, 200);

    try {
      const response = await api.post('/score/assess', {
        transactionId: id,
      });
      
      clearInterval(progressInterval);
      setAssessProgress(100);
      
      await fetchTransaction(); // Refresh transaction data
      alert(`Risk assessment completed. Risk Score: ${response.data.riskScore}`);
    } catch (error) {
      clearInterval(progressInterval);
      setAssessProgress(0);
      alert('Failed to assess risk: ' + (error.response?.data?.error || error.message));
    } finally {
      setTimeout(() => {
        setAssessing(false);
        setAssessProgress(0);
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-black' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
          <p className="mt-4 text-cyan-400 font-mono font-bold">[LOADING_TRANSACTION...]</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'} flex items-center justify-center`}>
        <div className="text-center">
          <svg className="w-20 h-20 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-400 font-mono font-bold text-xl mb-4">[TRANSACTION_NOT_FOUND]</p>
          <button
            onClick={() => navigate('/transactions')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold font-mono rounded-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all border-2 border-cyan-400/50"
          >
            [BACK_TO_TRANSACTIONS]
          </button>
        </div>
      </div>
    );
  }

  const getRiskColor = (score) => {
    if (score > 70) return { bg: 'bg-red-900/30', border: 'border-red-500/60', text: 'text-red-400', glow: 'shadow-red-500/40' };
    if (score > 40) return { bg: 'bg-yellow-900/30', border: 'border-yellow-500/60', text: 'text-yellow-400', glow: 'shadow-yellow-500/40' };
    return { bg: 'bg-green-900/30', border: 'border-green-500/60', text: 'text-green-400', glow: 'shadow-green-500/40' };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-green-900/30', border: 'border-green-500/60', text: 'text-green-400' };
      case 'pending':
        return { bg: 'bg-yellow-900/30', border: 'border-yellow-500/60', text: 'text-yellow-400' };
      default:
        return { bg: 'bg-red-900/30', border: 'border-red-500/60', text: 'text-red-400' };
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'} relative overflow-hidden`}>
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40"></div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 px-4 py-8 w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/transactions')}
          className="mb-6 inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 font-mono font-bold transition-colors group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>[BACK_TO_TRANSACTIONS]</span>
        </button>

        {/* Header */}
        <div className="mb-8 bg-slate-950/80 backdrop-blur-xl border-2 border-cyan-500/60 rounded-xl px-6 py-6 shadow-2xl shadow-cyan-500/40">
          <h1 className="text-4xl font-bold font-mono mb-2">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              [TRANSACTION_DETAILS]
            </span>
          </h1>
          <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'} font-mono text-sm`}>{'>'} Complete transaction analysis & risk assessment</p>
        </div>

        {/* Transaction Card */}
        <div className={`bg-slate-950/80 backdrop-blur-xl border-2 rounded-xl shadow-2xl overflow-hidden mb-6 ${
          getRiskColor(transaction.riskScore).border
        } ${getRiskColor(transaction.riskScore).glow}`}>
          {/* Terminal Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b-2 border-cyan-500/60 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full border border-red-700"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-700"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full border border-green-700 animate-pulse"></div>
              <span className="ml-4 font-mono text-xs font-bold text-cyan-300">root@transaction-viewer:~$</span>
            </div>
          </div>

          <div className="p-8">
            {/* Risk Score Badge */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className={`text-6xl ${
                  transaction.riskScore > 70 ? 'text-red-400' :
                  transaction.riskScore > 40 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {transaction.riskScore > 70 ? '🚨' : transaction.riskScore > 40 ? '⚠️' : '✅'}
                </div>
                <div>
                  <p className={`text-sm font-mono ${isDark ? 'text-slate-400' : 'text-gray-600'} uppercase tracking-wider`}>Risk Score</p>
                  <p className={`text-6xl font-bold font-mono ${getRiskColor(transaction.riskScore).text}`}>
                    {transaction.riskScore}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-6 py-3 rounded-lg font-bold text-lg font-mono border-2 ${
                  getStatusColor(transaction.status).border
                } ${getStatusColor(transaction.status).bg} ${getStatusColor(transaction.status).text} uppercase`}>
                  {transaction.status}
                </div>
              </div>
            </div>

            {/* Transaction Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Amount */}
              <div className="bg-slate-900/50 rounded-lg p-6 border-2 border-slate-700 hover:border-cyan-500/40 transition-colors">
                <label className="block text-xs font-bold text-cyan-400 mb-3 uppercase tracking-wider font-mono">
                  [AMOUNT]
                </label>
                <p className={`text-4xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'} font-mono`}>
                  ₹{transaction.amount.toLocaleString()}
                </p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} font-mono mt-2`}>{transaction.currency}</p>
              </div>

              {/* Date/Time */}
              <div className="bg-slate-900/50 rounded-lg p-6 border-2 border-slate-700 hover:border-cyan-500/40 transition-colors">
                <label className="block text-xs font-bold text-cyan-400 mb-3 uppercase tracking-wider font-mono">
                  [TIMESTAMP]
                </label>
                <p className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'} font-mono`}>
                  {new Date(transaction.timestamp).toLocaleDateString()}
                </p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} font-mono mt-2`}>
                  {new Date(transaction.timestamp).toLocaleTimeString()}
                </p>
              </div>

              {/* Merchant */}
              {transaction.merchantId && (
                <>
                  <div className="bg-slate-900/50 rounded-lg p-6 border-2 border-slate-700 hover:border-cyan-500/40 transition-colors">
                    <label className="block text-xs font-bold text-cyan-400 mb-3 uppercase tracking-wider font-mono">
                      [MERCHANT_NAME]
                    </label>
                    <p className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'} font-mono`}>{transaction.merchantId.name}</p>
                  </div>

                  <div className="bg-slate-900/50 rounded-lg p-6 border-2 border-slate-700 hover:border-cyan-500/40 transition-colors">
                    <label className="block text-xs font-bold text-cyan-400 mb-3 uppercase tracking-wider font-mono">
                      [MERCHANT_UPI_ID]
                    </label>
                    <p className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'} font-mono break-all`}>{transaction.merchantId.upiId}</p>
                  </div>
                </>
              )}

              {/* Transaction ID */}
              <div className="bg-slate-900/50 rounded-lg p-6 border-2 border-slate-700 hover:border-cyan-500/40 transition-colors md:col-span-2">
                <label className="block text-xs font-bold text-cyan-400 mb-3 uppercase tracking-wider font-mono">
                  [TRANSACTION_ID]
                </label>
                <p className={`text-lg font-mono ${isDark ? 'text-slate-300' : 'text-gray-700'} break-all`}>{transaction._id}</p>
              </div>
            </div>

            {/* Risk Assessment Section */}
            <div className="bg-slate-900/50 rounded-lg p-6 border-2 border-slate-700 mb-6">
              <h3 className="text-lg font-bold text-cyan-400 mb-4 font-mono uppercase tracking-wider">
                [RISK_ASSESSMENT]
              </h3>
              
              {/* Risk Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-mono ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Risk Level</span>
                  <span className={`text-sm font-mono font-bold ${getRiskColor(transaction.riskScore).text}`}>
                    {transaction.riskScore > 70 ? 'HIGH_RISK' : transaction.riskScore > 40 ? 'MEDIUM_RISK' : 'LOW_RISK'}
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-4 overflow-hidden border-2 border-slate-700">
                  <div
                    className={`h-full ${
                      transaction.riskScore > 70
                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                        : transaction.riskScore > 40
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                        : 'bg-gradient-to-r from-green-500 to-green-600'
                    } transition-all duration-500`}
                    style={{ width: `${transaction.riskScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Assessment Button */}
              {assessing && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cyan-400 font-mono text-sm font-bold">[ANALYZING...]</span>
                    <span className="text-cyan-400 font-mono text-sm">{assessProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border-2 border-cyan-500/40">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ease-out"
                      style={{ width: `${assessProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                onClick={handleRiskAssessment}
                disabled={assessing}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold font-mono py-4 px-4 rounded-lg hover:shadow-2xl hover:shadow-cyan-500/50 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-cyan-400/50 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  {assessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>[ASSESSING...]</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>[RUN_RISK_ASSESSMENT]</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>

            {/* Info Notice */}
            <div className="p-4 bg-blue-900/30 border-2 border-blue-500/60 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-blue-200 font-mono leading-relaxed">
                    <span className="font-bold">[INFO]</span> Risk assessment uses advanced ML algorithms to analyze transaction patterns, 
                    device telemetry, behavioral patterns, and historical data to determine fraud probability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
