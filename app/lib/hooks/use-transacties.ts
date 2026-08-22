"use client";

import { useCallback } from "react";
import { of } from "rxjs";
import type { Observable } from "rxjs";
import { subscribeTransacties } from "@/app/lib/services/firestore";
import { useObservable } from "@/app/lib/hooks/use-observable";
import type { TransactieDoc } from "@/app/lib/schemas";

interface UseTransactiesReturn {
  transacties: TransactieDoc[];
  loading: boolean;
  error: string | null;
}

export function useTransacties(
  boekjeId: string | undefined | null,
  filterMonth: string
): UseTransactiesReturn {
  const factory = useCallback(() => {
    if (!boekjeId) return of([]);
    return subscribeTransacties(boekjeId, filterMonth) as Observable<TransactieDoc[]>;
  }, [boekjeId, filterMonth]);

  const { data, loading } = useObservable(factory);
  return {
    transacties: data ?? [],
    loading: boekjeId ? loading : false,
    error: null,
  };
}
