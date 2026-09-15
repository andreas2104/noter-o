"use client";

import SessionCard from "./SessionCard";
import { Inbox } from "lucide-react";
import { eventDateOf, type Note } from "@/lib/db";

interface Props {
  notes: Note[];
  onDelete: (lines: Note[]) => void;
  onEdit: (id: number, rawInput: string, result: number) => void;
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

export default function NoteList({ notes, onDelete, onEdit, loaded }: Props) {
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

  return (
    <div className="flex flex-col gap-2">
      {groupBySession(notes).map((session, i) => (
        <SessionCard
          key={i}
          lines={session}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}