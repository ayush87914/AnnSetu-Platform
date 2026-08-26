import { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, HeartHandshake, Bike, ShieldCheck, Mail, Lock, Leaf } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const roles = [
  { key: 'restaurant', label: 'Restaurant', icon: Store },
  { key: 'ngo', label: 'NGO', icon: HeartHandshake },
  { key: 'volunteer', label: 'Volunteer', icon: Bike },
  { key: 'admin', label: 'Admin', icon: ShieldCheck },
];

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('restaurant');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      const { token, user } = res.data;
      if (user.role !== selectedRole) {
        setError('Selected role does not match this account. Please choose the correct role.');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'restaurant') navigate('/restaurant/dashboard');
      else if (user.role === 'ngo') navigate('/ngo/dashboard');
      else if (user.role === 'volunteer') navigate('/volunteer/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
        <h1 className="font-display text-3xl font-medium text-textmain mb-1">Welcome back</h1>
        <p className="text-sm text-textmuted mb-6">Log in to continue your journey.</p>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.key;
            const finalClasses = 'flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ' + (isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 text-textmuted hover:border-white/25');
            return (
              <button key={role.key} type="button" onClick={() => setSelectedRole(role.key)} className={finalClasses}>
                <Icon size={16} />
                <span className="text-[10px]">{role.label}</span>
              </button>
            );
          })}
        </div>
        {error && <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textmuted" />
            <input type="email" name="email" placeholder="Email address" required value={formData.email} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50" />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textmuted" />
            <input type="password" name="password" placeholder="Password" required value={formData.password} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50" />
          </div>
          <div className="text-right -mt-2">
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} className="mt-2 w-full py-3.5 rounded-xl bg-primary text-bg font-medium hover:shadow-[0_0_25px_rgba(52,211,153,0.4)] transition-all disabled:opacity-60">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className="text-center text-sm text-textmuted mt-6">Don't have an account? <Link to="/register" className="text-primary hover:underline">Sign up</Link></p>
      </motion.div>
    </div>
  );
}