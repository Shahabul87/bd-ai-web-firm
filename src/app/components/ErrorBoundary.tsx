'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-ink-950 px-6">
            <div className="border border-line bg-ink-900 p-10 max-w-md w-full text-center">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber">
                error / unexpected
              </p>
              <h2 className="mt-5 font-display text-2xl font-medium text-bone">
                Something went wrong
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-steel">
                We hit an unexpected error. Refresh the page to try again — if it
                keeps happening, let us know at hello@craftsai.org.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-8 inline-flex items-center justify-center gap-2 bg-signal px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-ink-950 transition-colors duration-150 hover:bg-signal-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                aria-label="Refresh the page"
              >
                Refresh page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}