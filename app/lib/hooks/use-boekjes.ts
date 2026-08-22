"use client";

import { useCallback } from "react";
import { retry, catchError, timer } from "rxjs";
import { Observable, of, throwError } from "rxjs";
import { subscribeBoekjes } from "@/app/lib/services/firestore";
import { useObservable } from "@/app/lib/hooks/use-observable";
import { translateFirebaseError } from "@/app/lib/format";
import type { BoekjeDoc } from "@/app/lib/schemas";

interface UseBoekjesReturn {
  boekjes: BoekjeDoc[];
  loading: boolean;
  error: string | null;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

function isPermissionError(error: Error): boolean {
  return (
    error.message.includes("permission-denied") ||
    error.message.includes("Missing or insufficient permissions")
  );
}

export function useBoekjes(
  userId: string | undefined,
  refreshKey = 0
): UseBoekjesReturn {
  const factory = useCallback(() => {
    if (!userId) return of([]);
    return subscribeBoekjes(userId).pipe(
      retry({
        count: MAX_RETRIES,
        delay: (error: Error) => {
          if (isPermissionError(error)) return timer(RETRY_DELAY);
          return throwError(() => error);
        },
      }),
      catchError((error: Error) => {
        if (isPermissionError(error)) return of([]);
        return throwError(() => new Error(translateFirebaseError(error)));
      })
    ) as Observable<BoekjeDoc[]>;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, refreshKey]);

  const { data, loading, error } = useObservable(factory);
  return { boekjes: data ?? [], loading, error };
}
