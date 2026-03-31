import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Diamond, ArrowRight, Minus, Plus, AlertCircle, CheckCircle2, ShoppingCart, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { toast } from 'sonner';
import { Tooltip } from '../components/Tooltip';
import { DIAMOND_PACKAGES } from '../constants';
import { DiamondPackage } from '../types';
import { verifyPlayerId } from '../services/playerService';

const PackageSkeleton = () => (
  <div className="p-8 rounded-[2rem] border border-slate-200 bg-slate-50 animate-pulse">
    <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto mb-6" />
    <div className="h-8 bg-slate-200 rounded-xl w-1/2 mx-auto mb-3" />
    <div className="h-4 bg-slate-200 rounded-lg w-1/4 mx-auto mb-8" />
    <div className="h-12 bg-slate-200 rounded-xl w-full" />
  </div>
);

const Home = () => {
  const { order, setOrder, addToCart } = useAppContext();
  const navigate = useNavigate();
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingPackages(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const [isVerifying, setIsVerifying] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const handleVerifyPlayer = async () => {
    if (!order.playerId) return;
    setIsVerifying(true);
    setPlayerError(null);

    try {
      const playerData = await verifyPlayerId(order.playerId);
      setOrder({ ...order, playerUsername: playerData.username });
      toast.success(`Player ID verified: ${playerData.username}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Verification failed. Please try again.';
      setPlayerError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSelectPackage = (pkg: DiamondPackage) => {
    setOrder({ ...order, selectedPackage: pkg, quantity: 1 });
  };

  const onAddToCart = (e: React.MouseEvent, pkg: DiamondPackage) => {
    e.stopPropagation();
    if (!order.playerUsername) {
      const errorMsg = 'Please verify your Player ID first';
      setPlayerError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    addToCart(pkg, 1, order.playerId, order.playerUsername);
    toast.success(`${pkg.amount} Diamonds added to cart!`);
  };

  const onBuyNow = (e: React.MouseEvent, pkg: DiamondPackage) => {
    e.stopPropagation();
    if (!order.playerUsername) {
      const errorMsg = 'Please verify your Player ID first';
      setPlayerError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    setOrder({ ...order, selectedPackage: pkg, quantity: 1 });
    navigate('/payment');
  };

  return (
    <div className="space-y-16">
      <div className="text-center relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-neon-cyan/20 blur-[100px] rounded-full -z-10"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-8xl font-display font-black mb-6 tracking-tighter leading-none text-slate-900">
            ELITE <span className="text-neon-cyan neon-glow-text">RELOAD</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-lg font-medium leading-relaxed">
            Experience the next generation of diamond top-ups. Instant, secure, and built for the pros.
          </p>
        </motion.div>
      </div>

      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="step-number">1</div>
            <h2 className="text-xl font-display font-black uppercase tracking-widest">Enter Player ID</h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-pro max-w-2xl mx-auto"
          >
            <div className="relative group">
              <input
                type="text"
                placeholder="ENTER 8-12 DIGIT PLAYER ID"
                value={order.playerId}
                onChange={(e) => {
                  setOrder({ ...order, playerId: e.target.value, playerUsername: '' });
                  if (playerError) setPlayerError(null);
                }}
                className={`w-full bg-slate-50 border rounded-2xl px-6 py-5 focus:outline-none focus:bg-white transition-all font-mono text-lg font-bold tracking-widest placeholder:text-slate-300 uppercase ${
                  playerError ? 'border-red-500/50 focus:border-red-500' : 'border-slate-200 focus:border-neon-cyan/50'
                }`}
              />
              <div className="absolute right-2 top-2 bottom-2">
                <button 
                  onClick={handleVerifyPlayer}
                  disabled={!order.playerId || isVerifying}
                  className="h-full px-8 bg-neon-cyan text-gaming-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all shadow-xl"
                >
                  {isVerifying ? (
                    <div className="w-4 h-4 border-2 border-gaming-dark/30 border-t-gaming-dark animate-spin rounded-full" />
                  ) : (
                    'Verify ID'
                  )}
                </button>
              </div>
            </div>
            
            {playerError && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-2 ml-1"
              >
                <AlertCircle className="w-3 h-3" /> {playerError}
              </motion.p>
            )}

            <AnimatePresence>
              {order.playerUsername && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-slate-200"
                >
                  <div className="flex items-center gap-4 p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
                    <motion.div 
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", damping: 12, stiffness: 200 }}
                      className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center"
                    >
                      <CheckCircle2 className="text-green-500 w-5 h-5" />
                    </motion.div>
                    <div>
                      <p className="text-[8px] text-green-500/50 font-black uppercase tracking-widest mb-0.5">Verified Account</p>
                      <p className="text-xl font-display font-black tracking-tight">{order.playerUsername}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="step-number">2</div>
            <h2 className="text-xl font-display font-black uppercase tracking-widest">Select Recharge</h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {isLoadingPackages ? (
              Array.from({ length: 8 }).map((_, i) => <PackageSkeleton key={i} />)
            ) : (
              DIAMOND_PACKAGES.map((pkg, idx) => {
                const isSelected = order.selectedPackage?.id === pkg.id;
                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * idx }}
                    onClick={() => handleSelectPackage(pkg)}
                    className={`card-pro glow-border group cursor-pointer p-5 sm:p-6 ${
                      isSelected ? 'active border-neon-cyan bg-neon-cyan/[0.05]' : ''
                    }`}
                  >
                    {pkg.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neon-cyan text-gaming-dark text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg z-20 whitespace-nowrap">
                        Best Value
                      </div>
                    )}
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="relative">
                        <Diamond className={`w-10 h-10 transition-all duration-500 ${isSelected ? 'text-neon-cyan scale-110 drop-shadow-[0_0_10px_rgba(14,165,233,0.8)]' : 'text-slate-200'}`} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-display font-black tracking-tight text-slate-900">{pkg.amount}</h3>
                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Diamonds</p>
                      </div>
                      {pkg.bonus && (
                        <div className="bg-neon-cyan/10 text-neon-cyan text-[8px] font-black px-2 py-1 rounded-md border border-neon-cyan/20 uppercase tracking-widest">
                          +{pkg.bonus} Bonus
                        </div>
                      )}
                      <div className="mt-2 w-full pt-4 border-t border-slate-200 flex flex-col gap-3">
                        <p className="text-lg font-black text-slate-900">${pkg.price}</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => onAddToCart(e, pkg)}
                            className="flex-1 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all flex items-center justify-center group/cart"
                          >
                            <ShoppingCart className="w-4 h-4 text-slate-400 group-hover/cart:text-neon-cyan transition-colors" />
                          </button>
                          <button 
                            onClick={(e) => onBuyNow(e, pkg)}
                            className="flex-[2] p-2 bg-neon-cyan text-white text-[8px] font-black uppercase tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-1"
                          >
                            Buy Now
                            <Zap className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <motion.div 
                        layoutId="selection-ring"
                        className="absolute inset-0 border-2 border-neon-cyan rounded-[2rem] pointer-events-none"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </section>

        {order.selectedPackage && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="step-number">3</div>
              <h2 className="text-xl font-display font-black uppercase tracking-widest">Configure Quantity</h2>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-pro max-w-md mx-auto"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Current Order</p>
                  <p className="text-xl font-display font-black text-slate-900">{order.selectedPackage.amount * order.quantity} Diamonds</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-2 border border-slate-200">
                  <button 
                    onClick={() => setOrder({ ...order, quantity: Math.max(1, order.quantity - 1) })}
                    className="w-10 h-10 rounded-xl bg-slate-200/50 hover:bg-slate-200 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="text-xl font-black text-neon-cyan min-w-[1.5rem] text-center">{order.quantity}</span>
                  <button 
                    onClick={() => setOrder({ ...order, quantity: order.quantity + 1 })}
                    className="w-10 h-10 rounded-xl bg-slate-200/50 hover:bg-slate-200 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {order.selectedPackage && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="step-number">4</div>
              <h2 className="text-xl font-display font-black uppercase tracking-widest">Finalize Order</h2>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.3em] mb-3">Total Payable</p>
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 justify-center">
                  <span className="text-5xl md:text-7xl font-display font-black text-slate-900 tracking-tighter">
                    ${(order.selectedPackage.price * order.quantity).toFixed(2)}
                  </span>
                  <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />
                  <span className="text-xl md:text-2xl text-neon-cyan font-black uppercase tracking-widest">
                    {order.selectedPackage.amount * order.quantity} Diamonds
                  </span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/payment')}
                disabled={!order.playerUsername || !order.selectedPackage}
                className="neon-button w-full max-w-md flex items-center justify-center gap-3 group disabled:opacity-30 disabled:scale-100"
              >
                Buy Now 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;
