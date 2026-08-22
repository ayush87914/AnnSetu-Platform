import { motion } from 'framer-motion';
import { Store, HeartHandshake, Bike, Home as HomeIcon } from 'lucide-react';

const nodes = [
  { icon: Store, label: 'Restaurant', delay: 0 },
  { icon: HeartHandshake, label: 'NGO', delay: 0.15 },
  { icon: Bike, label: 'Volunteer', delay: 0.3 },
  { icon: HomeIcon, label: 'Family', delay: 0.45 },
];

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20">
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-accentglow/20 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-xs text-textmuted tracking-wide">Live in Ghaziabad &amp; Delhi NCR</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="relative z-10 font-display text-center text-5xl md:text-7xl font-medium leading-[1.05] max-w-4xl"
      >
        Don't waste food,
        <br />
        <span className="text-primary">feed lives.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative z-10 text-center text-textmuted text-lg max-w-xl mt-6"
      >
        We connect restaurants with surplus food to NGOs and volunteers, turning what would be wasted into meals for those who need them most.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="relative z-10 flex flex-col sm:flex-row gap-4 mt-10"
      >
        <a href="/register" className="px-7 py-3.5 rounded-full bg-primary text-bg font-medium hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] transition-all text-center">Donate Food</a>
        <a href="/available-food" className="px-7 py-3.5 rounded-full border border-white/15 text-textmain hover:border-primary/50 hover:text-primary transition-all text-center">Find Food</a>
        <a href="/register" className="px-7 py-3.5 rounded-full border border-white/15 text-textmain hover:border-primary/50 hover:text-primary transition-all text-center">Become a Volunteer</a>
      </motion.div>

      <div className="relative z-10 w-full max-w-4xl mt-24 hidden md:block">
        <svg viewBox="0 0 800 100" className="absolute top-10 left-0 w-full h-24" preserveAspectRatio="none">
          <path d="M 60 50 Q 260 -10 400 50 T 740 50" stroke="url(#pathGradient)" strokeWidth="1.5" strokeDasharray="4 6" fill="none" />
          <defs>
            <linearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          <motion.circle
            r="4"
            fill="#FBBF24"
            animate={{ offsetDistance: ['0%', '100%'] }}
            style={{ offsetPath: "path('M 60 50 Q 260 -10 400 50 T 740 50')" }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          />
        </svg>

        <div className="flex justify-between items-start relative">
          {nodes.map(({ icon: Icon, label, delay }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + delay }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <Icon size={26} className="text-primary" />
              </div>
              <span className="text-xs text-textmuted font-mono">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}