import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { MessageCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { motion, AnimatePresence } from 'motion/react';

export const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-neon-cyan selection:text-white bg-gaming-dark">
      <div className="noise-bg" />
      
      {/* Global Progress Bar */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname + "-loader"}
          initial={{ width: "0%", opacity: 1 }}
          animate={{ width: "100%", opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed top-0 left-0 h-[2px] bg-neon-cyan z-[100] shadow-[0_0_10px_rgba(14,165,233,0.8)]"
        />
      </AnimatePresence>

      <Navbar />
      
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 1.02 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Support Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Tooltip text="Chat with support" position="left">
          <button className="w-14 h-14 rounded-full bg-neon-cyan text-white flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:scale-110 transition-all group">
            <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          </button>
        </Tooltip>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-neon-cyan/10 rounded-lg">
                  <div className="w-5 h-5 bg-neon-cyan rounded-sm" />
                </div>
                <span className="text-lg font-display font-bold tracking-tight text-slate-900">
                  DIAMOND<span className="text-neon-cyan">BOOST</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                The most trusted diamond reload platform for Free Fire players worldwide. Instant delivery, secure payments, and 24/7 support.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Platform</h4>
              <ul className="space-y-4 text-xs font-medium text-slate-600">
                <li><Link to="/" className="hover:text-neon-cyan transition-colors">Packages</Link></li>
                <li><Link to="/membership" className="hover:text-neon-cyan transition-colors">Membership</Link></li>
                <li><Link to="/earn" className="hover:text-neon-cyan transition-colors">Earn Balance</Link></li>
                <li><Link to="/admin" className="hover:text-neon-cyan transition-colors">Admin Dashboard</Link></li>
                <li><Link to="/profile" className="hover:text-neon-cyan transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Support</h4>
              <ul className="space-y-4 text-xs font-medium text-slate-600">
                <li><button className="hover:text-neon-cyan transition-colors">Help Center</button></li>
                <li><button className="hover:text-neon-cyan transition-colors">Terms of Service</button></li>
                <li><button className="hover:text-neon-cyan transition-colors">Privacy Policy</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Connect</h4>
              <ul className="space-y-4 text-xs font-medium text-slate-600">
                <li><button className="hover:text-neon-cyan transition-colors">Discord</button></li>
                <li><button className="hover:text-neon-cyan transition-colors">Instagram</button></li>
                <li><button className="hover:text-neon-cyan transition-colors">Twitter</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              © 2024 DiamondBoost Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Server Status: Online</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
