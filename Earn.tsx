import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, TrendingUp, ExternalLink, CheckCircle2, Wallet, Coins, ShieldCheck, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const OFFERS = [
  {
    id: '1',
    title: 'Install & Open App',
    description: 'Download and open the app to earn instant balance.',
    reward: 2.50,
    type: 'App Install',
    provider: 'AdGate Media'
  },
  {
    id: '2',
    title: 'Complete Survey',
    description: 'Share your opinion and get rewarded.',
    reward: 5.00,
    type: 'Survey',
    provider: 'CPAGrip'
  },
  {
    id: '3',
    title: 'Sign Up for Service',
    description: 'Create a free account to earn high rewards.',
    reward: 15.00,
    type: 'Sign Up',
    provider: 'AdGate Media'
  }
];

const Earn = () => {
  const { order, updateWalletBalance, user, isAuthReady } = useAppContext();
  const [completedOffers, setCompletedOffers] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'offers' | 'offerwall'>('offers');

  if (!isAuthReady) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] animate-pulse">Initializing Protocol...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-20 h-20 bg-neon-cyan/10 rounded-full flex items-center justify-center">
          <Wallet className="w-10 h-10 text-neon-cyan" />
        </div>
        <h1 className="text-3xl font-display font-black text-slate-900">Authentication Required</h1>
        <p className="text-slate-400 uppercase tracking-widest text-xs font-bold text-center max-w-sm">
          You must be logged in to access the earning protocol and fuel your wallet.
        </p>
      </div>
    );
  }

  const handleCompleteOffer = async (offerId: string, reward: number) => {
    if (completedOffers.includes(offerId)) return;
    setIsProcessing(offerId);
    
    try {
      // Simulate offer completion
      await new Promise(resolve => setTimeout(resolve, 2000));
      await updateWalletBalance(order.walletBalance + reward);
      setCompletedOffers(prev => [...prev, offerId]);
    } catch (error) {
      console.error('Failed to complete offer:', error);
      // handleFirestoreError is already called inside updateWalletBalance
    } finally {
      setIsProcessing(null);
    }
  };

  // Construct the offerwall URL with the user's UID
  // Replace with your actual CPAGrip/AdGate Media wall URL
  const offerwallUrl = `https://www.cpagrip.com/show.php?l=0&u=123456&id=12345&subid=${user?.uid || ''}`;

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-neon-cyan">
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Earning Protocol v2.0</span>
          </div>
          <h1 className="text-6xl font-display font-black tracking-tighter text-slate-900">
            Earn <span className="text-neon-cyan">Balance</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-md uppercase tracking-widest font-bold leading-relaxed">
            Complete high-yield operations to fuel your wallet for future diamond acquisitions.
          </p>
        </div>

        <div className="card-pro p-6 flex items-center gap-6 min-w-[300px]">
          <div className="w-16 h-16 bg-neon-cyan/10 rounded-2xl flex items-center justify-center">
            <Wallet className="w-8 h-8 text-neon-cyan" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Wallet</p>
            <p className="text-3xl font-display font-black text-slate-900">${order.walletBalance.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 p-1 bg-slate-50 border border-slate-200 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('offers')}
          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'offers' ? 'bg-neon-cyan text-white' : 'text-slate-400 hover:text-slate-900'
          }`}
        >
          Featured Tasks
        </button>
        <button
          onClick={() => setActiveTab('offerwall')}
          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'offerwall' ? 'bg-neon-cyan text-white' : 'text-slate-400 hover:text-slate-900'
          }`}
        >
          CPA Offerwall
        </button>
      </div>

      {activeTab === 'offers' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {OFFERS.map((offer) => {
            const isCompleted = completedOffers.includes(offer.id);
            const isCurrentProcessing = isProcessing === offer.id;
            
            return (
              <motion.div
                key={offer.id}
                whileHover={{ y: -5 }}
                className={`card-pro p-8 relative overflow-hidden group ${isCompleted ? 'opacity-50' : ''}`}
              >
                <div className="absolute top-0 right-0 p-4">
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    {offer.provider}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      {isCompleted ? (
                        <motion.div
                          key="completed"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="w-14 h-14 rounded-2xl bg-green-500/20 text-green-500 flex items-center justify-center"
                        >
                          <CheckCircle2 className="w-8 h-8" />
                          <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 2, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 rounded-2xl border-2 border-green-500"
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="pending"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-neon-cyan/10 group-hover:text-neon-cyan flex items-center justify-center transition-colors duration-500 border border-slate-200"
                        >
                          <Gift className="w-8 h-8" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                        {offer.type}
                      </span>
                    </div>
                    <h3 className="text-xl font-display font-black mb-2 text-slate-900">{offer.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{offer.description}</p>
                  </div>

                  <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-neon-cyan" />
                      <span className="text-xl font-display font-black text-neon-cyan">+${offer.reward.toFixed(2)}</span>
                    </div>
                    
                    <button
                      onClick={() => handleCompleteOffer(offer.id, offer.reward)}
                      disabled={isCompleted || isCurrentProcessing}
                      className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                        isCompleted
                          ? 'bg-green-500/10 text-green-500 cursor-default'
                          : isCurrentProcessing
                            ? 'bg-slate-100 text-slate-400 cursor-wait'
                            : 'bg-slate-900 text-white hover:scale-105 active:scale-95'
                      }`}
                    >
                      {isCompleted ? 'Completed' : isCurrentProcessing ? 'Processing...' : (
                        <>
                          Start <ExternalLink className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="card-pro p-0 overflow-hidden border-neon-cyan/20">
            <div className="bg-neon-cyan/5 p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-neon-cyan" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Secure Offerwall Protocol</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Connection</span>
              </div>
            </div>
            
            <div className="aspect-[16/9] w-full bg-slate-50 relative">
              <iframe 
                src={offerwallUrl}
                className="w-full h-full border-none"
                title="CPA Offerwall"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-white/80 backdrop-blur-sm">
                <div className="text-center space-y-4 p-8">
                  <div className="w-16 h-16 bg-neon-cyan/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Info className="w-8 h-8 text-neon-cyan" />
                  </div>
                  <h3 className="text-xl font-display font-black text-slate-900">Offerwall Integration</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    To enable the real offerwall, please replace the placeholder URL in <code className="text-neon-cyan">Earn.tsx</code> with your actual CPAGrip or AdGate Media wall link.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-pro p-8 bg-slate-50/50">
            <h3 className="text-xl font-display font-black mb-6 flex items-center gap-3 text-slate-900">
              <ShieldCheck className="w-6 h-6 text-neon-cyan" />
              Postback Configuration
            </h3>
            <div className="space-y-6">
              <p className="text-xs text-slate-500 leading-relaxed">
                To automatically credit rewards to your wallet, configure your CPA network's postback URL to point to our secure endpoint.
              </p>
              
              <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4">
                <div>
                  <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-2">Your Postback URL</p>
                  <div className="flex items-center gap-4">
                    <code className="flex-1 bg-slate-50 p-4 rounded-xl text-neon-cyan text-xs font-mono break-all border border-slate-100">
                      {window.location.origin}/api/postback/cpagrip?uid={'{subid}'}&reward={'{payout}'}&status=1
                    </code>
                    <button 
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/postback/cpagrip?uid={subid}&reward={payout}&status=1`)}
                      className="px-6 py-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-neon-cyan/5 rounded-xl border border-neon-cyan/10">
                  <Info className="w-4 h-4 text-neon-cyan shrink-0 mt-0.5" />
                  <p className="text-[10px] text-neon-cyan/80 leading-relaxed font-bold uppercase tracking-tight">
                    Replace <code className="bg-neon-cyan/10 px-1 rounded">{"{subid}"}</code> and <code className="bg-neon-cyan/10 px-1 rounded">{"{payout}"}</code> with the correct macros provided by your CPA network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offerwall Placeholder */}
      {activeTab === 'offers' && (
        <div className="card-pro p-12 text-center border-dashed border-2 border-slate-200">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <TrendingUp className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-display font-black text-slate-900">More Offers Coming Soon</h2>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold leading-relaxed">
              We are integrating AdGate Media and CPAGrip offerwalls to provide you with hundreds of high-paying tasks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earn;
