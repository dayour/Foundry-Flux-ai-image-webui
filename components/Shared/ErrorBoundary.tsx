"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error | null;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // Send to telemetry if configured
    // console.error("ErrorBoundary caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-lg border border-red-500/20 bg-red-500/5 text-red-600">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <div>
              <div className="font-semibold">Something went wrong</div>
              <div className="text-sm mt-1">There was a problem loading this section. Try refreshing the page or contact support if the issue persists.</div>
              {this.state.error && (
                <details className="mt-2 text-xs text-red-400">
                  <summary className="cursor-pointer">View error</summary>
                  <pre className="whitespace-pre-wrap">{String(this.state.error)}</pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
