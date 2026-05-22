import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Email/Login, 2: OTP, 3: Create Password
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, 'admin');
      toast.success('Admin authentication successful');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Authentication failed. Use Setup mode if first time.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!email) return toast.error('Please enter admin email');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/admin/request-otp', { email });
      toast.success(data.message);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Access Denied');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/verify-reset-otp', { email, otp });
      toast.success('OTP Verified. Please set your secure password.');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    
    setLoading(true);
    try {
      await api.post('/api/auth/admin/set-password', { email, otp, password });
      toast.success('Secure password established. You can now login.');
      setIsSetupMode(false);
      setStep(1);
      setPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-black/60 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-red-500/30 shadow-[0_0_80px_rgba(239,68,68,0.15)] relative overflow-hidden"
      >
        {/* Admin Glow Background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/20 rounded-full blur-[80px]" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-red-600/20 rounded-full blur-[80px]" />

        <div className="text-center mb-10 relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-600/10 border border-red-500/40 mb-6 rotate-12 shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-transform hover:rotate-0 duration-500">
            <Shield className="text-red-500 -rotate-12 group-hover:rotate-0" size={38} />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Admin Login</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
            {isSetupMode ? 'Secure Identity Establishment' : 'Secure infrastructure access'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 relative z-10"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Admin Identity (Email)</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                    placeholder="rajeevkumar9801456p@gmail.com"
                    required
                  />
                </div>
              </div>

              {!isSetupMode ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Secure Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                        placeholder="••••••••"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleStandardLogin}
                    disabled={loading}
                    className="w-full group bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white font-black py-4 rounded-2xl transition-all duration-500 shadow-2xl shadow-red-900/40 uppercase tracking-[0.25em] text-xs mt-4 flex items-center justify-center gap-3"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                      <>
                        <span>Authenticate</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-4">
                    <button 
                      onClick={() => { setIsSetupMode(true); setStep(1); }}
                      className="text-[10px] font-bold text-zinc-500 hover:text-red-500 uppercase tracking-widest transition-colors"
                    >
                      First time or forgot password? <span className="text-red-600 underline">Initialize via OTP</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={handleRequestOTP}
                    disabled={loading}
                    className="w-full group bg-white text-black hover:bg-red-500 hover:text-white disabled:bg-zinc-800 text-white font-black py-4 rounded-2xl transition-all duration-500 shadow-2xl uppercase tracking-[0.25em] text-xs mt-4 flex items-center justify-center gap-3"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : (
                      <>
                        <span>Request Access Code</span>
                        <KeyRound size={18} />
                      </>
                    )}
                  </button>
                  <div className="text-center pt-4">
                    <button 
                      onClick={() => setIsSetupMode(false)}
                      className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
                    >
                      Back to Standard Login
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 relative z-10 text-center"
            >
              <div className="space-y-4">
                <p className="text-xs text-zinc-400">Security code sent to <span className="text-white font-bold">{email}</span></p>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl py-4 pl-12 text-center text-2xl font-black tracking-[0.5em] text-white focus:outline-none focus:border-red-500"
                    placeholder="000000"
                  />
                </div>
              </div>
              <button
                onClick={handleVerifyOTP}
                className="w-full bg-red-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs"
              >
                Verify Code
              </button>
              <button onClick={() => setStep(1)} className="text-[10px] text-zinc-500 hover:text-white uppercase tracking-widest font-black">Change Email</button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 relative z-10"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">New Secure Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-red-500"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Confirm Identity Key</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-red-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button
                onClick={handleSetPassword}
                className="w-full bg-green-500 text-black font-black py-4 rounded-2xl uppercase tracking-widest text-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                <span>Establish Password</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 text-center relative z-10">
          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Authorized Personnel Only</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
