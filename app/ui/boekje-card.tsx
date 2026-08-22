"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useBoekjeContext } from "@/app/lib/contexts/boekje-context";
import { useState } from "react";
import type { BoekjeDoc } from "@/app/lib/schemas";

import { useAuth } from "@/app/lib/contexts/auth-context";
import { translateFirebaseError } from "@/app/lib/format";
import { ConfirmDialog } from "@/app/ui/confirm-dialog";

function IconPencil() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function IconArchive() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  );
}

function IconRestore() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M12 11v6" />
      <path d="m9 14 3-3 3 3" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function BoekjeCard({ boekje, onEdit }: { boekje: BoekjeDoc; onEdit?: () => void }) {
  const router = useRouter();
  const { setActiveBoekje, deleteBoekje, updateBoekje } = useBoekjeContext();
  const { user } = useAuth();
  const [removing, setRemoving] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"delete" | "archive" | null>(null);
  const [error, setError] = useState("");

  const isOwner = user?.uid === (boekje.createdBy ?? boekje.members[0]);

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmAction("delete");
  }

  function handleConfirmAction() {
    if (confirmAction === "delete") {
      setRemoving(true);
      setConfirmAction(null);
      setTimeout(async () => {
        try {
          await deleteBoekje(boekje.id);
        } catch (err) {
          setError(translateFirebaseError(err));
          setRemoving(false);
        }
      }, 300);
    } else if (confirmAction === "archive") {
      setConfirmAction(null);
      updateBoekje(boekje.id, { archived: true }).catch((err) =>
        setError(translateFirebaseError(err))
      );
    }
  }

  async function handleArchive(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmAction("archive");
  }

  async function handleRestore(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await updateBoekje(boekje.id, { archived: false });
    } catch (err) {
      setError(translateFirebaseError(err));
    }
  }

  function handleEditClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (onEdit) onEdit();
  }

  function handleClick() {
    if (boekje.archived) return;
    setActiveBoekje(boekje.id);
    router.push(`/boekje/${boekje.id}`);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={removing ? { opacity: 0, scale: 0.98 } : { opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="card"
      onClick={handleClick}
      style={{ cursor: boekje.archived ? "default" : "pointer", transition: "border-color 0.1s ease" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, marginRight: 12 }}>
          <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: boekje.archived ? "var(--text-secondary)" : "var(--text-primary)" }}>
            {boekje.title} {boekje.archived && <span style={{ fontSize: 10, color: "var(--text-secondary)", fontStyle: "italic" }}>(gearchiveerd)</span>}
          </h3>
          {boekje.description && (
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.4 }}>
              {boekje.description}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
          <span className="badge badge-primary" style={{ fontSize: 10 }}>
            {boekje.members.length} {boekje.members.length === 1 ? "lid" : "leden"}
          </span>
          {isOwner && (
            <div style={{ display: "flex", gap: 4 }}>
              {!boekje.archived ? (
                <>
                  <button className="btn btn-ghost btn-sm" onClick={handleEditClick} style={{ padding: "2px 6px", display: "flex" }} title="Bewerken">
                    <IconPencil />
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={handleArchive} style={{ padding: "2px 6px", display: "flex" }} title="Archiveer">
                    <IconArchive />
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-ghost btn-sm" onClick={handleRestore} style={{ padding: "2px 6px", display: "flex" }} title="Herstellen">
                    <IconRestore />
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={handleDelete} style={{ padding: "2px 6px", display: "flex" }} title="Verwijderen">
                    <IconX />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="error-message" style={{ marginTop: 8 }}>
          {error}
        </div>
      )}
      <ConfirmDialog
        open={confirmAction !== null}
        title={confirmAction === "delete" ? "Boekje verwijderen" : "Boekje archiveren"}
        message={
          confirmAction === "delete"
            ? `Weet je zeker dat je "${boekje.title}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`
            : `Weet je zeker dat je "${boekje.title}" wilt archiveren?`
        }
        confirmLabel={confirmAction === "delete" ? "Verwijderen" : "Archiveren"}
        cancelLabel="Annuleren"
        variant="danger"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
    </motion.div>
  );
}
