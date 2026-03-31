import React from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred. Our team has been notified.";
      
      try {
        const parsedError = JSON.parse(this.state.error?.message || '{}');
        if (parsedError.error) {
          if (parsedError.error.includes('permission-denied') || parsedError.error.includes('insufficient permissions')) {
            errorMessage = "You don't have permission to perform this action. Please check if you are logged in correctly.";
          } else if (parsedError.error.includes('quota-exceeded')) {
            errorMessage = "We've reached our daily limit for this service. Please try again tomorrow.";
          } else if (parsedError.error.includes('network-error')) {
            errorMessage = "Network connection lost. Please check your internet and try again.";
          }
        }
      } catch (e) {
        // Not a JSON error, use default or raw message
        if (this.state.error?.message) {
          errorMessage = this.state.error.message;
        }
      }

      return (
        <div className="min-h-screen bg-gaming-dark flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full card-pro p-8 text-center space-y-6"
          >
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-display font-black uppercase tracking-tight">System <span className="text-red-500">Glitch</span></h1>
              <p className="text-white/60 text-sm leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <RefreshCcw className="w-4 h-4" />
                Retry
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-neon-cyan text-gaming-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </div>

            <p className="text-[8px] text-white/20 font-black uppercase tracking-widest">
              Error ID: {Math.random().toString(36).substring(7).toUpperCase()}
            </p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
