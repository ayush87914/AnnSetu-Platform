import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Leaf, MailCheck } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email,
        otp: otpValue,
      });
      setSuccess(res.data.message || 'Email verified successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResending(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/resend-otp', { email });
      setSuccess(res.data.message || 'New OTP sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 relative overflow-hidden">
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/15 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-accentglow/15 rounded-full blur-[100px]"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/10 p-8"
      >
        <Link to="/" className="flex items-center gap-2 mb-8 w-fit">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
            <Leaf size={16} className="text-primary" />
          </div>
          <span className="font-display text-lg font-semibold text-textmain">
            Anna<span className="text-primary">Setu</span>
          </span>
        </Link>

        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
          <MailCheck size={24} className="text-primary" />
        </div>

        <h1 className="font-display text-3xl font-medium text-textmain mb-1">Verify your email</h1>
        <p className="text-sm text-textmuted mb-6">
          We sent a 6-digit code to{' '}
          <span className="text-textmain">{email || 'your email'}</span>
        </p>

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-mono rounded-xl bg-white/5 border border-white/10 text-textmain focus:outline-none focus:border-primary/50"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary text-bg font-medium hover:shadow-[0_0_25px_rgba(52,211,153,0.4)] transition-all disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <p className="text-center text-sm text-textmuted mt-6">
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-primary hover:underline disabled:opacity-60"
          >
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}