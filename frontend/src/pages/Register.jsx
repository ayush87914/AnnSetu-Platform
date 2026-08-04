import { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, HeartHandshake, Bike, ShieldCheck, User, Mail, Phone, Lock, Leaf } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const roles = [
  { key: 'restaurant', label: 'Restaurant', icon: Store },
  { key: 'ngo', label: 'NGO', icon: HeartHandshake },
  { key: 'volunteer', label: 'Volunteer', icon: Bike },
];

export default function Register() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('restaurant');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessInfo: '',
    ngoInfo: '',
    idProof: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: selectedRole,
      };

      if (selectedRole === 'restaurant') {
        payload.businessInfo = formData.businessInfo;
      }
      if (selectedRole === 'ngo') {
        payload.ngoInfo = formData.ngoInfo;
      }
      if (selectedRole === 'volunteer') {
        payload.idProof = formData.idProof;
      }

      await axios.post('http://localhost:5000/api/auth/register', payload);
      navigate('/verify-otp', { state: { email: formData.email } });
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

        <h1 className="font-display text-3xl font-medium text-textmain mb-1">Create your account</h1>
        <p className="text-sm text-textmuted mb-6">Join the movement to end hunger.</p>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.key;
            const baseClasses = 'flex flex-col items-center gap-2 py-3 rounded-xl border transition-all';
            const activeClasses = 'border-primary bg-primary/10 text-primary';
            const inactiveClasses = 'border-white/10 text-textmuted hover:border-white/25';
            const finalClasses = baseClasses + ' ' + (isSelected ? activeClasses : inactiveClasses);

            return (
              <button key={role.key} type="button" onClick={() => setSelectedRole(role.key)} className={finalClasses}>
                <Icon size={18} />
                <span className="text-xs">{role.label}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textmuted" />
            <input
              type="text"
              name="name"
              placeholder="Full name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textmuted" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="relative">
            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textmuted" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone number"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50"
            />
          </div>

          {selectedRole === 'restaurant' && (
            <div className="relative">
              <ShieldCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textmuted" />
              <input
                type="text"
                name="businessInfo"
                placeholder="Business license / GST number"
                required
                value={formData.businessInfo}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50"
              />
            </div>
          )}

          {selectedRole === 'ngo' && (
            <div className="relative">
              <ShieldCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textmuted" />
              <input
                type="text"
                name="ngoInfo"
                placeholder="NGO certificate / registration ID"
                required
                value={formData.ngoInfo}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50"
              />
            </div>
          )}

          {selectedRole === 'volunteer' && (
            <div className="relative">
              <ShieldCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textmuted" />
              <input
                type="text"
                name="idProof"
                placeholder="ID proof number (Aadhar, etc.)"
                required
                value={formData.idProof}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50"
              />
            </div>
          )}

          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textmuted" />
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textmuted" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3.5 rounded-xl bg-primary text-bg font-medium hover:shadow-[0_0_25px_rgba(52,211,153,0.4)] transition-all disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-textmuted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}