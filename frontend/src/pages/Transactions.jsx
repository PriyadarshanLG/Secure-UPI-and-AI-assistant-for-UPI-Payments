import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import api from '../utils/api';

const Transactions = () => {
  const outletContext = useOutletContext ? useOutletContext() : {};
  const theme = outletContext?.theme || 'dark';
  const isDark = theme === 'dark';
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page]);

  const fetchTransactions = async () => {
    try {
      const response = await api.get(
        `/transactions?page=${pagination.page}&limit=${pagination.limit}`
      );
      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-black' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
          <p className="mt-4 text-cyan-400 font-mono font-bold">[LOADING_TRANSACTIONS...]</p>
        </div>
      </div>
    );
  }

  const getRiskColor = (score) => {
    if (score > 70) return { bg: 'bg-red-900/30', border: 'border-red-500/60', text: 'text-red-400' };
    if (score > 40) return { bg: 'bg-yellow-900/30', border: 'border-yellow-500/60', text: 'text-yellow-400' };
    return { bg: 'bg-green-900/30', border: 'border-green-500/60', text: 'text-green-400' };
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

      <div className="relative z-10 px-4 py-8">
        {/* Header */}
        <div className="mb-8 bg-slate-950/80 backdrop-blur-xl border-2 border-cyan-500/60 rounded-xl px-6 py-6 shadow-2xl shadow-cyan-500/40 mx-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold font-mono mb-2">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                  [TRANSACTION_LOG]
                </span>
              </h1>
              <p className="text-slate-400 font-mono text-sm">{'>'} View all transactions with risk scores</p>
            </div>
            <Link
              to="/transactions/new"
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold font-mono rounded-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all border-2 border-cyan-400/50 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>[NEW_TRANSACTION]</span>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-950/80 backdrop-blur-xl border-2 border-cyan-500/60 rounded-xl shadow-2xl shadow-cyan-500/40 overflow-hidden mx-4">
          {/* Terminal Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b-2 border-cyan-500/60 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full border border-red-700"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-700"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full border border-green-700 animate-pulse"></div>
              <span className="ml-4 font-mono text-xs font-bold text-cyan-300">root@transaction-db:~$</span>
            </div>
            <div className="flex items-center space-x-2 bg-cyan-900/60 border-2 border-cyan-400 px-3 py-1 rounded">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="font-mono text-xs text-cyan-200 font-bold">{pagination.total || transactions.length} RECORDS</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-900/50 border-b-2 border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    AMOUNT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    MERCHANT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    RISK_SCORE
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    DATE
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-slate-500 font-mono">[NO_TRANSACTIONS_FOUND]</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction, idx) => (
                    <tr 
                      key={transaction._id} 
                      className="hover:bg-slate-900/50 transition-colors group"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold font-mono text-slate-100">
                          ₹{transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-slate-300">
                          {transaction.merchantId?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-bold font-mono rounded border-2 ${
                            getStatusColor(transaction.status).bg
                          } ${getStatusColor(transaction.status).border} ${
                            getStatusColor(transaction.status).text
                          } uppercase`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <span
                            className={`text-lg font-bold font-mono ${
                              getRiskColor(transaction.riskScore).text
                            }`}
                          >
                            {transaction.riskScore}
                          </span>
                          <div className="w-24 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
                            <div
                              className={`h-full ${
                                transaction.riskScore > 70
                                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                                  : transaction.riskScore > 40
                                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                  : 'bg-gradient-to-r from-green-500 to-green-600'
                              }`}
                              style={{ width: `${transaction.riskScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/transactions/${transaction._id}`}
                          className="px-4 py-2 bg-cyan-900/40 text-cyan-400 rounded border-2 border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-900/60 transition-all font-mono font-bold inline-flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>[VIEW]</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-slate-900/50 border-t-2 border-slate-800 px-6 py-4">
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-slate-800 border-2 border-cyan-500/40 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-cyan-400 hover:bg-slate-700 transition-all font-mono text-cyan-400 font-bold"
                >
                  {'<'} PREV
                </button>
                <span className="px-6 py-2 bg-slate-900/80 border-2 border-slate-700 rounded-lg font-mono text-slate-300">
                  <span className="text-cyan-400 font-bold">{pagination.page}</span> / {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.pages}
                  className="px-4 py-2 bg-slate-800 border-2 border-cyan-500/40 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-cyan-400 hover:bg-slate-700 transition-all font-mono text-cyan-400 font-bold"
                >
                  NEXT {'>'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
