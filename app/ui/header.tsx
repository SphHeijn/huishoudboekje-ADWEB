"use client";

import { useAuth } from "@/app/lib/contexts/auth-context";
import { useBoekjeContext } from "@/app/lib/contexts/boekje-context";
import { useRouter } from "next/navigation";
import { CustomSelect } from "@/app/ui/custom-select";

export function Header() {
  const { user, logout } = useAuth();
  const { activeBoekje, setActiveBoekje, boekjes } = useBoekjeContext();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header
      style={{
        height: "var(--header-height)",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={() => {
            setActiveBoekje(null);
            router.push("/");
          }}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 14,
            fontWeight: 600,
            background: "none",
            border: "none",
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          Huishoudboekje
        </button>
        <CustomSelect
          value={activeBoekje?.id ?? ""}
          onChange={(id) => {
            if (id) {
              setActiveBoekje(id);
              router.push(`/boekje/${id}`);
            } else {
              setActiveBoekje(null);
              router.push("/");
            }
          }}
          options={boekjes.map((b) => ({ value: b.id, label: b.title }))}
          placeholder="Kies een boekje..."
          style={{ minWidth: 160 }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
          {user?.email}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ padding: "4px 8px", fontSize: 11 }}>
          Uitloggen
        </button>
      </div>
    </header>
  );
}
