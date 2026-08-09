import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Package, Clock, MapPin, Phone, LogOut, CheckCircle2, Store, HeartHandshake, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfileModal from '../components/ProfileModal';
import RouteMap from '../components/RouteMap';
import { API_URL } from '../config';

const statusLabels = {
  accepted: 'Ready for Pickup',
  picked_up: 'Picked Up — Deliver Now',
  delivered: 'Delivered',
};

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('available');
  const [availablePickups, setAvailablePickups] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [pickupModal, setPickupModal] = useState(null);
  const [pickupOtpInput, setPickupOtpInput] = useState('');
  const [pickupError, setPickupError] = useState('');
  const [deliveryModal, setDeliveryModal] = useState(null);
  const [deliveryOtpInput, setDeliveryOtpInput] = useState('');
  const [deliveryError, setDeliveryError] = useState('');
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: 'Bearer ' + token } };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [availRes, tasksRes] = await Promise.all([
        axios.get(`${API_URL}/api/donations/volunteer/available-pickups`, authHeader),
        axios.get(`${API_URL}/api/donations/volunteer/my-tasks`, authHeader),
      ]);
      setAvailablePickups(availRes.data.donations);
      setMyTasks(tasksRes.data.donations);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || currentUser.role !== 'volunteer') {
      navigate('/login');
      return;
    }
    fetchData();
  }, []);

  const handleAssign = async (id) => {
    setActionLoading(id);
    setMessage('');
    try {
      await axios.patch(`${API_URL}/api/donations/volunteer/assign/${id}`, {}, authHeader);
      setMessage('Pickup task assigned to you!');
      fetchData();
      setActiveTab('tasks');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to assign task');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyPickup = async (e) => {
    e.preventDefault();
    setPickupError('');
    setActionLoading(pickupModal._id);
    try {
      await axios.patch(
        `${API_URL}/api/donations/volunteer/verify-pickup-otp/${pickupModal._id}`,
        { otp: pickupOtpInput },
        authHeader
      );
      setMessage('Pickup verified! Food picked up successfully.');
      setPickupModal(null);
      setPickupOtpInput('');
      fetchData();
    } catch (err) {
      setPickupError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    setDeliveryError('');
    setActionLoading(deliveryModal._id);
    try {
      await axios.patch(
        `${API_URL}/api/donations/confirm-delivery/${deliveryModal._id}`,
        { otp: deliveryOtpInput },
        authHeader
      );
      setMessage('Delivery confirmed successfully! 🎉');
      setDeliveryModal(null);
      setDeliveryOtpInput('');
      fetchData();
    } catch (err) {
      setDeliveryError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const currentList = activeTab === 'available' ? availablePickups : myTasks;

  return (
    <div className="min-h-screen px-6 py-10 relative overflow-hidden">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Leaf size={18} className="text-primary" />
            </div>
            <span className="font-display text-lg font-semibold text-textmain">
              Anna<span className="text-primary">Setu</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-white/10 hover:border-primary/40 transition-all"
              title="View profile"
            >
              {currentUser.profileImage ? (
                <img src={currentUser.profileImage} alt={currentUser.name} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-[11px] font-medium text-primary">
                    {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <span className="text-sm text-textmain hidden sm:inline">{currentUser.name}</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-full border border-white/15 text-textmuted hover:text-red-400 hover:border-red-400/40 transition-all flex items-center justify-center flex-shrink-0"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        <h1 className="font-display text-3xl font-medium text-textmain mb-8">Delivery Tasks</h1>

        {message && (
          <div className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm">
            <CheckCircle2 size={16} />
            {message}
          </div>
        )}

        <div className="flex gap-2 bg-white/5 p-1 rounded-full w-fit mb-6">
          <button
            onClick={() => setActiveTab('available')}
            className={'px-4 py-1.5 rounded-full text-sm transition-all ' + (activeTab === 'available' ? 'bg-primary text-bg' : 'text-textmuted')}
          >
            Available ({availablePickups.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={'px-4 py-1.5 rounded-full text-sm transition-all ' + (activeTab === 'tasks' ? 'bg-primary text-bg' : 'text-textmuted')}
          >
            My Tasks ({myTasks.length})
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {loading ? (
            <p className="text-textmuted text-sm">Loading...</p>
          ) : currentList.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-10 text-center">
              <Package size={28} className="text-textmuted mx-auto mb-3" />
              <p className="text-textmuted text-sm">
                {activeTab === 'available' ? 'No pickups available right now.' : 'You have no active tasks.'}
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
                      {activeTab === 'tasks' && (
                        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-accentglow/15 text-accentglow">
                          {statusLabels[d.status]}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-textmuted mb-1">
                      <span className="flex items-center gap-1"><Store size={12} /> {d.donor?.name || 'Restaurant'}</span>
                      <span className="flex items-center gap-1"><HeartHandshake size={12} /> {d.acceptedBy?.name || 'NGO'}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-textmuted">
                      <span className="flex items-center gap-1"><Package size={12} /> {d.quantity}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {d.pickupAddress}</span>
                      <span className="flex items-center gap-1"><Phone size={12} /> {d.donor?.phone || d.contactNumber}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> Expires {new Date(d.expiryTime).toLocaleString()}</span>
                    </div>
                  </div>

                  {activeTab === 'available' && (
                    <button
                      onClick={() => handleAssign(d._id)}
                      disabled={actionLoading === d._id}
                      className="px-5 py-2.5 rounded-full bg-primary text-bg text-sm font-medium hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all disabled:opacity-60 flex-shrink-0 w-fit"
                    >
                      {actionLoading === d._id ? 'Assigning...' : 'Accept Pickup Task'}
                    </button>
                  )}
                </div>

                {activeTab === 'tasks' && d.pickupLocation && (
                  <RouteMap
                    pickupLat={d.pickupLocation.latitude}
                    pickupLng={d.pickupLocation.longitude}
                    restaurantName={d.donor?.name}
                  />
                )}

                {activeTab === 'tasks' && d.status === 'accepted' && (
                  <button
                    onClick={() => { setPickupModal(d); setPickupOtpInput(''); setPickupError(''); }}
                    className="w-fit flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/15 text-blue-400 text-sm font-medium hover:bg-blue-500/25 transition-all"
                  >
                    <KeyRound size={14} />
                    Enter Pickup OTP
                  </button>
                )}

                {activeTab === 'tasks' && d.status === 'picked_up' && (
                  <button
                    onClick={() => { setDeliveryModal(d); setDeliveryOtpInput(''); setDeliveryError(''); }}
                    className="w-fit flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/15 text-secondary text-sm font-medium hover:bg-secondary/25 transition-all"
                  >
                    <KeyRound size={14} />
                    Enter Delivery OTP
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {pickupModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setPickupModal(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-surface border border-white/10 p-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
              <KeyRound size={24} className="text-blue-400" />
            </div>
            <h3 className="font-display text-xl text-textmain mb-1">Enter Pickup OTP</h3>
            <p className="text-sm text-textmuted mb-5">
              Ask the restaurant for the pickup code to confirm you've collected <span className="text-textmain">{pickupModal.foodName}</span>.
            </p>

            {pickupError && (
              <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {pickupError}
              </div>
            )}

            <form onSubmit={handleVerifyPickup} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="6-digit OTP"
                required
                maxLength={6}
                value={pickupOtpInput}
                onChange={(e) => setPickupOtpInput(e.target.value)}
                className="w-full text-center text-2xl tracking-[0.3em] font-mono py-3 rounded-xl bg-white/5 border border-white/10 text-textmain focus:outline-none focus:border-primary/50"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPickupModal(null)}
                  className="flex-1 py-3 rounded-xl border border-white/15 text-textmuted text-sm hover:text-textmain transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === pickupModal._id}
                  className="flex-1 py-3 rounded-xl bg-primary text-bg text-sm font-medium hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all disabled:opacity-60"
                >
                  {actionLoading === pickupModal._id ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {deliveryModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setDeliveryModal(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-surface border border-white/10 p-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
              <KeyRound size={24} className="text-secondary" />
            </div>
            <h3 className="font-display text-xl text-textmain mb-1">Enter Delivery OTP</h3>
            <p className="text-sm text-textmuted mb-5">
              Ask the NGO for the delivery code to confirm <span className="text-textmain">{deliveryModal.foodName}</span> has been handed over.
            </p>

            {deliveryError && (
              <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {deliveryError}
              </div>
            )}

            <form onSubmit={handleConfirmDelivery} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="6-digit OTP"
                required
                maxLength={6}
                value={deliveryOtpInput}
                onChange={(e) => setDeliveryOtpInput(e.target.value)}
                className="w-full text-center text-2xl tracking-[0.3em] font-mono py-3 rounded-xl bg-white/5 border border-white/10 text-textmain focus:outline-none focus:border-primary/50"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryModal(null)}
                  className="flex-1 py-3 rounded-xl border border-white/15 text-textmuted text-sm hover:text-textmain transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === deliveryModal._id}
                  className="flex-1 py-3 rounded-xl bg-primary text-bg text-sm font-medium hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all disabled:opacity-60"
                >
                  {actionLoading === deliveryModal._id ? 'Confirming...' : 'Confirm'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {showProfile && (
        <ProfileModal
          user={currentUser}
          onClose={() => setShowProfile(false)}
          onUpdate={(updated) => setCurrentUser(updated)}
        />
      )}
    </div>
  );
}