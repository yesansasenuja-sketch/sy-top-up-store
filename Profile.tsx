import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, History, Trophy, Star, Camera, ChevronRight, Zap, AlertCircle, ExternalLink, Image as ImageIcon, CreditCard, Wallet, Landmark, Loader2, Plus, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { toast } from 'sonner';

const Profile = () => {
  const { user, setUser, isAuthenticated, order, setOrder, orders, isAuthReady, updateUserProfile, updateWalletBalance } = useAppContext();
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isToppingUp, setIsToppingUp] = useState(false);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    phoneNumber: user?.phoneNumber || '',
    bankName: user?.paymentDetails?.bankName || '',
    accountNumber: user?.paymentDetails?.accountNumber || '',
    accountName: user?.paymentDetails?.accountName || '',
    cryptoWallet: user?.paymentDetails?.cryptoWallet || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        phoneNumber: user.phoneNumber || '',
        bankName: user.paymentDetails?.bankName || '',
        accountNumber: user.paymentDetails?.accountNumber || '',
        accountName: user.paymentDetails?.accountName || '',
        cryptoWallet: user.paymentDetails?.cryptoWallet || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (isAuthReady && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthReady, isAuthenticated, navigate]);

  const handleSave = async () => {
    if (isEditingProfile) {
      setIsSaving(true);
      try {
        await updateUserProfile({
          username: formData.username,
          phoneNumber: formData.phoneNumber,
          paymentDetails: {
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            accountName: formData.accountName,
            cryptoWallet: formData.cryptoWallet,
          }
        });
        toast.success('Profile updated successfully!');
        setIsEditingProfile(false);
      } catch (error) {
        toast.error('Failed to update profile. Please try again.');
        console.error(error);
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsEditingProfile(true);
    }
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    setIsToppingUp(true);
    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const currentBalance = user?.walletBalance || 0;
      await updateWalletBalance(currentBalance + amount);
      
      toast.success(`Successfully topped up $${amount.toFixed(2)}!`);
      setIsTopUpModalOpen(false);
      setTopUpAmount('');
    } catch (error) {
      toast.error('Top up failed. Please try again.');
      console.error(error);
    } finally {
      setIsToppingUp(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card-pro text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50" />
            
            <div className="relative inline-block mb-8">
              <div className="relative z-10 w-32 h-32 rounded-[2.5rem] border-2 border-neon-cyan/30 p-1.5 bg-slate-50 backdrop-blur-xl group cursor-pointer">
                <div className="w-full h-full rounded-[2rem] overflow-hidden">
                  <img src={user?.avatar} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <button className="absolute -bottom-2 -right-2 p-3 bg-neon-cyan text-white rounded-2xl shadow-xl hover:scale-110 transition-all active:scale-95 z-20">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute inset-0 bg-neon-cyan/20 blur-[40px] rounded-full -z-10 animate-pulse" />
            </div>

            <h2 className="text-3xl font-display font-black tracking-tight mb-1 text-slate-900">{user?.username}</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black mb-8">{user?.email}</p>
            
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">Wallet Balance</p>
                  <p className="text-2xl font-black text-neon-cyan tracking-tight">${user?.walletBalance.toFixed(2)}</p>
                </div>
                <div className="text-center border-l border-slate-200">
                  <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">Pro Level</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">12</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsTopUpModalOpen(true)}
                className="w-full py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-neon-cyan transition-all group"
              >
                <Plus className="w-3 h-3 group-hover:rotate-90 transition-transform" /> Top Up Balance
              </button>
            </div>
          </div>

          {order.remainingBalance > 0 && (
            <div className="card-pro bg-neon-cyan/5 border-neon-cyan/20">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neon-cyan mb-4 flex items-center gap-2">
                <AlertCircle className="w-3 h-3" /> Pending Payment
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1">Remaining Balance</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">${order.remainingBalance.toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => navigate('/payment')}
                  className="px-6 py-3 rounded-xl bg-neon-cyan text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                >
                  Pay Now
                </button>
              </div>
            </div>
          )}

          <div className="card-pro">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <Zap className="w-3 h-3 text-neon-cyan" /> Performance Stats
            </h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between group cursor-help">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Total Orders</span>
                </div>
                <span className="text-lg font-black tracking-tight text-slate-900">{orders.length}</span>
              </div>
              <div className="flex items-center justify-between group cursor-help">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Loyalty Points</span>
                </div>
                <span className="text-lg font-black tracking-tight text-slate-900">{orders.length * 50}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <div className="card-pro">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-display font-black flex items-center gap-4">
                <div className="p-2.5 bg-neon-cyan/10 rounded-xl">
                  <User className="w-6 h-6 text-neon-cyan" />
                </div>
                <span className="text-slate-900">Identity</span>
              </h3>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  isEditingProfile 
                    ? 'bg-neon-cyan text-white shadow-[0_0_20px_rgba(14,165,233,0.3)]' 
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-900'
                } disabled:opacity-50`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  isEditingProfile ? 'Save Changes' : 'Edit Profile'
                )}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Username</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-neon-cyan transition-colors" />
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!isEditingProfile}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold text-sm text-slate-900 focus:outline-none focus:border-neon-cyan/50 focus:bg-white transition-all disabled:opacity-40"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-neon-cyan transition-colors" />
                  <input 
                    type="email" 
                    value={user?.email || ''}
                    disabled={true}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold text-sm text-slate-900 focus:outline-none focus:border-neon-cyan/50 focus:bg-white transition-all opacity-40"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-neon-cyan transition-colors" />
                  <input 
                    type="tel" 
                    placeholder="Not linked"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    disabled={!isEditingProfile}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold text-sm text-slate-900 focus:outline-none focus:border-neon-cyan/50 focus:bg-white transition-all disabled:opacity-40"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card-pro">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-display font-black flex items-center gap-4">
                <div className="p-2.5 bg-neon-cyan/10 rounded-xl">
                  <CreditCard className="w-6 h-6 text-neon-cyan" />
                </div>
                Payment Details
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Bank Name</label>
                <div className="relative group">
                  <Landmark className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-neon-cyan transition-colors" />
                  <input 
                    type="text" 
                    placeholder="e.g. Bank of Ceylon"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    disabled={!isEditingProfile}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold text-sm text-slate-900 focus:outline-none focus:border-neon-cyan/50 focus:bg-white transition-all disabled:opacity-40"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Account Number</label>
                <div className="relative group">
                  <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-neon-cyan transition-colors" />
                  <input 
                    type="text" 
                    placeholder="e.g. 000123456789"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    disabled={!isEditingProfile}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold text-sm text-slate-900 focus:outline-none focus:border-neon-cyan/50 focus:bg-white transition-all disabled:opacity-40"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Account Holder Name</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-neon-cyan transition-colors" />
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    disabled={!isEditingProfile}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold text-sm text-slate-900 focus:outline-none focus:border-neon-cyan/50 focus:bg-white transition-all disabled:opacity-40"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Crypto Wallet (USDT/TRC20)</label>
                <div className="relative group">
                  <Wallet className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-neon-cyan transition-colors" />
                  <input 
                    type="text" 
                    placeholder="e.g. T..."
                    value={formData.cryptoWallet}
                    onChange={(e) => setFormData({ ...formData, cryptoWallet: e.target.value })}
                    disabled={!isEditingProfile}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold text-sm text-slate-900 focus:outline-none focus:border-neon-cyan/50 focus:bg-white transition-all disabled:opacity-40"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card-pro">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-display font-black flex items-center gap-4">
                <div className="p-2.5 bg-neon-cyan/10 rounded-xl">
                  <History className="w-6 h-6 text-neon-cyan" />
                </div>
                <span className="text-slate-900">Transaction Log</span>
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Updates</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No transactions recorded yet</p>
                </div>
              ) : (
                orders.map((orderItem, idx) => (
                  <motion.div 
                    key={orderItem.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="p-5 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-neon-cyan/30 hover:bg-white transition-all group gap-4"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Zap className="w-6 h-6 text-neon-cyan drop-shadow-[0_0_8px_rgba(14,165,233,0.4)]" />
                      </div>
                      <div>
                        <p className="font-black text-base tracking-tight text-slate-900">{orderItem.package.amount} Diamonds</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                          {new Date(orderItem.date).toLocaleDateString()} • {orderItem.id}
                        </p>
                        <p className="text-[9px] text-neon-cyan/60 font-black uppercase tracking-widest mt-1">UID: {orderItem.playerId}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                      <div className="text-right">
                        <p className="font-black text-base tracking-tight text-slate-900">${orderItem.totalPrice.toFixed(2)}</p>
                        <div className="flex items-center gap-1.5 justify-end">
                          <div className={`w-1 h-1 rounded-full ${
                            orderItem.status === 'completed' ? 'bg-green-500' : 
                            orderItem.status === 'pending' ? 'bg-yellow-500' : 'bg-neon-cyan'
                          }`} />
                          <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                            orderItem.status === 'completed' ? 'text-green-500' : 
                            orderItem.status === 'pending' ? 'text-yellow-500' : 'text-neon-cyan'
                          }`}>{orderItem.status}</p>
                        </div>
                        {orderItem.status === 'pending' && orderItem.isPartial && (
                          <button 
                            onClick={() => {
                              setOrder({
                                ...order,
                                selectedPackage: orderItem.package,
                                quantity: orderItem.quantity,
                                playerId: orderItem.playerId,
                                playerUsername: orderItem.playerUsername,
                                isPartialPayment: false, // We are paying the FULL remaining balance
                                partialAmount: orderItem.remainingBalance,
                                remainingBalance: 0,
                                payingOrderId: orderItem.id
                              });
                              navigate('/payment');
                            }}
                            className="mt-1 text-[8px] font-black text-neon-cyan uppercase tracking-widest hover:underline"
                          >
                            Pay Balance (${orderItem.remainingBalance.toFixed(2)})
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {orderItem.proofUrl && (
                          <button 
                            onClick={() => setSelectedProof(orderItem.proofUrl!)}
                            className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center hover:bg-neon-cyan/20 transition-all group/proof"
                            title="View Delivery Proof"
                          >
                            <ImageIcon className="w-5 h-5 text-neon-cyan" />
                          </button>
                        )}
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-neon-cyan/10 transition-all">
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-neon-cyan transition-all" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            {orders.length > 0 && (
              <button className="w-full mt-10 py-4 rounded-2xl bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/20 transition-all uppercase tracking-[0.3em]">
                Access Full Archive
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Proof Modal */}
      <AnimatePresence>
        {selectedProof && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/95 backdrop-blur-md"
            onClick={() => setSelectedProof(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-4xl w-full bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.1)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-black uppercase tracking-widest text-slate-900">Delivery Proof</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Official Transaction Screenshot</p>
                </div>
                <button 
                  onClick={() => setSelectedProof(null)}
                  className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-all"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-4">
                <div className="aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative group">
                  <img src={selectedProof} alt="Proof" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-200/50 backdrop-blur-[2px]">
                    <a 
                      href={selectedProof} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" /> Open Full Image
                    </a>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-slate-50 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold leading-relaxed">
                  This screenshot serves as official proof of diamond delivery to your Player ID. If you have any issues, please contact support with your Order ID.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Up Modal */}
      <AnimatePresence>
        {isTopUpModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsTopUpModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-md w-full bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-black uppercase tracking-widest text-slate-900">Top Up Wallet</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Add funds to your balance</p>
                </div>
                <button 
                  onClick={() => setIsTopUpModalOpen(false)}
                  className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-all"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Amount to Add ($)</label>
                  <div className="relative group">
                    <Wallet className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-neon-cyan transition-colors" />
                    <input 
                      type="number" 
                      placeholder="Enter amount (e.g. 50)"
                      value={topUpAmount || ''}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold text-sm text-slate-900 focus:outline-none focus:border-neon-cyan/50 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[10, 25, 50, 100, 250, 500].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setTopUpAmount(amount.toString())}
                      className="py-3 rounded-xl border border-slate-200 text-[10px] font-black text-slate-400 hover:border-neon-cyan hover:text-neon-cyan transition-all"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleTopUp}
                  disabled={isToppingUp || !topUpAmount}
                  className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-neon-cyan hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:scale-100"
                >
                  {isToppingUp ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" /> Initialize Top Up
                    </>
                  )}
                </button>
              </div>

              <div className="p-6 bg-slate-50 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-neon-cyan" />
                </div>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold leading-relaxed">
                  Secure payment gateway integration. Your transaction is protected by 256-bit SSL encryption.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
