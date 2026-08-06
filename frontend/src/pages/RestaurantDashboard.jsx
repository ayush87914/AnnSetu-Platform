import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Plus, Package, Clock, MapPin, Phone, LogOut, X, CheckCircle2, User, Mail, ShieldCheck, Image as ImageIcon, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const statusColors = {
  pending: 'bg-secondary/15 text-secondary',
  accepted: 'bg-accentglow/15 text-accentglow',
  picked_up: 'bg-blue-500/15 text-blue-400',
  delivered: 'bg-primary/15 text-primary',
  cancelled: 'bg-red-500/15 text-red-400',
};

const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted by NGO',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [otpModal, setOtpModal] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(null);

  const [formData, setFormData] = useState({
    foodName: '',
    foodType: 'veg',
    quantity: '',
    cookingTime: '',
    expiryTime: '',
    pickupAddress: '',
    latitude: '',
    longitude: '',
    contactNumber: '',
    foodImage: '',
  });

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const authHeader = { headers: { Authorization: 'Bearer ' + token } };

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/donations/my-donations', authHeader);
      setDonations(res.data.donations);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || user.role !== 'restaurant') {
      navigate('/login');
      return;
    }
    fetchDonations();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, foodImage: reader.result }));
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setFormData((prev) => ({
        ...prev,
        latitude: pos.coords.latitude.toFixed(6),
        longitude: pos.coords.longitude.toFixed(6),
      }));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      await axios.post('http://localhost:5000/api/donations/create', formData, authHeader);
      setMessage('Food donation posted successfully!');
      setShowForm(false);
      setImagePreview('');
      setFormData({
        foodName: '', foodType: 'veg', quantity: '', cookingTime: '', expiryTime: '',
        pickupAddress: '', latitude: '', longitude: '', contactNumber: '', foodImage: '',
      });
      fetchDonations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post donation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.patch('http://localhost:5000/api/donations/cancel/' + id, {}, authHeader);
      fetchDonations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleGeneratePickupOtp = async (donation) => {
    setOtpLoading(donation._id);
    setMessage('');
    try {
      const res = await axios.post('http://localhost:5000/api/donations/generate-pickup-otp/' + donation._id, {}, authHeader);
      setGeneratedOtp(res.data.otp);
      setOtpModal(donation);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to generate OTP');
    } finally {
      setOtpLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen px-6 py-10 relative overflow-hidden">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 text-left">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
              <Leaf size={18} className="text-primary" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold text-textmain leading-tight">
                Anna<span className="text-primary">Setu</span>
              </div>
              <div className="text-xs text-textmuted">Welcome back, {user.name} • View profile</div>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-sm text-textmuted hover:text-textmain hover:border-white/30 transition-all"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-medium text-textmain">My Donations</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-bg font-medium hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancel' : 'Post Food'}
          </button>
        </div>

        {message && (
          <div className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm">
            <CheckCircle2 size={16} />
            {message}
          </div>
        )}

        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            onSubmit={handleSubmit}
            className="mb-10 rounded-2xl bg-white/[0.03] border border-white/10 p-6 flex flex-col gap-4"
          >
            {error && (
              <div className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs text-textmuted mb-2 block">Food photo (optional, max 2MB)</label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-20 h-20 rounded-xl object-cover border border-white/10" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <ImageIcon size={22} className="text-textmuted" />
                  </div>
                )}
                <input
                  type="file" accept="image/*" onChange={handleImageChange}
                  className="text-sm text-textmuted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/15 file:text-primary file:text-sm hover:file:bg-primary/25 file:cursor-pointer cursor-pointer"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text" name="foodName" placeholder="Food name (e.g. Veg Biryani)" required
                value={formData.foodName} onChange={handleChange}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50"
              />
              <select
                name="foodType" value={formData.foodType} onChange={handleChange}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain focus:outline-none focus:border-primary/50"
              >
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text" name="quantity" placeholder="Quantity (e.g. 15 kg or 20 plates)" required
                value={formData.quantity} onChange={handleChange}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50"
              />
              <input
                type="text" name="contactNumber" placeholder="Contact number" required
                value={formData.contactNumber} onChange={handleChange}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-textmuted mb-1 block">Cooking time</label>
                <input
                  type="datetime-local" name="cookingTime" required
                  value={formData.cookingTime} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-textmuted mb-1 block">Expiry time (last pickup time)</label>
                <input
                  type="datetime-local" name="expiryTime" required
                  value={formData.expiryTime} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <input
              type="text" name="pickupAddress" placeholder="Pickup address" required
              value={formData.pickupAddress} onChange={handleChange}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50"
            />

            <div className="grid md:grid-cols-3 gap-4 items-end">
              <input
                type="text" name="latitude" placeholder="Latitude" required
                value={formData.latitude} onChange={handleChange}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50"
              />
              <input
                type="text" name="longitude" placeholder="Longitude" required
                value={formData.longitude} onChange={handleChange}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50"
              />
              <button
                type="button" onClick={useMyLocation}
                className="px-4 py-3 rounded-xl border border-white/15 text-sm text-textmuted hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2"
              >
                <MapPin size={14} />
                Use my location
              </button>
            </div>

            <button
              type="submit" disabled={submitting}
              className="mt-2 py-3.5 rounded-xl bg-primary text-bg font-medium hover:shadow-[0_0_25px_rgba(52,211,153,0.4)] transition-all disabled:opacity-60"
            >
              {submitting ? 'Posting...' : 'Post Donation'}
            </button>
          </motion.form>
        )}

        <div className="flex flex-col gap-4">
          {loading ? (
            <p className="text-textmuted text-sm">Loading...</p>
          ) : donations.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-10 text-center">
              <Package size={28} className="text-textmuted mx-auto mb-3" />
              <p className="text-textmuted text-sm">No donations yet. Post your first one!</p>
            </div>
          ) : (
            donations.map((d) => (
              <motion.div
                key={d._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 flex flex-col gap-4"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {d.foodImage ? (
                    <img src={d.foodImage} alt={d.foodName} className="w-20 h-20 rounded-xl object-cover border border-white/10 flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <Package size={22} className="text-textmuted" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-textmain font-medium">{d.foodName}</h3>
                      <span className={'text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ' + statusColors[d.status]}>
                        {statusLabels[d.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-textmuted">
                      <span className="flex items-center gap-1"><Package size={12} /> {d.quantity}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {d.pickupAddress}</span>
                      <span className="flex items-center gap-1"><Phone size={12} /> {d.contactNumber}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> Expires {new Date(d.expiryTime).toLocaleString()}</span>
                    </div>
                  </div>

                  {d.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(d._id)}
                      className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-all w-fit flex-shrink-0"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {d.status === 'accepted' && d.assignedVolunteer && (
                  <button
                    onClick={() => handleGeneratePickupOtp(d)}
                    disabled={otpLoading === d._id}
                    className="w-fit flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/15 text-secondary text-sm font-medium hover:bg-secondary/25 transition-all disabled:opacity-60"
                  >
                    <KeyRound size={14} />
                    {otpLoading === d._id ? 'Generating...' : 'Generate Pickup OTP'}
                  </button>
                )}

                {d.status === 'accepted' && !d.assignedVolunteer && (
                  <p className="text-xs text-textmuted">Waiting for a volunteer to be assigned before pickup can begin.</p>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {otpModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setOtpModal(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-surface border border-white/10 p-6 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
              <KeyRound size={24} className="text-secondary" />
            </div>
            <h3 className="font-display text-xl text-textmain mb-1">Pickup OTP</h3>
            <p className="text-sm text-textmuted mb-5">
              Share this code with the volunteer picking up <span className="text-textmain">{otpModal.foodName}</span> to confirm handover.
            </p>
            <div className="text-4xl font-mono font-semibold text-secondary tracking-[0.3em] mb-6">
              {generatedOtp}
            </div>
            <button
              onClick={() => setOtpModal(null)}
              className="w-full py-3 rounded-xl bg-primary text-bg text-sm font-medium hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all"
            >
              Done
            </button>
          </motion.div>
        </motion.div>
      )}

      {showProfile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowProfile(false)}
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
              <button onClick={() => setShowProfile(false)} className="text-textmuted hover:text-textmain">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2 text-textmuted">
                <User size={14} /> {user.name}
              </div>
              <div className="flex items-center gap-2 text-textmuted">
                <Mail size={14} /> {user.email}
              </div>
              <div className="flex items-center gap-2 text-textmuted">
                <ShieldCheck size={14} className="text-primary" />
                Status: <span className="text-primary capitalize">{user.status || 'approved'}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}