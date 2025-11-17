import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EvidenceUpload from './pages/EvidenceUpload';
import LinkChecker from './pages/LinkChecker';
import SMSChecker from './pages/SMSChecker';
import DeepfakeDetector from './pages/DeepfakeDetector';
import VoiceDetector from './pages/VoiceDetector';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Main feature - fraud detection */}
          <Route path="evidence/upload" element={<EvidenceUpload />} />
          <Route path="links/check" element={<LinkChecker />} />
          <Route path="sms/check" element={<SMSChecker />} />
          <Route path="deepfake/detect" element={<DeepfakeDetector />} />
          <Route path="voice/detect" element={<VoiceDetector />} />
          <Route path="profile" element={<Profile />} />
          
          {/* Redirect old routes to dashboard */}
          <Route path="transactions" element={<Navigate to="/dashboard" replace />} />
          <Route path="transactions/:id" element={<Navigate to="/dashboard" replace />} />
          <Route path="admin" element={<Navigate to="/dashboard" replace />} />
        </Route>
        
        {/* Redirect any unknown routes to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;


