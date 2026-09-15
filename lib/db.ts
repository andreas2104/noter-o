import Dexie, { type EntityTable } from "dexie";

export interface Note {
  id?: number;
  rawInput: string;
  result: number;
  category: string;
  createdAt: Date;
  eventDate: Date;
  sessionId?: string;
}

export const DEFAULT_CATEGORY = "Général";

const CATEGORIES = [
  "Général",
  "Carburant",
  "Alimentation",
  "Transport",
  "Loyer",
  "Santé",
  "Éducation",
  "Loisirs",
  "Autre",
];

export { CATEGORIES };

class NoteODatabase extends Dexie {
  notes!: EntityTable<Note, "id">;

  constructor() {
    super("NoteO");
    this.version(3).stores({
      notes: "++id, createdAt, eventDate, category, sessionId",
    });
  }
}

export const db = new NoteODatabase();

export function newSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function eventDateOf(note: Note): Date {
  return note.eventDate instanceof Date ? note.eventDate : note.createdAt;
}