import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Bell, Lock, Shield, History, ChevronRight, User, X, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'sonner';

const Settings = () => {
  const { isAuthenticated, handleLogout, user } = useAppContext();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleResetPassword = async () => {
    if (!user?.email) {
      toast.error('User email not found.');
      return;
    }
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to send reset email.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setActiveModal(null);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1500);
  };

  const handleDeleteAccount = () => {
    setIsSaving(true);
    setTimeout(() => {
      handleLogout();
      navigate('/');
    }, 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <SettingsIcon className="w-10 h-10 text-slate-200" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-4 text-slate-900">Login Required</h2>
        <p className="text-slate-400 mb-8">Please login to access your settings.</p>
        <button 
          onClick={() => navigate('/login')}
          className="px-8 py-3 rounded-xl bg-neon-cyan text-white font-bold hover:scale-105 transition-all"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="card-pro overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50" />
        
        <h2 className="text-4xl font-display font-black mb-12 flex items-center gap-5 text-slate-900">
          <div className="p-3 bg-neon-cyan/10 rounded-2xl">
            <SettingsIcon className="w-8 h-8 text-neon-cyan drop-shadow-[0_0_8px_rgba(14,165,233,0.4)]" />
          </div>
          Control Center
        </h2>

        <div className="space-y-10">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">System Configuration</h3>
            <div className="space-y-3">
              {[
                { icon: User, label: 'Personal Identity', desc: 'Secure profile management', action: () => navigate('/profile') },
                { icon: Bell, label: 'Alert Protocols', desc: 'Manage real-time notifications', action: () => setActiveModal('notifications') },
                { icon: History, label: 'Transaction Logs', desc: 'Audit your previous orders', action: () => navigate('/profile') },
              ].map((item) => (
                <button 
                  key={item.label}
                  onClick={item.action}
                  className="w-full p-5 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-neon-cyan/30 hover:bg-white transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center group-hover:bg-neon-cyan/10 transition-all duration-500">
                      <item.icon className="w-6 h-6 text-slate-400 group-hover:text-neon-cyan transition-all" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-base tracking-tight text-slate-900">{item.label}</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-bold">{item.desc}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-neon-cyan/10 transition-all">
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-neon-cyan transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Security Core</h3>
            <div className="space-y-3">
              {[
                { icon: Lock, label: 'Access Keys', desc: 'Rotate account credentials', action: () => setActiveModal('password') },
                { icon: Shield, label: 'Privacy Firewall', desc: 'Data isolation & visibility', action: () => setActiveModal('privacy') },
              ].map((item) => (
                <button 
                  key={item.label}
                  onClick={item.action}
                  className="w-full p-5 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-neon-cyan/30 hover:bg-white transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center group-hover:bg-neon-cyan/10 transition-all duration-500">
                      <item.icon className="w-6 h-6 text-slate-400 group-hover:text-neon-cyan transition-all" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-base tracking-tight text-slate-900">{item.label}</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-bold">{item.desc}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-neon-cyan/10 transition-all">
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-neon-cyan transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-10 border-t border-slate-200">
            <button 
              onClick={() => setActiveModal('delete')}
              className="w-full py-5 rounded-3xl bg-red-50 border border-red-200 text-red-500 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-100 hover:border-red-300 transition-all"
            >
              Terminate Account
            </button>
            <div className="flex flex-col items-center gap-2 mt-8">
              <p className="text-[9px] text-slate-200 uppercase tracking-[0.4em] font-black">
                DiamondBoost v2.5.0-PRO
              </p>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-neon-cyan rounded-full animate-pulse" />
                <p className="text-[8px] text-neon-cyan/30 uppercase tracking-widest font-black">Secure Connection Established</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white border border-slate-200 rounded-[32px] p-8 shadow-2xl"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {activeModal === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-neon-cyan/10 rounded-xl">
                      <Bell className="w-6 h-6 text-neon-cyan" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-slate-900">Notifications</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Order Updates', desc: 'Get notified when your diamonds are delivered' },
                      { label: 'Promotions', desc: 'Receive special offers and bonus credit alerts' },
                      { label: 'Security Alerts', desc: 'Important updates about your account security' },
                    ].map((notif) => (
                      <div key={notif.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="text-left">
                          <p className="font-bold text-sm text-slate-900">{notif.label}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{notif.desc}</p>
                        </div>
                        <div className="w-12 h-6 bg-neon-cyan/20 rounded-full relative cursor-pointer">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-neon-cyan rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={handleSave} className="w-full neon-button mt-4">
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              )}

              {activeModal === 'password' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-neon-cyan/10 rounded-xl">
                      <Lock className="w-6 h-6 text-neon-cyan" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-slate-900">Change Password</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-neon-cyan transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-neon-cyan transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-neon-cyan transition-all" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button onClick={handleSave} className="w-full neon-button">
                      {isSaving ? 'Updating...' : 'Update Password'}
                    </button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100"></div>
                      </div>
                      <div className="relative flex justify-center text-[8px] uppercase">
                        <span className="bg-white px-3 text-slate-300 font-black tracking-widest">Alternative</span>
                      </div>
                    </div>
                    <button 
                      onClick={handleResetPassword}
                      disabled={isResetting}
                      className="w-full py-4 rounded-2xl bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isResetting ? 'Sending Reset Email...' : 'Reset via Email'}
                    </button>
                  </div>
                </div>
              )}

              {activeModal === 'privacy' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-neon-cyan/10 rounded-xl">
                      <Shield className="w-6 h-6 text-neon-cyan" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-slate-900">Privacy Settings</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <p className="text-sm font-bold mb-1 text-slate-900">Public Profile</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">Allow others to see your level and stats</p>
                      <div className="w-12 h-6 bg-slate-100 rounded-full relative cursor-pointer">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-slate-300 rounded-full" />
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <p className="text-sm font-bold mb-1 text-slate-900">Data Collection</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">Help us improve by sharing usage data</p>
                      <div className="w-12 h-6 bg-neon-cyan/20 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-neon-cyan rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                      </div>
                    </div>
                  </div>
                  <button onClick={handleSave} className="w-full neon-button mt-4">
                    {isSaving ? 'Saving...' : 'Save Privacy Settings'}
                  </button>
                </div>
              )}

              {activeModal === 'delete' && (
                <div className="space-y-6 text-center">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Trash2 className="w-10 h-10 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">Delete Account?</h3>
                    <p className="text-slate-400 text-sm">This action is permanent and cannot be undone. You will lose all your credits and order history.</p>
                  </div>
                  <div className="flex flex-col gap-3 pt-4">
                    <button 
                      onClick={handleDeleteAccount}
                      disabled={isSaving}
                      className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                          Deleting...
                        </>
                      ) : (
                        'Yes, Delete My Account'
                      )}
                    </button>
                    <button 
                      onClick={() => setActiveModal(null)}
                      disabled={isSaving}
                      className="w-full py-4 rounded-2xl bg-slate-100 text-slate-400 font-bold hover:text-slate-900 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200]"
          >
            <div className="bg-green-500 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold text-sm">Settings saved successfully!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Settings;
