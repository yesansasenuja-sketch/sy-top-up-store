import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { Tooltip } from '../components/Tooltip';
import { verifyPlayerId } from '../services/playerService';
import { toast } from 'sonner';

const Details = () => {
  const { order, setOrder } = useAppContext();
  const navigate = useNavigate();
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="step-number">3</div>
        <h2 className="text-xl font-display font-black uppercase tracking-widest text-slate-900">Account Details</h2>
      </div>

      <div className="card-pro overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50" />
        
        <h2 className="text-4xl font-display font-black mb-10 flex items-center gap-5 text-slate-900">
          <div className="p-3 bg-neon-cyan/10 rounded-2xl">
            <User className="w-8 h-8 text-neon-cyan drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]" />
          </div>
          Target Account
        </h2>

        <div className="space-y-10">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Player Identity (UID)</label>
            <div className="relative group">
              <input
                type="text"
                placeholder="Enter 8-12 digit ID"
                value={order.playerId || ''}
                onChange={(e) => setOrder({ ...order, playerId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:outline-none focus:border-neon-cyan/50 focus:bg-white transition-all font-mono text-lg font-bold tracking-widest placeholder:text-slate-300 text-slate-900"
              />
              <div className="absolute right-2 top-2 bottom-2">
                <button 
                  onClick={handleVerifyPlayer}
                  disabled={!order.playerId || isVerifying}
                  className="h-full px-6 bg-neon-cyan text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all shadow-xl"
                >
                  {isVerifying ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                  ) : (
                    'Scan ID'
                  )}
                </button>
              </div>
            </div>
            {playerError && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-2 ml-1"
              >
                <AlertCircle className="w-3 h-3" /> {playerError}
              </motion.p>
            )}
          </div>

          <AnimatePresence>
            {order.playerUsername && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="p-6 bg-green-500/5 border border-green-500/10 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[40px] rounded-full -z-10" />
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <CheckCircle2 className="text-green-500 w-7 h-7" />
                </div>
                <div>
                  <p className="text-[9px] text-green-500/50 font-black uppercase tracking-[0.2em] mb-1">Authenticated Account</p>
                  <p className="text-2xl font-display font-black tracking-tight text-slate-900">{order.playerUsername}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-6 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/')}
              className="flex-1 py-5 rounded-2xl bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
            >
              <ArrowLeft className="w-3 h-3" /> Go back
            </button>
            <button 
              onClick={() => navigate('/payment')}
              disabled={!order.playerUsername}
              className="flex-[1.5] neon-button disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-3 group"
            >
              Initialize Payment 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Details;
