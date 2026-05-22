import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get('email');

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      return toast.error('Please enter all 6 digits');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/verify-otp', { email, otp: otpString });
      toast.success(data.message);
      
      // Save token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('voicecast_user', JSON.stringify(data.user));
      
      // Navigate based on role
      if (data.user.role === 'admin') navigate('/admin/dashboard');
      else if (data.user.role === 'artist') navigate('/creator-panel');
      else navigate('/');
      
      window.location.reload(); // Refresh to update context
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      await api.post('/api/auth/send-otp', { email, purpose: 'registration' });
      toast.success('New OTP sent to your email');
      setTimer(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs[0].current.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-zinc-900/50 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl"
      >
        <button 
          onClick={() => navigate('/register')}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-6 text-[10px] font-black uppercase tracking-widest group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Register
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <ShieldCheck className="text-green-500" size={32} />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Verify Email</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
            We've sent a 6-digit code to <span className="text-white">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 bg-zinc-800/50 border border-zinc-700 rounded-xl text-center text-2xl font-black text-white focus:outline-none focus:border-green-500 transition-all"
              />
            ))}
          </div>

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                Resend code in <span className="text-green-500">{formatTime(timer)}</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-green-500 hover:text-green-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mx-auto transition-colors"
              >
                <RefreshCw size={14} />
                Resend OTP
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black font-black py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-green-500/20 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Verify & Complete</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
