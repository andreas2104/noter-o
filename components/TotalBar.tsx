"use client";

import { formatResult } from "@/lib/parser";

interface Props {
  total: number;
  count: number;
}

export default function TotalBar({ total, count }: Props) {
  return (
    <div className="sticky bottom-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-medium">
            Total général
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {count} session{count > 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatResult(total)}
            <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500 ml-1">
              Ar
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}