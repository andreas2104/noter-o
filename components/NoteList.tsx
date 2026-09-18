"use client";

import { useRef, useState } from "react";
import SessionCard from "./SessionCard";
import { ChevronDown, Inbox, Printer } from "lucide-react";
import { eventDateOf, type Note } from "@/lib/db";
import { formatResult } from "@/lib/parser";
import { printPartial } from "@/lib/print";

interface Props {
  notes: Note[];
  onDelete: (lines: Note[]) => void;
  onEdit: (id: number, rawInput: string, result: number) => void;
  onUpdateSessionTitle: (lines: Note[], sessionTitle: string) => void;
  onAddToSession: (
    sessionId: string,
    rawInput: string,
    result: number,
    category: string,
    eventDate: Date
  ) => void;
  loaded: boolean;
}

function groupBySession(notes: Note[]): Note[][] {
  const groups = new Map<string, Note[]>();
  for (const note of notes) {
    const key = note.sessionId ? `s:${note.sessionId}` : `n:${note.id}`;
    const group = groups.get(key);
    if (group) group.push(note);
    else groups.set(key, [note]);
  }
  const result = [...groups.values()];
  result.sort((a, b) => {
    const da = new Date(eventDateOf(a[0])).getTime();
    const db = new Date(eventDateOf(b[0])).getTime();
    return db - da;
  });
  return result;
}

function dateKeyOf(session: Note[]): string {
  const times = session.map((note) => new Date(eventDateOf(note)).getTime());
  const date = new Date(Math.min(...times));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function groupSessionsByDate(notes: Note[]): Array<[string, Note[][]]> {
  const dates = new Map<string, Note[][]>();
  for (const session of groupBySession(notes)) {
    const key = dateKeyOf(session);
    const group = dates.get(key);
    if (group) group.push(session);
    else dates.set(key, [session]);
  }
  return [...dates.entries()].sort(([a], [b]) => b.localeCompare(a));
}

function DateSection({
  dateKey,
  sessions,
  defaultOpen,
  onDelete,
  onEdit,
  onUpdateSessionTitle,
  onAddToSession,
}: {
  dateKey: string;
  sessions: Note[][];
  defaultOpen: boolean;
  onDelete: Props["onDelete"];
  onEdit: Props["onEdit"];
  onUpdateSessionTitle: Props["onUpdateSessionTitle"];
  onAddToSession: Props["onAddToSession"];
}) {
  const [open, setOpen] = useState(defaultOpen);
  const sectionRef = useRef<HTMLElement>(null);
  const [year, month, day] = dateKey.split("-").map(Number);
  const label = new Date(year, month - 1, day).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const total = sessions.flat().reduce((sum, note) => sum + note.result, 0);

  return (
    <section ref={sectionRef} className="date-group flex flex-col gap-2">
      <div className="date-heading flex items-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 px-3 py-2">
        <button
          onClick={() => setOpen((value) => !value)}
          className="flex flex-1 items-center gap-2 text-left"
          aria-expanded={open}
        >
          <ChevronDown
            className={`print:hidden h-4 w-4 text-zinc-500 transition-transform ${open ? "" : "-rotate-90"}`}
          />
          <span className="text-sm font-semibold capitalize text-zinc-700 dark:text-zinc-200">
            {label}
          </span>
          <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
            {sessions.length} session{sessions.length > 1 ? "s" : ""} · {formatResult(total)} Ar
          </span>
        </button>
        <button
          onClick={() => printPartial("date", sectionRef.current)}
          className="print:hidden rounded-lg p-1.5 text-zinc-400 hover:bg-white hover:text-emerald-600 dark:hover:bg-zinc-800"
          aria-label={`Imprimer les notes du ${label}`}
          title="Imprimer cette date"
        >
          <Printer className="h-4 w-4" />
        </button>
      </div>

      <div className={`date-sessions flex flex-col gap-2 ${open ? "" : "hidden"}`}>
        {sessions.map((session) => {
          const key = session[0].sessionId ?? `note-${session[0].id}`;
          return (
            <SessionCard
              key={key}
              lines={session}
              onDelete={onDelete}
              onEdit={onEdit}
              onUpdateSessionTitle={onUpdateSessionTitle}
              onAddToSession={onAddToSession}
            />
          );
        })}
      </div>
    </section>
  );
}

export default function NoteList({
  notes,
  onDelete,
  onEdit,
  onUpdateSessionTitle,
  onAddToSession,
  loaded,
}: Props) {
  if (!loaded) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-3 bg-white dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/50 rounded-2xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="h-3.5 w-2/3 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                <div className="h-2.5 w-1/3 bg-zinc-100 dark:bg-zinc-800 rounded mt-2 animate-pulse" />
              </div>
              <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Inbox className="w-12 h-12 text-zinc-300 dark:text-zinc-600" />
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Aucune note pour l&apos;instant
        </p>
        <p className="text-xs text-zinc-300 dark:text-zinc-600">
          Saisissez une opération ci-dessus
        </p>
      </div>
    );
  }

  const dateGroups = groupSessionsByDate(notes);

  return (
    <div className="flex flex-col gap-3">
      {dateGroups.map(([dateKey, sessions], index) => (
        <DateSection
          key={dateKey}
          dateKey={dateKey}
          sessions={sessions}
          defaultOpen={index === 0}
          onDelete={onDelete}
          onEdit={onEdit}
          onUpdateSessionTitle={onUpdateSessionTitle}
          onAddToSession={onAddToSession}
        />
      ))}
    </div>
  );
}
