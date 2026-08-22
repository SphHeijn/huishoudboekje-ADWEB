"use client";

import { useState, type FormEvent } from "react";
import { useBoekjeContext } from "@/app/lib/contexts/boekje-context";
import { motion, AnimatePresence } from "motion/react";
import { formatEur, translateFirebaseError } from "@/app/lib/format";
import type { CategorieDoc } from "@/app/lib/schemas";
import { ConfirmDialog } from "@/app/ui/confirm-dialog";

const PRESET_COLORS = ["#4f46e5", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1"];

export function CategorieManager() {
  const {
    categorieen,
    transacties,
    createCategorie,
    updateCategorie,
    deleteCategorieWithTransactions,
    deleteCategorieKeepTransactions,
    activeBoekjeId,
    loading,
    error: contextError,
  } = useBoekjeContext();

  const [editingCategorie, setEditingCategorie] = useState<CategorieDoc | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const [categoryToDelete, setCategoryToDelete] = useState<CategorieDoc | null>(null);
  const [deleteTransactionOption, setDeleteTransactionOption] = useState<"remove" | "keep">("keep");
  const [deleting, setDeleting] = useState(false);

  function resetForm() {
    setEditingCategorie(null);
    setName("");
    setColor(PRESET_COLORS[0]);
    setIcon("");
    setMaxBudget("");
    setEndDate("");
    setError("");
  }

  function handleStartEdit(cat: CategorieDoc) {
    setEditingCategorie(cat);
    setName(cat.name);
    setColor(cat.color ?? PRESET_COLORS[0]);
    setIcon(cat.icon ?? "");
    setMaxBudget(cat.maxBudget !== undefined ? String(cat.maxBudget) : "");
    setEndDate(cat.endDate ?? "");
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!activeBoekjeId) return;
    if (!name.trim()) {
      setError("Naam is verplicht");
      return;
    }

    const budgetNum = maxBudget.trim() ? Number(maxBudget) : undefined;
    if (budgetNum !== undefined && (isNaN(budgetNum) || budgetNum < 0)) {
      setError("Budget moet een geldig positief getal zijn");
      return;
    }

    const dateVal = endDate.trim() ? endDate : undefined;

    try {
      if (editingCategorie) {
        await updateCategorie(activeBoekjeId, editingCategorie.id, {
          name: name.trim(),
          icon: icon || undefined,
          color,
          maxBudget: budgetNum,
          endDate: dateVal,
        });
      } else {
        await createCategorie(activeBoekjeId, {
          name: name.trim(),
          icon: icon || undefined,
          color,
          maxBudget: budgetNum,
          endDate: dateVal,
        });
      }
      resetForm();
    } catch (err: unknown) {
      setError(translateFirebaseError(err));
    }
  }

  function handleDelete(cat: CategorieDoc) {
    setCategoryToDelete(cat);
    setDeleteTransactionOption("keep");
  }

  async function handleConfirmDelete() {
    if (!activeBoekjeId || !categoryToDelete) return;
    setDeleting(true);
    try {
      if (deleteTransactionOption === "remove") {
        await deleteCategorieWithTransactions(activeBoekjeId, categoryToDelete.id);
      } else {
        await deleteCategorieKeepTransactions(activeBoekjeId, categoryToDelete.id);
      }
      setCategoryToDelete(null);
    } catch (err: unknown) {
      setError(translateFirebaseError(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
        {editingCategorie ? "Categorie bewerken" : "Categorieën"}
      </h3>

      <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div className="form-group" style={{ flex: 2, minWidth: 150 }}>
            <label className="form-label" htmlFor="cat-name">Naam</label>
            <input id="cat-name" className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Bijv. Boodschappen" />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 100 }}>
            <label className="form-label" htmlFor="cat-budget">Budget (€, optioneel)</label>
            <input id="cat-budget" className="form-input" type="number" step="0.01" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} placeholder="Bijv. 150.00" />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
            <label className="form-label" htmlFor="cat-enddate">Einddatum (optioneel)</label>
            <input id="cat-enddate" className="form-input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ width: 60 }}>
            <label className="form-label" htmlFor="cat-icon">Icoon</label>
            <input id="cat-icon" className="form-input" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🛒" maxLength={2} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Kleur</label>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 2,
                  background: c,
                  border: color === c ? "2px solid var(--text-primary)" : "1px solid var(--border)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          {editingCategorie && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>Annuleren</button>
          )}
          <button type="submit" className="btn btn-primary btn-sm">
            {editingCategorie ? "Opslaan" : "Toevoegen"}
          </button>
        </div>
      </form>

      {contextError && (
        <div className="error-message" style={{ marginBottom: 12 }}>
          {contextError}
        </div>
      )}
      
      {loading ? (
        <div className="loading-screen" style={{ padding: 24 }}>
          <div className="spinner" />
        </div>
      ) : categorieen.length === 0 ? (
        <div className="empty-state" style={{ padding: 24 }}>
          <div className="empty-state-title">Nog geen categorieën</div>
          <div className="empty-state-text">Maak categorieën aan om je transacties te organiseren.</div>
        </div>
      ) : (
        <div className="grid-3">
          <AnimatePresence>
            {categorieen.map((c) => {
              // Calculate monthly spent
              const spent = transacties
                .filter((t) => t.categoryId === c.id && t.type === "uitgave")
                .reduce((s, t) => s + t.amount, 0);

              const hasBudget = c.maxBudget !== undefined && c.maxBudget > 0;
              const remaining = hasBudget ? c.maxBudget! - spent : 0;
              const percentage = hasBudget ? (spent / c.maxBudget!) * 100 : 0;

              let progressBarColor = "var(--success)";
              let statusLabel = "";
              let isExceeded = false;
              let isAlmostEmpty = false;

              if (hasBudget) {
                if (spent > c.maxBudget!) {
                  progressBarColor = "var(--danger)";
                  statusLabel = "Budget overschreden!";
                  isExceeded = true;
                } else if (spent >= 0.8 * c.maxBudget!) {
                  progressBarColor = "var(--warning)";
                  statusLabel = "Budget bijna op!";
                  isAlmostEmpty = true;
                }
              }

              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="card"
                  style={{
                    padding: 12,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 8,
                    borderColor: isExceeded ? "var(--danger)" : isAlmostEmpty ? "var(--warning)" : "var(--border)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 1, background: c.color ?? "#6b7280" }} />
                        {c.icon && <span style={{ fontSize: 16 }}>{c.icon}</span>}
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleStartEdit(c)} style={{ padding: "2px 6px", fontSize: 11 }} title="Bewerken">✎</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(c)} style={{ padding: "2px 6px", fontSize: 11 }} title="Verwijderen">✕</button>
                      </div>
                    </div>

                    {c.endDate && (
                      <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 6 }}>
                        📅 Tot: <span style={{ fontFamily: "var(--font-mono)" }}>{c.endDate}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 4, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 500 }}>
                      <span style={{ color: "var(--text-secondary)" }}>Uitgegeven:</span>
                      <span style={{ fontFamily: "var(--font-mono)" }}>{formatEur(spent)}</span>
                    </div>

                    {hasBudget && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 500, marginTop: 2 }}>
                          <span style={{ color: "var(--text-secondary)" }}>Resterend:</span>
                          <span style={{
                            fontFamily: "var(--font-mono)",
                            color: remaining >= 0 ? "var(--success)" : "var(--danger)",
                            fontWeight: 600
                          }}>
                            {formatEur(remaining)}
                          </span>
                        </div>

                        <div style={{ width: "100%", height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden", marginTop: 6 }}>
                          <div
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                              height: "100%",
                              background: progressBarColor,
                              borderRadius: 3,
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>

                        {statusLabel && (
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: progressBarColor,
                              marginTop: 4,
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            ⚠️ {statusLabel}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <ConfirmDialog
        open={categoryToDelete !== null}
        title="Categorie verwijderen"
        message={`Weet je zeker dat je "${categoryToDelete?.name ?? ""}" wilt verwijderen?`}
        confirmLabel="Verwijderen"
        cancelLabel="Annuleren"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setCategoryToDelete(null)}
        loading={deleting}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: "var(--text-primary)",
              cursor: "pointer",
              padding: "6px 8px",
              borderRadius: "var(--radius-sm)",
              background: deleteTransactionOption === "keep" ? "var(--surface-hover)" : "transparent",
            }}
          >
            <input
              type="radio"
              name="transaction-action"
              value="keep"
              checked={deleteTransactionOption === "keep"}
              onChange={() => setDeleteTransactionOption("keep")}
            />
            Transacties houden zonder categorie
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: "var(--text-primary)",
              cursor: "pointer",
              padding: "6px 8px",
              borderRadius: "var(--radius-sm)",
              background: deleteTransactionOption === "remove" ? "var(--surface-hover)" : "transparent",
            }}
          >
            <input
              type="radio"
              name="transaction-action"
              value="remove"
              checked={deleteTransactionOption === "remove"}
              onChange={() => setDeleteTransactionOption("remove")}
            />
            Ook bijbehorende transacties verwijderen
          </label>
        </div>
      </ConfirmDialog>
    </div>
  );
}
