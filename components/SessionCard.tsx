"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Trash2, Pencil, Check, X, AlertCircle } from "lucide-react";
import { formatResult, parseExpression } from "@/lib/parser";
import { eventDateOf, type Note } from "@/lib/db";

interface Props {
  lines: Note[];
  onDelete: (lines: Note[]) => void;
  onEdit: (id: number, rawInput: string, result: number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Général: "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300",
  Carburant: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  Alimentation:
    "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  Transport: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  Loyer: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  Santé: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  Éducation:
    "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
  Loisirs: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400",
  Autre: "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300",
};

function Line({
  note,
  onEdit,
}: {
  note: Note;
  onEdit: (id: number, rawInput: string, result: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(note.rawInput);
  const [editError, setEditError] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) editRef.current?.focus();
  }, [editing]);

  const confirmEdit = useCallback(() => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    const result = parseExpression(trimmed);
    if (result === null) {
      setEditError(true);
      setTimeout(() => setEditError(false), 1500);
      return;
    }
    if (note.id != null) onEdit(note.id, trimmed, result);
    setEditing(false);
  }, [editValue, note.id, onEdit]);

  const categoryClass =
    CATEGORY_COLORS[note.category] ?? CATEGORY_COLORS["Général"];

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-emerald-500 font-medium shrink-0">-</span>
        <div className="relative flex-1 min-w-0">
          <input
            ref={editRef}
            type="text"
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              setEditError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmEdit();
              if (e.key === "Escape") setEditing(false);
            }}
            className={`w-full px-3 py-1.5 rounded-lg text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none transition-all ${
              editError
                ? "ring-2 ring-red-500"
                : "focus:ring-2 focus:ring-emerald-500"
            }`}
            aria-label="Modifier la ligne"
          />
          {editError && (
            <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
          )}
        </div>
        <button
          onClick={confirmEdit}
          className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-colors"
          aria-label="Enregistrer"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => setEditing(false)}
          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 transition-colors"
          aria-label="Annuler"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group/line">
      <span className="text-emerald-500 font-medium shrink-0">-</span>
      <p className="flex-1 min-w-0 basis-0 text-sm text-zinc-600 dark:text-zinc-400 truncate">
        {note.rawInput}
      </p>
      {note.category && (
        <span
          className={`hidden sm:inline px-1.5 py-0.5 rounded-md text-[10px] font-medium shrink-0 ${categoryClass}`}
        >
          {note.category}
        </span>
      )}
      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
        {formatResult(note.result)}
        <span className="text-[10px] font-normal text-zinc-400 dark:text-zinc-500 ml-0.5">
          Ar
        </span>
      </span>
      <button
        onClick={() => setEditing(true)}
        className="opacity-0 group-hover/line:opacity-100 focus:opacity-100 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-300 hover:text-zinc-500 dark:hover:text-zinc-300 transition-all shrink-0"
        aria-label="Modifier la ligne"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function SessionCard({ lines, onDelete, onEdit }: Props) {
  const [swiping, setSwiping] = useState(false);
  const [offset, setOffset] = useState(0);
  const startX = useRef<number | null>(null);

  const dateStr = new Date(eventDateOf(lines[0])).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const total = lines.reduce((sum, l) => sum + l.result, 0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setSwiping(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (startX.current === null) return;
      const dx = e.touches[0].clientX - startX.current;
      if (dx < 0 && dx > -96) setOffset(dx);
    },
    []
  );

  const handleTouchEnd = useCallback(() => {
    startX.current = null;
    setSwiping(false);
    if (offset <= -60) setOffset(-96);
    else setOffset(0);
  }, [offset]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl transition-transform ${
        swiping ? "" : "duration-200 ease-out"
      }`}
      style={{ transform: `translateX(${offset}px)` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="absolute inset-y-0 right-0 w-24 bg-red-600 flex items-center justify-center cursor-pointer"
        onClick={() => onDelete(lines)}
        role="button"
        aria-label="Supprimer la session"
      >
        <Trash2 className="w-5 h-5 text-white" />
      </div>

      <div className="group bg-white dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/50 rounded-2xl transition-all hover:shadow-md dark:hover:shadow-zinc-900/50">
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <p className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
            {dateStr}
            <span className="text-zinc-300 dark:text-zinc-600">
              &middot; {lines.length} ligne{lines.length > 1 ? "s" : ""}
            </span>
          </p>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onDelete(lines)}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-300 hover:text-red-500 transition-all"
              aria-label="Supprimer la session"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1 px-4 py-2">
          {lines.map((line) =>
            line.id != null ? (
              <Line key={line.id} note={line} onEdit={onEdit} />
            ) : null
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-700/50">
          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            total ={" "}
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatResult(total)}
            <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500 ml-1">
              Ar
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}