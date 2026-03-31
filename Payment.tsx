import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Landmark, Smartphone, CircleDollarSign, Wallet, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2, Zap, Layers, Building2, Signal, Globe, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { toast } from 'sonner';
import { Tooltip } from '../components/Tooltip';
import { PAYMENT_METHODS } from '../constants';

const Payment = () => {
  const { order, setOrder } = useAppContext();
  const navigate = useNavigate();
  const [isPaypalAuthenticated, setIsPaypalAuthenticated] = useState(false);
  const [isPaypalLoggingIn, setIsPaypalLoggingIn] = useState(false);
  const [mobilePhoneNumber, setMobilePhoneNumber] = useState('');
  const [mobileProvider, setMobileProvider] = useState('');
  const [isMobileVerifying, setIsMobileVerifying] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [mobileError, setMobileError] = useState<string | null>(null);

  const handlePaypalLogin = () => {
    setIsPaypalLoggingIn(true);
    setTimeout(() => {
      setIsPaypalAuthenticated(true);
      setIsPaypalLoggingIn(false);
    }, 2000);
  };

  const handleVerifyMobile = () => {
    if (!mobilePhoneNumber || !mobileProvider) {
      setMobileError('Please enter phone number and select provider.');
      return;
    }
    
    if (mobilePhoneNumber.length < 10) {
      setMobileError('Please enter a valid phone number.');
      return;
    }

    setIsMobileVerifying(true);
    setMobileError(null);
    
    setTimeout(() => {
      const isSuccess = Math.random() > 0.1; // 90% success rate
      if (isSuccess) {
        setIsMobileVerified(true);
        toast.success('Mobile number verified successfully!');
      } else {
        setMobileError('Verification failed. Please check your number and try again.');
        toast.error('Mobile verification failed.');
      }
      setIsMobileVerifying(false);
    }, 2000);
  };

  const totalAmount = order.payingOrderId 
    ? order.partialAmount 
    : (order.selectedPackage?.price || 0) * order.quantity;
  const depositAmount = totalAmount * 0.8; // Example: 80% deposit
  const remainingAmount = totalAmount - depositAmount;

  const handlePaymentTypeChange = (isPartial: boolean) => {
    setOrder({
      ...order,
      isPartialPayment: isPartial,
      partialAmount: isPartial ? depositAmount : totalAmount,
      remainingBalance: isPartial ? remainingAmount : 0
    });
  };

  const isWalletInsufficient = order.paymentMethod?.id === 'wallet' && 
    (order.walletBalance < (order.isPartialPayment ? order.partialAmount : totalAmount));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10"
    >
      <div className="lg:col-span-7 space-y-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="step-number">5</div>
          <h2 className="text-xl font-display font-black uppercase tracking-widest text-slate-900">Select Payment</h2>
        </div>

        {/* Payment Type Selection */}
        {!order.payingOrderId && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handlePaymentTypeChange(false)}
              className={`p-6 rounded-3xl border transition-all text-left relative overflow-hidden group ${
                !order.isPartialPayment 
                  ? 'bg-neon-cyan/10 border-neon-cyan shadow-[0_0_20px_rgba(0,242,255,0.1)]' 
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl transition-all ${!order.isPartialPayment ? 'bg-neon-cyan text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${!order.isPartialPayment ? 'text-neon-cyan/60' : 'text-slate-400'}`}>Standard</p>
                </div>
                <p className={`text-xl font-display font-black ${!order.isPartialPayment ? 'text-slate-900' : 'text-slate-700'}`}>Full Payment</p>
                <p className="text-[9px] text-neon-cyan font-bold mt-2 uppercase tracking-widest">Instant Delivery</p>
              </div>
              {!order.isPartialPayment && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-neon-cyan flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </button>

            <button
              onClick={() => handlePaymentTypeChange(true)}
              className={`p-6 rounded-3xl border transition-all text-left relative overflow-hidden group ${
                order.isPartialPayment 
                  ? 'bg-neon-cyan/10 border-neon-cyan shadow-[0_0_20px_rgba(0,242,255,0.1)]' 
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl transition-all ${order.isPartialPayment ? 'bg-neon-cyan text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${order.isPartialPayment ? 'text-neon-cyan/60' : 'text-slate-400'}`}>Flexible</p>
                </div>
                <p className={`text-xl font-display font-black ${order.isPartialPayment ? 'text-slate-900' : 'text-slate-700'}`}>Partial Payment</p>
                <p className="text-[9px] text-neon-cyan font-bold mt-2 uppercase tracking-widest">Pay ${depositAmount.toFixed(2)} Now</p>
              </div>
              {order.isPartialPayment && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-neon-cyan flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-display font-black flex items-center gap-5 text-slate-900">
            <div className="p-3 bg-neon-cyan/10 rounded-2xl">
              <CreditCard className="w-8 h-8 text-neon-cyan drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]" />
            </div>
            Payment Gateway
          </h2>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-neon-cyan" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Secure Protocol v3.0</span>
          </div>
        </div>

        <div className="grid gap-4">
          {PAYMENT_METHODS.map((method) => {
            const getIcon = (id: string) => {
              switch (id) {
                case 'bank': return Landmark;
                case 'mobile': return Smartphone;
                case 'card': return CreditCard;
                case 'paypal': return CircleDollarSign;
                case 'wallet': return Wallet;
                default: return Wallet;
              }
            };
            const Icon = getIcon(method.id);
            const isSelected = order.paymentMethod?.id === method.id;
            const amountToPay = order.isPartialPayment ? order.partialAmount : totalAmount;
            const isInsufficient = method.id === 'wallet' && order.walletBalance < amountToPay;

            return (
              <motion.div
                key={method.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setOrder({ ...order, paymentMethod: method })}
                className={`group relative p-6 rounded-[2rem] glow-border cursor-pointer transition-all duration-500 flex items-center justify-between overflow-hidden ${
                  isSelected 
                    ? 'active border-neon-cyan bg-neon-cyan/[0.05]' 
                    : 'bg-slate-50 border-slate-200'
                } ${isInsufficient && isSelected ? 'border-red-500/50 bg-red-500/5' : ''}`}
              >
                {isSelected && (
                  <motion.div 
                    layoutId="active-payment"
                    className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 to-transparent -z-10"
                  />
                )}
                
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    isSelected 
                      ? (isInsufficient ? 'bg-red-500 text-white' : 'bg-neon-cyan text-white shadow-[0_0_20px_rgba(0,242,255,0.3)]') 
                      : 'bg-white border border-slate-200 text-slate-300 group-hover:text-slate-500'
                  }`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className={`text-xl font-display font-black tracking-tight transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      {method.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {method.brands && (
                        <div className="flex gap-1.5">
                          {method.brands.map((brand) => {
                            const getBrandIcon = (brandName: string) => {
                              const b = brandName.toLowerCase();
                              if (b.includes('visa') || b.includes('mastercard') || b.includes('jcb')) return CreditCard;
                              if (b.includes('bca') || b.includes('mandiri') || b.includes('bni') || b.includes('bri')) return Building2;
                              if (b.includes('telkomsel') || b.includes('indosat') || b.includes('xl') || b.includes('tri') || b.includes('smartfren')) return Signal;
                              if (b.includes('global') || b.includes('secure')) return Globe;
                              if (b.includes('internal') || b.includes('credits')) return Coins;
                              return Globe;
                            };
                            const BrandIcon = getBrandIcon(brand);
                            return (
                              <span key={brand} className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 border border-slate-200">
                                <BrandIcon className="w-2 h-2" />
                                {brand}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      {method.id === 'wallet' ? (
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isInsufficient && isSelected ? 'text-red-500' : 'text-slate-400'}`}>
                          Balance: ${order.walletBalance.toFixed(2)} {isInsufficient && isSelected && '(INSUFFICIENT)'}
                        </p>
                      ) : method.balance !== undefined && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Balance: <span className="text-neon-cyan">${method.balance.toFixed(2)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                  isSelected 
                    ? (isInsufficient ? 'border-red-500' : 'border-neon-cyan bg-neon-cyan/20') 
                    : 'border-slate-200 bg-slate-100'
                }`}>
                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`w-3 h-3 rounded-full ${isInsufficient ? 'bg-red-500' : 'bg-neon-cyan shadow-[0_0_10px_rgba(0,242,255,1)]'}`} 
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* PayPal Login Section */}
        <AnimatePresence mode="wait">
          {order.paymentMethod?.id === 'paypal' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="card-pro border-neon-cyan/20 bg-neon-cyan/[0.02] relative overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-neon-cyan/5 blur-[80px] rounded-full" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#0070ba]/10 flex items-center justify-center">
                  <CircleDollarSign className="w-6 h-6 text-[#0070ba]" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-black tracking-tight text-slate-900">PayPal Secure Auth</h3>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Encrypted Handshake Required</p>
                </div>
              </div>
              
              {isPaypalAuthenticated ? (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-5 text-green-500 bg-green-500/5 p-6 rounded-3xl border border-green-500/10"
                >
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[9px] text-green-500/50 font-black uppercase tracking-widest mb-1">Identity Verified</p>
                    <p className="text-lg font-display font-black tracking-tight text-slate-900">gamer_pro@email.com</p>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Authorize this transaction by connecting your PayPal account. Your credentials are never stored on our servers.
                  </p>
                  <button 
                    onClick={handlePaypalLogin}
                    disabled={isPaypalLoggingIn}
                    className="w-full py-5 rounded-2xl bg-[#0070ba] text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#003087] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl"
                  >
                    {isPaypalLoggingIn ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                    ) : (
                      <>
                        <CircleDollarSign className="w-4 h-4" /> Authenticate via PayPal
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Reload Section */}
        <AnimatePresence mode="wait">
          {order.paymentMethod?.id === 'mobile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="card-pro relative overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-neon-cyan/10 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-neon-cyan" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-black tracking-tight text-slate-900">Carrier Billing</h3>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Direct Mobile Integration</p>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Terminal Number</label>
                  <input 
                    type="tel" 
                    placeholder="08XXXXXXXXX"
                    value={mobilePhoneNumber}
                    onChange={(e) => {
                      setMobilePhoneNumber(e.target.value);
                      if (mobileError) setMobileError(null);
                    }}
                    className={`w-full bg-slate-50 border rounded-2xl px-5 py-4 focus:outline-none transition-all font-mono text-lg font-bold tracking-widest text-slate-900 ${
                      mobileError && !mobilePhoneNumber ? 'border-red-500/50 focus:border-red-500' : 'border-slate-200 focus:border-neon-cyan/50'
                    }`}
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Network Provider</label>
                  <div className="relative">
                    <select
                      value={mobileProvider}
                      onChange={(e) => {
                        setMobileProvider(e.target.value);
                        if (mobileError) setMobileError(null);
                      }}
                      className={`w-full bg-slate-50 border rounded-2xl px-5 py-4 focus:outline-none transition-all font-black text-[10px] uppercase tracking-widest appearance-none cursor-pointer text-slate-900 ${
                        mobileError && !mobileProvider ? 'border-red-500/50 focus:border-red-500' : 'border-slate-200 focus:border-neon-cyan/50'
                      }`}
                    >
                      <option value="" disabled>Select Carrier</option>
                      <option value="telkomsel">Telkomsel</option>
                      <option value="indosat">Indosat</option>
                      <option value="xl">XL Axiata</option>
                      <option value="tri">Tri</option>
                      <option value="smartfren">Smartfren</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ArrowRight className="w-4 h-4 text-slate-300 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>
              
              {mobileError && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mt-6 text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-2 ml-1"
                >
                  <AlertCircle className="w-3 h-3" /> {mobileError}
                </motion.p>
              )}

              <div className="mt-8">
                {isMobileVerified ? (
                  <div className="w-full py-5 rounded-2xl bg-green-500/5 border border-green-500/10 text-green-500 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-5 h-5" /> Line Verified
                  </div>
                ) : (
                  <button 
                    onClick={handleVerifyMobile}
                    disabled={isMobileVerifying}
                    className="w-full py-5 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan font-black text-[10px] uppercase tracking-[0.3em] hover:bg-neon-cyan/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {isMobileVerifying ? (
                      <div className="w-5 h-5 border-2 border-neon-cyan/30 border-t-neon-cyan animate-spin rounded-full" />
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" /> Initialize Verification
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="lg:col-span-5 space-y-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="step-number">6</div>
          <h2 className="text-xl font-display font-black uppercase tracking-widest text-slate-900">Order Summary</h2>
        </div>

        <div className="card-pro sticky top-24 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 blur-[40px] rounded-full -z-10" />
          
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 ml-1">Manifest Summary</h3>
          
          <div className="space-y-6 mb-10">
            <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Package</span>
              <span className="text-lg font-display font-black tracking-tight text-slate-900">{order.selectedPackage?.amount * order.quantity} <span className="text-neon-cyan">Diamonds</span></span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Quantity</span>
                <span className="text-xl font-display font-black tracking-tight text-slate-900">x{order.quantity}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Bonus</span>
                <span className="text-xl font-display font-black tracking-tight text-green-500">+{(order.selectedPackage?.bonus || 0) * order.quantity}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Target UID</span>
              <span className="text-xl font-mono font-black tracking-[0.2em] text-neon-cyan/80">{order.playerId}</span>
            </div>

            <div className="pt-8 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-1">
                    {order.payingOrderId ? 'Balance to Pay' : (order.isPartialPayment ? 'Deposit to Pay' : 'Total Payable')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
                    <span className="text-4xl font-display font-black text-slate-900 tracking-tighter">
                      ${(order.isPartialPayment ? order.partialAmount : totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {order.isPartialPayment && (
                <div className="p-4 rounded-2xl bg-neon-cyan/5 border border-neon-cyan/10 flex justify-between items-center">
                  <div>
                    <p className="text-[8px] font-black text-neon-cyan/50 uppercase tracking-widest">Remaining Balance</p>
                    <p className="text-sm font-black text-neon-cyan">${order.remainingBalance.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pay later via</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Wallet / Ads</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => navigate('/credits')}
              disabled={
                !order.paymentMethod || 
                isWalletInsufficient ||
                (order.paymentMethod.id === 'paypal' && !isPaypalAuthenticated) ||
                (order.paymentMethod.id === 'mobile' && !isMobileVerified)
              }
              className="w-full neon-button py-6 flex items-center justify-center gap-4 disabled:opacity-30 disabled:scale-100 group"
            >
              <span className="text-xs font-black uppercase tracking-[0.2em]">Execute Transaction</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={() => navigate('/details')}
              className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-900 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3 h-3" /> Go back
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 opacity-20 grayscale">
            <ShieldCheck className="w-5 h-5" />
            <Landmark className="w-5 h-5" />
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Payment;
