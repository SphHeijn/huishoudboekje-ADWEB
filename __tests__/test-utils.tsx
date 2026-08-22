import React, { type ReactNode } from "react";
import { render, type RenderResult } from "@testing-library/react";
import { AuthContext } from "@/app/lib/contexts/auth-context";
import { BoekjeContext } from "@/app/lib/contexts/boekje-context";
import type { BoekjeDoc, TransactieDoc, CategorieDoc } from "@/app/lib/schemas";

export interface MockAuthContextValue {
  user: { uid: string; email: string } | null;
  loading: boolean;
  login: jest.Mock;
  register: jest.Mock;
  logout: jest.Mock;
}

export interface MockBoekjeContextValue {
  activeBoekjeId: string | null;
  activeBoekje: BoekjeDoc | null;
  filterMonth: string;
  boekjes: BoekjeDoc[];
  transacties: TransactieDoc[];
  categorieen: CategorieDoc[];
  loading: boolean;
  error: string | null;
  setActiveBoekje: jest.Mock;
  setFilterMonth: jest.Mock;
  createBoekje: jest.Mock;
  updateBoekje: jest.Mock;
  deleteBoekje: jest.Mock;
  createTransactie: jest.Mock;
  updateTransactie: jest.Mock;
  deleteTransactie: jest.Mock;
  createCategorie: jest.Mock;
  updateCategorie: jest.Mock;
  deleteCategorie: jest.Mock;
  deleteCategorieWithTransactions: jest.Mock;
  deleteCategorieKeepTransactions: jest.Mock;
}

export const defaultMockAuth: MockAuthContextValue = {
  user: { uid: "test-user-uid", email: "test@example.com" },
  loading: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
};

export const defaultMockBoekje: MockBoekjeContextValue = {
  activeBoekjeId: null,
  activeBoekje: null,
  filterMonth: "2026-05",
  boekjes: [],
  transacties: [],
  categorieen: [],
  loading: false,
  error: null,
  setActiveBoekje: jest.fn(),
  setFilterMonth: jest.fn(),
  createBoekje: jest.fn().mockResolvedValue("boekje-new-id"),
  updateBoekje: jest.fn().mockResolvedValue(undefined),
  deleteBoekje: jest.fn().mockResolvedValue(undefined),
  createTransactie: jest.fn().mockResolvedValue("trans-new-id"),
  updateTransactie: jest.fn().mockResolvedValue(undefined),
  deleteTransactie: jest.fn().mockResolvedValue(undefined),
  createCategorie: jest.fn().mockResolvedValue("cat-new-id"),
  updateCategorie: jest.fn().mockResolvedValue(undefined),
  deleteCategorie: jest.fn().mockResolvedValue(undefined),
  deleteCategorieWithTransactions: jest.fn().mockResolvedValue(undefined),
  deleteCategorieKeepTransactions: jest.fn().mockResolvedValue(undefined),
};

export function renderWithProviders(
  ui: React.ReactElement,
  {
    auth = defaultMockAuth,
    boekje = defaultMockBoekje,
  }: {
    auth?: MockAuthContextValue;
    boekje?: MockBoekjeContextValue;
  } = {}
): RenderResult {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AuthContext.Provider value={auth as unknown as MockAuthContextValue}>
        <BoekjeContext.Provider value={boekje as unknown as MockBoekjeContextValue}>
          {children}
        </BoekjeContext.Provider>
      </AuthContext.Provider>
    );
  }
  return render(ui, { wrapper: Wrapper });
}

export function createMockBoekje(overrides: Partial<BoekjeDoc> = {}): BoekjeDoc {
  return {
    id: "boekje-1",
    title: "Test Boekje",
    description: "A test boekje",
    currency: "EUR",
    createdAt: new Date("2026-01-01"),
    createdBy: "user-1",
    members: ["user-1"],
    ...overrides,
  };
}

export function createMockTransactie(overrides: Partial<TransactieDoc> = {}): TransactieDoc {
  return {
    id: "trans-1",
    boekjeId: "boekje-1",
    type: "uitgave",
    amount: 50.0,
    categoryId: "cat-1",
    date: "2026-05-15",
    description: "Test transaction",
    createdAt: new Date("2026-05-15"),
    createdBy: "user-1",
    ...overrides,
  };
}

export function createMockCategorie(overrides: Partial<CategorieDoc> = {}): CategorieDoc {
  return {
    id: "cat-1",
    name: "Boodschappen",
    icon: "🛒",
    color: "#4f46e5",
    createdAt: new Date("2026-01-01"),
    ...overrides,
  };
}
