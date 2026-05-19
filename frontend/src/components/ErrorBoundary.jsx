import React from 'react';
import { RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("Caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-12 flex flex-col items-center justify-center bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-800 m-8 text-center">
          <h2 className="text-xl font-bold text-zinc-400 mb-4">Something went wrong in this section</h2>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-6 py-2 rounded-full text-sm font-bold transition-all"
          >
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}
