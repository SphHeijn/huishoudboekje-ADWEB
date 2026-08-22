"use client";

import { useState } from "react";
import { useBoekjeContext } from "@/app/lib/contexts/boekje-context";
import { TransactieForm } from "@/app/ui/transactie-form";
import { motion, AnimatePresence } from "motion/react";
import { formatEur } from "@/app/lib/format";
import type { TransactieDoc, CategorieDoc } from "@/app/lib/schemas";

function getCategorieLabel(catId: string | undefined, categorieen: CategorieDoc[]): { name: string; color: string } {
  if (!catId) return { name: "Zonder categorie", color: "#9ca3af" };
  const cat = categorieen.find((c) => c.id === catId);
  return cat ? { name: cat.name, color: cat.color ?? "#6b7280" } : { name: "Onbekend", color: "#6b7280" };
}

import { useEffect, useRef } from "react";

function AnimatedNumber({ value, durationMs = 600 }: { value: number; durationMs?: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    prevValueRef.current = endValue;

    if (startValue === endValue || process.env.NODE_ENV === "test") {
      setDisplayValue(endValue);
      return;
    }

    const startTime = performance.now();
    let animationFrameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const easeProgress = progress * (2 - progress); // easeOutQuad
      const currentValue = startValue + (endValue - startValue) * easeProgress;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, durationMs]);

  return <span>{formatEur(displayValue)}</span>;
}

export function TransactieList() {
  const { transacties, categorieen, deleteTransactie, activeBoekjeId, filterMonth } = useBoekjeContext();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TransactieDoc | null>(null);

  async function handleDelete(t: TransactieDoc) {
    if (!activeBoekjeId) return;
    await deleteTransactie(activeBoekjeId, t.id);
  }

  const uitgaven = transacties.filter((t) => t.type === "uitgave");
  const inkomsten = transacties.filter((t) => t.type === "inkomsten");
  const totaalUitgaven = uitgaven.reduce((s, t) => s + t.amount, 0);
  const totaalInkomsten = inkomsten.reduce((s, t) => s + t.amount, 0);
  const saldo = totaalInkomsten - totaalUitgaven;

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "space-around" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 500, textTransform: "uppercase", marginBottom: 2, fontFamily: "var(--font-mono)" }}>Inkomsten</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--success)", fontFamily: "var(--font-mono)" }}>
              <AnimatedNumber value={totaalInkomsten} />
            </div>
          </div>
          <div style={{ width: 1, height: 24, background: "var(--border)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 500, textTransform: "uppercase", marginBottom: 2, fontFamily: "var(--font-mono)" }}>Balans</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: saldo >= 0 ? "var(--success)" : "var(--danger)", fontFamily: "var(--font-mono)" }}>
              <AnimatedNumber value={saldo} durationMs={1200} />
            </div>
          </div>
          <div style={{ width: 1, height: 24, background: "var(--border)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 500, textTransform: "uppercase", marginBottom: 2, fontFamily: "var(--font-mono)" }}>Uitgaven</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--danger)", fontFamily: "var(--font-mono)" }}>
              <AnimatedNumber value={totaalUitgaven} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600 }}>
          Transacties {filterMonth}
        </h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
          + Nieuwe transactie
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: 12 }}>
          <TransactieForm onDone={() => setShowForm(false)} />
        </div>
      )}
      {editing && (
        <div style={{ marginBottom: 12 }}>
          <TransactieForm onDone={() => setEditing(null)} initial={editing} />
        </div>
      )}

      {transacties.length === 0 ? (
        <div className="empty-state" style={{ padding: 32 }}>
          <div className="empty-state-title">Nog geen transacties</div>
          <div className="empty-state-text">Voeg de eerste uitgave of inkomsten toe voor deze maand.</div>
        </div>
      ) : (
        <AnimatePresence>
          {transacties.map((t) => {
            const cat = getCategorieLabel(t.categoryId, categorieen);
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 1, background: cat.color }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{t.description || "Transactie"}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", marginTop: 1 }}>
                      {t.date} <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>·</span> {cat.name}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)", color: t.type === "inkomsten" ? "var(--success)" : "var(--foreground)", marginRight: 4 }}>
                    {t.type === "inkomsten" ? "+" : "-"}{formatEur(t.amount)}
                  </span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(t)} style={{ padding: "4px 6px", fontSize: 11 }}>✎</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(t)} style={{ padding: "4px 6px", fontSize: 11 }}>✕</button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
}
