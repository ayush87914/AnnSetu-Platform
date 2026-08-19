import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Leaf } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Available Food', href: '/available-food' },
  { label: 'Volunteer', href: '#volunteer' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-bg/80 backdrop-blur-lg border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
            <Leaf size={18} className="text-primary" />
          </div>
          <span className="font-display text-xl font-semibold text-textmain">
            Anna<span className="text-primary">Setu</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-sm text-textmuted hover:text-textmain transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a href="/login" className="px-5 py-2 text-sm text-textmain border border-white/15 rounded-full hover:border-primary/50 hover:text-primary transition-all">
            Log In
          </a>
          <a href="/register" className="px-5 py-2 text-sm font-medium bg-primary text-bg rounded-full hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all">
            Sign Up
          </a>
        </div>

        <button className="md:hidden text-textmain" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-surface border-t border-white/10 px-6 py-4 flex flex-col gap-4"
        >
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-textmuted hover:text-textmain" onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-2">
            <a href="/login" className="px-5 py-2 text-sm text-center text-textmain border border-white/15 rounded-full">
              Log In
            </a>
            <a href="/register" className="px-5 py-2 text-sm text-center font-medium bg-primary text-bg rounded-full">
              Sign Up
            </a>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}