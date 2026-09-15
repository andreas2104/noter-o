"use client";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-zinc-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.242 2.829a5 5 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
          />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        Hors ligne
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 text-center max-w-sm">
        Vous n&apos;avez pas de connexion internet. Vos notes existantes sont
        toujours disponibles.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
}
