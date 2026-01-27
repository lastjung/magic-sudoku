import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // If passed a reset handler, call it (e.g., to reset parent state)
    if (this.props.onReset) {
        this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
          return this.props.fallback;
      }

      return (
        <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-2xl border border-red-500/30 text-center">
            <div className="p-3 bg-red-500/10 rounded-full mb-4">
                <AlertTriangle size={32} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Something went wrong</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-xs">
                The component encountered an error. 
                {this.state.error && <span className="block mt-1 text-xs font-mono bg-black/30 p-1 rounded text-red-300 truncate max-w-[250px] mx-auto">{this.state.error.toString()}</span>}
            </p>
            <button 
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold border border-white/10 transition-colors"
            >
                <RefreshCcw size={14} /> Try Again
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
