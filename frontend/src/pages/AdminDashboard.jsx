import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../utils/api';

const AdminDashboard = () => {
  const outletContext = useOutletContext ? useOutletContext() : {};
  const theme = outletContext?.theme || 'dark';
  const isDark = theme === 'dark';
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, logsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=10'),
        api.get('/admin/logs?limit=10'),
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setLogs(logsRes.data.logs);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-black' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-purple-400 font-mono font-bold">[LOADING_ADMIN_DATA...]</p>
        </div>
      </div>
    );
  }

  const chartData = stats?.users?.byRole
    ? [
        { name: 'Admin', value: stats.users.byRole.admin },
        { name: 'Merchant', value: stats.users.byRole.merchant },
        { name: 'Customer', value: stats.users.byRole.customer },
      ]
    : [];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'} relative overflow-hidden`}>
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40"></div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 px-4 py-8">
        {/* Header */}
        <div className="mb-8 bg-slate-950/80 backdrop-blur-xl border-2 border-purple-500/60 rounded-xl px-6 py-6 shadow-2xl shadow-purple-500/40 mx-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold font-mono mb-2">
                <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  [ADMIN_CONTROL_PANEL]
                </span>
              </h1>
              <p className="text-slate-400 font-mono text-sm">{'>'} System monitoring & user management</p>
            </div>
            <div className="flex items-center space-x-2 bg-purple-900/60 border-2 border-purple-400 px-4 py-2 rounded-lg">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="font-mono text-sm text-purple-200 font-bold">ADMIN_MODE</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8 mx-4">
          {/* Total Users */}
          <div className="bg-slate-950/80 backdrop-blur-xl border-2 border-cyan-500/60 rounded-xl p-6 shadow-xl shadow-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/60 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-cyan-400 font-mono text-xs uppercase tracking-wider font-bold">[TOTAL_USERS]</span>
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded border-2 border-cyan-400/50">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
            </div>
            <p className="text-5xl font-bold font-mono text-slate-50">{stats?.users?.total || 0}</p>
            <p className="text-xs font-mono text-slate-400 mt-2">Registered accounts</p>
          </div>

          {/* Total Transactions */}
          <div className="bg-slate-950/80 backdrop-blur-xl border-2 border-blue-500/60 rounded-xl p-6 shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/60 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-blue-400 font-mono text-xs uppercase tracking-wider font-bold">[TRANSACTIONS]</span>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded border-2 border-blue-400/50">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-5xl font-bold font-mono text-slate-50">{stats?.transactions?.total || 0}</p>
            <p className="text-xs font-mono text-slate-400 mt-2">Total processed</p>
          </div>

          {/* High Risk */}
          <div className="bg-slate-950/80 backdrop-blur-xl border-2 border-red-500/60 rounded-xl p-6 shadow-xl shadow-red-500/40 hover:shadow-2xl hover:shadow-red-500/60 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-red-400 font-mono text-xs uppercase tracking-wider font-bold">[HIGH_RISK]</span>
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded border-2 border-red-400/50">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-5xl font-bold font-mono text-red-400">{stats?.transactions?.highRisk || 0}</p>
            <p className="text-xs font-mono text-slate-400 mt-2">Flagged transactions</p>
          </div>

          {/* Tampered Evidence */}
          <div className="bg-slate-950/80 backdrop-blur-xl border-2 border-orange-500/60 rounded-xl p-6 shadow-xl shadow-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/60 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-orange-400 font-mono text-xs uppercase tracking-wider font-bold">[TAMPERED_FILES]</span>
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded border-2 border-orange-400/50">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-5xl font-bold font-mono text-orange-400">{stats?.evidence?.tampered || 0}</p>
            <p className="text-xs font-mono text-slate-400 mt-2">Detected forgeries</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mx-4">
          {/* Users by Role Chart */}
          <div className="bg-slate-950/80 backdrop-blur-xl border-2 border-purple-500/60 rounded-xl shadow-2xl shadow-purple-500/40 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b-2 border-purple-500/60 px-6 py-4">
              <h2 className="text-xl font-bold font-mono text-purple-300">[USERS_BY_ROLE]</h2>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" style={{ fontFamily: 'monospace', fontSize: '12px' }} />
                  <YAxis stroke="#94a3b8" style={{ fontFamily: 'monospace', fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: '2px solid #a855f7',
                      borderRadius: '8px',
                      fontFamily: 'monospace'
                    }}
                  />
                  <Legend wrapperStyle={{ fontFamily: 'monospace' }} />
                  <Bar dataKey="value" fill="url(#purpleGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-slate-950/80 backdrop-blur-xl border-2 border-cyan-500/60 rounded-xl shadow-2xl shadow-cyan-500/40 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b-2 border-cyan-500/60 px-6 py-4">
              <h2 className="text-xl font-bold font-mono text-cyan-300">[RECENT_USERS]</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-100 font-mono">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-400 font-mono">{user.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 text-xs font-bold font-mono rounded border-2 bg-purple-900/30 border-purple-500/60 text-purple-400 uppercase">
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="bg-slate-950/80 backdrop-blur-xl border-2 border-purple-500/60 rounded-xl shadow-2xl shadow-purple-500/40 overflow-hidden mx-4">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b-2 border-purple-500/60 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full border border-red-700"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-700"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full border border-green-700 animate-pulse"></div>
              <span className="ml-4 font-mono text-xs font-bold text-purple-300">root@audit-logs:~$</span>
            </div>
            <h2 className="text-xl font-bold font-mono text-purple-300">[RECENT_AUDIT_LOGS]</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-900/50 border-b-2 border-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">
                    Actor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-100 font-mono">
                      {log.actorId?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">{log.action}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-8 bg-blue-900/30 border-2 border-blue-500/60 rounded-xl p-6 backdrop-blur-xl mx-4">
          <div className="flex items-start space-x-4">
            <svg className="w-8 h-8 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-lg font-bold text-blue-300 mb-2 font-mono">[ADMIN_PANEL_INFO]</h4>
              <p className="text-sm text-blue-200 font-mono leading-relaxed">
                This admin dashboard provides real-time monitoring of system activity, user management, and security analytics. 
                All actions are logged in the audit trail for compliance and security purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
