"use client";

import { useDraggable } from "@dnd-kit/core";
import type { TransactieDoc } from "@/app/lib/schemas";
import { formatEur } from "@/app/lib/format";

interface Props {
  transaction: TransactieDoc;
}

export function DraggableTransaction({ transaction }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: transaction.id,
    data: { type: "transaction", transaction },
  });

  const style: React.CSSProperties = {
    padding: "8px 12px",
    background: "var(--surface)",
    border: isDragging ? "1px solid var(--primary)" : "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    cursor: "grab",
    fontSize: 13,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    opacity: isDragging ? 0.6 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: "border-color 0.12s ease",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <span>{transaction.description || "Transactie"}</span>
      <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)", color: transaction.type === "inkomsten" ? "var(--success)" : "var(--danger)" }}>
        {transaction.type === "inkomsten" ? "+" : "-"}{formatEur(transaction.amount)}
      </span>
    </div>
  );
}
