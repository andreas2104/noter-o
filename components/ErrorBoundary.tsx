"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Oups, une erreur est survenue
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 text-center max-w-sm">
            L&apos;application a rencontré un problème inattendu. Essayez de
            recharger la page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
          >
            Recharger
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
