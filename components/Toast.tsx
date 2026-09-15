"use client";

import { useEffect } from "react";
import { X, Undo2 } from "lucide-react";

interface ToastProps {
  message: string;
  onUndo?: () => void;
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({
  message,
  onUndo,
  onDismiss,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl shadow-lg min-w-[200px]">
        <span className="text-sm flex-1">{message}</span>
        {onUndo && (
          <button
            onClick={onUndo}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-700 dark:bg-zinc-300 hover:bg-zinc-600 dark:hover:bg-zinc-400 text-xs font-medium transition-colors"
          >
            <Undo2 className="w-3 h-3" />
            Annuler
          </button>
        )}
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
