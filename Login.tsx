import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Facebook, Apple, Phone, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useAppContext } from '../context/AppContext';
import { toast } from 'sonner';

const Login = () => {
  const { setIsAuthenticated, setUser } = useAppContext();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      console.error(err);
      let message = 'Failed to send reset email';
      if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      toast.error(message);
    } finally {
      setIsResetting(null);
      setIsResetting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn('google');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Successfully signed in with Google!');
      navigate('/profile');
    } catch (err: any) {
      console.error(err);
      let message = 'Failed to sign in with Google';
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in popup was closed before completion.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your connection.';
      }
      toast.error(message);
    } finally {
      setIsLoggingIn(null);
    }
  };

  const handleSocialLogin = (provider: string) => {
    if (provider === 'google') {
      handleGoogleLogin();
      return;
    }
    
    setIsLoggingIn(provider);
    setTimeout(() => {
      setIsAuthenticated(true);
      setUser({
        id: '1',
        username: 'GamerPro_99',
        email: 'gamer_pro@email.com',
        avatar: 'https://picsum.photos/seed/gamer/200/200',
        provider: provider as any,
        uid: '1',
        walletBalance: 120,
        role: 'user',
        createdAt: new Date().toISOString()
      });
      setIsLoggingIn(null);
      toast.success(`Successfully signed in with ${provider}!`);
      navigate('/');
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="p-8 rounded-[32px] bg-white border border-slate-200 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-transparent to-neon-cyan opacity-30" />
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold mb-2 text-slate-900">Welcome Back</h2>
          <p className="text-slate-400 text-sm">Login to access your credits and order history.</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                placeholder="name@example.com"
                value={email || ''}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 focus:outline-none focus:border-neon-cyan transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
              <button 
                onClick={handleForgotPassword}
                disabled={isResetting}
                className="text-[10px] font-bold text-neon-cyan uppercase tracking-widest hover:underline disabled:opacity-50"
              >
                {isResetting ? 'Sending...' : 'Forgot Password?'}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 focus:outline-none focus:border-neon-cyan transition-all"
              />
            </div>
          </div>
          <button 
            onClick={() => handleSocialLogin('email')}
            className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold hover:scale-[1.02] transition-all shadow-xl"
          >
            {isLoggingIn === 'email' ? 'Logging in...' : 'Sign In'}
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => handleSocialLogin('facebook')}
            className="py-4 rounded-2xl bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center hover:bg-[#1877F2]/20 transition-all"
          >
            <Facebook className="w-6 h-6 text-[#1877F2]" />
          </button>
          <button 
            onClick={() => handleSocialLogin('google')}
            className="py-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-all"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.94 0 3.68.67 5.05 1.97l3.77-3.77C18.54 1.12 15.5 0 12 0 7.31 0 3.25 2.69 1.25 6.62l4.41 3.42c1.04-3.12 3.96-5.42 7.34-5.42z"/>
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.91c2.2-2.02 3.66-5 3.66-8.73z"/>
              <path fill="#FBBC05" d="M5.66 14.71c-.26-.79-.41-1.63-.41-2.5 0-.87.15-1.71.41-2.5L1.25 6.62C.45 8.21 0 10.01 0 12c0 1.99.45 3.79 1.25 5.38l4.41-3.67z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.76-2.91c-1.1.74-2.5 1.18-4.17 1.18-3.38 0-6.3-2.3-7.34-5.42L1.25 17.38C3.25 21.31 7.31 24 12 24z"/>
            </svg>
          </button>
          <button 
            onClick={() => handleSocialLogin('apple')}
            className="py-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-all"
          >
            <Apple className="w-6 h-6 text-slate-900" />
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Don't have an account? <button className="text-neon-cyan font-bold hover:underline">Create Account</button>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;
