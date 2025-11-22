import React from 'react';

/**
 * ErrorBoundary captures unexpected render-time errors and shows a controlled fallback UI.
 * This prevents a single component failure from crashing the entire React tree.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Centralize logging for easier debugging/monitoring.
    console.error('Secure UPI UI error boundary caught:', error, errorInfo);
  }

  handleReset = () => {
    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 px-6 text-center">
          <div className="max-w-lg">
            <p className="text-xs text-cyan-400 font-mono mb-3 tracking-widest">[FALLBACK_SAFE_MODE]</p>
            <h1 className="text-3xl font-bold font-mono mb-4">Something went wrong</h1>
            <p className="text-sm text-slate-400 font-mono mb-6">
              The interface hit an unexpected error. Your session is safe, but this view needs a quick refresh.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-5 py-2 rounded border border-cyan-500 text-cyan-300 font-mono text-sm hover:bg-cyan-500/10 transition"
              >
                Retry View
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2 rounded border border-slate-600 text-slate-300 font-mono text-sm hover:bg-slate-800 transition"
              >
                Reload App
              </button>
            </div>
            {this.state.error && (
              <p className="mt-6 text-xs text-slate-500 font-mono break-words">
                <span className="text-slate-400">Error:</span> {this.state.error.message}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;









