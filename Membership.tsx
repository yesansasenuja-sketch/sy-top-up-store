import React from 'react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Shield, Check, Clock, AlertCircle, CreditCard } from 'lucide-react';

const Membership = () => {
  const { packages, activeSubscription, user, isAuthReady } = useAppContext();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080c11]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00f2ff]"></div>
      </div>
    );
  }

  const activePkg = packages.find(p => p.id === activeSubscription?.packageId);

  return (
    <div className="min-h-screen bg-[#080c11] pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight"
          >
            MEMBERSHIP <span className="text-[#00f2ff]">PACKAGES</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 max-w-2xl mx-auto"
          >
            Unlock exclusive benefits, faster top-ups, and special discounts with our premium membership plans.
          </motion.p>
        </div>

        {activeSubscription && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12 p-6 rounded-3xl bg-gradient-to-r from-[#00f2ff10] to-transparent border border-[#00f2ff20] flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#00f2ff20] flex items-center justify-center">
                <Shield className="w-8 h-8 text-[#00f2ff]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Active Membership: {activePkg?.name}</h2>
                <p className="text-slate-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Expires on: {new Date(activeSubscription.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="px-6 py-2 rounded-full bg-[#00f2ff20] text-[#00f2ff] font-bold text-sm uppercase tracking-widest">
              Status: {activeSubscription.status}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-[2rem] border transition-all duration-500 group ${
                activeSubscription?.packageId === pkg.id 
                ? 'bg-[#00f2ff05] border-[#00f2ff] shadow-[0_0_30px_rgba(0,242,255,0.1)]' 
                : 'bg-[#0f172a] border-white/5 hover:border-[#00f2ff50]'
              }`}
            >
              {activeSubscription?.packageId === pkg.id && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00f2ff] text-[#080c11] text-[10px] font-black uppercase tracking-widest">
                  Current Plan
                </div>
              )}

              <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-white">{pkg.price}</span>
                <span className="text-slate-400 font-bold">LKR</span>
                <span className="text-slate-500 text-sm ml-2">/ {pkg.days} Days</span>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Exclusive Discounts',
                  'Priority Support',
                  'Instant Top-up',
                  'Member Badge',
                  `${pkg.days} Days Validity`
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-400 text-sm">
                    <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#00f2ff]" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <form method="post" action="https://sandbox.payhere.lk/pay/checkout">
                <input type="hidden" name="merchant_id" value="1210000" />
                <input type="hidden" name="return_url" value={window.location.origin + "/membership"} />
                <input type="hidden" name="cancel_url" value={window.location.origin + "/membership"} />
                <input type="hidden" name="notify_url" value={window.location.origin + "/api/payhere/notify"} />

                <input type="hidden" name="order_id" value={`ORD-${Date.now()}`} />
                <input type="hidden" name="items" value={pkg.name} />
                <input type="hidden" name="currency" value="LKR" />
                <input type="hidden" name="amount" value={pkg.price} />

                <input type="hidden" name="first_name" value={user?.username || 'Gamer'} />
                <input type="hidden" name="last_name" value="User" />
                <input type="hidden" name="email" value={user?.email || ''} />
                <input type="hidden" name="phone" value="0771234567" />
                <input type="hidden" name="address" value="No.1, Colombo" />
                <input type="hidden" name="city" value="Colombo" />
                <input type="hidden" name="country" value="Sri Lanka" />

                <input type="hidden" name="custom_1" value={user?.uid || ''} />
                <input type="hidden" name="custom_2" value={pkg.id} />

                <button
                  type="submit"
                  disabled={!user || activeSubscription?.packageId === pkg.id}
                  className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    activeSubscription?.packageId === pkg.id
                    ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                    : 'bg-[#00f2ff] text-[#080c11] hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#00f2ff20]'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  {activeSubscription?.packageId === pkg.id ? 'Already Active' : 'Subscribe Now'}
                </button>
              </form>
            </motion.div>
          ))}
        </div>

        {!user && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 p-6 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 justify-center"
          >
            <AlertCircle className="text-red-500" />
            <p className="text-red-500 font-bold">Please login to subscribe to a membership package.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Membership;
