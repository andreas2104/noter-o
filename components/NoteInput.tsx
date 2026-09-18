"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { Plus, AlertCircle, Check, CalendarDays } from "lucide-react";
import { formatResult, parseExpression } from "@/lib/parser";
import { CATEGORIES } from "@/lib/db";

export interface SessionLine {
  rawInput: string;
  result: number;
  category: string;
}

interface Props {
  onAdd: (lines: SessionLine[], eventDate: Date, sessionTitle?: string) => void;
  onClearAll: () => void;
}

function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

interface PreviewLine {
  rawInput: string;
  ok: boolean;
  result: number | null;
}

export default function NoteInput({ onAdd, onClearAll }: Props) {
  const [value, setValue] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [eventDate, setEventDate] = useState(todayLocalISO);
  const [showClear, setShowClear] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const preview = useMemo<PreviewLine[]>(() => {
    return value
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((rawInput) => {
        const result = parseExpression(rawInput);
        return { rawInput, ok: result !== null, result };
      });
  }, [value]);

  const total = preview
    .filter((l) => l.ok)
    .reduce((sum, l) => sum + (l.result ?? 0), 0);
  const hasInvalid = preview.some((l) => !l.ok);
  const canSubmit = preview.length > 0 && !hasInvalid;

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    const lines: SessionLine[] = preview.map((l) => ({
      rawInput: l.rawInput,
      result: l.result as number,
      category,
    }));
    onAdd(lines, isoToDate(eventDate), sessionTitle.trim() || undefined);
    setValue("");
    setSessionTitle("");
    setCategory(CATEGORIES[0]);
    inputRef.current?.focus();
  }, [canSubmit, preview, onAdd, category, eventDate, sessionTitle]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-700 px-4 pt-3 pb-3"
      style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top, 0px))" }}
    >
      <input
        type="text"
        value={sessionTitle}
        onChange={(e) => setSessionTitle(e.target.value)}
        placeholder="Titre ou note de la session (facultatif)"
        aria-label="Titre de la session"
        maxLength={120}
        className="mb-2 w-full rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 outline-none transition-all placeholder:font-normal placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
      />
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          "20000ar (carburant)\n1000 (lavage)\n\nChaque ligne = 1 opération, saisie (Entrée) pour la ligne suivante"
        }
        rows={Math.min(4, Math.max(2, value.split("\n").length))}
        className={`flex-1 w-full px-4 py-3 rounded-xl text-base bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none transition-all resize-none ${
          hasInvalid && value.trim()
            ? "ring-2 ring-red-500"
            : "focus:ring-2 focus:ring-emerald-500"
        }`}
        autoComplete="off"
        inputMode="text"
      />

      <div className="flex items-center gap-2 mt-2.5">
        <div className="relative">
          <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 pointer-events-none" />
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value || todayLocalISO())}
            className="pl-8 pr-2 py-1.5 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            aria-label="Date de l'événement"
          />
        </div>
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden sm:inline">
          Entrée = nouvelle ligne &middot; le résultat s&apos;affiche seul
        </span>
        <button
          onClick={() => setShowClear(!showClear)}
          className="ml-auto text-xs text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0 py-1"
          aria-label="Supprimer toutes les notes"
        >
          Effacer tout
        </button>
      </div>

      {showClear && (
        <div className="flex items-center justify-end gap-1.5 mt-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Supprimer toutes les notes ?
          </span>
          <button
            onClick={() => {
              onClearAll();
              setShowClear(false);
            }}
            className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[11px] font-medium hover:bg-red-700"
          >
            Confirmer
          </button>
          <button
            onClick={() => setShowClear(false)}
            className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] hover:bg-zinc-300 dark:hover:bg-zinc-600"
          >
            Annuler
          </button>
        </div>
      )}

      <div className="flex gap-1.5 flex-wrap mt-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              category === c
                ? "bg-emerald-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {c}
            {category === c && <Check className="inline w-3 h-3 ml-1" />}
          </button>
        ))}
      </div>

      {preview.length > 0 && (
        <div className="mt-3 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <div className="max-h-40 overflow-y-auto px-3 py-2 flex flex-col gap-0.5 bg-zinc-50 dark:bg-zinc-900/40">
            {preview.map((line, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-sm ${
                  line.ok
                    ? "text-zinc-600 dark:text-zinc-300"
                    : "text-red-500 dark:text-red-400"
                }`}
              >
                <span
                  className={`font-medium shrink-0 ${
                    line.ok
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                >
                  -
                </span>
                <span className="flex-1 min-w-0 truncate">
                  {line.rawInput}
                </span>
                <span className="shrink-0 tabular-nums font-semibold">
                  {line.ok
                    ? `= ${formatResult(line.result as number)} Ar`
                    : "= invalide"}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700">
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              total ={" "}
              <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatResult(total)} Ar
              </span>
            </span>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {hasInvalid ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {hasInvalid ? "Corriger la ligne" : "Ajouter"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
