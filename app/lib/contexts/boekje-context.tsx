"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/app/lib/contexts/auth-context";
import { useBoekjes } from "@/app/lib/hooks/use-boekjes";
import { useTransacties } from "@/app/lib/hooks/use-transacties";
import { useCategorieen } from "@/app/lib/hooks/use-categorieen";
import {
  createBoekje as createBoekjeService,
  updateBoekje as updateBoekjeService,
  deleteBoekje as deleteBoekjeService,
  createTransactie as createTransactieService,
  updateTransactie as updateTransactieService,
  deleteTransactie as deleteTransactieService,
  createCategorie as createCategorieService,
  updateCategorie as updateCategorieService,
  deleteCategorie as deleteCategorieService,
  deleteCategorieWithTransactions as deleteCategorieWithTransactionsService,
  unlinkTransactionsFromCategory as unlinkTransactionsFromCategoryService,
} from "@/app/lib/services/firestore";
import type {
  Boekje,
  Transactie,
  Categorie,
  BoekjeDoc,
  TransactieDoc,
  CategorieDoc,
} from "@/app/lib/schemas";

// ───── Reducer ─────

interface BoekjeState {
  activeBoekjeId: string | null;
  filterMonth: string;
}

type BoekjeAction =
  | { type: "SET_ACTIVE_BOEKJE"; payload: string | null }
  | { type: "SET_FILTER_MONTH"; payload: string };

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function boekjeReducer(state: BoekjeState, action: BoekjeAction): BoekjeState {
  switch (action.type) {
    case "SET_ACTIVE_BOEKJE":
      return { ...state, activeBoekjeId: action.payload };
    case "SET_FILTER_MONTH":
      return { ...state, filterMonth: action.payload };
    default:
      return state;
  }
}

const initialState: BoekjeState = {
  activeBoekjeId: null,
  filterMonth: getCurrentMonth(),
};

// ───── Context ─────

interface BoekjeContextValue {
  activeBoekjeId: string | null;
  activeBoekje: BoekjeDoc | null;
  filterMonth: string;
  boekjes: BoekjeDoc[];
  transacties: TransactieDoc[];
  categorieen: CategorieDoc[];
  loading: boolean;
  error: string | null;
  setActiveBoekje: (id: string | null) => void;
  setFilterMonth: (month: string) => void;
  createBoekje: (data: Boekje) => Promise<string>;
  updateBoekje: (id: string, data: Partial<Boekje & { members: string[] }>) => Promise<void>;
  deleteBoekje: (id: string) => Promise<void>;
  createTransactie: (data: Transactie) => Promise<string>;
  updateTransactie: (
    boekjeId: string,
    id: string,
    data: Partial<Transactie>
  ) => Promise<void>;
  deleteTransactie: (boekjeId: string, id: string) => Promise<void>;
  createCategorie: (boekjeId: string, data: Categorie) => Promise<string>;
  updateCategorie: (
    boekjeId: string,
    id: string,
    data: Partial<Categorie>
  ) => Promise<void>;
  deleteCategorie: (boekjeId: string, id: string) => Promise<void>;
  deleteCategorieWithTransactions: (boekjeId: string, categoryId: string) => Promise<void>;
  deleteCategorieKeepTransactions: (boekjeId: string, categoryId: string) => Promise<void>;
}

export const BoekjeContext = createContext<BoekjeContextValue | null>(null);

// ───── Provider ─────

export function BoekjeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(boekjeReducer, initialState);
  const [boekjesKey, setBoekjesKey] = useState(0);

  const { boekjes, loading: boekjesLoading, error: boekjesError } = useBoekjes(
    user?.uid,
    boekjesKey
  );
  const {
    transacties,
    loading: transactiesLoading,
    error: transactiesError,
  } = useTransacties(state.activeBoekjeId, state.filterMonth);
  const {
    categorieen,
    loading: categorieenLoading,
    error: categorieenError,
  } = useCategorieen(state.activeBoekjeId);

  const activeBoekje =
    boekjes.find((b) => b.id === state.activeBoekjeId) ?? null;
  const loading = boekjesLoading || transactiesLoading || categorieenLoading;
  const error = boekjesError ?? transactiesError ?? categorieenError ?? null;

  const setActiveBoekje = useCallback(
    (id: string | null) => dispatch({ type: "SET_ACTIVE_BOEKJE", payload: id }),
    []
  );
  const setFilterMonth = useCallback(
    (month: string) =>
      dispatch({ type: "SET_FILTER_MONTH", payload: month }),
    []
  );

  const crud = useCrudMethods(user?.uid, () => setBoekjesKey((k) => k + 1));

  return (
    <BoekjeContext.Provider
      value={{
        activeBoekjeId: state.activeBoekjeId,
        activeBoekje,
        filterMonth: state.filterMonth,
        boekjes,
        transacties,
        categorieen,
        loading,
        error,
        setActiveBoekje,
        setFilterMonth,
        ...crud,
      }}
    >
      {children}
    </BoekjeContext.Provider>
  );
}

function useCrudMethods(userId: string | undefined, onBoekjeChange: () => void) {
  const createBoekje = useCallback(
    async (data: Boekje) => {
      if (!userId) throw new Error("Niet geauthenticeerd");
      const id = await createBoekjeService(data, userId);
      onBoekjeChange();
      return id;
    },
    [userId, onBoekjeChange]
  );

  const updateBoekje = useCallback(
    async (id: string, data: Partial<Boekje & { members: string[] }>) => {
      await updateBoekjeService(id, data);
    },
    []
  );

  const deleteBoekje = useCallback(
    async (id: string) => {
      await deleteBoekjeService(id);
      onBoekjeChange();
    },
    [onBoekjeChange]
  );

  const createTransactie = useCallback(
    async (data: Transactie) => {
      if (!userId) throw new Error("Niet geauthenticeerd");
      return createTransactieService(data, userId);
    },
    [userId]
  );

  const updateTransactie = useCallback(
    async (
      boekjeId: string,
      id: string,
      data: Partial<Transactie>
    ) => {
      await updateTransactieService(boekjeId, id, data);
    },
    []
  );

  const deleteTransactie = useCallback(
    async (boekjeId: string, id: string) => {
      await deleteTransactieService(boekjeId, id);
    },
    []
  );

  const createCategorie = useCallback(
    async (boekjeId: string, data: Categorie) => {
      if (!userId) throw new Error("Niet geauthenticeerd");
      return createCategorieService(boekjeId, data, userId);
    },
    [userId]
  );

  const updateCategorie = useCallback(
    async (
      boekjeId: string,
      id: string,
      data: Partial<Categorie>
    ) => {
      await updateCategorieService(boekjeId, id, data);
    },
    []
  );

  const deleteCategorie = useCallback(
    async (boekjeId: string, id: string) => {
      await deleteCategorieService(boekjeId, id);
    },
    []
  );

  const deleteCategorieWithTransactions = useCallback(
    async (boekjeId: string, categoryId: string) => {
      await deleteCategorieWithTransactionsService(boekjeId, categoryId);
    },
    []
  );

  const deleteCategorieKeepTransactions = useCallback(
    async (boekjeId: string, categoryId: string) => {
      await unlinkTransactionsFromCategoryService(boekjeId, categoryId);
    },
    []
  );

  return {
    createBoekje,
    updateBoekje,
    deleteBoekje,
    createTransactie,
    updateTransactie,
    deleteTransactie,
    createCategorie,
    updateCategorie,
    deleteCategorie,
    deleteCategorieWithTransactions,
    deleteCategorieKeepTransactions,
  };
}

// ───── Hook ─────

export function useBoekjeContext() {
  const context = useContext(BoekjeContext);
  if (!context) {
    throw new Error("useBoekjeContext moet binnen een BoekjeProvider worden gebruikt");
  }
  return context;
}
