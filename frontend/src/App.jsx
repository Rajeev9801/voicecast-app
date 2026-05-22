import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useVoice } from './context/VoiceContext';
import { useVoiceDiagnostics } from './hooks/useVoiceDiagnostics';
import { podcastService } from './services/podcastService';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import RecordingStudio from './pages/RecordingStudio';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import LikedSongs from './pages/LikedSongs';
import CreatePlaylist from './pages/CreatePlaylist';
import PodcasterDashboard from './pages/PodcasterDashboard';
import AddPodcast from './pages/AddPodcast';
import AdminLoginOriginal from './pages/Admin/AdminLogin';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminPodcasts from './pages/Admin/AdminPodcasts';
import AdminRecordings from './pages/Admin/AdminRecordings';
import AdminAnalytics from './pages/Admin/AdminAnalytics';
import AdminRoute from './routes/AdminRoute';

// New Stylized Login Pages
import UserLogin from './pages/Auth/UserLogin';
import ArtistLogin from './pages/Auth/ArtistLogin';
import AdminLogin from './pages/Auth/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyOTP from './pages/VerifyOTP';
import VerifyResetOTP from './pages/VerifyResetOTP';

// Components
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import FloatingMic from './components/FloatingMic';
import VolumeHUD from './components/VolumeHUD';
import VoiceDiagnosticsDialog from './components/VoiceDiagnosticsDialog';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const {
    audioRef,
    podcasts, setPodcasts,
    currentPodcast,
    isPlaying,
    playPodcast,
    handleNext,
    handlePrev,
    togglePlayPause,
    showToast,
    setIsPlaying,
    isListening, 
    transcript, 
    aiResponse, 
    voiceError, 
    startListening, 
    stopListening,
    isSupported
  } = useVoice();

  const [trendingPodcasts, setTrendingPodcasts] = useState([]);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const diagnostics = useVoiceDiagnostics();

  useEffect(() => {
    // Disable automatic diagnostics popup for stability mode
    // if (voiceError === 'not-allowed') setShowDiagnostics(true);
  }, [voiceError]);

  useEffect(() => {
    const initData = async () => {
      try {
        const [recommended, trending] = await Promise.all([
          podcastService.getRecommended(),
          podcastService.getTrending()
        ]);
        setPodcasts(recommended);
        setTrendingPodcasts(trending);
      } catch (err) {
        console.warn('Initial load failed, using local fallback data', err);
      }
    };
    initData();
  }, [setPodcasts]);

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-zinc-500 font-bold tracking-widest uppercase text-xs">System Initialization</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-x-hidden max-w-full">
      <Sidebar />

      <div className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden max-w-full bg-zinc-900">
        <main className="pb-48 md:pb-32 w-full overflow-x-hidden max-w-full">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home podcasts={podcasts} trendingPodcasts={trendingPodcasts} />} />
              <Route path="/search" element={<Search currentPodcast={currentPodcast} isPlaying={isPlaying} onPlayPodcast={playPodcast} />} />
              <Route path="/library" element={<Library onPlayPodcast={playPodcast} currentPodcast={currentPodcast} isPlaying={isPlaying} />} />
              <Route path="/record" element={user ? <RecordingStudio /> : <Navigate to="/login" />} />
              <Route path="/liked" element={user ? <LikedSongs onPlayPodcast={playPodcast} currentPodcast={currentPodcast} isPlaying={isPlaying} /> : <Navigate to="/login" />} />
              <Route path="/create-playlist" element={user ? <CreatePlaylist /> : <Navigate to="/login" />} />
              <Route path="/dashboard" element={user ? <UserDashboard /> : <Navigate to="/login" />} />
              <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
              <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
              <Route path="/creator-panel" element={(user?.role === 'artist' || user?.role === 'admin') ? <PodcasterDashboard /> : <Navigate to="/login" />} />
              <Route path="/add-podcast" element={(user?.role === 'artist' || user?.role === 'admin') ? <AddPodcast /> : <AddPodcast />} />
              
              {/* Admin Infrastructure */}
              <Route path="/admin/login" element={<AdminLoginOriginal />} />
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/admin/podcasts" element={<AdminRoute><AdminPodcasts /></AdminRoute>} />
              <Route path="/admin/recordings" element={<AdminRoute><AdminRecordings /></AdminRoute>} />
              <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
              
              <Route path="/login/user" element={<UserLogin />} />
              <Route path="/login/artist" element={<ArtistLogin />} />
              <Route path="/login/admin" element={<AdminLogin />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="/login" element={<Navigate to="/login/user" replace />} />
              <Route path="/register" element={<Register />} />
              
              {/* Redirects */}
              <Route path="/recording" element={<Navigate to="/record" />} />
              <Route path="/user-dashboard" element={<Navigate to="/dashboard" />} />
              <Route path="/artist" element={<Navigate to="/creator-panel" />} />
              <Route path="/creator-dashboard" element={<Navigate to="/creator-panel" />} />
              <Route path="/admin-dashboard" element={<Navigate to="/admin" />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>

      <Player 
        currentPodcast={currentPodcast} 
        isPlaying={isPlaying} 
        onPlayPause={togglePlayPause}
        onNext={handleNext}
        onPrevious={handlePrev}
        audioRef={audioRef}
      />

      <FloatingMic
        isListening={isListening}
        onStart={startListening}
        onStop={stopListening}
        transcript={transcript}
        aiResponse={aiResponse}
        error={voiceError}
        isSupported={isSupported}
      />

      <VolumeHUD />

      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {showDiagnostics && (
        <VoiceDiagnosticsDialog 
          diagnostics={diagnostics} 
          onRetry={diagnostics.runDiagnostics}
          onRequestPermission={diagnostics.requestPermission}
          onClose={() => setShowDiagnostics(false)}
        />
      )}
    </div>
  );
}
