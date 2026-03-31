import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Zap, AlertCircle, Twitter, Facebook, Send, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';

const Confirmation = () => {
  const { order, setOrder } = useAppContext();
  const navigate = useNavigate();
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const totalDiamonds = (order.selectedPackage?.amount || 0) * order.quantity + (order.selectedPackage?.bonus || 0) * order.quantity;
  const shareText = `I just recharged ${totalDiamonds} Diamonds at DiamondBoost! 💎 Fast, secure and elite service. Get yours now!`;
  const shareUrl = window.location.origin;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  const handleSendEmailConfirmation = async () => {
    if (!confirmationEmail) return;
    setIsSendingEmail(true);
    setEmailError(null);

    // Simulate email sending
    setTimeout(() => {
      if (confirmationEmail.includes('@')) {
        setEmailSent(true);
      } else {
        setEmailError('Please enter a valid email address.');
      }
      setIsSendingEmail(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto text-center"
    >
      <div className="flex items-center justify-center gap-4 mb-12">
        <div className="step-number">8</div>
        <h2 className="text-xl font-display font-black uppercase tracking-widest text-slate-900">Order Confirmed</h2>
      </div>

      <div className="mb-12">
        <div className="w-32 h-32 bg-green-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 relative group">
          <div className="absolute inset-0 bg-green-500/20 blur-3xl animate-pulse rounded-full" />
          <CheckCircle2 className="w-16 h-16 text-green-500 relative z-10 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)] group-hover:scale-110 transition-transform duration-500" />
        </div>
        <h2 className="text-5xl font-display font-black mb-3 tracking-tight text-slate-900">Order Confirmed</h2>
        <p className="text-xs text-slate-400 uppercase tracking-[0.4em] font-black">Transaction Protocol Complete</p>
      </div>

      <div className="card-pro text-left mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-neon-cyan/5 blur-[60px] rounded-full -z-10" />
        
        <div className="space-y-5">
          <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Hash</span>
            <span className="font-mono text-xs font-black text-neon-cyan/60 tracking-widest">#DB-92837465</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Quantity</span>
              <span className="text-xl font-display font-black tracking-tight text-slate-900">x{order.quantity}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Yield</span>
              <span className="text-xl font-display font-black tracking-tight text-neon-cyan">
                {(order.selectedPackage?.amount || 0) * order.quantity + (order.selectedPackage?.bonus || 0) * order.quantity} <span className="text-[10px] opacity-50">DIAMONDS</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Target UID</span>
              <span className="text-lg font-mono font-black tracking-widest text-slate-700">{order.playerId}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Gateway</span>
              <span className="text-lg font-display font-black tracking-tight text-slate-700">{order.paymentMethod?.name}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Paid</span>
              <span className="text-lg font-display font-black text-slate-900">
                ${(order.isPartialPayment ? order.partialAmount : (order.selectedPackage?.price || 0) * order.quantity).toFixed(2)}
              </span>
            </div>
            {order.isPartialPayment && (
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <span className="text-[10px] font-black text-neon-cyan/50 uppercase tracking-widest">Remaining Balance</span>
                <span className="text-lg font-display font-black text-neon-cyan">
                  ${order.remainingBalance.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center p-5 rounded-2xl bg-green-500/5 border border-green-500/10">
            <span className="text-[10px] font-black text-green-500/50 uppercase tracking-widest">Current Status</span>
            <span className="text-green-500 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
              Processing Delivery
            </span>
          </div>
        </div>
      </div>

      <div className="card-pro text-left mb-10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 ml-1">Digital Receipt</h3>
        {emailSent ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 text-green-500 bg-green-500/5 p-5 rounded-2xl border border-green-500/10"
          >
            <CheckCircle2 className="w-6 h-6" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Transmission Successful</p>
              <p className="text-sm font-black tracking-tight text-slate-900">{confirmationEmail}</p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold ml-1">Enter destination for order manifest</p>
            <div className="flex gap-3">
              <input 
                type="email" 
                placeholder="OPERATOR@EMAIL.COM"
                value={confirmationEmail}
                onChange={(e) => {
                  setConfirmationEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                className={`flex-1 bg-slate-50 border rounded-2xl px-5 py-4 focus:outline-none transition-all font-black text-[10px] uppercase tracking-widest placeholder:text-slate-300 text-slate-900 ${
                  emailError ? 'border-red-500/50 focus:border-red-500' : 'border-slate-200 focus:border-neon-cyan/50'
                }`}
              />
              <button 
                onClick={handleSendEmailConfirmation}
                disabled={!confirmationEmail || isSendingEmail}
                className="px-8 py-4 rounded-2xl bg-neon-cyan text-white font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all shadow-xl whitespace-nowrap"
              >
                {isSendingEmail ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                ) : (
                  'Transmit'
                )}
              </button>
            </div>
            {emailError && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[9px] text-red-500 font-black uppercase tracking-widest flex items-center gap-2 ml-1"
              >
                <AlertCircle className="w-3 h-3" /> {emailError}
              </motion.p>
            )}
          </div>
        )}
      </div>

      <div className="card-pro text-left mb-10">
        <div className="flex items-center gap-3 mb-6">
          <Share2 className="w-5 h-5 text-neon-cyan" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Share Your Success</h3>
        </div>
        
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-6 ml-1 leading-relaxed">
          Broadcast your diamond acquisition to the network. Let the world know you're reloaded.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button 
            onClick={() => handleShare('twitter')}
            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-neon-cyan/30 transition-all group"
          >
            <Twitter className="w-6 h-6 text-slate-300 group-hover:text-[#1DA1F2] transition-colors" />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Twitter</span>
          </button>
          
          <button 
            onClick={() => handleShare('facebook')}
            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-neon-cyan/30 transition-all group"
          >
            <Facebook className="w-6 h-6 text-slate-300 group-hover:text-[#4267B2] transition-colors" />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Facebook</span>
          </button>

          <button 
            onClick={() => handleShare('whatsapp')}
            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-neon-cyan/30 transition-all group"
          >
            <Zap className="w-6 h-6 text-slate-300 group-hover:text-[#25D366] transition-colors" />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">WhatsApp</span>
          </button>

          <button 
            onClick={() => handleShare('telegram')}
            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-neon-cyan/30 transition-all group"
          >
            <Send className="w-6 h-6 text-slate-300 group-hover:text-[#0088cc] transition-colors" />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Telegram</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => {
            setOrder({ ...order, selectedPackage: null, playerUsername: '', paymentMethod: null });
            navigate('/');
          }}
          className="w-full py-6 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
        >
          Return to Command Center
        </button>
      </div>
    </motion.div>
  );
};

export default Confirmation;
