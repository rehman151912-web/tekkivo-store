import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('TEKKIVO ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-2xl bg-white border border-slate-200 p-8 text-center shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="font-display text-xl font-bold text-[#10243D]">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              We encountered an unexpected error while loading this view. Your
              cart items remain safely saved.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 h-11 px-5 rounded-xl bg-[#10243D] hover:bg-[#183558] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload TEKKIVO Store</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
