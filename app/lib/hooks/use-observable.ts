"use client";

import { useEffect, useState } from "react";
import { type Observable } from "rxjs";

export interface UseObservableResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useObservable<T>(
  factory: () => Observable<T>
): UseObservableResult<T> {
  const [state, setState] = useState<UseObservableResult<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const subscription = factory().subscribe({
      next: (data) => setState({ data, loading: false, error: null }),
      error: (err) =>
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        }),
    });

    return () => subscription.unsubscribe();
  }, [factory]);

  return state;
}
