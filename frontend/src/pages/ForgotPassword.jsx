import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Mail, KeyRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
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
          <span className="font-display text-lg font-semibold text-textmain">Anna<span className="text-primary">Setu</span></span>
        </Link>
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5"><KeyRound size={24} className="text-primary" /></div>
        <h1 className="font-display text-3xl font-medium text-textmain mb-1">Forgot password?</h1>
        <p className="text-sm text-textmuted mb-6">Enter your email and we'll send you a reset code.</p>
        {error && <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textmuted" />
            <input type="email" placeholder="Email address" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50" />
          </div>
          <button type="submit" disabled={loading} className="mt-2 w-full py-3.5 rounded-xl bg-primary text-bg font-medium hover:shadow-[0_0_25px_rgba(52,211,153,0.4)] transition-all disabled:opacity-60">
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>
        <p className="text-center text-sm text-textmuted mt-6">Remember your password? <Link to="/login" className="text-primary hover:underline">Log in</Link></p>
      </motion.div>
    </div>
  );
}