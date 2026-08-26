import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Package, Clock, MapPin, Phone, LogOut, CheckCircle2, Navigation, Store, KeyRound, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfileModal from '../components/ProfileModal';
import DonationsMap from '../components/DonationsMap';
import { List, Map as MapIcon } from 'lucide-react';
import { API_URL } from '../config';

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
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [viewMode, setViewMode] = useState('list');
  const [ratingModal, setRatingModal] = useState(null);
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [volunteerRating, setVolunteerRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: 'Bearer ' + token } };

  const fetchNearby = async (lat, lng) => {
    try {
      const url = lat && lng
        ? `${API_URL}/api/donations/available/nearby?latitude=${lat}&longitude=${lng}`
        : `${API_URL}/api/donations/available/nearby`;
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
      const res = await axios.get(`${API_URL}/api/donations/ngo/my-accepted`, authHeader);
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
    if (!token || currentUser.role !== 'ngo') {
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
      await axios.patch(`${API_URL}/api/donations/accept/${id}`, {}, authHeader);
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
      const res = await axios.post(`${API_URL}/api/donations/ngo/generate-delivery-otp/${donation._id}`, {}, authHeader);
      setGeneratedOtp(res.data.otp);
      setOtpModal(donation);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to generate OTP');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setActionLoading(ratingModal._id);
    try {
      await axios.patch(
        `${API_URL}/api/donations/rate/${ratingModal._id}`,
        { restaurantRating, volunteerRating, feedbackComment },
        authHeader
      );
      setMessage('Thank you for your feedback!');
      setRatingModal(null);
      setRestaurantRating(0);
      setVolunteerRating(0);
      setFeedbackComment('');
      fetchAccepted();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit rating');
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
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Leaf size={18} className="text-primary" />
            </div>
            <span className="font-display text-lg font-semibold text-textmain">
              Ann<span className="text-primary">Setu</span>
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

        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div className="flex gap-2 bg-white/5 p-1 rounded-full w-fit">
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

          {activeTab === 'nearby' && (
            <div className="flex gap-2 bg-white/5 p-1 rounded-full w-fit">
              <button
                onClick={() => setViewMode('list')}
                className={'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ' + (viewMode === 'list' ? 'bg-primary text-bg' : 'text-textmuted')}
              >
                <List size={12} /> List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ' + (viewMode === 'map' ? 'bg-primary text-bg' : 'text-textmuted')}
              >
                <MapIcon size={12} /> Map
              </button>
            </div>
          )}
        </div>

        {activeTab === 'nearby' && viewMode === 'map' && nearbyDonations.length > 0 && (
          <DonationsMap donations={nearbyDonations} userLocation={location} />
        )}

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

                {activeTab === 'accepted' && d.status === 'delivered' && !d.restaurantRating && (
                  <button
                    onClick={() => { setRatingModal(d); setRestaurantRating(0); setVolunteerRating(0); setFeedbackComment(''); }}
                    className="w-fit flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/15 text-secondary text-sm font-medium hover:bg-secondary/25 transition-all"
                  >
                    <Star size={14} />
                    Rate this delivery
                  </button>
                )}

                {activeTab === 'accepted' && d.status === 'delivered' && d.restaurantRating && (
                  <div className="flex items-center gap-1 text-xs text-textmuted">
                    <CheckCircle2 size={14} className="text-primary" />
                    Feedback submitted — thank you!
                  </div>
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

      {ratingModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setRatingModal(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-surface border border-white/10 p-6"
          >
            <h3 className="font-display text-xl text-textmain mb-1">Rate this delivery</h3>
            <p className="text-sm text-textmuted mb-5">{ratingModal.foodName}</p>

            <form onSubmit={handleSubmitRating} className="flex flex-col gap-5">
              <div>
                <label className="text-xs text-textmuted mb-2 block flex items-center gap-1.5">
                  <Store size={12} /> Restaurant ({ratingModal.donor?.name || 'Restaurant'})
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRestaurantRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={26}
                        className={star <= restaurantRating ? 'fill-secondary text-secondary' : 'text-white/20'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-textmuted mb-2 block flex items-center gap-1.5">
                  Volunteer ({ratingModal.assignedVolunteer?.name || 'Volunteer'})
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setVolunteerRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={26}
                        className={star <= volunteerRating ? 'fill-secondary text-secondary' : 'text-white/20'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-textmuted mb-1 block">Comment (optional)</label>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  rows={3}
                  placeholder="Share your experience..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-textmain placeholder:text-textmuted focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRatingModal(null)}
                  className="flex-1 py-3 rounded-xl border border-white/15 text-textmuted text-sm hover:text-textmain transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === ratingModal._id || !restaurantRating || !volunteerRating}
                  className="flex-1 py-3 rounded-xl bg-primary text-bg text-sm font-medium hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all disabled:opacity-60"
                >
                  {actionLoading === ratingModal._id ? 'Submitting...' : 'Submit'}
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