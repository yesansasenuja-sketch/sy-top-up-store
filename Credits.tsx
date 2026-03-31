import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { toast } from 'sonner';
import { Tooltip } from '../components/Tooltip';

const Credits = () => {
  const { order, setOrder, saveOrder, updateWalletBalance, finalizePartialPayment } = useAppContext();
  const navigate = useNavigate();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleWatchAd = () => {
    setIsWatchingAd(true);
    setAdError(null);
    
    // Simulate ad watching
    setTimeout(async () => {
      const isSuccess = Math.random() > 0.1;
      if (isSuccess) {
        try {
          await updateWalletBalance(order.walletBalance + 5.00);
          toast.success('Ad completed! $5.00 added to your wallet.');
        } catch (error) {
          // handleFirestoreError already shows a toast
        } finally {
          setIsWatchingAd(false);
        }
      } else {
        const errorMsg = "Ad failed to load. Please try again.";
        setAdError(errorMsg);
        toast.error(errorMsg);
        setIsWatchingAd(false);
      }
    }, 3000);
  };

  const handleConfirmPayment = () => {
    if (!order.selectedPackage || !order.paymentMethod) return;

    setIsProcessingPayment(true);
    setPaymentError(null);

    // Simulate payment processing
    setTimeout(async () => {
      const isSuccess = Math.random() > 0.05; // 95% success rate
      if (isSuccess) {
        try {
          const amountToPay = order.isPartialPayment ? order.partialAmount : (order.selectedPackage?.price || 0) * order.quantity;
          
          if (order.paymentMethod?.id === 'wallet') {
            await updateWalletBalance(order.walletBalance - amountToPay);
          }

          if (order.payingOrderId) {
            await finalizePartialPayment(order.payingOrderId, amountToPay);
          } else {
            // Create and save order
            const newOrder = {
              id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              date: new Date().toISOString(),
              package: order.selectedPackage!,
              quantity: order.quantity,
              playerId: order.playerId,
              playerUsername: order.playerUsername,
              paymentMethod: order.paymentMethod!,
              totalPrice: order.selectedPackage!.price * order.quantity,
              amountPaid: amountToPay,
              remainingBalance: order.isPartialPayment ? order.remainingBalance : 0,
              status: order.isPartialPayment ? 'pending' : 'processing' as any,
              isPartial: order.isPartialPayment
            };

            await saveOrder(newOrder);
            toast.success('Order placed successfully!');
          }
          navigate('/success');
        } catch (error) {
          // handleFirestoreError already shows a toast
          setPaymentError('Failed to save order. Please try again.');
        } finally {
          setIsProcessingPayment(false);
        }
      } else {
        const errorMsg = 'Payment processing failed. Please try again or use a different method.';
        setPaymentError(errorMsg);
        toast.error(errorMsg);
        setIsProcessingPayment(false);
      }
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto text-center"
    >
      <div className="flex items-center justify-center gap-4 mb-12">
        <div className="step-number">7</div>
        <h2 className="text-xl font-display font-black uppercase tracking-widest text-slate-900">Boost Wallet</h2>
      </div>

      <div className="card-pro relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50" />
        
        <div className="relative mb-10">
          <div className="w-24 h-24 bg-neon-cyan/10 rounded-[2rem] flex items-center justify-center mx-auto relative group">
            <div className="absolute inset-0 bg-neon-cyan/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <PlayCircle className="w-12 h-12 text-neon-cyan drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
          </div>
          <div className="absolute -top-4 -right-4 bg-neon-cyan text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-bounce">
            FREE REWARD
          </div>
        </div>
        
        <h2 className="text-4xl font-display font-black mb-4 tracking-tight text-slate-900">
          {order.payingOrderId ? 'Finalize Balance' : 'Boost Your Wallet'}
        </h2>
        <p className="text-xs text-slate-400 mb-10 max-w-sm mx-auto leading-relaxed uppercase tracking-widest font-bold">
          {order.payingOrderId 
            ? `You are paying the remaining balance of $${order.partialAmount.toFixed(2)} for Order ${order.payingOrderId}.`
            : 'Initialize a 30-second data stream to acquire $5.00 Bonus Balance for your next transaction.'}
        </p>

        <div className="flex flex-col gap-5">
          <button 
            onClick={handleWatchAd}
            disabled={isWatchingAd}
            className={`w-full py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-2xl ${
              isWatchingAd 
                ? 'bg-slate-100 text-slate-400 border border-slate-200' 
                : 'bg-slate-900 text-white hover:scale-[1.02] active:scale-95'
            }`}
          >
            {isWatchingAd ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 animate-spin rounded-full" />
                Streaming Protocol...
              </>
            ) : (
              <>
                <PlayCircle className="w-5 h-5" /> Watch & Acquire +$5.00
              </>
            )}
          </button>
          
          {adError && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4" /> {adError}
            </motion.p>
          )}
          
          <button 
            onClick={handleConfirmPayment}
            disabled={isProcessingPayment}
            className="w-full py-5 rounded-2xl border border-slate-200 bg-slate-50 font-black text-[10px] text-slate-400 uppercase tracking-[0.3em] hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center gap-3 group"
          >
            {isProcessingPayment ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 animate-spin rounded-full" />
                Processing...
              </>
            ) : (
              <>
                Skip & {order.payingOrderId ? 'Pay Balance' : 'Finalize Order'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          {paymentError && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4" /> {paymentError}
            </motion.p>
          )}

          <button 
            onClick={() => navigate('/payment')}
            className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-900 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" /> Go back
          </button>
        </div>

        <div className="mt-12 pt-10 border-t border-slate-100 flex items-center justify-center gap-12">
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-black mb-2">Current Balance</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
              <AnimatePresence mode="wait">
                <motion.p 
                  key={order.walletBalance}
                  initial={{ scale: 1.2, color: '#00f2ff' }}
                  animate={{ scale: 1, color: '#00f2ff' }}
                  className="text-3xl font-display font-black tracking-tighter"
                >
                  ${order.walletBalance.toFixed(2)}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
          <div className="w-[1px] h-12 bg-slate-100" />
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-black mb-2">Post-Reward</p>
            <p className="text-3xl font-display font-black text-slate-300 tracking-tighter">${(order.walletBalance + 5.00).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Credits;
