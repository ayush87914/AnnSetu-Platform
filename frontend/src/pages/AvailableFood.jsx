import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, Clock, Store, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AvailableFood() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/public/available-food`);
        setDonations(res.data.donations);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <section className="relative px-6 pt-32 pb-20 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/15 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accentglow/15 rounded-full blur-[100px]"></div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-primary text-xs tracking-[0.2em] uppercase font-mono">Available Food</span>
            <h1 className="font-display text-4xl md:text-5xl font-medium mt-4 mb-3">
              Find Food. <span className="text-primary">Feed Hope.</span>
            </h1>
            <p className="text-textmuted max-w-xl mx-auto">
              Discover surplus food currently available near you, waiting to be picked up by verified NGOs.
            </p>
          </motion.div>

          {loading ? (
            <p className="text-center text-textmuted text-sm">Loading...</p>
          ) : donations.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-16 text-center max-w-md mx-auto">
              <Package size={32} className="text-textmuted mx-auto mb-4" />
              <p className="text-textmain font-medium mb-2">No donations available right now</p>
              <p className="text-textmuted text-sm mb-6">Check back soon, or become a partner to help us grow.</p>
              <Link
                to="/register"
                className="inline-block px-6 py-3 rounded-full bg-primary text-bg text-sm font-medium hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all"
              >
                Join AnnSetu
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.map((d, i) => (
                <motion.div
                  key={d._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden"
                >
                  {d.foodImage ? (
                    <img src={d.foodImage} alt={d.foodName} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-white/5 flex items-center justify-center">
                      <Package size={28} className="text-textmuted" />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={
                        'text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ' +
                        (d.foodType === 'veg' ? 'bg-primary/15 text-primary' : d.foodType === 'non-veg' ? 'bg-red-500/15 text-red-400' : 'bg-secondary/15 text-secondary')
                      }>
                        {d.foodType === 'veg' ? 'Vegetarian' : d.foodType === 'non-veg' ? 'Non-Vegetarian' : 'Veg & Non-Veg'}
                      </span>
                    </div>

                    <h3 className="text-textmain font-medium mb-1">{d.foodName}</h3>
                    <div className="flex items-center gap-1 text-xs text-textmuted mb-3">
                      <Store size={12} /> {d.donor?.name || 'Restaurant'}
                    </div>

                    <div className="flex flex-col gap-1.5 text-xs text-textmuted">
                      <span className="flex items-center gap-1.5"><Package size={12} /> {d.quantity}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={12} /> {d.pickupAddress}</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} /> Available until {new Date(d.expiryTime).toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 rounded-2xl bg-primary/10 border border-primary/20 p-8 text-center flex flex-col items-center gap-4"
          >
            <Leaf size={24} className="text-primary" />
            <h3 className="font-display text-xl text-textmain">Are you an NGO?</h3>
            <p className="text-textmuted text-sm max-w-md">
              Register with AnnSetu to claim these donations and get them delivered to those who need them most.
            </p>
            <Link
              to="/register"
              className="px-6 py-3 rounded-full bg-primary text-bg text-sm font-medium hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all"
            >
              Register as NGO
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}