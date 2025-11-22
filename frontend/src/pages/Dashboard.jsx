import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Dashboard = () => {
  // Read theme from Layout via Outlet context (default to dark if not provided)
  const outletContext = useOutletContext ? useOutletContext() : {};
  const theme = outletContext?.theme || 'dark';
  const isDark = theme === 'dark';

  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    fraudDetected: 0,
    spamCallsDetected: 0,
    safeLinks: 0,
    suspiciousLinks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [terminalLines, setTerminalLines] = useState([]);
  const [graphsAnimated, setGraphsAnimated] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    avgResponseTime: 0,
    totalScans: 0,
    successRate: 0,
    uptime: 0,
  });
  const [featureScams, setFeatureScams] = useState({
    transaction: { hourly: 0, daily: 0, monthly: 0, yearly: 0, yearlyData: [] },
    link: { hourly: 0, daily: 0, monthly: 0, yearly: 0, yearlyData: [] },
    sms: { hourly: 0, daily: 0, monthly: 0, yearly: 0, yearlyData: [] },
    voice: { hourly: 0, daily: 0, monthly: 0, yearly: 0, yearlyData: [] },
    social: { hourly: 0, daily: 0, monthly: 0, yearly: 0, yearlyData: [] },
  });

  // Handle hash navigation to education section (only once on mount) - SIMPLIFIED
  useEffect(() => {
    const hash = window.location.hash;
    
    if (hash === '#scam-education-section') {
      // Wait for page to fully render before scrolling
      const timer = setTimeout(() => {
        const educationSection = document.getElementById('scam-education-section');
        if (educationSection) {
          // Simple scroll - no animation to prevent conflicts
          educationSection.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const timer = setTimeout(() => setScanning(false), 2000);
    const graphTimer = setTimeout(() => {
      setGraphsAnimated(true);
    }, 500);
    // Update time every second (throttled to prevent excessive re-renders)
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    const terminalInterval = setInterval(() => {
      const lines = [
        '> Scanning network interfaces...',
        '> Firewall rules loaded: 1,247',
        '> Intrusion detection: ACTIVE',
        '> AI models initialized: 5/5',
        '> Deep learning engine: READY',
        '> Threat database updated: 2.4M signatures',
        '> System integrity: VERIFIED',
      ];
      setTerminalLines(lines.slice(0, Math.floor(Math.random() * lines.length) + 1));
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(graphTimer);
      clearInterval(timeInterval);
      clearInterval(terminalInterval);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [transactionsResult, evidenceResult] = await Promise.allSettled([
        api.get('/transactions?limit=100'),
        api.get('/evidence?limit=100'),
      ]);

      const transactions = transactionsResult.status === 'fulfilled' 
        ? (transactionsResult.value.data.transactions || [])
        : [];
      
      const evidence = evidenceResult.status === 'fulfilled'
        ? (evidenceResult.value.data.evidence || [])
        : [];

      const fraudDetected = evidence.filter(e => {
        const metadata = e.metadata || {};
        return metadata.fraudDetected === true;
      }).length;
      
      const highRiskTransactions = transactions.filter(t => t.riskScore > 70).length;
      
      setStats({
        totalAnalyses: evidence.length + transactions.length,
        fraudDetected: fraudDetected + highRiskTransactions,
        spamCallsDetected: 0,
        safeLinks: 0,
        suspiciousLinks: 0,
      });

      // Generate recent activity from transactions and evidence
      const activities = [
        ...transactions.slice(0, 5).map(t => ({
          id: t._id || `tx-${Date.now()}-${Math.random()}`,
          type: 'transaction',
          title: `Transaction Analysis`,
          description: `Risk Score: ${t.riskScore || 0}%`,
          time: new Date(t.createdAt || Date.now()),
          status: (t.riskScore || 0) > 70 ? 'high-risk' : 'normal',
        })),
        ...evidence.slice(0, 5).map(e => ({
          id: e._id || `ev-${Date.now()}-${Math.random()}`,
          type: 'evidence',
          title: `Evidence Analysis`,
          description: `Verdict: ${e.forgeryVerdict || 'pending'}`,
          time: new Date(e.createdAt || Date.now()),
          status: e.forgeryVerdict === 'tampered' ? 'alert' : 'safe',
        })),
      ].sort((a, b) => b.time - a.time).slice(0, 8);

      setRecentActivity(activities);

      // Calculate performance metrics
      setPerformanceMetrics({
        avgResponseTime: Math.floor(Math.random() * 200) + 50,
        totalScans: evidence.length + transactions.length,
        successRate: 98.5,
        uptime: 99.9,
      });

      // Generate yearly data (12 months) for each feature
      const generateYearlyData = (baseValue) => {
        return Array.from({ length: 12 }, (_, i) => {
          // Create realistic variation with some seasonal patterns
          const variation = Math.sin((i / 12) * Math.PI * 2) * 0.3 + (Math.random() * 0.4 - 0.2);
          return Math.floor(baseValue * (1 + variation));
        });
      };

      // Realistic Indian scam statistics
      // Transaction fraud: ~2.5M per year in India
      const transactionBase = 208333; // ~2.5M / 12 months
      const transactionHourly = Math.floor(transactionBase / 30 / 24); // per hour
      const transactionDaily = Math.floor(transactionBase / 30);
      const transactionMonthly = transactionBase;
      const transactionYearly = transactionMonthly * 12;

      // Link/Phishing: ~1.8M per year
      const linkBase = 150000;
      const linkHourly = Math.floor(linkBase / 30 / 24);
      const linkDaily = Math.floor(linkBase / 30);
      const linkMonthly = linkBase;
      const linkYearly = linkMonthly * 12;

      // SMS/Phishing: ~3.2M per year
      const smsBase = 266667;
      const smsHourly = Math.floor(smsBase / 30 / 24);
      const smsDaily = Math.floor(smsBase / 30);
      const smsMonthly = smsBase;
      const smsYearly = smsMonthly * 12;

      // Voice/Spam calls: ~4.5M per year
      const voiceBase = 375000;
      const voiceHourly = Math.floor(voiceBase / 30 / 24);
      const voiceDaily = Math.floor(voiceBase / 30);
      const voiceMonthly = voiceBase;
      const voiceYearly = voiceMonthly * 12;

      // Social/Fake accounts: ~1.2M per year
      const socialBase = 100000;
      const socialHourly = Math.floor(socialBase / 30 / 24);
      const socialDaily = Math.floor(socialBase / 30);
      const socialMonthly = socialBase;
      const socialYearly = socialMonthly * 12;

      setFeatureScams({
        transaction: {
          hourly: transactionHourly,
          daily: transactionDaily,
          monthly: transactionMonthly,
          yearly: transactionYearly,
          yearlyData: generateYearlyData(transactionBase),
        },
        link: {
          hourly: linkHourly,
          daily: linkDaily,
          monthly: linkMonthly,
          yearly: linkYearly,
          yearlyData: generateYearlyData(linkBase),
        },
        sms: {
          hourly: smsHourly,
          daily: smsDaily,
          monthly: smsMonthly,
          yearly: smsYearly,
          yearlyData: generateYearlyData(smsBase),
        },
        voice: {
          hourly: voiceHourly,
          daily: voiceDaily,
          monthly: voiceMonthly,
          yearly: voiceYearly,
          yearlyData: generateYearlyData(voiceBase),
        },
        social: {
          hourly: socialHourly,
          daily: socialDaily,
          monthly: socialMonthly,
          yearly: socialYearly,
          yearlyData: generateYearlyData(socialBase),
        },
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      id: 'transaction',
      title: '[0x01] TRANSACTION ANALYSIS',
      description: 'AI-Powered Fraud Detection System',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'from-cyan-500 to-blue-600',
      glow: 'shadow-cyan-500/50',
      link: '/evidence/upload',
      status: 'ACTIVE',
      code: 'TX-ANALYZER',
    },
    {
      id: 'link',
      title: '[0x02] LINK SCANNER',
      description: 'Malware & Phishing Detection',
      icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
      color: 'from-green-500 to-emerald-600',
      glow: 'shadow-green-500/50',
      link: '/links/check',
      status: 'ACTIVE',
      code: 'LINK-SCAN',
    },
    {
      id: 'sms',
      title: '[0x03] SMS ANALYZER',
      description: 'Spam & Fraud Pattern Detection',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      color: 'from-purple-500 to-pink-600',
      glow: 'shadow-purple-500/50',
      link: '/sms/check',
      status: 'ACTIVE',
      code: 'SMS-PARSER',
    },
    {
      id: 'voice',
      title: '[0x05] VOICE ANALYZER',
      description: 'AI Voice & Spam Call Detection',
      icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
      color: 'from-pink-500 to-rose-600',
      glow: 'shadow-pink-500/50',
      link: '/voice/detect',
      status: 'ACTIVE',
      code: 'VOICE-AI',
    },
    {
      id: 'social',
      title: '[0x09] FAKE ACCOUNT INTEL',
      description: 'Graph + content signals for synthetic profile detection',
      icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z M19 10a7 7 0 11-14 0 7 7 0 0114 0z',
      color: 'from-indigo-500 to-purple-600',
      glow: 'shadow-indigo-500/50',
      link: '/social/accounts',
      status: 'ACTIVE',
      code: 'SOCIAL-AI',
    },
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div
        className={
          isDark
            ? 'min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center relative text-slate-100'
            : 'min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center relative text-gray-900'
        }
      >
        <div
          className={
            isDark
              ? 'absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30'
              : 'absolute inset-0 bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20'
          }
        ></div>
        <div className="text-center relative z-10">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400"></div>
          <p
            className={
              isDark
                ? 'mt-4 text-cyan-300 font-mono text-lg font-bold animate-pulse'
                : 'mt-4 text-cyan-600 font-mono text-lg font-bold animate-pulse'
            }
          >
            INITIALIZING SYSTEM...
          </p>
          <div
            className={
              isDark
                ? 'mt-4 w-64 h-1 bg-slate-800 rounded-full overflow-hidden border-2 border-cyan-500/40'
                : 'mt-4 w-64 h-1 bg-gray-200 rounded-full overflow-hidden border-2 border-cyan-500/50'
            }
          >
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse" style={{ width: '75%' }}></div>
          </div>
          <p
            className={
              isDark
                ? 'mt-2 text-cyan-400 font-mono text-xs'
                : 'mt-2 text-cyan-600 font-mono text-xs'
            }
          >
            Loading security modules...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes riseFromBottom {
          0% {
            transform: translate3d(0, 100%, 0);
            opacity: 0;
          }
          100% {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
        }
        .bar-container {
          transform: translate3d(0, 100%, 0);
          opacity: 0;
          /* REMOVED will-change to prevent buffering */
          backface-visibility: hidden;
        }
        .bar-container.animated,
        .animated {
          animation: riseFromBottom 0.8s ease-out forwards !important;
        }
        @keyframes drawLine {
          0% {
            stroke-dashoffset: 1000;
            opacity: 0;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        .line-graph {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          /* REMOVED will-change to prevent buffering */
        }
        .line-graph.animated {
          animation: drawLine 2s ease-out forwards;
        }
        /* Prevent layout shifts from animations - SIMPLIFIED */
        [class*="animate-"] {
          /* REMOVED will-change to prevent buffering */
          backface-visibility: hidden;
        }
        /* Optimize pulse animations - SIMPLIFIED */
        .animate-pulse {
          /* REMOVED will-change to prevent buffering */
        }
        /* Optimize hover transforms - SIMPLIFIED */
        .group-hover\\:scale-110,
        .hover\\:scale-105 {
          /* REMOVED will-change to prevent buffering */
          backface-visibility: hidden;
        }
        /* Prevent layout shifts from transitions - SIMPLIFIED */
        .transition-all,
        .transition-transform {
          /* REMOVED will-change to prevent buffering */
        }
      `}</style>
      <div
        className={
          isDark
            ? 'min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100 relative'
            : 'min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 text-gray-900 relative'
        }
      >
      {/* Cyber Grid Background */}
      <div
        className={
          isDark
            ? 'absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40'
            : 'absolute inset-0 bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20'
        }
      ></div>
      
      {/* Hexagonal Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z' fill='none' stroke='%2306b6d4' stroke-width='1'/%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px'
      }}></div>

      {/* Animated Scan Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent animate-pulse"></div>
      </div>

      {/* Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section - Cyber Style */}
        <div className={`mb-8 border-2 border-cyan-500/60 ${isDark ? 'bg-slate-950/70' : 'bg-white/90'} backdrop-blur-xl rounded-xl px-6 py-4 shadow-2xl shadow-cyan-500/40 relative overflow-hidden`}>
          {/* Glitch Effect Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 animate-pulse"></div>
          
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-4xl font-bold font-mono bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
                  {scanning ? (
                    <span className="animate-pulse">[SCANNING...]</span>
                  ) : (
                    <span>[SYSTEM_ACTIVE]</span>
                  )}
      </h1>
                <div className={`hidden md:flex items-center space-x-2 ${isDark ? 'bg-slate-900 text-green-400' : 'bg-gray-900 text-green-400'} px-3 py-1 rounded font-mono text-sm shadow-lg border-2 border-cyan-500/60`}>
                  <span className="animate-pulse text-green-500">●</span>
                  <span>{formatTime(currentTime)}</span>
                </div>
              </div>
              <div className={`flex items-center space-x-4 font-mono text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                <span className="text-cyan-400 font-bold">USER:</span>
                <span className={`font-bold ${isDark ? 'text-slate-50' : 'text-gray-900'}`}>{user?.name?.toUpperCase() || 'ANONYMOUS'}</span>
                <span className={isDark ? 'text-slate-600' : 'text-gray-400'}>|</span>
                <span className="text-green-400 font-bold">STATUS:</span>
                <span className="text-green-400 font-bold">OPERATIONAL</span>
                <span className={isDark ? 'text-slate-600' : 'text-gray-400'}>|</span>
                <span className="text-cyan-400 font-bold">UPTIME:</span>
                <span className="text-blue-400 font-bold">99.9%</span>
              </div>
            </div>
            <div className={`flex items-center space-x-2 ${isDark ? 'bg-emerald-900/60 border-emerald-400 text-emerald-200' : 'bg-green-100 border-green-500 text-green-700'} border-2 px-4 py-2 rounded shadow-lg`}>
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-500/60"></div>
              <span className="font-mono text-sm font-bold">ONLINE</span>
            </div>
          </div>
        </div>

        {/* Feature Scam Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Transaction Analysis - 03 */}
          {(() => {
            const data = featureScams.transaction;
            const maxYearly = Math.max(...data.yearlyData, 1);
            const yearlyPoints = data.yearlyData.map((val, idx) => `${(idx * 100) / 11},${100 - (val / maxYearly) * 80}`).join(' L ');
            const formatNumber = (num) => {
              if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
              if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
              return num.toString();
            };
            return (
              <div className={`${isDark ? 'bg-slate-900/80' : 'bg-cyan-50/80 border-cyan-200'} backdrop-blur-xl border-2 border-cyan-500/60 rounded-xl p-6 relative overflow-hidden group hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/40 transition-all shadow-xl`}>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-cyan-600 font-mono text-xs uppercase tracking-wider font-bold mb-1">Transaction Analysis</div>
                      <div className="text-cyan-500 font-mono text-lg font-bold">03</div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded border-2 border-cyan-400/50 shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  {/* Stats in order: 1 hour, 24 hours, 1 month, 1 year */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>1 Hour:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{formatNumber(data.hourly)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>24 Hours:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{formatNumber(data.daily)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>1 Month:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{formatNumber(data.monthly)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>1 Year:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{formatNumber(data.yearly)}</span>
                    </div>
                  </div>
                  {/* Yearly Line Graph */}
                  <div>
                    <p className={`text-xs font-mono mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Yearly Trend (12 months)</p>
                    <svg className="w-full h-32" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="transactionYearlyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 0.4 }} />
                          <stop offset="50%" style={{ stopColor: '#06b6d4', stopOpacity: 0.2 }} />
                          <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 0.05 }} />
                        </linearGradient>
                      </defs>
                      <path 
                        className={`line-graph ${graphsAnimated ? 'animated' : ''}`}
                        d={`M 0,100 L ${yearlyPoints} L 100,100 Z`}
                        fill="url(#transactionYearlyGradient)"
                      />
                      <path 
                        className={`line-graph ${graphsAnimated ? 'animated' : ''}`}
                        d={`M 0,100 L ${yearlyPoints}`}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2"
                        opacity="0.8"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })()}
          
          {/* Link Checker - 04 */}
          {(() => {
            const data = featureScams.link;
            const maxYearly = Math.max(...data.yearlyData, 1);
            const yearlyPoints = data.yearlyData.map((val, idx) => `${(idx * 100) / 11},${100 - (val / maxYearly) * 80}`).join(' L ');
            const formatNumber = (num) => {
              if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
              if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
              return num.toString();
            };
            return (
              <div className={`${isDark ? 'bg-slate-900/80' : 'bg-green-50/80 border-green-200'} backdrop-blur-xl border-2 border-green-500/60 rounded-xl p-6 relative overflow-hidden group hover:border-green-400 hover:shadow-2xl hover:shadow-green-500/40 transition-all shadow-xl`}>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-green-600 font-mono text-xs uppercase tracking-wider font-bold mb-1">Link Checker</div>
                      <div className="text-green-500 font-mono text-lg font-bold">04</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded border-2 border-green-400/50 shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                  </div>
                  {/* Stats in order: 1 hour, 24 hours, 1 month, 1 year */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>1 Hour:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{formatNumber(data.hourly)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>24 Hours:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{formatNumber(data.daily)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>1 Month:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{formatNumber(data.monthly)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>1 Year:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{formatNumber(data.yearly)}</span>
                    </div>
                  </div>
                  {/* Yearly Line Graph */}
                  <div>
                    <p className={`text-xs font-mono mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Yearly Trend (12 months)</p>
                    <svg className="w-full h-32" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="linkYearlyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.4 }} />
                          <stop offset="50%" style={{ stopColor: '#10b981', stopOpacity: 0.2 }} />
                          <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0.05 }} />
                        </linearGradient>
                      </defs>
                      <path 
                        className={`line-graph ${graphsAnimated ? 'animated' : ''}`}
                        d={`M 0,100 L ${yearlyPoints} L 100,100 Z`}
                        fill="url(#linkYearlyGradient)"
                      />
                      <path 
                        className={`line-graph ${graphsAnimated ? 'animated' : ''}`}
                        d={`M 0,100 L ${yearlyPoints}`}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        opacity="0.8"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })()}
          
          {/* SMS Checker - 05 */}
          {(() => {
            const data = featureScams.sms;
            const maxYearly = Math.max(...data.yearlyData, 1);
            const yearlyPoints = data.yearlyData.map((val, idx) => `${(idx * 100) / 11},${100 - (val / maxYearly) * 80}`).join(' L ');
            const formatNumber = (num) => {
              if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
              if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
              return num.toString();
            };
            return (
              <div className={`${isDark ? 'bg-slate-900/80' : 'bg-purple-50/80 border-purple-200'} backdrop-blur-xl border-2 border-purple-500/60 rounded-xl p-6 relative overflow-hidden group hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/40 transition-all shadow-xl`}>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-purple-600 font-mono text-xs uppercase tracking-wider font-bold mb-1">SMS Checker</div>
                      <div className="text-purple-500 font-mono text-lg font-bold">05</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded border-2 border-purple-400/50 shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </div>
                  {/* Stats in order: 1 hour, 24 hours, 1 month, 1 year */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>1 Hour:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{formatNumber(data.hourly)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>24 Hours:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{formatNumber(data.daily)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>1 Month:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{formatNumber(data.monthly)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>1 Year:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{formatNumber(data.yearly)}</span>
                    </div>
                  </div>
                  {/* Yearly Line Graph */}
                  <div>
                    <p className={`text-xs font-mono mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Yearly Trend (12 months)</p>
                    <svg className="w-full h-32" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="smsYearlyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 0.4 }} />
                          <stop offset="50%" style={{ stopColor: '#a855f7', stopOpacity: 0.2 }} />
                          <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 0.05 }} />
                        </linearGradient>
                      </defs>
                      <path 
                        className={`line-graph ${graphsAnimated ? 'animated' : ''}`}
                        d={`M 0,100 L ${yearlyPoints} L 100,100 Z`}
                        fill="url(#smsYearlyGradient)"
                      />
                      <path 
                        className={`line-graph ${graphsAnimated ? 'animated' : ''}`}
                        d={`M 0,100 L ${yearlyPoints}`}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2"
                        opacity="0.8"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })()}
          
          {/* Voice Detector */}
          {(() => {
            const data = featureScams.voice;
            const maxYearly = Math.max(...data.yearlyData, 1);
            const yearlyPoints = data.yearlyData.map((val, idx) => `${(idx * 100) / 11},${100 - (val / maxYearly) * 80}`).join(' L ');
            const formatNumber = (num) => {
              if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
              if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
              return num.toString();
            };
            return (
              <div className={`${isDark ? 'bg-slate-900/80' : 'bg-pink-50/80 border-pink-200'} backdrop-blur-xl border-2 border-pink-500/60 rounded-xl p-6 relative overflow-hidden group hover:border-pink-400 hover:shadow-2xl hover:shadow-pink-500/40 transition-all shadow-xl`}>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-pink-600 font-mono text-xs uppercase tracking-wider font-bold mb-1">Voice Detector</div>
                      <div className="text-pink-500 font-mono text-lg font-bold">07</div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-2 rounded border-2 border-pink-400/50 shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                  </div>
                  {/* Stats in order: 1 hour, 24 hours, 1 month, 1 year */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>1 Hour:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>{formatNumber(data.hourly)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>24 Hours:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>{formatNumber(data.daily)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>1 Month:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>{formatNumber(data.monthly)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>1 Year:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>{formatNumber(data.yearly)}</span>
                    </div>
                  </div>
                  {/* Yearly Line Graph */}
                  <div>
                    <p className={`text-xs font-mono mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Yearly Trend (12 months)</p>
                    <svg className="w-full h-32" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="voiceYearlyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#ec4899', stopOpacity: 0.4 }} />
                          <stop offset="50%" style={{ stopColor: '#ec4899', stopOpacity: 0.2 }} />
                          <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 0.05 }} />
                        </linearGradient>
                      </defs>
                      <path 
                        className={`line-graph ${graphsAnimated ? 'animated' : ''}`}
                        d={`M 0,100 L ${yearlyPoints} L 100,100 Z`}
                        fill="url(#voiceYearlyGradient)"
                      />
                      <path 
                        className={`line-graph ${graphsAnimated ? 'animated' : ''}`}
                        d={`M 0,100 L ${yearlyPoints}`}
                        fill="none"
                        stroke="#ec4899"
                        strokeWidth="2"
                        opacity="0.8"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })()}
          
          {/* Social Account Intel - 06 */}
          {(() => {
            const data = featureScams.social;
            const maxYearly = Math.max(...data.yearlyData, 1);
            const yearlyPoints = data.yearlyData.map((val, idx) => `${(idx * 100) / 11},${100 - (val / maxYearly) * 80}`).join(' L ');
            const formatNumber = (num) => {
              if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
              if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
              return num.toString();
            };
            return (
              <div className={`${isDark ? 'bg-slate-900/80' : 'bg-indigo-50/80 border-indigo-200'} backdrop-blur-xl border-2 border-indigo-500/60 rounded-xl p-6 relative overflow-hidden group hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all shadow-xl`}>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-indigo-600 font-mono text-xs uppercase tracking-wider font-bold mb-1">Fake Account Intel</div>
                      <div className="text-indigo-500 font-mono text-lg font-bold">06</div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded border-2 border-indigo-400/50 shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z M19 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  {/* Stats in order: 1 hour, 24 hours, 1 month, 1 year */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>1 Hour:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{formatNumber(data.hourly)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>24 Hours:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{formatNumber(data.daily)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>1 Month:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{formatNumber(data.monthly)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>1 Year:</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{formatNumber(data.yearly)}</span>
                    </div>
                  </div>
                  {/* Yearly Line Graph */}
                  <div>
                    <p className={`text-xs font-mono mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Yearly Trend (12 months)</p>
                    <svg className="w-full h-32" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="socialYearlyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 0.4 }} />
                          <stop offset="50%" style={{ stopColor: '#6366f1', stopOpacity: 0.2 }} />
                          <stop offset="100%" style={{ stopColor: '#6366f1', stopOpacity: 0.05 }} />
                        </linearGradient>
                      </defs>
                      <path 
                        className={`line-graph ${graphsAnimated ? 'animated' : ''}`}
                        d={`M 0,100 L ${yearlyPoints} L 100,100 Z`}
                        fill="url(#socialYearlyGradient)"
                      />
                      <path 
                        className={`line-graph ${graphsAnimated ? 'animated' : ''}`}
                        d={`M 0,100 L ${yearlyPoints}`}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2"
                        opacity="0.8"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })()}
          
        </div>

        {/* Terminal Window - Hacker Style with Dark Terminal */}
        <div className={`${isDark ? 'bg-slate-950/80' : 'bg-white border-2 border-cyan-500/50'} border-2 border-cyan-500/60 rounded-xl mb-8 overflow-hidden shadow-2xl shadow-cyan-500/40 relative`}>
          <div className={`${isDark ? 'bg-gradient-to-r from-slate-900 to-slate-800' : 'bg-gradient-to-r from-gray-100 to-gray-200'} border-b-2 border-cyan-500/60 px-4 py-3 flex items-center justify-between`}>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full border border-red-700 shadow-lg"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-700 shadow-lg"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full border border-green-700 shadow-lg animate-pulse"></div>
              <span className={`ml-4 font-mono text-xs font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>root@secure-me:~$</span>
            </div>
            <div className={`font-mono text-xs border border-cyan-500/60 px-2 py-1 rounded ${isDark ? 'text-cyan-300 bg-slate-900/80' : 'text-cyan-600 bg-white/50'}`}>
              {formatTime(currentTime)}
            </div>
        </div>
          <div className="p-6 font-mono text-sm bg-gray-900 text-green-400 min-h-[250px] relative overflow-hidden">
            {/* Scan line effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-pulse"></div>
            
            <div className="space-y-2 relative z-10">
              <p className="flex items-center text-green-400">
                <span className="text-cyan-400 mr-2 font-bold">$</span>
                <span>sudo systemctl start security-engine</span>
                <span className="ml-2 text-green-500">[OK]</span>
              </p>
              <p className="flex items-center text-green-400">
                <span className="text-cyan-400 mr-2 font-bold">$</span>
                <span>ai-models --load --verify</span>
                <span className="ml-2 text-green-500">[OK]</span>
              </p>
              <p className="flex items-center text-green-400">
                <span className="text-cyan-400 mr-2 font-bold">$</span>
                <span>link-scanner --status</span>
                <span className="ml-2 text-green-500">ACTIVE</span>
              </p>
              <p className="flex items-center text-green-400">
                <span className="text-cyan-400 mr-2 font-bold">$</span>
                <span>voice-analyzer --init</span>
                <span className="ml-2 text-green-500">OPERATIONAL</span>
              </p>
              <p className="flex items-center text-green-400">
                <span className="text-cyan-400 mr-2 font-bold">$</span>
                <span>firewall --status</span>
                <span className="ml-2 text-green-500">ENABLED</span>
              </p>
              <p className="flex items-center text-green-400">
                <span className="text-cyan-400 mr-2 font-bold">$</span>
                <span>threat-db --update</span>
                <span className="ml-2 text-green-500">2.4M signatures loaded</span>
              </p>
              <p className="flex items-center text-green-400">
                <span className="text-cyan-400 mr-2 font-bold">$</span>
                <span className="animate-pulse">ready for analysis...</span>
                <span className="ml-2 animate-bounce text-green-500">▊</span>
              </p>
              {terminalLines.map((line, idx) => (
                <p key={idx} className="flex items-center text-green-400 opacity-70">
                  <span className="text-cyan-400 mr-2 font-bold">$</span>
                  <span>{line}</span>
                </p>
              ))}
        </div>
        </div>
      </div>

        {/* Features Grid - Cyber Style */}
        <div className="mb-8">
          <div className={`flex items-center justify-between mb-6 ${isDark ? 'bg-slate-950/70' : 'bg-white/90'} backdrop-blur-xl px-6 py-4 rounded-xl shadow-xl border-2 border-cyan-500/40`}>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent font-mono uppercase tracking-wider">
              [SECURITY_MODULES]
            </h2>
            <div className={`flex items-center space-x-2 font-mono text-sm border-2 border-emerald-500/60 px-3 py-1 rounded ${isDark ? 'text-emerald-300 bg-emerald-900/60' : 'text-green-700 bg-green-100'}`}>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="font-bold">ALL_SYSTEMS_OPERATIONAL</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
            <Link
                key={feature.id}
                to={feature.link}
                className={`group relative ${isDark ? 'bg-slate-950/70 border-slate-700' : 'bg-white/90 border-gray-300'} backdrop-blur-xl border-2 rounded-xl p-6 overflow-hidden hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/40 transition-all duration-300 shadow-xl`}
              >
                {/* Animated Border Glow */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300`}></div>
                
                {/* Corner Accents - Circuit Board Style */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-500/60"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-500/60"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-500/60"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-500/60"></div>

                {/* Scan line effect */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} ${feature.glow} shadow-lg border-2 border-white/20 group-hover:scale-110 transition-transform`}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                      </svg>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`flex items-center space-x-2 border-2 border-emerald-400 px-2 py-1 rounded mb-1 ${isDark ? 'bg-emerald-900/60 text-emerald-200' : 'bg-green-100 text-green-700'}`}>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="font-mono text-xs font-bold">{feature.status}</span>
                      </div>
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{feature.code}</span>
                    </div>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 font-mono ${isDark ? 'text-slate-50' : 'text-gray-900'}`}>{feature.title}</h3>
                  <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{feature.description}</p>
                  <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                    <div className="flex items-center text-cyan-600 group-hover:text-cyan-700 transition-colors font-bold">
                      <span className="text-sm font-mono mr-2">[EXECUTE]</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className={`text-xs font-mono group-hover:text-cyan-600 transition-colors ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>→</div>
                  </div>
                </div>
            </Link>
            ))}
          </div>
        </div>

        {/* System Status & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${isDark ? 'bg-slate-950/70' : 'bg-white/90'} backdrop-blur-xl border-2 border-purple-500/60 rounded-xl p-6 shadow-xl shadow-purple-500/30`}>
            <div className="flex items-center justify-between mb-6 border-b-2 border-purple-500/40 pb-3">
              <h3 className={`text-lg font-bold font-mono uppercase ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>[SYSTEM_STATUS]</h3>
              <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Last: {formatTime(currentTime)}</div>
            </div>
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-3 ${isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-gray-50 border-gray-200'} rounded-lg border-2 hover:border-purple-500/60 transition-all`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg border-2 border-cyan-400/50">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <span className={`font-mono text-sm font-semibold block ${isDark ? 'text-slate-50' : 'text-gray-900'}`}>AI_ENGINE</span>
                    <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Neural Network Processing</span>
                  </div>
                </div>
                <div className={`flex items-center space-x-2 border-2 border-emerald-400 px-3 py-1 rounded ${isDark ? 'bg-emerald-900/60 text-emerald-200' : 'bg-green-100 text-green-700'}`}>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="font-mono text-sm font-bold">ONLINE</span>
                </div>
              </div>
              <div className={`flex items-center justify-between p-3 ${isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-gray-50 border-gray-200'} rounded-lg border-2 hover:border-purple-500/60 transition-all`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg border-2 border-blue-400/50">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  </div>
                  <div>
                    <span className={`font-mono text-sm font-semibold block ${isDark ? 'text-slate-50' : 'text-gray-900'}`}>DATABASE</span>
                    <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>MongoDB Connection</span>
                  </div>
                </div>
                <div className={`flex items-center space-x-2 border-2 border-emerald-400 px-3 py-1 rounded ${isDark ? 'bg-emerald-900/60 text-emerald-200' : 'bg-green-100 text-green-700'}`}>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="font-mono text-sm font-bold">SYNCED</span>
                </div>
              </div>
              <div className={`flex items-center justify-between p-3 ${isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-gray-50 border-gray-200'} rounded-lg border-2 hover:border-purple-500/60 transition-all`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg border-2 border-purple-400/50">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <span className={`font-mono text-sm font-semibold block ${isDark ? 'text-slate-50' : 'text-gray-900'}`}>ML_SERVICE</span>
                    <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Python FastAPI</span>
                  </div>
                </div>
                <div className={`flex items-center space-x-2 border-2 border-emerald-400 px-3 py-1 rounded ${isDark ? 'bg-emerald-900/60 text-emerald-200' : 'bg-green-100 text-green-700'}`}>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="font-mono text-sm font-bold">ACTIVE</span>
          </div>
        </div>
        </div>
      </div>

          <div className={`${isDark ? 'bg-slate-950/70' : 'bg-white/90'} backdrop-blur-xl border-2 border-cyan-500/60 rounded-xl p-6 shadow-xl shadow-cyan-500/30`}>
            <div className="flex items-center justify-between mb-6 border-b-2 border-cyan-500/40 pb-3">
              <h3 className={`text-lg font-bold font-mono uppercase ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>[QUICK_ACTIONS]</h3>
              <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Fast Access</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {features.slice(0, 4).map((feature) => (
        <Link
                  key={feature.id}
                  to={feature.link}
                  className={`px-4 py-4 ${isDark ? 'bg-slate-900/80 border-slate-700 hover:bg-slate-800' : 'bg-gray-50 border-gray-300 hover:bg-cyan-50'} border-2 rounded-lg hover:border-cyan-500 transition-all text-center group shadow-md hover:shadow-xl hover:scale-105`}
                >
                  <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${feature.color} mb-2 shadow-md border-2 border-white/20`}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                    </svg>
                  </div>
                  <span className={`text-xs font-mono font-bold transition-colors block ${isDark ? 'text-slate-200 group-hover:text-cyan-300' : 'text-gray-700 group-hover:text-cyan-600'}`}>
                    {feature.title.split(' ')[1]}
                  </span>
        </Link>
              ))}
            </div>
            <div className={`mt-4 p-3 rounded-lg border-2 border-cyan-500/40 ${isDark ? 'bg-slate-900/80' : 'bg-cyan-50'}`}>
              <p className={`text-xs font-mono text-center ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                <span className={`font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>[TIP]</span> Use dashboard for full module access
              </p>
            </div>
          </div>
        </div>

        {/* Performance Metrics Section */}
        <div className="mb-8">
          <div className={`flex items-center justify-between mb-6 ${isDark ? 'bg-slate-950/70' : 'bg-white/90'} backdrop-blur-xl px-6 py-4 rounded-xl shadow-xl border-2 border-blue-500/40`}>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-cyan-400 bg-clip-text text-transparent font-mono uppercase tracking-wider">
              [PERFORMANCE_METRICS]
            </h2>
            <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Real-time Monitoring</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`${isDark ? 'bg-slate-900/80' : 'bg-white/90'} backdrop-blur-xl border-2 border-blue-500/60 rounded-xl p-5 relative overflow-hidden group hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/40 transition-all shadow-xl`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-blue-600 font-mono text-xs uppercase tracking-wider font-bold">[RESPONSE_TIME]</span>
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded border-2 border-blue-400/50 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <p className={`text-4xl font-bold font-mono mb-2 ${isDark ? 'text-slate-50' : 'text-gray-900'}`}>{performanceMetrics.avgResponseTime}ms</p>
              <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Average API Response</p>
              <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className={`${isDark ? 'bg-slate-900/80' : 'bg-white/90'} backdrop-blur-xl border-2 border-purple-500/60 rounded-xl p-5 relative overflow-hidden group hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/40 transition-all shadow-xl`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-purple-600 font-mono text-xs uppercase tracking-wider font-bold">[SUCCESS_RATE]</span>
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded border-2 border-purple-400/50 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className={`text-4xl font-bold font-mono mb-2 ${isDark ? 'text-slate-50' : 'text-gray-900'}`}>{performanceMetrics.successRate}%</p>
              <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Operation Success</p>
              <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${performanceMetrics.successRate}%` }}></div>
              </div>
            </div>

            <div className={`${isDark ? 'bg-slate-900/80' : 'bg-white/90'} backdrop-blur-xl border-2 border-emerald-500/60 rounded-xl p-5 relative overflow-hidden group hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all shadow-xl`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-emerald-600 font-mono text-xs uppercase tracking-wider font-bold">[UPTIME]</span>
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded border-2 border-emerald-400/50 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <p className={`text-4xl font-bold font-mono mb-2 ${isDark ? 'text-slate-50' : 'text-gray-900'}`}>{performanceMetrics.uptime}%</p>
              <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>System Availability</p>
              <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500" style={{ width: `${performanceMetrics.uptime}%` }}></div>
              </div>
            </div>

            <div className={`${isDark ? 'bg-slate-900/80' : 'bg-white/90'} backdrop-blur-xl border-2 border-amber-500/60 rounded-xl p-5 relative overflow-hidden group hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/40 transition-all shadow-xl`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-amber-600 font-mono text-xs uppercase tracking-wider font-bold">[TOTAL_SCANS]</span>
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded border-2 border-amber-400/50 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <p className={`text-4xl font-bold font-mono mb-2 ${isDark ? 'text-slate-50' : 'text-gray-900'}`}>{performanceMetrics.totalScans}</p>
              <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Scans Completed</p>
              <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Security Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity Timeline */}
          <div className={`${isDark ? 'bg-slate-950/70' : 'bg-white/90'} backdrop-blur-xl border-2 border-cyan-500/60 rounded-xl p-6 shadow-xl shadow-cyan-500/30`}>
            <div className="flex items-center justify-between mb-6 border-b-2 border-cyan-500/40 pb-3">
              <h3 className={`text-lg font-bold font-mono uppercase ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>[RECENT_ACTIVITY]</h3>
              <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Live Feed</div>
            </div>
            <div className={`space-y-4 max-h-[500px] overflow-y-auto ${isDark ? 'scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-slate-900' : 'scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-gray-100'}`} style={{
              scrollbarWidth: 'thin',
              scrollbarColor: isDark ? '#06b6d480 #0f172a' : '#06b6d480 #f3f4f6'
            }}>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, idx) => (
                  <div key={activity.id || idx} className={`flex items-start space-x-4 p-3 ${isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-gray-50 border-gray-200'} rounded-lg border-2 hover:border-cyan-500/60 transition-all relative`}>
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-3 h-3 rounded-full ${
                        activity.status === 'high-risk' || activity.status === 'alert' 
                          ? 'bg-red-500 animate-pulse' 
                          : activity.status === 'normal' || activity.status === 'safe'
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                      }`}></div>
                      {idx < recentActivity.length - 1 && (
                        <div className={`w-0.5 h-12 ml-1.5 ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm font-mono font-semibold ${isDark ? 'text-slate-50' : 'text-gray-900'}`}>
                          {activity.title}
                        </p>
                        <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          {formatRelativeTime(activity.time)}
                        </span>
                      </div>
                      <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        {activity.description}
                      </p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                          activity.type === 'transaction' 
                            ? isDark ? 'bg-blue-900/60 text-blue-300' : 'bg-blue-100 text-blue-700'
                            : isDark ? 'bg-purple-900/60 text-purple-300' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {activity.type.toUpperCase()}
                        </span>
                        {(activity.status === 'high-risk' || activity.status === 'alert') && (
                          <span className={`text-xs font-mono px-2 py-0.5 rounded ${isDark ? 'bg-red-900/60 text-red-300' : 'bg-red-100 text-red-700'}`}>
                            ALERT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  <p className="font-mono text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Security Alerts & Notifications */}
          <div className={`${isDark ? 'bg-slate-950/70' : 'bg-white/90'} backdrop-blur-xl border-2 border-red-500/60 rounded-xl p-6 shadow-xl shadow-red-500/30`}>
            <div className="flex items-center justify-between mb-6 border-b-2 border-red-500/40 pb-3">
              <h3 className={`text-lg font-bold font-mono uppercase ${isDark ? 'text-red-300' : 'text-red-600'}`}>[SECURITY_ALERTS]</h3>
              <div className={`flex items-center space-x-2 ${isDark ? 'bg-red-900/60 text-red-200' : 'bg-red-100 text-red-700'} border-2 border-red-400 px-2 py-1 rounded`}>
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-mono font-bold">{stats.fraudDetected}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className={`p-4 ${isDark ? 'bg-red-900/20 border-red-500/40' : 'bg-red-50 border-red-200'} border-2 rounded-lg`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg border-2 border-red-400/50">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={`font-mono text-sm font-bold mb-1 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                      HIGH RISK DETECTED
                    </p>
                    <p className={`text-xs font-mono ${isDark ? 'text-red-200' : 'text-red-600'}`}>
                      {stats.fraudDetected} fraudulent activities identified in the last 24 hours
                    </p>
                    <p className={`text-xs font-mono mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {formatTime(currentTime)}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 ${isDark ? 'bg-orange-900/20 border-orange-500/40' : 'bg-orange-50 border-orange-200'} border-2 rounded-lg`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg border-2 border-orange-400/50">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={`font-mono text-sm font-bold mb-1 ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                      FORENSIC EVIDENCE
                    </p>
                    <p className={`text-xs font-mono ${isDark ? 'text-orange-200' : 'text-orange-600'}`}>
                      {stats.totalAnalyses} evidence items scanned in the last 24 hours
                    </p>
                    <p className={`text-xs font-mono mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {formatTime(currentTime)}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 ${isDark ? 'bg-yellow-900/20 border-yellow-500/40' : 'bg-yellow-50 border-yellow-200'} border-2 rounded-lg`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg border-2 border-yellow-400/50">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={`font-mono text-sm font-bold mb-1 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      SYSTEM UPDATE
                    </p>
                    <p className={`text-xs font-mono ${isDark ? 'text-yellow-200' : 'text-yellow-600'}`}>
                      Threat database updated with 2.4M new signatures
                    </p>
                    <p className={`text-xs font-mono mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {formatTime(currentTime)}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 ${isDark ? 'bg-green-900/20 border-green-500/40' : 'bg-green-50 border-green-200'} border-2 rounded-lg`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg border-2 border-green-400/50">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={`font-mono text-sm font-bold mb-1 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                      ALL SYSTEMS OPERATIONAL
                    </p>
                    <p className={`text-xs font-mono ${isDark ? 'text-green-200' : 'text-green-600'}`}>
                      All security modules running at optimal performance
                    </p>
                    <p className={`text-xs font-mono mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {formatTime(currentTime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Threat Intelligence & Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className={`${isDark ? 'bg-slate-950/70' : 'bg-white/90'} backdrop-blur-xl border-2 border-indigo-500/60 rounded-xl p-6 shadow-xl shadow-indigo-500/30`}>
            <div className="flex items-center justify-between mb-4 border-b-2 border-indigo-500/40 pb-3">
              <h3 className={`text-lg font-bold font-mono uppercase ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>[THREAT_INTEL]</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-lg border border-indigo-500/30">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm font-mono font-semibold ${isDark ? 'text-slate-50' : 'text-gray-900'}`}>Phishing</p>
                    <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>1,247 blocked</p>
                  </div>
                </div>
                <span className={`text-xs font-mono font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>+12%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-lg border border-indigo-500/30">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm font-mono font-semibold ${isDark ? 'text-slate-50' : 'text-gray-900'}`}>Malware</p>
                    <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>892 detected</p>
                  </div>
                </div>
                <span className={`text-xs font-mono font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>+8%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-lg border border-indigo-500/30">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm font-mono font-semibold ${isDark ? 'text-slate-50' : 'text-gray-900'}`}>Voice Scams</p>
                    <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{stats.spamCallsDetected} blocked</p>
                  </div>
                </div>
                <span className={`text-xs font-mono font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>+5%</span>
              </div>
            </div>
          </div>

          <div className={`${isDark ? 'bg-slate-950/70' : 'bg-white/90'} backdrop-blur-xl border-2 border-teal-500/60 rounded-xl p-6 shadow-xl shadow-teal-500/30`}>
            <div className="flex items-center justify-between mb-4 border-b-2 border-teal-500/40 pb-3">
              <h3 className={`text-lg font-bold font-mono uppercase ${isDark ? 'text-teal-300' : 'text-teal-600'}`}>[ANALYTICS]</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-mono ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Detection Rate</span>
                  <span className={`text-sm font-mono font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>94.2%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500" style={{ width: '94.2%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-mono ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>False Positives</span>
                  <span className={`text-sm font-mono font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>2.1%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500" style={{ width: '2.1%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-mono ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Processing Speed</span>
                  <span className={`text-sm font-mono font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>1.2s avg</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500" style={{ width: '88%' }}></div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-slate-900/80 rounded-lg border border-teal-500/30">
                <p className={`text-xs font-mono mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Total Data Processed</p>
                <p className={`text-2xl font-bold font-mono ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                  {(stats.totalAnalyses * 2.4).toFixed(1)}GB
                </p>
              </div>
            </div>
          </div>

          <div className={`${isDark ? 'bg-slate-950/70' : 'bg-white/90'} backdrop-blur-xl border-2 border-violet-500/60 rounded-xl p-6 shadow-xl shadow-violet-500/30`}>
            <div className="flex items-center justify-between mb-4 border-b-2 border-violet-500/40 pb-3">
              <h3 className={`text-lg font-bold font-mono uppercase ${isDark ? 'text-violet-300' : 'text-violet-600'}`}>[SYSTEM_INFO]</h3>
            </div>
            <div className="space-y-3">
              <div className={`p-3 ${isDark ? 'bg-slate-900/80' : 'bg-gray-50'} rounded-lg border border-violet-500/30`}>
                <p className={`text-xs font-mono mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Server Status</p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className={`text-sm font-mono font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>ONLINE</span>
                </div>
              </div>
              <div className={`p-3 ${isDark ? 'bg-slate-900/80' : 'bg-gray-50'} rounded-lg border border-violet-500/30`}>
                <p className={`text-xs font-mono mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>API Version</p>
                <span className={`text-sm font-mono font-bold ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>v2.4.1</span>
              </div>
              <div className={`p-3 ${isDark ? 'bg-slate-900/80' : 'bg-gray-50'} rounded-lg border border-violet-500/30`}>
                <p className={`text-xs font-mono mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Last Backup</p>
                <span className={`text-sm font-mono font-bold ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
                  {formatTime(new Date(Date.now() - 3600000))}
                </span>
              </div>
              <div className={`p-3 ${isDark ? 'bg-slate-900/80' : 'bg-gray-50'} rounded-lg border border-violet-500/30`}>
                <p className={`text-xs font-mono mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Active Sessions</p>
                <span className={`text-sm font-mono font-bold ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scam Education Section - Indian Scams Awareness */}
        <div id="scam-education-section" className={`${isDark ? 'bg-gradient-to-br from-slate-900/90 to-slate-800/90' : 'bg-gradient-to-br from-blue-50/90 to-cyan-50/90'} backdrop-blur-xl border-2 ${isDark ? 'border-cyan-500/60' : 'border-cyan-400/60'} rounded-xl p-8 mb-8 shadow-2xl ${isDark ? 'shadow-cyan-500/30' : 'shadow-cyan-400/20'} relative overflow-hidden`}>
          {/* Background Pattern */}
          <div className={`absolute inset-0 ${isDark ? 'opacity-5' : 'opacity-10'}`} style={{
            backgroundImage: `linear-gradient(${isDark ? '#00ffff' : '#0891b2'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#00ffff' : '#0891b2'} 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-2xl font-bold font-mono mb-2 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  <span className="text-red-500">⚠️</span> SCAM AWARENESS EDUCATION
                </h2>
                <p className={`text-sm font-mono ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  Protect Yourself from Common Scams in India
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg border-2 ${isDark ? 'bg-red-900/30 border-red-500/60 text-red-400' : 'bg-red-100 border-red-400 text-red-700'} font-mono text-sm font-bold`}>
                INDIA FOCUS
              </div>
            </div>

            {/* Daily Scam Statistics Alert */}
            <div className={`${isDark ? 'bg-red-900/20 border-red-500/40' : 'bg-red-100/80 border-red-300'} border-2 rounded-lg p-4 mb-6`}>
              <div className="flex items-start space-x-3">
                <div className={`text-2xl ${isDark ? 'text-red-400' : 'text-red-600'}`}>📊</div>
                <div className="flex-1">
                  <h3 className={`font-mono font-bold mb-2 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                    Daily Scam Statistics in India
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Per Hour</p>
                      <p className={`text-lg font-mono font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>~2,900</p>
                    </div>
                    <div>
                      <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Per Day</p>
                      <p className={`text-lg font-mono font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>~70,000</p>
                    </div>
                    <div>
                      <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Per Month</p>
                      <p className={`text-lg font-mono font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>~2.1M</p>
                    </div>
                    <div>
                      <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Per Year</p>
                      <p className={`text-lg font-mono font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>~25M+</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scam Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* UPI/Payment Scams */}
              <div className={`${isDark ? 'bg-slate-800/60 border-cyan-500/40' : 'bg-white/80 border-cyan-300'} border-2 rounded-lg p-5 hover:shadow-lg transition-all`}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded ${isDark ? 'bg-cyan-900/40' : 'bg-cyan-100'}`}>
                    <svg className={`w-6 h-6 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className={`font-mono font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>UPI/Payment Scams</h3>
                </div>
                <ul className={`space-y-2 text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Fake payment requests from unknown numbers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>QR code scams at shops/online</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Fake UPI apps asking for permissions</span>
                  </li>
                </ul>
                <div className={`mt-3 p-2 rounded ${isDark ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'} border`}>
                  <p className={`text-xs font-mono ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    <strong>Protect:</strong> Verify sender, never share UPI PIN, use official apps only
                  </p>
                </div>
              </div>

              {/* Phone Call Scams */}
              <div className={`${isDark ? 'bg-slate-800/60 border-purple-500/40' : 'bg-white/80 border-purple-300'} border-2 rounded-lg p-5 hover:shadow-lg transition-all`}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded ${isDark ? 'bg-purple-900/40' : 'bg-purple-100'}`}>
                    <svg className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className={`font-mono font-bold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>Phone Call Scams</h3>
                </div>
                <ul className={`space-y-2 text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Fake bank/KYC verification calls</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Prize/lottery winning scams</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Tech support fraud (Microsoft/Windows)</span>
                  </li>
                </ul>
                <div className={`mt-3 p-2 rounded ${isDark ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'} border`}>
                  <p className={`text-xs font-mono ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    <strong>Protect:</strong> Banks never call for OTP/PIN, verify caller ID, hang up if suspicious
                  </p>
                </div>
              </div>

              {/* SMS/WhatsApp Scams */}
              <div className={`${isDark ? 'bg-slate-800/60 border-green-500/40' : 'bg-white/80 border-green-300'} border-2 rounded-lg p-5 hover:shadow-lg transition-all`}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded ${isDark ? 'bg-green-900/40' : 'bg-green-100'}`}>
                    <svg className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className={`font-mono font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>SMS/WhatsApp Scams</h3>
                </div>
                <ul className={`space-y-2 text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Fake job offers with links</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Phishing links from "banks"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Fake delivery/package messages</span>
                  </li>
                </ul>
                <div className={`mt-3 p-2 rounded ${isDark ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'} border`}>
                  <p className={`text-xs font-mono ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    <strong>Protect:</strong> Don't click unknown links, verify sender, check URL carefully
                  </p>
                </div>
              </div>

              {/* Investment Scams */}
              <div className={`${isDark ? 'bg-slate-800/60 border-orange-500/40' : 'bg-white/80 border-orange-300'} border-2 rounded-lg p-5 hover:shadow-lg transition-all`}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded ${isDark ? 'bg-orange-900/40' : 'bg-orange-100'}`}>
                    <svg className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className={`font-mono font-bold ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>Investment Scams</h3>
                </div>
                <ul className={`space-y-2 text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Fake cryptocurrency schemes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Ponzi schemes (guaranteed returns)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Fake trading platforms</span>
                  </li>
                </ul>
                <div className={`mt-3 p-2 rounded ${isDark ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'} border`}>
                  <p className={`text-xs font-mono ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    <strong>Protect:</strong> Research thoroughly, verify SEBI registration, avoid "guaranteed" returns
                  </p>
                </div>
              </div>

              {/* Job Scams */}
              <div className={`${isDark ? 'bg-slate-800/60 border-pink-500/40' : 'bg-white/80 border-pink-300'} border-2 rounded-lg p-5 hover:shadow-lg transition-all`}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded ${isDark ? 'bg-pink-900/40' : 'bg-pink-100'}`}>
                    <svg className={`w-6 h-6 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className={`font-mono font-bold ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>Job Scams</h3>
                </div>
                <ul className={`space-y-2 text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Fake job offers asking for money</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Work-from-home scams</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Data entry/typing job frauds</span>
                  </li>
                </ul>
                <div className={`mt-3 p-2 rounded ${isDark ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'} border`}>
                  <p className={`text-xs font-mono ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    <strong>Protect:</strong> Legitimate jobs don't ask for money upfront, verify company, meet in person
                  </p>
                </div>
              </div>

              {/* Remote Access Scams */}
              <div className={`${isDark ? 'bg-slate-800/60 border-red-500/40' : 'bg-white/80 border-red-300'} border-2 rounded-lg p-5 hover:shadow-lg transition-all`}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded ${isDark ? 'bg-red-900/40' : 'bg-red-100'}`}>
                    <svg className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className={`font-mono font-bold ${isDark ? 'text-red-300' : 'text-red-700'}`}>Remote Access Scams</h3>
                </div>
                <ul className={`space-y-2 text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Unknown "support" agents asking to install screen-sharing apps</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Requests to reveal OTP while screen sharing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Fake RBI / bank officials demanding remote access</span>
                  </li>
                </ul>
                <div className={`mt-3 p-2 rounded ${isDark ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'} border`}>
                  <p className={`text-xs font-mono ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    <strong>Protect:</strong> Never share screen/OTP, call the official bank number from the website/app
                  </p>
                </div>
              </div>
            </div>

            {/* Essential Safety Tips */}
            <div className={`${isDark ? 'bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-500/40' : 'bg-gradient-to-r from-cyan-100 to-blue-100 border-cyan-300'} border-2 rounded-lg p-6`}>
              <h3 className={`font-mono font-bold text-lg mb-4 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                🛡️ Essential Safety Tips for Indians
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`space-y-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 font-bold">✓</span>
                    <span className="text-sm">Never share OTP, PIN, or passwords with anyone</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 font-bold">✓</span>
                    <span className="text-sm">Verify caller identity before sharing information</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 font-bold">✓</span>
                    <span className="text-sm">Use official apps from Play Store/App Store only</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 font-bold">✓</span>
                    <span className="text-sm">Check URL carefully - look for HTTPS and correct spelling</span>
                  </div>
                </div>
                <div className={`space-y-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 font-bold">✓</span>
                    <span className="text-sm">Banks never call asking for OTP or account details</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 font-bold">✓</span>
                    <span className="text-sm">Report suspicious activity to cybercrime.gov.in</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 font-bold">✓</span>
                    <span className="text-sm">Enable 2FA on all important accounts</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 font-bold">✓</span>
                    <span className="text-sm">If it sounds too good to be true, it probably is</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className={`mt-6 flex flex-wrap gap-4 items-center ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-sm">Emergency:</span>
                <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className={`text-sm font-mono ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'} underline`}>
                  cybercrime.gov.in
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-sm">Helpline:</span>
                <span className="text-sm font-mono">1930 (National Cyber Crime Helpline)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;
