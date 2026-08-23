import { Leaf } from 'lucide-react';

const FacebookIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95Z"/></svg>
);
const InstagramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
);
const TwitterIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22 5.8c-.7.3-1.5.6-2.4.7.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1-.8-.8-1.9-1.3-3.1-1.3-2.3 0-4.2 1.9-4.2 4.2 0 .3 0 .6.1.9-3.5-.2-6.6-1.9-8.7-4.4-.4.6-.6 1.3-.6 2.1 0 1.4.7 2.7 1.8 3.4-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.7 3.3 4-.3.1-.7.2-1.1.2-.3 0-.5 0-.8-.1.5 1.7 2.1 2.9 3.9 2.9-1.4 1.1-3.2 1.8-5.2 1.8-.3 0-.7 0-1-.1C3.5 20 5.7 20.7 8 20.7c8 0 12.4-6.7 12.4-12.4v-.6c.8-.6 1.5-1.3 2.1-2.1Z"/></svg>
);
const LinkedinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.24 8.25h4.5V23h-4.5V8.25ZM8.5 8.25h4.3v2h.06c.6-1.1 2.06-2.3 4.24-2.3 4.53 0 5.37 2.9 5.37 6.7V23h-4.5v-6.65c0-1.58-.03-3.63-2.24-3.63-2.24 0-2.58 1.7-2.58 3.5V23h-4.5V8.25Z"/></svg>
);

export default function Footer() {
  return (
    <footer id="contact" className="relative px-6 pt-20 pb-10 border-t border-white/10 mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                <Leaf size={16} className="text-primary" />
              </div>
              <span className="font-display text-lg font-semibold text-textmain">
                Anna<span className="text-primary">Setu</span>
              </span>
            </div>
            <p className="text-sm text-textmuted leading-relaxed">
              Connecting surplus food from restaurants to those who need it most. Together, we build a hunger-free world.
            </p>
            <div className="flex gap-3 mt-5">
              {[FacebookIcon, InstagramIcon, TwitterIcon, LinkedinIcon].map((Icon, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/15 hover:border-primary/30 transition-colors cursor-pointer">
                  <Icon />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-textmain font-medium mb-4 text-sm">For Restaurants</h4>
            <ul className="space-y-3 text-sm text-textmuted">
              <li className="hover:text-primary cursor-pointer transition-colors">Register Your Restaurant</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Dashboard</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Donation Guidelines</li>
            </ul>
          </div>

          <div>
            <h4 className="text-textmain font-medium mb-4 text-sm">For NGOs</h4>
            <ul className="space-y-3 text-sm text-textmuted">
              <li className="hover:text-primary cursor-pointer transition-colors">Register Your NGO</li>
              <li className="hover:text-primary cursor-pointer transition-colors">NGO Dashboard</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Success Stories</li>
            </ul>
          </div>

          <div>
            <h4 className="text-textmain font-medium mb-4 text-sm">Contact Us</h4>
            <ul className="space-y-3 text-sm text-textmuted">
              <li>+91 99999 99999</li>
              <li>imission806@gmail.com</li>
              <li>Dehradun, India</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-textmuted">
          <span>© 2026 AnnaSetu. All rights reserved.</span>
          <span>Made with 💚 for a better tomorrow.</span>
        </div>
      </div>
    </footer>
  );
}