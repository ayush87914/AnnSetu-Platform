import { motion } from 'framer-motion';
import { UtensilsCrossed, Bell, HandHeart, Truck, HeartHandshake } from 'lucide-react';

const steps = [
  { icon: UtensilsCrossed, title: 'Food is Donated', desc: 'Restaurant uploads details of surplus food available for pickup.' },
  { icon: Bell, title: 'NGOs Notified', desc: 'Nearby NGOs receive an instant alert about the new donation.' },
  { icon: HandHeart, title: 'NGO Accepts', desc: 'NGO reviews and accepts the donation, coordinating pickup.' },
  { icon: Truck, title: 'Food is Picked Up', desc: 'A volunteer collects the food and delivers it safely.' },
  { icon: HeartHandshake, title: 'Impact is Created', desc: 'Food reaches those in need and lives are changed.' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-32">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-primary text-xs tracking-[0.2em] uppercase font-mono">How It Works</span>
          <h2 className="font-display text-4xl md:text-5xl font-medium mt-4">
            Simple steps, <span className="text-primary">big impact.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-6 relative">
          <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-px bg-gradient-to-r from-primary/40 via-secondary/40 to-accentglow/40" />

          {steps.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-surface border border-white/10 flex items-center justify-center mb-5">
                <Icon size={24} className="text-primary" />
              </div>
              <span className="text-xs font-mono text-secondary mb-2">STEP {i + 1}</span>
              <h3 className="font-medium text-textmain mb-2">{title}</h3>
              <p className="text-sm text-textmuted leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}