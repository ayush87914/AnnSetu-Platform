import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Users, Store, HeartHandshake, Bike, Clock, Check, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [stats, setStats] = useState({ totalRestaurants: 0, totalNGOs: 0, totalVolunteers: 0, pendingApprovals: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const authHeader = { headers: { Authorization: 'Bearer ' + token } };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/pending-users', authHeader),
        axios.get('http://localhost:5000/api/admin/dashboard-stats', authHeader),
      ]);
      setPendingUsers(pendingRes.data.users);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, []);

  const handleAction = async (userId, status) => {
    setActionLoading(userId);
    setMessage('');
    try {
      await axios.patch(
        'http://localhost:5000/api/admin/update-status/' + userId,
        { status },
        authHeader
      );
      setMessage('User ' + status + ' successfully');
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

  return (
    <div className="min-h-screen px-6 py-10 relative overflow-hidden">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
              <Leaf size={18} className="text-primary" />
            </div>
            <span className="font-display text-xl font-semibold text-textmain">
              Anna<span className="text-primary">Setu</span> Admin
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-sm text-textmuted hover:text-textmain hover:border-white/30 transition-all"
          >
            <LogOut size={14} />
            Logout
          </button>
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

        {message && (
          <div className="mb-6 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm">
            {message}
          </div>
        )}

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users size={18} className="text-primary" />
            <h2 className="font-medium text-textmain">Pending Approvals</h2>
          </div>

          {loading ? (
            <p className="text-textmuted text-sm">Loading...</p>
          ) : pendingUsers.length === 0 ? (
            <p className="text-textmuted text-sm">No pending users right now.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingUsers.map((u) => (
                <motion.div
                  key={u._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-textmain font-medium">{u.name}</span>
                      <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {u.role}
                      </span>
                    </div>
                    <div className="text-xs text-textmuted mt-1">{u.email} • {u.phone}</div>
                    {u.businessInfo && <div className="text-xs text-textmuted">{u.businessInfo}</div>}
                    {u.ngoInfo && <div className="text-xs text-textmuted">{u.ngoInfo}</div>}
                    {u.idProof && <div className="text-xs text-textmuted">{u.idProof}</div>}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(u._id, 'approved')}
                      disabled={actionLoading === u._id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/15 text-primary text-sm hover:bg-primary/25 transition-all disabled:opacity-50"
                    >
                      <Check size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(u._id, 'rejected')}
                      disabled={actionLoading === u._id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                      <X size={14} />
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}