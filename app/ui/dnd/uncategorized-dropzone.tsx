"use client";

import { useDroppable } from "@dnd-kit/core";
import { motion } from "motion/react";
import { DraggableTransaction } from "@/app/ui/dnd/draggable-transaction";
import type { TransactieDoc } from "@/app/lib/schemas";

interface Props {
  transacties: TransactieDoc[];
  isOver: boolean;
}

export function UncategorizedDropzone({ transacties, isOver }: Props) {
  const { setNodeRef } = useDroppable({
    id: "__uncategorized__",
    data: { type: "uncategorized" },
  });

  return (
    <motion.div
      ref={setNodeRef}
      animate={{
        scale: isOver ? 1.02 : 1,
        borderColor: isOver ? "var(--primary)" : "var(--border)",
      }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      style={{
        marginBottom: 20,
        padding: "10px 12px",
        border: `1px dashed ${isOver ? "var(--primary)" : "var(--border)"}`,
        borderRadius: "var(--radius-md)",
        background: isOver
          ? "color-mix(in srgb, var(--primary) 8%, var(--surface))"
          : "transparent",
        transition: "background 0.15s, border-color 0.15s",
        boxShadow: isOver
          ? "0 0 0 2px color-mix(in srgb, var(--primary) 20%, transparent)"
          : "none",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: transacties.length > 0 ? 8 : 0 }}>
        <span style={{ fontSize: 16 }}>📂</span>
        <div style={{ flex: 1 }}>
          <h4
            style={{
              fontSize: 13,
              fontWeight: 600,
              margin: 0,
              color: "var(--text-primary)",
            }}
          >
            Geen categorie ({transacties.length})
          </h4>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
            {isOver
              ? "Laat los om categorie te verwijderen"
              : transacties.length === 0
                ? "Sleep een transactie hierheen om de categorie te ontkoppelen"
                : `${transacties.length} transactie${transacties.length !== 1 ? "s" : ""}`}
          </div>
        </div>
      </div>

      {transacties.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {transacties.map((t) => (
            <DraggableTransaction key={t.id} transaction={t} />
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
