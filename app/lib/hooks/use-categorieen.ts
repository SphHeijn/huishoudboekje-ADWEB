"use client";

import { useCallback } from "react";
import { of } from "rxjs";
import type { Observable } from "rxjs";
import { subscribeCategorieen } from "@/app/lib/services/firestore";
import { useObservable } from "@/app/lib/hooks/use-observable";
import type { CategorieDoc } from "@/app/lib/schemas";

interface UseCategorieenReturn {
  categorieen: CategorieDoc[];
  loading: boolean;
  error: string | null;
}

export function useCategorieen(
  boekjeId: string | undefined | null
): UseCategorieenReturn {
  const factory = useCallback(() => {
    if (!boekjeId) return of([]);
    return subscribeCategorieen(boekjeId) as Observable<CategorieDoc[]>;
  }, [boekjeId]);

  const { data, loading } = useObservable(factory);
  return {
    categorieen: data ?? [],
    loading: boekjeId ? loading : false,
    error: null,
  };
}
