"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/contexts/auth-context";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  if (user) return null;

  return <div className="center" style={{ minHeight: "100vh", padding: 24 }}>{children}</div>;
}
