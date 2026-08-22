"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="center" style={{ minHeight: "100vh", padding: 24 }}>
      <div className="card" style={{ maxWidth: 480, textAlign: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Er ging iets mis</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
          {error.message || "Er is een fout opgetreden. Probeer het opnieuw."}
        </p>
        <button className="btn btn-primary" onClick={reset}>
          Opnieuw proberen
        </button>
      </div>
    </div>
  );
}
