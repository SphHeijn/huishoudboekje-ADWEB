"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBoekjeContext } from "@/app/lib/contexts/boekje-context";
import { useAuth } from "@/app/lib/contexts/auth-context";
import { getUserByEmail, getUserEmails } from "@/app/lib/services/firestore";
import { translateFirebaseError } from "@/app/lib/format";
import { FirebaseError } from "firebase/app";
import { TransactieList } from "@/app/ui/transactie-list";
import { CategorieManager } from "@/app/ui/categorie-manager";
import { BalanceChart } from "@/app/ui/charts/balance-chart";
import { CategoryChart } from "@/app/ui/charts/category-chart";
import { TransactionDndWrapper } from "@/app/ui/dnd/transaction-dnd-wrapper";
import { motion } from "motion/react";
import { ConfirmDialog } from "@/app/ui/confirm-dialog";

type Tab = "transacties" | "categorieen" | "grafieken" | "koppelen" | "deelnemers";

const TABS: { key: Tab; label: string }[] = [
  { key: "transacties", label: "Transacties" },
  { key: "categorieen", label: "Categorieën" },
  { key: "grafieken", label: "Grafieken" },
  { key: "koppelen", label: "Slepen & Koppelen" },
  { key: "deelnemers", label: "Deelnemers" },
];

export default function BoekjeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { activeBoekje, setActiveBoekje, transacties, categorieen, filterMonth, setFilterMonth, updateBoekje } = useBoekjeContext();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<Tab>("transacties");
  const [memberEmails, setMemberEmails] = useState<Record<string, string>>({});
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [memberRemoveError, setMemberRemoveError] = useState("");
  const [memberRemoving, setMemberRemoving] = useState(false);

  useEffect(() => {
    if (activeBoekje?.id !== id) {
      setActiveBoekje(id);
    }
  }, [id, activeBoekje?.id, setActiveBoekje]);

  useEffect(() => {
    if (activeBoekje?.members) {
      getUserEmails(activeBoekje.members).then(setMemberEmails);
    }
  }, [activeBoekje?.members]);

  if (!activeBoekje) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  if (activeBoekje.archived) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <div className="empty-state-icon">📦</div>
        <div className="empty-state-title">Boekje is gearchiveerd</div>
        <div className="empty-state-text">
          Dit huishoudboekje is gearchiveerd en kan niet worden bekeken. Herstel het boekje vanuit het dashboard om het opnieuw te openen.
        </div>
        <button className="btn btn-primary" onClick={() => router.push("/")} style={{ marginTop: 12 }}>
          Terug naar dashboard
        </button>
      </div>
    );
  }

  const isMember = user && activeBoekje.members.includes(user.uid);
  if (!isMember) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <div className="empty-state-icon">🚫</div>
        <div className="empty-state-title">Geen toegang</div>
        <div className="empty-state-text">
          Je bent geen lid van dit huishoudboekje en hebt daarom geen toestemming om dit te bekijken.
        </div>
        <button className="btn btn-primary" onClick={() => router.push("/")} style={{ marginTop: 12 }}>
          Terug naar dashboard
        </button>
      </div>
    );
  }

  const isOwner = user?.uid === (activeBoekje.createdBy ?? activeBoekje.members[0]);

  async function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeBoekje) return;
    setInviteError("");
    setInviteSuccess("");
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    try {
      const emailLower = inviteEmail.trim().toLowerCase();
      const targetUid = await getUserByEmail(emailLower);
      if (!targetUid) {
        setInviteError("Gebruiker met dit e-mailadres is niet geregistreerd.");
        setInviteLoading(false);
        return;
      }

      if (activeBoekje.members.includes(targetUid)) {
        setInviteError("Deze gebruiker is al deelnemer van dit boekje.");
        setInviteLoading(false);
        return;
      }

      const newMembers = [...activeBoekje.members, targetUid];
      await updateBoekje(activeBoekje.id, { members: newMembers });
      setInviteSuccess("Deelnemer succesvol toegevoegd!");
      setInviteEmail("");
    } catch (err) {
      if (err instanceof FirebaseError && err.code === "permission-denied") {
        setInviteError("Je hebt geen toestemming om deelnemers toe te voegen. Mogelijk zijn de beveiligingsregels niet goed ingesteld.");
      } else {
        setInviteError(translateFirebaseError(err));
      }
    } finally {
      setInviteLoading(false);
    }
  }

  function handleRemoveMember(uidToRemove: string) {
    if (!activeBoekje) return;
    if (uidToRemove === activeBoekje.createdBy) return;
    setMemberRemoveError("");
    setMemberToRemove(uidToRemove);
  }

  async function handleConfirmRemoveMember() {
    if (!activeBoekje || !memberToRemove) return;
    setMemberRemoving(true);
    setMemberRemoveError("");
    try {
      const newMembers = activeBoekje.members.filter((m) => m !== memberToRemove);
      await updateBoekje(activeBoekje.id, { members: newMembers });
      setMemberToRemove(null);
    } catch (err) {
      const msg = err instanceof FirebaseError && err.code === "permission-denied"
        ? "Je hebt geen toestemming om deelnemers te verwijderen."
        : translateFirebaseError(err);
      setMemberRemoveError(msg);
    } finally {
      setMemberRemoving(false);
    }
  }

  const months = generateMonths();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 16 }}>
        <h1 style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 600 }}>{activeBoekje.title}</h1>
        {activeTab !== "deelnemers" && (
          <div className="form-group" style={{ width: 140 }}>
            <select className="form-input" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{ padding: "4px 24px 4px 8px", height: 28, fontSize: 12 }}>
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      {activeBoekje.description && (
        <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 12, marginTop: 2 }}>{activeBoekje.description}</p>
      )}

      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? "tab-active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "transacties" && <TransactieList />}
      {activeTab === "categorieen" && <CategorieManager />}
      {activeTab === "grafieken" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <BalanceChart transacties={transacties} />
          <CategoryChart transacties={transacties} categorieen={categorieen} />
        </div>
      )}
      {activeTab === "koppelen" && <TransactionDndWrapper />}
      
      {memberRemoveError && (
        <div className="error-message" style={{ marginBottom: 12 }}>
          {memberRemoveError}
        </div>
      )}

      <ConfirmDialog
        open={memberToRemove !== null}
        title="Deelnemer verwijderen"
        message="Weet je zeker dat je deze deelnemer wilt verwijderen?"
        confirmLabel="Verwijderen"
        cancelLabel="Annuleren"
        variant="danger"
        onConfirm={handleConfirmRemoveMember}
        onCancel={() => setMemberToRemove(null)}
        loading={memberRemoving}
      />

      {activeTab === "deelnemers" && (
        <div className="grid-2" style={{ gap: 24, marginTop: 16 }}>
          <div className="card">
            <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              Huidige deelnemers
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeBoekje.members.map((uid) => {
                const email = memberEmails[uid] || "Laden...";
                const isOwnerItem = uid === activeBoekje.createdBy;
                return (
                  <div
                    key={uid}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{email}</div>
                      <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 2 }}>
                        UID: <span style={{ fontFamily: "var(--font-mono)" }}>{uid}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        className={`badge ${isOwnerItem ? "badge-primary" : "badge-secondary"}`}
                        style={{ fontSize: 10 }}
                      >
                        {isOwnerItem ? "Eigenaar" : "Deelnemer"}
                      </span>
                      {isOwner && !isOwnerItem && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleRemoveMember(uid)}
                          style={{ padding: "2px 6px", fontSize: 11, cursor: "pointer" }}
                          title="Deelnemer verwijderen"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              Deelnemer toevoegen
            </h3>
            <form onSubmit={handleInviteSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="invite-email-input">E-mailadres</label>
                <input
                  id="invite-email-input"
                  className="form-input"
                  type="email"
                  placeholder="deelnemer@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              {inviteError && <div className="error-message">{inviteError}</div>}
              {inviteSuccess && (
                <div
                  style={{
                    color: "var(--success)",
                    fontSize: 12,
                    padding: "8px 12px",
                    background: "rgba(16, 185, 129, 0.1)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--success)",
                  }}
                >
                  {inviteSuccess}
                </div>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={inviteLoading}
                style={{ alignSelf: "flex-end" }}
              >
                {inviteLoading ? "Bezig..." : "Toevoegen"}
              </button>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function generateMonths() {
  const months: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
    months.push({ value, label });
  }
  return months;
}
