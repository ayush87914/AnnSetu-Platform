import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Package, Clock, MapPin, Phone, LogOut, CheckCircle2, Navigation, Store, X, User, Mail, ShieldCheck, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const statusColors = {
  accepted: 'bg-accentglow/15 text-accentglow',
  picked_up: 'bg-blue-500/15 text-blue-400',
  delivered: 'bg-primary/15 text-primary',
};

const statusLabels = {
  accepted: 'Waiting for Pickup',
  picked_up: 'On the Way',
  delivered: 'Delivered',
};

export default function NgoDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('nearby');
  const [nearbyDonations, setNearbyDonations] = useState([]);
  const [acceptedDonations, setAcceptedDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [location, setLocation] = useState(null);
  const [otpModal, setOtpModal] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const authHeader = { headers: { Authorization: 'Bearer ' + token } };

  const fetchNearby = async (lat, lng) => {
    try {
      const url = lat && lng
        ? `http://localhost:5000/api/donations/available/nearby?latitude=${lat}&longitude=${lng}`
        : 'http://localhost:5000/api/donations/available/nearby';
      const res = await axios.get(url, authHeader);
      setNearbyDonations(res.data.donations);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  const fetchAccepted = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/donations/ngo/my-accepted', authHeader);
      setAcceptedDonations(res.data.donations);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAll = async (lat, lng) => {
    setLoading(true);
    await Promise.all([fetchNearby(lat, lng), fetchAccepted()]);
    setLoading(false);
  };

  useEffect(() => {
    if (!token || user.role !== 'ngo') {
      navigate('/login');
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation({ lat, lng });
          fetchAll(lat, lng);
        },
        () => {
          fetchAll();
        }
      );
    } else {
      fetchAll();
    }
  }, []);

  const handleAccept = async (id) => {
    setActionLoading(id);
    setMessage('');
    try {
      await axios.patch('http://localhost:5000/api/donations/accept/' + id, {}, authHeader);
      setMessage('Donation accepted successfully!');
      fetchAll(location?.lat, location?.lng);
      setActiveTab('accepted');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to accept donation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateDeliveryOtp = async (donation) => {
    setActionLoading(donation._id);
    setMessage('');
    try {
      const res = await axios.post('http://localhost:5000/api/donations/ngo/generate-delivery-otp/' + donation._id, {}, authHeader);
      setGeneratedOtp(res.data.otp);
      setOtpModal(donation);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to generate OTP');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const currentList = activeTab === 'nearby' ? nearbyDonations : acceptedDonations;

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

        <h1 className="font-display text-3xl font-medium text-textmain mb-2">Available Donations</h1>
        <p className="text-sm text-textmuted mb-8">
          {location ? 'Showing donations sorted by distance from your location.' : 'Enable location for distance-sorted results.'}
        </p>

        {message && (
          <div className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm">
            <CheckCircle2 size={16} />
            {message}
          </div>
        )}

        <div className="flex gap-2 bg-white/5 p-1 rounded-full w-fit mb-6">
          <button
            onClick={() => setActiveTab('nearby')}
            className={'px-4 py-1.5 rounded-full text-sm transition-all ' + (activeTab === 'nearby' ? 'bg-primary text-bg' : 'text-textmuted')}
          >
            Nearby ({nearbyDonations.length})
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={'px-4 py-1.5 rounded-full text-sm transition-all ' + (activeTab === 'accepted' ? 'bg-primary text-bg' : 'text-textmuted')}
          >
            My Accepted ({acceptedDonations.length})
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {loading ? (
            <p className="text-textmuted text-sm">Loading...</p>
          ) : currentList.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-10 text-center">
              <Package size={28} className="text-textmuted mx-auto mb-3" />
              <p className="text-textmuted text-sm">
                {activeTab === 'nearby' ? 'No donations available right now.' : 'You have not accepted any donations yet.'}
              </p>
            </div>
          ) : (
            currentList.map((d) => (
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
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-textmain font-medium">{d.foodName}</h3>
                      {activeTab === 'accepted' ? (
                        <span className={'text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ' + statusColors[d.status]}>
                          {statusLabels[d.status]}
                        </span>
                      ) : d.distanceKm && (
                        <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-secondary/15 text-secondary">
                          <Navigation size={10} /> {d.distanceKm} km away
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-textmuted mb-1">
                      <Store size={12} /> {d.donor?.name || 'Restaurant'}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-textmuted">
                      <span className="flex items-center gap-1"><Package size={12} /> {d.quantity}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {d.pickupAddress}</span>
                      <span className="flex items-center gap-1"><Phone size={12} /> {d.contactNumber}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> Expires {new Date(d.expiryTime).toLocaleString()}</span>
                    </div>
                  </div>

                  {activeTab === 'nearby' && (
                    <button
                      onClick={() => handleAccept(d._id)}
                      disabled={actionLoading === d._id}
                      className="px-5 py-2.5 rounded-full bg-primary text-bg text-sm font-medium hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all disabled:opacity-60 flex-shrink-0 w-fit"
                    >
                      {actionLoading === d._id ? 'Accepting...' : 'Accept Donation'}
                    </button>
                  )}
                </div>

                {activeTab === 'accepted' && d.status === 'picked_up' && (
                  <button
                    onClick={() => handleGenerateDeliveryOtp(d)}
                    disabled={actionLoading === d._id}
                    className="w-fit flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/15 text-secondary text-sm font-medium hover:bg-secondary/25 transition-all disabled:opacity-60"
                  >
                    <KeyRound size={14} />
                    {actionLoading === d._id ? 'Generating...' : 'Generate Delivery OTP'}
                  </button>
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
            <h3 className="font-display text-xl text-textmain mb-1">Delivery OTP</h3>
            <p className="text-sm text-textmuted mb-5">
              Share this code with the volunteer delivering <span className="text-textmain">{otpModal.foodName}</span> to confirm handover.
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