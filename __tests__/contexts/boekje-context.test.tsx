import { render, screen, waitFor, act } from "@testing-library/react";
import { BoekjeProvider, useBoekjeContext } from "@/app/lib/contexts/boekje-context";
import { useBoekjes } from "@/app/lib/hooks/use-boekjes";
import { useTransacties } from "@/app/lib/hooks/use-transacties";
import { useCategorieen } from "@/app/lib/hooks/use-categorieen";
import type { ReactNode } from "react";

jest.mock("@/app/lib/hooks/use-boekjes");
jest.mock("@/app/lib/hooks/use-transacties");
jest.mock("@/app/lib/hooks/use-categorieen");

jest.mock("@/app/lib/services/firestore", () => ({
  createBoekje: jest.fn(),
  updateBoekje: jest.fn(),
  deleteBoekje: jest.fn(),
  createTransactie: jest.fn(),
  updateTransactie: jest.fn(),
  deleteTransactie: jest.fn(),
  createCategorie: jest.fn(),
  updateCategorie: jest.fn(),
  deleteCategorie: jest.fn(),
}));

jest.mock("@/app/lib/contexts/auth-context", () => ({
  useAuth: () => ({
    user: { uid: "test-user-uid", email: "test@example.com" },
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  AuthContext: null,
}));

import {
  createBoekje as mockCreateBoekjeService,
  updateBoekje as mockUpdateBoekjeService,
  deleteBoekje as mockDeleteBoekjeService,
  createTransactie as mockCreateTransactieService,
  updateTransactie as mockUpdateTransactieService,
  deleteTransactie as mockDeleteTransactieService,
  createCategorie as mockCreateCategorieService,
  updateCategorie as mockUpdateCategorieService,
  deleteCategorie as mockDeleteCategorieService,
} from "@/app/lib/services/firestore";

beforeEach(() => {
  jest.clearAllMocks();
  (useBoekjes as jest.Mock).mockReturnValue({
    boekjes: [],
    loading: false,
    error: null,
  });
  (useTransacties as jest.Mock).mockReturnValue({
    transacties: [],
    loading: false,
    error: null,
  });
  (useCategorieen as jest.Mock).mockReturnValue({
    categorieen: [],
    loading: false,
    error: null,
  });
});

function TestConsumer() {
  const ctx = useBoekjeContext();
  return (
    <div>
      <span data-testid="boekjes-count">{ctx.boekjes.length}</span>
      <span data-testid="active-id">{ctx.activeBoekjeId ?? "null"}</span>
      <button data-testid="set-active" onClick={() => ctx.setActiveBoekje("b1")}>setActive</button>
      <button data-testid="create-boekje" onClick={() => ctx.createBoekje({ title: "New", currency: "EUR" })}>createBoekje</button>
      <button data-testid="delete-boekje" onClick={() => ctx.deleteBoekje("b1")}>deleteBoekje</button>
      <button data-testid="update-boekje" onClick={() => ctx.updateBoekje("b1", { title: "Updated" })}>updateBoekje</button>
      <button data-testid="create-transactie" onClick={() => ctx.createTransactie({ boekjeId: "b1", type: "uitgave", amount: 10, categoryId: "c1", date: "2026-05-01" })}>createTransactie</button>
      <button data-testid="update-transactie" onClick={() => ctx.updateTransactie("b1", "t1", { amount: 20 })}>updateTransactie</button>
      <button data-testid="delete-transactie" onClick={() => ctx.deleteTransactie("b1", "t1")}>deleteTransactie</button>
      <button data-testid="create-categorie" onClick={() => ctx.createCategorie("b1", { name: "New Cat", type: "beide" })}>createCategorie</button>
      <button data-testid="update-categorie" onClick={() => ctx.updateCategorie("b1", "c1", { name: "Renamed" })}>updateCategorie</button>
      <button data-testid="delete-categorie" onClick={() => ctx.deleteCategorie("b1", "c1")}>deleteCategorie</button>
    </div>
  );
}

function renderWithProviders(children: ReactNode) {
  return render(<BoekjeProvider>{children}</BoekjeProvider>);
}

it("provides data from hooks", () => {
  renderWithProviders(<TestConsumer />);
  expect(screen.getByTestId("boekjes-count").textContent).toBe("0");
});

it("setActiveBoekje updates state", async () => {
  renderWithProviders(<TestConsumer />);
  await act(async () => {
    screen.getByTestId("set-active").click();
  });
  await waitFor(() => {
    expect(screen.getByTestId("active-id").textContent).toBe("b1");
  });
});

it("calls service methods", async () => {
  renderWithProviders(<TestConsumer />);

  await act(async () => {
    screen.getByTestId("create-boekje").click();
  });
  expect(mockCreateBoekjeService).toHaveBeenCalled();

  await act(async () => {
    screen.getByTestId("delete-boekje").click();
  });
  expect(mockDeleteBoekjeService).toHaveBeenCalledWith("b1");

  await act(async () => {
    screen.getByTestId("update-boekje").click();
  });
  expect(mockUpdateBoekjeService).toHaveBeenCalledWith("b1", { title: "Updated" });

  await act(async () => {
    screen.getByTestId("create-transactie").click();
  });
  expect(mockCreateTransactieService).toHaveBeenCalled();

  await act(async () => {
    screen.getByTestId("update-transactie").click();
  });
  expect(mockUpdateTransactieService).toHaveBeenCalledWith("b1", "t1", { amount: 20 });

  await act(async () => {
    screen.getByTestId("delete-transactie").click();
  });
  expect(mockDeleteTransactieService).toHaveBeenCalledWith("b1", "t1");

  await act(async () => {
    screen.getByTestId("create-categorie").click();
  });
  expect(mockCreateCategorieService).toHaveBeenCalled();

  await act(async () => {
    screen.getByTestId("update-categorie").click();
  });
  expect(mockUpdateCategorieService).toHaveBeenCalledWith("b1", "c1", { name: "Renamed" });

  await act(async () => {
    screen.getByTestId("delete-categorie").click();
  });
  expect(mockDeleteCategorieService).toHaveBeenCalledWith("b1", "c1");
});

it("throws useBoekjeContext error when used outside provider", () => {
  function BadConsumer() {
    useBoekjeContext();
    return null;
  }
  expect(() => render(<BadConsumer />)).toThrow(
    "useBoekjeContext moet binnen een BoekjeProvider worden gebruikt"
  );
});
