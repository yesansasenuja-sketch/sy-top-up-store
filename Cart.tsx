import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, Diamond, Plus, Minus, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';

const Cart = () => {
  const { cart, removeFromCart, clearCart, setOrder, order, updateCartItemQuantity } = useAppContext();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.package.price * item.quantity, 0);
  const totalDiamonds = cart.reduce((sum, item) => sum + item.package.amount * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // For now, we take the first item to the payment page as the app is designed for single orders
    // In a real cart system, we'd process all items. 
    // But to keep it simple and compatible with existing flow:
    const firstItem = cart[0];
    setOrder({
      ...order,
      selectedPackage: firstItem.package,
      quantity: firstItem.quantity,
      playerId: firstItem.playerId,
      playerUsername: firstItem.playerUsername
    });
    navigate('/payment');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neon-cyan/10 rounded-2xl">
            <ShoppingCart className="w-8 h-8 text-neon-cyan" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-slate-900">Your <span className="text-neon-cyan">Cart</span></h1>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">{cart.length} Items in cart</p>
          </div>
        </div>
        {cart.length > 0 && (
          <button 
            onClick={clearCart}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Cart
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {cart.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-pro p-12 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingCart className="w-10 h-10 text-slate-200" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-black mb-2 text-slate-900">Cart is Empty</h3>
                  <p className="text-slate-400 text-sm">Add some diamonds to your cart to get started.</p>
                </div>
                <button 
                  onClick={() => navigate('/')}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                >
                  Browse Packages
                </button>
              </motion.div>
            ) : (
              cart.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="card-pro group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-neon-cyan/10 rounded-2xl flex items-center justify-center border border-neon-cyan/20">
                      <Diamond className="w-8 h-8 text-neon-cyan" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-xl font-display font-black text-slate-900">{item.package.amount} Diamonds</h3>
                        <p className="text-lg font-black text-slate-900">${(item.package.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID: {item.playerId}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-neon-cyan/50">{item.playerUsername}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-1.5 border border-slate-200">
                      <button 
                        onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-black text-neon-cyan min-w-[1rem] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-3 text-slate-200 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="card-pro sticky top-32">
            <h3 className="text-lg font-display font-black uppercase tracking-widest mb-6 pb-6 border-b border-slate-200 text-slate-900">Order Summary</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subtotal</span>
                <span className="font-black text-slate-900">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Diamonds</span>
                <span className="font-black text-neon-cyan">{totalDiamonds}</span>
              </div>
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-widest text-slate-900">Total</span>
                <span className="text-3xl font-display font-black text-neon-cyan">${total.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="neon-button w-full flex items-center justify-center gap-3 group disabled:opacity-30 disabled:scale-100"
            >
              Checkout
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[8px] text-center text-slate-400 font-black uppercase tracking-widest mt-6">
              Secure checkout powered by Elite Reload
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
