"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "motion/react";
import { formatEur } from "@/app/lib/format";
import type { TransactieDoc } from "@/app/lib/schemas";

interface Props {
  transacties: TransactieDoc[];
}

export function BalanceChart({ transacties }: Props) {
  const data = useMemo(() => {
    const days: Record<string, number> = {};
    const sorted = [...transacties].sort((a, b) => a.date.localeCompare(b.date));
    for (const t of sorted) {
      if (!days[t.date]) days[t.date] = 0;
      days[t.date] += t.type === "inkomsten" ? t.amount : -t.amount;
    }
    const dates = Object.keys(days).sort();
    const result: { date: string; saldo: number }[] = [];
    let running = 0;
    for (const date of dates) {
      running += days[date];
      result.push({ date, saldo: Math.round(running * 100) / 100 });
    }
    return result;
  }, [transacties]);

  if (data.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
        <h3 className="card-title" style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Saldoverloop</h3>
        <div className="empty-state" style={{ padding: 24 }}>
          <div className="empty-state-title">Nog geen data</div>
          <div className="empty-state-text">Voeg transacties toe om het saldoverloop te zien.</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="card"
    >
      <h3 className="card-title" style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Saldoverloop</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
            tickFormatter={(d) => new Date(d + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
            tickFormatter={(v) => `€${v}`}
          />
          <Tooltip
            formatter={(value) => [formatEur(Number(value)), "Saldo"]}
            labelFormatter={(d) => new Date(String(d) + "T00:00:00").toLocaleDateString("nl-NL")}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              fontSize: 12,
              color: "var(--text-primary)",
              fontFamily: "var(--font-mono)",
            }}
          />
          <Line
            type="monotone"
            dataKey="saldo"
            stroke="var(--primary)"
            strokeWidth={1.5}
            dot={{ fill: "var(--primary)", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
