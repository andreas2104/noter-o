"use client";

import { useEffect, useCallback } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    },
    [onCancel]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6 mx-4 max-w-sm w-full animate-slide-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          {message}
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
