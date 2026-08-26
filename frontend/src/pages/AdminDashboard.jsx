import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Users, Store, HeartHandshake, Bike, Clock, Check, X, LogOut, ShieldCheck, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfileModal from '../components/ProfileModal';
import { API_URL } from '../config';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [stats, setStats] = useState({ totalRestaurants: 0, totalNGOs: 0, totalVolunteers: 0, pendingApprovals: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [showProfile, setShowProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: 'Bearer ' + token } };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/pending-users`, authHeader),
        axios.get(`${API_URL}/api/admin/all-users?status=approved`, authHeader),
        axios.get(`${API_URL}/api/admin/dashboard-stats`, authHeader),
      ]);
      setPendingUsers(pendingRes.data.users);
      setApprovedUsers(approvedRes.data.users);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || currentUser.role !== 'admin') { navigate('/login'); return; }
    fetchData();
  }, []);

  const handleAction = async (userId, status) => {
    setActionLoading(userId);
    setMessage('');
    try {
      await axios.patch(`${API_URL}/api/admin/update-status/${userId}`, { status }, authHeader);
      setMessage('User ' + status + ' successfully');
      setSelectedUser(null);
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const statCards = [
    { icon: Store, label: 'Restaurants', value: stats.totalRestaurants },
    { icon: HeartHandshake, label: 'NGOs', value: stats.totalNGOs },
    { icon: Bike, label: 'Volunteers', value: stats.totalVolunteers },
    { icon: Clock, label: 'Pending Approvals', value: stats.pendingApprovals },
  ];

  const currentList = activeTab === 'pending' ? pendingUsers : approvedUsers;

  return (
    <div className="min-h-screen px-6 py-10 relative overflow-hidden">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0"><Leaf size={18} className="text-primary" /></div>
            <span className="font-display text-lg font-semibold text-textmain">Ann<span className="text-primary">Setu</span> Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-white/10 hover:border-primary/40 transition-all" title="View profile">
              {currentUser.profileImage ? (
                <img src={currentUser.profileImage} alt={currentUser.name} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center"><span className="text-[11px] font-medium text-primary">{currentUser.name?.charAt(0).toUpperCase() || 'U'}</span></div>
              )}
              <span className="text-sm text-textmain hidden sm:inline">{currentUser.name}</span>
            </button>
            <button onClick={handleLogout} className="w-9 h-9 rounded-full border border-white/15 text-textmuted hover:text-red-400 hover:border-red-400/40 transition-all flex items-center justify-center flex-shrink-0" title="Logout"><LogOut size={15} /></button>
          </div>
        </div>

        <h1 className="font-display text-3xl font-medium text-textmain mb-8">Dashboard Overview</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {statCards.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
              <Icon size={20} className="text-primary mb-3" />
              <div className="font-mono text-2xl font-semibold text-textmain">{value}</div>
              <div className="text-xs text-textmuted mt-1">{label}</div>
            </div>
          ))}
        </div>

        {message && <div className="mb-6 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm">{message}</div>}

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex gap-2 bg-white/5 p-1 rounded-full">
              <button onClick={() => setActiveTab('pending')} className={'px-4 py-1.5 rounded-full text-sm transition-all ' + (activeTab === 'pending' ? 'bg-primary text-bg' : 'text-textmuted')}>Pending ({pendingUsers.length})</button>
              <button onClick={() => setActiveTab('approved')} className={'px-4 py-1.5 rounded-full text-sm transition-all ' + (activeTab === 'approved' ? 'bg-primary text-bg' : 'text-textmuted')}>Approved ({approvedUsers.length})</button>
            </div>
          </div>

          {loading ? (
            <p className="text-textmuted text-sm">Loading...</p>
          ) : currentList.length === 0 ? (
            <p className="text-textmuted text-sm">No {activeTab} users right now.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {currentList.map((u) => (
                <motion.div key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setSelectedUser(u)} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-3">
                    {u.profileImage ? (
                      <img src={u.profileImage} alt={u.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><span className="text-xs font-medium text-primary">{u.name?.charAt(0).toUpperCase()}</span></div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-textmain font-medium">{u.name}</span>
                        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary">{u.role}</span>
                      </div>
                      <div className="text-xs text-textmuted mt-1">{u.email} • {u.phone}</div>
                    </div>
                  </div>

                  {activeTab === 'pending' ? (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleAction(u._id, 'approved')} disabled={actionLoading === u._id} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/15 text-primary text-sm hover:bg-primary/25 transition-all disabled:opacity-50"><Check size={14} />Approve</button>
                      <button onClick={() => handleAction(u._id, 'rejected')} disabled={actionLoading === u._id} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-all disabled:opacity-50"><X size={14} />Reject</button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs w-fit"><ShieldCheck size={12} />Approved</span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUser(null)} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-surface border border-white/10 p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  {selectedUser.profileImage ? (
                    <img src={selectedUser.profileImage} alt={selectedUser.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-sm font-medium text-primary">{selectedUser.name?.charAt(0).toUpperCase()}</span></div>
                  )}
                  <div>
                    <h3 className="font-display text-xl text-textmain">{selectedUser.name}</h3>
                    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary mt-1 inline-block">{selectedUser.role}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-textmuted hover:text-textmain"><X size={18} /></button>
              </div>

              <div className="flex flex-col gap-3 text-sm mb-6">
                <div className="flex items-center gap-2 text-textmuted"><Mail size={14} /> {selectedUser.email}</div>
                <div className="flex items-center gap-2 text-textmuted"><Phone size={14} /> {selectedUser.phone}</div>
                {selectedUser.businessInfo && <div className="text-textmuted">Business Info: {selectedUser.businessInfo}</div>}
                {selectedUser.ngoInfo && <div className="text-textmuted">NGO Info: {selectedUser.ngoInfo}</div>}
                {selectedUser.idProof && <div className="text-textmuted">ID Proof: {selectedUser.idProof}</div>}
                <div className="text-textmuted">Status: <span className="text-primary capitalize">{selectedUser.status}</span></div>
              </div>

              {selectedUser.status === 'approved' ? (
                <button onClick={() => handleAction(selectedUser._id, 'pending')} disabled={actionLoading === selectedUser._id} className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all disabled:opacity-50">{actionLoading === selectedUser._id ? 'Revoking...' : 'Revoke Access'}</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => handleAction(selectedUser._id, 'approved')} disabled={actionLoading === selectedUser._id} className="flex-1 py-3 rounded-xl bg-primary/15 text-primary text-sm font-medium hover:bg-primary/25 transition-all disabled:opacity-50">Approve</button>
                  <button onClick={() => handleAction(selectedUser._id, 'rejected')} disabled={actionLoading === selectedUser._id} className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all disabled:opacity-50">Reject</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showProfile && <ProfileModal user={currentUser} onClose={() => setShowProfile(false)} onUpdate={(updated) => setCurrentUser(updated)} />}
    </div>
  );
}