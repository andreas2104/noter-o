"use client";

import { useRef, useState } from "react";
import {
  Download,
  Upload,
  FileJson,
  FileText,
  UploadCloud,
  Printer,
} from "lucide-react";
import { eventDateOf, type Note } from "@/lib/db";
import { printAll } from "@/lib/print";

interface Props {
  notes: Note[];
  onImport: (notes: Omit<Note, "id">[]) => Promise<number>;
}

export default function ExportButton({ notes, onImport }: Props) {
  const [open, setOpen] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJSON = () => {
    const data = notes.map((n) => ({
      rawInput: n.rawInput,
      result: n.result,
      category: n.category,
      sessionTitle: n.sessionTitle ?? undefined,
      eventDate: new Date(eventDateOf(n)).toISOString(),
      sessionId: n.sessionId ?? undefined,
    }));
    download(
      JSON.stringify(data, null, 2),
      "note-o-export.json",
      "application/json"
    );
    setOpen(false);
  };

  const exportCSV = () => {
    const header = "Entrée,Résultat,Date,Catégorie,Session,Titre\n";
    const rows = notes
      .map(
        (n) =>
          `"${n.rawInput.replace(/"/g, '""')}",${n.result},${new Date(
            eventDateOf(n)
          ).toISOString()},"${n.category.replace(/"/g, '""')}","${(n.sessionId ?? "").replace(/"/g, '""')}","${(n.sessionTitle ?? "").replace(/"/g, '""')}"`
      )
      .join("\n");
    download(header + rows, "note-o-export.csv", "text/csv");
    setOpen(false);
  };

  const printPDF = () => {
    setOpen(false);
    window.setTimeout(printAll, 0);
  };

  const exportJSONTemplate = () => {
    const template = JSON.stringify(
      [
        {
          rawInput: "100.000 (loyer) + 400.000 (provision)",
          result: 500000,
          category: "Loyer",
          sessionTitle: "Dépenses de septembre",
          eventDate: "2026-09-15T00:00:00.000Z",
        },
      ],
      null,
      2
    );
    download(template, "note-o-import-template.json", "application/json");
  };

  const download = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      let rows: Array<{
        rawInput: string;
        result: number;
        category?: string;
        eventDate?: string;
        sessionId?: string;
        sessionTitle?: string;
      }>;

      if (file.name.endsWith(".json")) {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!Array.isArray(data)) throw new Error("Format JSON invalide");
        rows = data;
      } else if (file.name.endsWith(".csv")) {
        const text = await file.text();
        rows = text
          .trim()
          .split("\n")
          .slice(1)
          .map((line) => {
            const parts = [];
            let current = "";
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
              const ch = line[i];
              if (ch === '"') {
                if (inQuotes && line[i + 1] === '"') {
                  current += '"';
                  i++;
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (ch === "," && !inQuotes) {
                parts.push(current);
                current = "";
              } else {
                current += ch;
              }
            }
            parts.push(current);
            return parts.map((p) => p.trim());
          })
          .filter((row) => row.length >= 3)
          .map((row) => ({
            rawInput: row[0],
            result: parseFloat(row[1]),
            category: row[3],
            eventDate: row[2],
            sessionId: row[4],
            sessionTitle: row[5],
          }));
      } else {
        throw new Error("Format non supporté");
      }

      const now = new Date();
      const valid = rows
        .filter(
          (n) =>
            typeof n.rawInput === "string" &&
            n.rawInput.trim() &&
            typeof n.result === "number" &&
            isFinite(n.result)
        )
        .map((n) => ({
          rawInput: n.rawInput.trim(),
          result: n.result,
          category: n.category || "Général",
          createdAt: now,
          eventDate: n.eventDate ? new Date(n.eventDate) : now,
          sessionId: n.sessionId || undefined,
          sessionTitle: n.sessionTitle?.trim() || undefined,
        }));

      if (valid.length === 0) {
        throw new Error("Aucune note valide trouvée");
      }

      const count = await onImport(valid);
      setImportMsg(
        `${count} note${count > 1 ? "s" : ""} importée${count > 1 ? "s" : ""} avec succès`
      );
    } catch (err) {
      setImportMsg(
        `Erreur d'import : ${
          err instanceof Error ? err.message : "format invalide"
        }`
      );
    }
    e.target.value = "";
    setOpen(false);
    setTimeout(() => setImportMsg(null), 4000);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={printPDF}
          disabled={notes.length === 0}
          className="print:hidden flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Imprimer ou enregistrer en PDF"
          title="Imprimer ou enregistrer en PDF"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">PDF</span>
        </button>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Données
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-1 z-50 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden min-w-[180px]">
              <button
                onClick={exportJSON}
                disabled={notes.length === 0}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FileJson className="w-4 h-4" />
                Exporter JSON
              </button>
              <button
                onClick={exportCSV}
                disabled={notes.length === 0}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FileText className="w-4 h-4" />
                Exporter CSV
              </button>
              <button
                onClick={printPDF}
                disabled={notes.length === 0}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4" />
                Imprimer / PDF
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <UploadCloud className="w-4 h-4" />
                Importer
              </button>
              <button
                onClick={exportJSONTemplate}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors border-t border-zinc-100 dark:border-zinc-700"
              >
                <FileJson className="w-4 h-4" />
                Télécharger modèle
              </button>
            </div>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".json,.csv"
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden
        />
      </div>
      {importMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl shadow-lg">
            <Upload className="w-4 h-4" />
            <span className="text-sm">{importMsg}</span>
          </div>
        </div>
      )}
    </>
  );
}
