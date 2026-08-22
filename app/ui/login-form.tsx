"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/lib/contexts/auth-context";
import { translateFirebaseError } from "@/app/lib/format";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err: unknown) {
      setError(translateFirebaseError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ width: 360, maxWidth: "100%" }}>
      <h1 style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Inloggen</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16 }}>
        Welkom terug bij Huishoudboekje
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label className="form-label" htmlFor="email">E-mail</label>
          <input id="email" className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="naam@voorbeeld.nl" required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="password">Wachtwoord</label>
          <input id="password" className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: 4 }}>
          {loading ? "Bezig..." : "Inloggen"}
        </button>
      </form>
      <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-secondary)", marginTop: 16 }}>
        Nog geen account?{" "}
        <Link href="/register" style={{ color: "var(--primary)", fontWeight: 500 }}>Registreer</Link>
      </p>
    </div>
  );
}
