import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, ArrowLeft, RefreshCw, Music } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';

const ArtistVerifyResetOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get('email');

  useEffect(() => {
    if (!email) {
      navigate('/artist/forgot-password');
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

    // We don't have a separate verify endpoint for artists yet,
    // so we just pass it to the reset page.
    // Or we can just use the generic one if we want.
    // Given the backend implementation, let's just go to reset page.
    navigate(`/artist/reset-password?email=${email}&otp=${otpString}`);
  };

  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      await api.post('/api/artists/forgot-password', { email });
      toast.success('New reset code sent');
      setTimer(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs[0].current.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-zinc-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)]"
      >
        <button 
          onClick={() => navigate('/artist/forgot-password')}
          className="flex items-center gap-2 text-zinc-500 hover:text-green-500 transition-colors mb-6 text-[10px] font-black uppercase tracking-widest group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <KeyRound className="text-green-500" size={32} />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Artist Security</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
            Enter the reset code sent to <span className="text-white">{email}</span>
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
                className="w-12 h-14 bg-black/40 border border-zinc-800 rounded-xl text-center text-2xl font-black text-white focus:outline-none focus:border-green-500 transition-all"
              />
            ))}
          </div>

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                Resend in <span className="text-green-500">{formatTime(timer)}</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-green-500 hover:text-green-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mx-auto transition-colors"
              >
                <RefreshCw size={14} />
                Resend Code
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black hover:bg-green-500 hover:text-white disabled:bg-zinc-800 text-white font-black py-4 rounded-2xl transition-all duration-300 shadow-xl uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Verify Code</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ArtistVerifyResetOTP;
