"use client";

import { Search, X } from "lucide-react";

export interface DateRange {
  from: string;
  to: string;
}

interface Props {
  searchQuery: string;
  onSearch: (q: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function Filters({
  searchQuery,
  onSearch,
  dateRange,
  onDateRangeChange,
}: Props) {
  return (
    <div className="flex flex-col gap-2 px-4 py-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-8 py-2 rounded-xl text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
          className="flex-1 px-2.5 py-1.5 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          aria-label="Date de début"
        />
        <span className="text-zinc-400 text-xs">→</span>
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
          className="flex-1 px-2.5 py-1.5 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          aria-label="Date de fin"
        />
        {(dateRange.from || dateRange.to) && (
          <button
            onClick={() => onDateRangeChange({ from: "", to: "" })}
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 transition-colors shrink-0"
            aria-label="Réinitialiser les dates"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}