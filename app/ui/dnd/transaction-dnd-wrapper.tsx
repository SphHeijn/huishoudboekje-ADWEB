"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { useBoekjeContext } from "@/app/lib/contexts/boekje-context";
import { useAuth } from "@/app/lib/contexts/auth-context";
import { CategoryDropzone } from "@/app/ui/dnd/category-dropzone";
import { UncategorizedDropzone } from "@/app/ui/dnd/uncategorized-dropzone";
import { motion } from "motion/react";
import { translateFirebaseError, formatEur } from "@/app/lib/format";
import type { TransactieDoc, CategorieDoc } from "@/app/lib/schemas";

export function TransactionDndWrapper() {
  const { transacties, categorieen, updateTransactie, activeBoekjeId, activeBoekje } = useBoekjeContext();
  const { user } = useAuth();
  const [activeTransaction, setActiveTransaction] = useState<TransactieDoc | null>(null);
  const [overCategoryId, setOverCategoryId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const isOwner = user?.uid === (activeBoekje?.createdBy ?? activeBoekje?.members[0]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const { groupedByCategory, uncategorized } = useMemo(() => {
    const map = new Map<string, TransactieDoc[]>();
    const uncat: TransactieDoc[] = [];

    for (const t of transacties) {
      if (t.categoryId) {
        const arr = map.get(t.categoryId) ?? [];
        arr.push(t);
        map.set(t.categoryId, arr);
      } else {
        uncat.push(t);
      }
    }

    const grouped: { categorie: CategorieDoc; transacties: TransactieDoc[] }[] = [];
    for (const c of categorieen) {
      grouped.push({ categorie: c, transacties: map.get(c.id) ?? [] });
    }

    return { groupedByCategory: grouped, uncategorized: uncat };
  }, [transacties, categorieen]);

  function handleDragStart(event: DragStartEvent) {
    setError("");
    const id = event.active.id as string;
    const t = transacties.find((tr) => tr.id === id);
    if (t) setActiveTransaction(t);
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    setOverCategoryId(over ? (over.id as string) : null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTransaction(null);
    setOverCategoryId(null);
    setError("");
    const { active, over } = event;
    if (!over || !activeBoekjeId) return;

    const transactionId = active.id as string;
    const targetCategoryId = over.id as string;
    const tx = transacties.find((t) => t.id === transactionId);
    if (!tx) return;

    if (targetCategoryId === "__uncategorized__") {
      if (!tx.categoryId) return;
      try {
        await updateTransactie(activeBoekjeId, transactionId, { categoryId: "" });
      } catch (err) {
        setError(translateFirebaseError(err));
      }
      return;
    }

    if (tx.categoryId === targetCategoryId) return;

    try {
      await updateTransactie(activeBoekjeId, transactionId, { categoryId: targetCategoryId });
    } catch (err) {
      setError(translateFirebaseError(err));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Slepen & Koppelen</h3>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>
          Sleep een transactie naar een categorie om ze te koppelen, of naar &quot;Geen categorie&quot; om te ontkoppelen.
        </p>

        {!isOwner && (
          <div className="error-message" style={{ marginBottom: 16 }}>
            Alleen de eigenaar van dit boekje kan transacties koppelen aan categorieën.
          </div>
        )}

        {error && (
          <div className="error-message" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        {transacties.length > 0 && (
          <UncategorizedDropzone
            transacties={uncategorized}
            isOver={overCategoryId === "__uncategorized__"}
          />
        )}

        {groupedByCategory.length === 0 ? (
          <div className="empty-state" style={{ padding: 24 }}>
            <div className="empty-state-title">Geen categorieën</div>
            <div className="empty-state-text">Maak eerst categorieën aan op het Categorieën-tab.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {groupedByCategory.map(({ categorie, transacties: txList }) => (
              <CategoryDropzone
                key={categorie.id}
                categorie={categorie}
                transacties={txList}
                isOver={overCategoryId === categorie.id}
              />
            ))}
          </div>
        )}
      </motion.div>

      <DragOverlay>
        {activeTransaction && (
          <div
            style={{
              padding: "8px 12px",
              background: "var(--surface)",
              border: "1px solid var(--primary)",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
              opacity: 0.9,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <span>{activeTransaction.description || "Transactie"}</span>
            <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)", color: activeTransaction.type === "inkomsten" ? "var(--success)" : "var(--danger)" }}>
              {activeTransaction.type === "inkomsten" ? "+" : "-"}{formatEur(activeTransaction.amount)}
            </span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
