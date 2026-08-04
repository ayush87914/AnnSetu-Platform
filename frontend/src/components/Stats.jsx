import { motion } from 'framer-motion';
import { Store, Users, UtensilsCrossed, Leaf, Globe } from 'lucide-react';

const stats = [
  { icon: Store, value: '1,000+', label: 'Restaurants Onboard' },
  { icon: Users, value: '2,500+', label: 'NGOs Registered' },
  { icon: UtensilsCrossed, value: '150K+', label: 'Meals Donated' },
  { icon: Leaf, value: '4.5 Tons', label: 'Food Waste Saved' },
  { icon: Globe, value: '100K+', label: 'People Impacted' },
];

export default function Stats() {
  return (
    <section className="relative px-6 -mt-8 z-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/10 px-6 py-10 grid grid-cols-2 md:grid-cols-5 gap-8"
      >
        {stats.map(({ icon: Icon, value, label }, i) => (
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