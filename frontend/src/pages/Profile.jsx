import { useAuth } from '../context/AuthContext';
import { Link, useOutletContext } from 'react-router-dom';

const Profile = () => {
  const outletContext = useOutletContext ? useOutletContext() : {};
  const theme = outletContext?.theme || 'dark';
  const isDark = theme === 'dark';
  
  const { user } = useAuth();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'} relative overflow-hidden`}>
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40"></div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 px-4 py-8 w-full">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 font-mono font-bold transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>[BACK_TO_DASHBOARD]</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 bg-slate-950/80 backdrop-blur-xl border-2 border-cyan-500/60 rounded-xl px-6 py-6 shadow-2xl shadow-cyan-500/40">
          <h1 className="text-4xl font-bold font-mono mb-2">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              [USER_PROFILE]
            </span>
          </h1>
          <p className="text-slate-400 font-mono text-sm">{'>'} Account information & system access</p>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-950/80 backdrop-blur-xl border-2 border-cyan-500/60 rounded-xl shadow-2xl shadow-cyan-500/40 overflow-hidden">
          {/* Terminal Header with Avatar */}
          <div className="bg-gradient-to-r from-purple-900 via-cyan-900 to-blue-900 border-b-2 border-cyan-500/60 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/50 border-4 border-slate-900">
                    <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-900 animate-pulse"></div>
                </div>
                <div className="text-white">
                  <h2 className="text-3xl font-bold font-mono">{user?.name}</h2>
                  <p className="text-cyan-300 font-mono text-sm mt-1">{user?.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="px-3 py-1 bg-cyan-500/30 border-2 border-cyan-400/60 text-cyan-200 text-xs font-mono font-bold rounded uppercase">
                      {user?.role}
                    </span>
                    <span className="px-3 py-1 bg-green-500/30 border-2 border-green-400/60 text-green-200 text-xs font-mono font-bold rounded flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>ACTIVE</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Full Name */}
              <div className="bg-slate-900/50 rounded-lg p-5 border-2 border-slate-700 hover:border-cyan-500/40 transition-colors">
                <label className="block text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider font-mono">
                  [FULL_NAME]
                </label>
                <p className="text-xl font-bold text-slate-100 font-mono">{user?.name}</p>
              </div>

              {/* Email */}
              <div className="bg-slate-900/50 rounded-lg p-5 border-2 border-slate-700 hover:border-cyan-500/40 transition-colors">
                <label className="block text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider font-mono">
                  [EMAIL_ADDRESS]
                </label>
                <p className="text-xl font-bold text-slate-100 font-mono break-all">{user?.email}</p>
              </div>

              {/* Phone */}
              <div className="bg-slate-900/50 rounded-lg p-5 border-2 border-slate-700 hover:border-cyan-500/40 transition-colors">
                <label className="block text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider font-mono">
                  [PHONE_NUMBER]
                </label>
                <p className="text-xl font-bold text-slate-100 font-mono">{user?.phone}</p>
              </div>

              {/* Role */}
              <div className="bg-slate-900/50 rounded-lg p-5 border-2 border-slate-700 hover:border-cyan-500/40 transition-colors">
                <label className="block text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider font-mono">
                  [USER_ROLE]
                </label>
                <p className="text-xl font-bold text-slate-100 font-mono uppercase">{user?.role}</p>
              </div>

              {/* User ID */}
              <div className="bg-slate-900/50 rounded-lg p-5 border-2 border-slate-700 hover:border-cyan-500/40 transition-colors">
                <label className="block text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider font-mono">
                  [USER_ID]
                </label>
                <p className="text-sm font-mono text-slate-300 break-all">{user?._id}</p>
              </div>

              {/* Account Status */}
              <div className="bg-slate-900/50 rounded-lg p-5 border-2 border-slate-700 hover:border-cyan-500/40 transition-colors">
                <label className="block text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider font-mono">
                  [ACCOUNT_STATUS]
                </label>
                <span className="inline-flex items-center px-4 py-2 rounded border-2 border-green-500/60 bg-green-900/30 text-green-400 font-mono font-bold">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  ACTIVE
                </span>
              </div>
            </div>

            {/* Demo Mode Info */}
            <div className="mb-8 p-6 bg-blue-900/30 border-2 border-blue-500/60 rounded-lg backdrop-blur-xl">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <svg className="h-7 w-7 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-blue-300 mb-2 font-mono">[DEMO_MODE_ACTIVE]</h4>
                  <p className="text-sm text-blue-200 font-mono leading-relaxed">
                    This is a demonstration account. Profile editing is disabled for this demo.
                    Focus on testing the main fraud detection features including evidence upload and transaction analysis.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/evidence/upload"
                className="flex-1 inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold font-mono rounded-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all border-2 border-cyan-400/50 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>[START_FRAUD_DETECTION]</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
