"use client";

import { useDroppable } from "@dnd-kit/core";
import { motion } from "motion/react";
import { DraggableTransaction } from "@/app/ui/dnd/draggable-transaction";
import type { CategorieDoc, TransactieDoc } from "@/app/lib/schemas";

interface Props {
  categorie: CategorieDoc;
  transacties: TransactieDoc[];
  isOver: boolean;
}

export function CategoryDropzone({ categorie, transacties, isOver }: Props) {
  const { setNodeRef } = useDroppable({
    id: categorie.id,
    data: { type: "category", categorie },
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
        padding: "10px 12px",
        background: isOver
          ? "color-mix(in srgb, var(--primary) 8%, var(--surface))"
          : "var(--surface)",
        border: `1px solid ${isOver ? "var(--primary)" : "var(--border)"}`,
        borderRadius: "var(--radius-md)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        boxShadow: isOver
          ? "0 0 0 2px color-mix(in srgb, var(--primary) 20%, transparent)"
          : "none",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 16 }}>{categorie.icon || "📁"}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{categorie.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
            {isOver
              ? "Laat los om te koppelen"
              : transacties.length === 0
                ? "Sleep een uitgave hierheen"
                : `${transacties.length} transactie${transacties.length !== 1 ? "s" : ""}`}
          </div>
        </div>
      </div>

      {transacties.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            marginLeft: 26,
            paddingLeft: 10,
            borderLeft: "2px solid var(--border)",
          }}
        >
          {transacties.map((t) => (
            <DraggableTransaction key={t.id} transaction={t} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
