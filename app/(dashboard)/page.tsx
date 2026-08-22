"use client";

import { useState } from "react";
import { useBoekjeContext } from "@/app/lib/contexts/boekje-context";
import { BoekjeCard } from "@/app/ui/boekje-card";
import { BoekjeForm } from "@/app/ui/boekje-form";
import type { BoekjeDoc } from "@/app/lib/schemas";

export default function DashboardPage() {
  const { boekjes, loading, error } = useBoekjeContext();
  const [showForm, setShowForm] = useState(false);
  const [editingBoekje, setEditingBoekje] = useState<BoekjeDoc | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const activeBoekjes = boekjes.filter((b) => !b.archived);
  const archivedBoekjes = boekjes.filter((b) => b.archived);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 600 }}>Mijn boekjes</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 2 }}>
            Beheer al je huishoudboekjes
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingBoekje(null); }}>
          + Nieuw boekje
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: 16 }}>
          <BoekjeForm onDone={() => setShowForm(false)} />
        </div>
      )}

      {editingBoekje && (
        <div style={{ marginBottom: 16 }}>
          <BoekjeForm
            onDone={() => setEditingBoekje(null)}
            initial={{ title: editingBoekje.title, description: editingBoekje.description }}
            boekjeId={editingBoekje.id}
          />
        </div>
      )}

      {error && (
        <div className="error-message" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : activeBoekjes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📒</div>
          <div className="empty-state-title">Nog geen actieve boekjes</div>
          <div className="empty-state-text">
            Maak je eerste huishoudboekje aan om te beginnen met het bijhouden van je uitgaven en inkomsten.
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Nieuw boekje
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {activeBoekjes.map((b) => (
            <BoekjeCard key={b.id} boekje={b} onEdit={() => { setEditingBoekje(b); setShowForm(false); }} />
          ))}
        </div>
      )}

      {!loading && archivedBoekjes.length > 0 && (
        <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <button
            className="btn btn-ghost"
            onClick={() => setShowArchived(!showArchived)}
            style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", cursor: "pointer", color: "var(--text-secondary)" }}
          >
            {showArchived ? "▼" : "▶"} Gearchiveerde boekjes ({archivedBoekjes.length})
          </button>
          
          {showArchived && (
            <div className="grid-2" style={{ marginTop: 12 }}>
              {archivedBoekjes.map((b) => (
                <BoekjeCard key={b.id} boekje={b} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
