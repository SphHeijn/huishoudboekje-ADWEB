"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "motion/react";
import { formatEur } from "@/app/lib/format";
import type { TransactieDoc, CategorieDoc } from "@/app/lib/schemas";

interface Props {
  transacties: TransactieDoc[];
  categorieen: CategorieDoc[];
}

export function CategoryChart({ transacties, categorieen }: Props) {
  const data = useMemo(() => {
    const byCat: Record<string, number> = {};
    const uitgaven = transacties.filter((t) => t.type === "uitgave");
    for (const t of uitgaven) {
      const key = t.categoryId || "__none__";
      byCat[key] = (byCat[key] ?? 0) + t.amount;
    }
    return Object.entries(byCat).map(([catId, amount]) => {
      if (catId === "__none__") {
        return { name: "Zonder categorie", color: "#9ca3af", icon: "", bedrag: Math.round(amount * 100) / 100 };
      }
      const cat = categorieen.find((c) => c.id === catId);
      return {
        name: cat?.name ?? "Onbekend",
        color: cat?.color ?? "#6b7280",
        icon: cat?.icon ?? "",
        bedrag: Math.round(amount * 100) / 100,
      };
    }).sort((a, b) => b.bedrag - a.bedrag);
  }, [transacties, categorieen]);

  if (data.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
        <h3 className="card-title" style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Uitgaven per categorie</h3>
        <div className="empty-state" style={{ padding: 24 }}>
          <div className="empty-state-title">Nog geen data</div>
          <div className="empty-state-text">Voeg uitgaven toe om de verdeling per categorie te zien.</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: 0.05 }}
      className="card"
    >
      <h3 className="card-title" style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Uitgaven per categorie</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
            tickFormatter={(v) => `€${v}`}
          />
          <Tooltip
            formatter={(value) => [formatEur(Number(value)), "Bedrag"]}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              fontSize: 12,
              color: "var(--text-primary)",
              fontFamily: "var(--font-mono)",
            }}
          />
          <Bar dataKey="bedrag" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
