import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, User, LogOut, Menu, X, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { Tooltip } from './Tooltip';

export const Navbar = () => {
  const { 
    isAuthenticated, 
    user, 
    order, 
    isMenuOpen, 
    setIsMenuOpen, 
    handleLogout,
    cart
  } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const onLogout = () => {
    handleLogout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-2xl border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-neon-cyan/10 rounded-xl group-hover:bg-neon-cyan/20 transition-all duration-500 group-hover:rotate-12">
              <Zap className="w-6 h-6 text-neon-cyan drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]" />
            </div>
            <span className="text-2xl font-display font-black tracking-tighter neon-glow-text">
              DIAMOND<span className="text-neon-cyan">BOOST</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-8">
              <Tooltip text="Go to home page">
                <Link to="/" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive('/') ? 'text-neon-cyan' : 'text-slate-400 hover:text-slate-900'}`}>Home</Link>
              </Tooltip>
              <Tooltip text="Earn wallet balance">
                <Link to="/earn" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive('/earn') ? 'text-neon-cyan' : 'text-slate-400 hover:text-slate-900'}`}>Earn</Link>
              </Tooltip>
              <Tooltip text="Membership Packages">
                <Link to="/membership" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive('/membership') ? 'text-neon-cyan' : 'text-slate-400 hover:text-slate-900'}`}>Membership</Link>
              </Tooltip>
              <Tooltip text="Admin Dashboard">
                <Link to="/admin" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive('/admin') ? 'text-neon-cyan' : 'text-slate-400 hover:text-slate-900'}`}>Admin</Link>
              </Tooltip>
              <Tooltip text="View your profile">
                <Link to="/profile" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive('/profile') ? 'text-neon-cyan' : 'text-slate-400 hover:text-slate-900'}`}>Profile</Link>
              </Tooltip>
              <Tooltip text="Account settings">
                <Link to="/settings" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive('/settings') ? 'text-neon-cyan' : 'text-slate-400 hover:text-slate-900'}`}>Settings</Link>
              </Tooltip>
              <Tooltip text="View Cart">
                <Link to="/cart" className={`relative p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all duration-500 group ${isActive('/cart') ? 'text-neon-cyan border-neon-cyan/50' : 'text-slate-400 hover:text-slate-900'}`}>
                  <ShoppingCart className="w-5 h-5" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-cyan text-white text-[8px] font-black rounded-full flex items-center justify-center animate-pulse">
                      {cart.length}
                    </span>
                  )}
                </Link>
              </Tooltip>
            </div>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-6 pl-8 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Wallet</p>
                  <p className="text-sm font-black text-neon-cyan tracking-tight">${order.walletBalance.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Tooltip text="Your Profile" position="bottom">
                    <button 
                      onClick={() => navigate('/profile')}
                      className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all duration-500 overflow-hidden group"
                    >
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <User className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </Tooltip>
                  <Tooltip text="Logout" position="bottom">
                    <button 
                      onClick={onLogout}
                      className="p-2.5 text-slate-300 hover:text-red-500 transition-all duration-300 hover:rotate-12"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            ) : (
              <div className="pl-8 border-l border-slate-200">
                <Link 
                  to="/login"
                  className="px-8 py-3 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-400 hover:text-slate-900">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block w-full text-left text-lg font-medium py-2 text-slate-900">Home</Link>
              <Link to="/membership" onClick={() => setIsMenuOpen(false)} className="block w-full text-left text-lg font-medium py-2 text-slate-900">Membership</Link>
              <Link to="/earn" onClick={() => setIsMenuOpen(false)} className="block w-full text-left text-lg font-medium py-2 text-slate-900">Earn Balance</Link>
              <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block w-full text-left text-lg font-medium py-2 text-slate-900">Admin Dashboard</Link>
              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block w-full text-left text-lg font-medium py-2 text-slate-900">Profile</Link>
              <Link to="/settings" onClick={() => setIsMenuOpen(false)} className="block w-full text-left text-lg font-medium py-2 text-slate-900">Settings</Link>
              <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between w-full text-left text-lg font-medium py-2 text-slate-900">
                <span>Cart</span>
                {cart.length > 0 && (
                  <span className="bg-neon-cyan text-white text-xs font-black px-2 py-0.5 rounded-full">
                    {cart.length}
                  </span>
                )}
              </Link>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
                    {isAuthenticated && user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <span className="font-medium block text-slate-900">{isAuthenticated ? user?.username : 'Guest User'}</span>
                    {isAuthenticated && <span className="text-[10px] text-slate-400 uppercase tracking-widest">{user?.email}</span>}
                  </div>
                </div>
                {isAuthenticated ? (
                  <button onClick={onLogout} className="p-2 text-red-500">
                    <LogOut className="w-5 h-5" />
                  </button>
                ) : (
                  <Link 
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-1.5 rounded-full bg-slate-900 text-white font-bold text-xs"
                  >
                    Login
                  </Link>
                )}
              </div>
              
              {isAuthenticated && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-left">
                    <p className="text-xs text-slate-400">Wallet Balance</p>
                    <p className="text-sm font-bold text-neon-cyan">${order.walletBalance.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
