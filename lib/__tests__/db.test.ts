import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { db, DEFAULT_CATEGORY, newSessionId } from "@/lib/db";

describe("database", () => {
  beforeEach(async () => {
    await db.notes.clear();
  });

  afterEach(async () => {
    await db.notes.clear();
  });

  it("adds a note with category, eventDate, sessionId and sessionTitle", async () => {
    const eventDate = new Date(2026, 8, 15);
    const id = await db.notes.add({
      rawInput: "20000ar (carburant) + 3000",
      result: 23000,
      category: "Carburant",
      sessionTitle: "Entretien voiture",
      createdAt: new Date(),
      eventDate,
      sessionId: "sess-1",
    });
    expect(id).toBeGreaterThan(0);

    const note = await db.notes.get(id);
    expect(note?.rawInput).toBe("20000ar (carburant) + 3000");
    expect(note?.result).toBe(23000);
    expect(note?.category).toBe("Carburant");
    expect(note?.sessionTitle).toBe("Entretien voiture");
    expect(note?.sessionId).toBe("sess-1");
    expect(note?.eventDate?.getTime()).toBe(eventDate.getTime());
  });

  it("generates unique session ids", () => {
    const a = newSessionId();
    const b = newSessionId();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(0);
  });

  it("orders notes by createdAt desc", async () => {
    await db.notes.bulkAdd([
      {
        rawInput: "1 + 1",
        result: 2,
        category: DEFAULT_CATEGORY,
        createdAt: new Date("2026-01-01"),
        eventDate: new Date("2026-01-01"),
      },
      {
        rawInput: "2 + 2",
        result: 4,
        category: DEFAULT_CATEGORY,
        createdAt: new Date("2026-01-02"),
        eventDate: new Date("2026-01-02"),
      },
    ]);

    const notes = await db.notes.orderBy("createdAt").reverse().toArray();
    expect(notes).toHaveLength(2);
    expect(notes[0].rawInput).toBe("2 + 2");
    expect(notes[1].rawInput).toBe("1 + 1");
  });

  it("filters notes by sessionId", async () => {
    const sessionId = newSessionId();
    await db.notes.bulkAdd([
      {
        rawInput: "100.000",
        result: 100000,
        category: DEFAULT_CATEGORY,
        createdAt: new Date(),
        eventDate: new Date(),
        sessionId,
      },
      {
        rawInput: "400.000",
        result: 400000,
        category: DEFAULT_CATEGORY,
        createdAt: new Date(),
        eventDate: new Date(),
        sessionId,
      },
    ]);

    const rows = await db.notes
      .where("sessionId")
      .equals(sessionId)
      .toArray();
    expect(rows).toHaveLength(2);
  });

  it("filters notes by eventDate index", async () => {
    await db.notes.bulkAdd([
      {
        rawInput: "1 + 1",
        result: 2,
        category: DEFAULT_CATEGORY,
        createdAt: new Date(),
        eventDate: new Date("2026-09-15"),
      },
      {
        rawInput: "2 + 2",
        result: 4,
        category: DEFAULT_CATEGORY,
        createdAt: new Date(),
        eventDate: new Date("2026-09-14"),
      },
    ]);

    const rows = await db.notes
      .where("eventDate")
      .equals(new Date("2026-09-15"))
      .toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0].rawInput).toBe("1 + 1");
  });

  it("updates a note", async () => {
    const id = await db.notes.add({
      rawInput: "10 * 10",
      result: 100,
      category: DEFAULT_CATEGORY,
      createdAt: new Date(),
      eventDate: new Date(),
    });

    await db.notes.update(id, { result: 1000, rawInput: "10 * 100" });
    const note = await db.notes.get(id);
    expect(note?.result).toBe(1000);
    expect(note?.rawInput).toBe("10 * 100");
  });

  it("deletes a note", async () => {
    const id = await db.notes.add({
      rawInput: "1 + 1",
      result: 2,
      category: DEFAULT_CATEGORY,
      createdAt: new Date(),
      eventDate: new Date(),
    });

    await db.notes.delete(id);
    const note = await db.notes.get(id);
    expect(note).toBeUndefined();
  });

  it("bulk deletes notes", async () => {
    await db.notes.bulkAdd([
      {
        rawInput: "1 + 1",
        result: 2,
        category: DEFAULT_CATEGORY,
        createdAt: new Date(),
        eventDate: new Date(),
        sessionId: "x",
      },
      {
        rawInput: "2 + 2",
        result: 4,
        category: DEFAULT_CATEGORY,
        createdAt: new Date(),
        eventDate: new Date(),
        sessionId: "x",
      },
    ]);

    const rows = await db.notes.where("sessionId").equals("x").toArray();
    const ids = rows.map((r) => r.id).filter((id): id is number => id != null);
    await db.notes.bulkDelete(ids);
    const remaining = await db.notes.count();
    expect(remaining).toBe(0);
  });

  it("clears all notes", async () => {
    await db.notes.add({
      rawInput: "1 + 1",
      result: 2,
      category: DEFAULT_CATEGORY,
      createdAt: new Date(),
      eventDate: new Date(),
    });
    await db.notes.clear();
    const count = await db.notes.count();
    expect(count).toBe(0);
  });

  it("filters by category", async () => {
    await db.notes.bulkAdd([
      {
        rawInput: "essence",
        result: 100,
        category: "Carburant",
        createdAt: new Date(),
        eventDate: new Date(),
      },
      {
        rawInput: "pain",
        result: 200,
        category: "Alimentation",
        createdAt: new Date(),
        eventDate: new Date(),
      },
    ]);

    const fuel = await db.notes.where("category").equals("Carburant").toArray();
    expect(fuel).toHaveLength(1);
    expect(fuel[0].rawInput).toBe("essence");
  });
});
