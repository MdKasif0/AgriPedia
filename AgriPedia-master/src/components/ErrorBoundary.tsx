import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-4 my-4 bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600 rounded-md">
          <h2 className="font-bold text-lg mb-2">Something went wrong.</h2>
          <p>{this.props.fallbackMessage || "Please try refreshing the page or starting over."}</p>
          {this.state.errorMessage && (
            <details className="mt-2 text-sm">
              <summary>Error Details (for debugging)</summary>
              <pre className="mt-1 whitespace-pre-wrap text-xs">{this.state.errorMessage}</pre>
            </details>
          )}
           <button
            onClick={() => this.setState({ hasError: false, errorMessage: '' })}
            className="mt-3 px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md"
          >
            Try to recover
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
