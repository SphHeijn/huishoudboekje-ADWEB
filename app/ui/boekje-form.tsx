"use client";

import { useState, type FormEvent } from "react";
import { useBoekjeContext } from "@/app/lib/contexts/boekje-context";
import { boekjeSchema } from "@/app/lib/schemas";
import { translateFirebaseError } from "@/app/lib/format";

interface Props {
  onDone: () => void;
  initial?: { title: string; description?: string };
  boekjeId?: string;
}

export function BoekjeForm({ onDone, initial, boekjeId }: Props) {
  const { createBoekje, updateBoekje } = useBoekjeContext();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = boekjeSchema.safeParse({ title, description: description || undefined, currency: "EUR" });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (boekjeId) {
        await updateBoekje(boekjeId, parsed.data);
      } else {
        await createBoekje(parsed.data);
      }
      onDone();
    } catch (err: unknown) {
      setError(translateFirebaseError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600 }}>
        {boekjeId ? "Boekje bewerken" : "Nieuw boekje"}
      </h3>
      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label className="form-label" htmlFor="title-input">Titel</label>
        <input id="title-input" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bijv. Huishoudboekje 2025" required />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="description-input">Beschrijving (optioneel)</label>
        <input id="description-input" className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Korte omschrijving" />
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <button type="button" className="btn btn-secondary" onClick={onDone}>Annuleren</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Bezig..." : boekjeId ? "Opslaan" : "Aanmaken"}
        </button>
      </div>
    </form>
  );
}
