import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Lock, KeyRound, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/reset-password`, { email, otp, newPassword });
      setSuccess(res.data.message || 'Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 relative overflow-hidden">
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/15 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-accentglow/15 rounded-full blur-[100px]"></div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-md rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/10 p-8">
        <Link to="/" className="flex items-center gap-2 mb-8 w-fit">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center"><Leaf size={16} className="text-primary" /></div>
          <span className="font-display text-lg font-semibold text-textmain">Ann<span className="text-primary">Setu</span></span>
        </Link>
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5"><KeyRound size={24} className="text-primary" /></div>
        <h1 className="font-display text-3xl font-medium text-textmain mb-1">Reset password</h1>
        <p className="text-sm text-textmuted mb-6">Enter the code sent to <span className="text-textmain">{email || 'your email'}</span> and choose a new password.</p>
        {error && <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
        {success && <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm"><CheckCircle2 size={16} />{success}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textmuted" />
            <input type="text" placeholder="6-digit OTP" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50" />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textmuted" />
            <input type="password" placeholder="New password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50" />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textmuted" />
            <input type="password" placeholder="Confirm new password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50" />
          </div>
          <button type="submit" disabled={loading} className="mt-2 w-full py-3.5 rounded-xl bg-primary text-bg font-medium hover:shadow-[0_0_25px_rgba(52,211,153,0.4)] transition-all disabled:opacity-60">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}