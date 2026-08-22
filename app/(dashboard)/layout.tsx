"use client";

import { useAuth } from "@/app/lib/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "@/app/ui/header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  if (!user) return null;

  return (
    <div className="page">
      <Header />
      <main className="main">{children}</main>
    </div>
  );
}
