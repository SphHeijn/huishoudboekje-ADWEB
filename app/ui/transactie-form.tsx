"use client";

import { useState, type FormEvent } from "react";
import { useBoekjeContext } from "@/app/lib/contexts/boekje-context";
import { transactieSchema } from "@/app/lib/schemas";
import { translateFirebaseError } from "@/app/lib/format";
import type { TransactieDoc } from "@/app/lib/schemas";

interface Props {
  onDone: () => void;
  initial?: TransactieDoc;
}

function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function TransactieForm({ onDone, initial }: Props) {
  const { createTransactie, updateTransactie, activeBoekjeId, categorieen } = useBoekjeContext();
  const [type, setType] = useState<"uitgave" | "inkomsten">(initial?.type ?? "uitgave");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date ?? getTodayString());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!activeBoekjeId) return;

    const parsed = transactieSchema.safeParse({
      boekjeId: activeBoekjeId,
      type,
      amount: Number(amount),
      categoryId: categoryId || (initial ? "" : undefined),
      date,
      description: description || (initial ? "" : undefined),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (initial) {
        await updateTransactie(activeBoekjeId, initial.id, parsed.data);
      } else {
        await createTransactie(parsed.data);
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
      <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600 }}>{initial ? "Transactie bewerken" : "Nieuwe transactie"}</h4>
      {error && <div className="error-message">{error}</div>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
          <label className="form-label" htmlFor="tx-type">Type</label>
          <select
            id="tx-type"
            className="form-input"
            value={type}
            onChange={(e) => setType(e.target.value as "uitgave" | "inkomsten")}
          >
            <option value="uitgave">Uitgave</option>
            <option value="inkomsten">Inkomsten</option>
          </select>
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: 100 }}>
          <label className="form-label" htmlFor="tx-amount">Bedrag (€)</label>
          <input id="tx-amount" className="form-input" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: 150 }}>
          <label className="form-label" htmlFor="tx-category">Categorie</label>
          <select
            id="tx-category"
            className="form-input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Geen categorie</option>
            {categorieen.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: 130 }}>
          <label className="form-label" htmlFor="tx-date">Datum</label>
          <input id="tx-date" className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="form-group" style={{ flex: 2, minWidth: 200 }}>
          <label className="form-label" htmlFor="tx-desc">Omschrijving</label>
          <input id="tx-desc" className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Bijv. Boodschappen" />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onDone}>Annuleren</button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
          {loading ? "Bezig..." : initial ? "Opslaan" : "Toevoegen"}
        </button>
      </div>
    </form>
  );
}
