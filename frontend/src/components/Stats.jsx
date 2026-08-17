import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Users, UtensilsCrossed, Leaf, Globe } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

export default function Stats() {
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalNGOs: 0,
    totalVolunteers: 0,
    totalDonationsPosted: 0,
    totalMealsDelivered: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/public/impact-stats`);
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load impact stats:', err);
      }
    };
    fetchStats();
  }, []);

  const statList = [
    { icon: Store, value: stats.totalRestaurants + '+', label: 'Restaurants Onboard' },
    { icon: Users, value: stats.totalNGOs + '+', label: 'NGOs Registered' },
    { icon: UtensilsCrossed, value: stats.totalMealsDelivered + '+', label: 'Meals Delivered' },
    { icon: Leaf, value: stats.totalDonationsPosted + '+', label: 'Donations Posted' },
    { icon: Globe, value: stats.totalVolunteers + '+', label: 'Active Volunteers' },
  ];

  return (
    <section className="relative px-6 -mt-8 z-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/10 px-6 py-10 grid grid-cols-2 md:grid-cols-5 gap-8"
      >
        {statList.map(({ icon: Icon, value, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="flex flex-col items-center text-center gap-2"
          >
            <Icon size={22} className="text-primary mb-1" />
            <span className="font-mono text-2xl md:text-3xl font-semibold text-textmain">{value}</span>
            <span className="text-xs text-textmuted">{label}</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}