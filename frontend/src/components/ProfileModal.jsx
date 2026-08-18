import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, User, Mail, Phone, ShieldCheck, Camera, Save, Star } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

export default function ProfileModal({ user, onClose, onUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [profileImage, setProfileImage] = useState(user.profileImage || '');
  const [imagePreview, setImagePreview] = useState(user.profileImage || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ratingInfo, setRatingInfo] = useState({ avgRating: null, totalRatings: 0 });

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: 'Bearer ' + token } };

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/my-profile`, authHeader);
        setRatingInfo({
          avgRating: res.data.user.avgRating,
          totalRatings: res.data.user.totalRatings
        });
      } catch (err) {
        console.error(err);
      }
    };
    if (user.role === 'restaurant' || user.role === 'volunteer') {
      fetchRating();
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.patch(
        `${API_URL}/api/auth/update-profile`,
        { name, phone, profileImage },
        authHeader
      );

      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccess('Profile updated successfully!');
      setEditMode(false);
      if (onUpdate) onUpdate(updatedUser);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-surface border border-white/10 p-6"
      >
        <div className="flex items-start justify-between mb-5">
          <h3 className="font-display text-xl text-textmain">My Profile</h3>
          <button onClick={onClose} className="text-textmuted hover:text-textmain">
            <X size={18} />
          </button>
        </div>

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

        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {imagePreview ? (
              <img src={imagePreview} alt={user.name} className="w-24 h-24 rounded-full object-cover border-2 border-primary/30" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <User size={32} className="text-primary" />
              </div>
            )}
            {editMode && (
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-all">
                <Camera size={14} className="text-bg" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {!editMode ? (
          <>
            <div className="flex flex-col gap-3 text-sm mb-6">
              <div className="flex items-center gap-2 text-textmuted">
                <User size={14} /> {user.name}
              </div>
              <div className="flex items-center gap-2 text-textmuted">
                <Mail size={14} /> {user.email}
              </div>
              <div className="flex items-center gap-2 text-textmuted">
                <Phone size={14} /> {user.phone || 'Not set'}
              </div>
              <div className="flex items-center gap-2 text-textmuted">
                <ShieldCheck size={14} className="text-primary" />
                Status: <span className="text-primary capitalize">{user.status || 'approved'}</span>
              </div>
              {ratingInfo.avgRating && (
                <div className="flex items-center gap-2 text-textmuted">
                  <Star size={14} className="text-secondary fill-secondary" />
                  Rating: <span className="text-secondary">{ratingInfo.avgRating} / 5</span> ({ratingInfo.totalRatings} reviews)
                </div>
              )}
            </div>

            <button
              onClick={() => setEditMode(true)}
              className="w-full py-3 rounded-xl bg-primary/15 text-primary text-sm font-medium hover:bg-primary/25 transition-all"
            >
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-textmuted mb-1 block">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain focus:outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="text-xs text-textmuted mb-1 block">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain focus:outline-none focus:border-primary/50"
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="flex-1 py-3 rounded-xl border border-white/15 text-textmuted text-sm hover:text-textmain transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-bg text-sm font-medium hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all disabled:opacity-60"
              >
                <Save size={14} />
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}