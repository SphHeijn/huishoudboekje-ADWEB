import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransactieList } from "@/app/ui/transactie-list";
import {
  renderWithProviders,
  defaultMockBoekje,
  createMockTransactie,
  createMockCategorie,
} from "../test-utils";

beforeEach(() => {
  jest.clearAllMocks();
});

it("renders summary cards with zeros when no transactions", () => {
  renderWithProviders(<TransactieList />);
  expect(screen.getByText("Inkomsten")).toBeInTheDocument();
  expect(screen.getByText("Uitgaven")).toBeInTheDocument();
  expect(screen.getByText("Balans")).toBeInTheDocument();
  const amounts = screen.getAllByText("€ 0,00");
  expect(amounts.length).toBe(3);
});

it("renders empty state when no transactions", () => {
  renderWithProviders(<TransactieList />);
  expect(screen.getByText("Nog geen transacties")).toBeInTheDocument();
  expect(
    screen.getByText("Voeg de eerste uitgave of inkomsten toe voor deze maand.")
  ).toBeInTheDocument();
});

it("renders transaction rows", () => {
  const transacties = [
    createMockTransactie({
      id: "t1",
      description: "Boodschappen",
      amount: 45.5,
      date: "2026-05-15",
      categoryId: "cat-1",
    }),
    createMockTransactie({
      id: "t2",
      type: "inkomsten",
      description: "Salaris",
      amount: 3000,
      date: "2026-05-01",
      categoryId: "cat-2",
    }),
  ];
  const categorieen = [
    createMockCategorie({ id: "cat-1", name: "Boodschappen", color: "#ef4444" }),
    createMockCategorie({ id: "cat-2", name: "Salaris", color: "#10b981" }),
  ];
  renderWithProviders(<TransactieList />, {
    boekje: { ...defaultMockBoekje, transacties, categorieen, activeBoekjeId: "boekje-1" },
  });
  expect(screen.getByText("Boodschappen")).toBeInTheDocument();
  expect(screen.getByText("Salaris")).toBeInTheDocument();
});

it("shows correct income/expenses/balance summaries", () => {
  const transacties = [
    createMockTransactie({ id: "t1", type: "uitgave", amount: 100 }),
    createMockTransactie({ id: "t2", type: "inkomsten", amount: 500 }),
    createMockTransactie({ id: "t3", type: "uitgave", amount: 50 }),
  ];
  renderWithProviders(<TransactieList />, {
    boekje: { ...defaultMockBoekje, transacties, activeBoekjeId: "boekje-1" },
  });
  const amounts = screen.getAllByText(/€\s[\d.]+,\d{2}/);
  expect(amounts.length).toBeGreaterThanOrEqual(3);
});

it("shows income with + sign and expense with - sign", () => {
  const transacties = [
    createMockTransactie({ id: "t1", type: "inkomsten", amount: 200 }),
    createMockTransactie({ id: "t2", type: "uitgave", amount: 50 }),
  ];
  renderWithProviders(<TransactieList />, {
    boekje: { ...defaultMockBoekje, transacties, activeBoekjeId: "boekje-1" },
  });
  expect(screen.getByText(/^\+€/)).toBeInTheDocument();
  expect(screen.getByText(/^\-€/)).toBeInTheDocument();
});

it("shows new transaction form when clicking + Nieuwe transactie", async () => {
  const user = userEvent.setup();
  renderWithProviders(<TransactieList />, {
   boekje: { ...defaultMockBoekje, activeBoekjeId: "boekje-1" },
  });
  await user.click(screen.getByText("+ Nieuwe transactie"));
  expect(screen.getByText("Nieuwe transactie")).toBeInTheDocument();
});

it("calls deleteTransactie when delete button is clicked", async () => {
  const user = userEvent.setup();
  const mockDeleteTransactie = jest.fn().mockResolvedValue(undefined);
  const transacties = [createMockTransactie({ id: "t1" })];
  renderWithProviders(<TransactieList />, {
    boekje: {
      ...defaultMockBoekje,
      transacties,
      activeBoekjeId: "boekje-1",
      deleteTransactie: mockDeleteTransactie,
    },
  });
  const deleteButtons = screen.getAllByText("✕");
  await user.click(deleteButtons[0]);
  expect(mockDeleteTransactie).toHaveBeenCalledWith("boekje-1", "t1");
});

it("shows edit form when edit button is clicked", async () => {
  const user = userEvent.setup();
  const transacties = [createMockTransactie({ id: "t1", description: "Test" })];
  renderWithProviders(<TransactieList />, {
    boekje: { ...defaultMockBoekje, transacties, activeBoekjeId: "boekje-1" },
  });
  const editButton = screen.getByText("✎");
  await user.click(editButton);
  expect(screen.getByText("Transactie bewerken")).toBeInTheDocument();
});

it("handles unknown category gracefully", () => {
  const transacties = [
    createMockTransactie({
      id: "t1",
      categoryId: "unknown",
      type: "uitgave",
      amount: 50,
    }),
  ];
  renderWithProviders(<TransactieList />, {
    boekje: { ...defaultMockBoekje, transacties, activeBoekjeId: "boekje-1" },
  });
  expect(screen.getByText((content) => content.includes("Onbekend"))).toBeInTheDocument();
});

it("shows filter month in title", () => {
  renderWithProviders(<TransactieList />, {
    boekje: { ...defaultMockBoekje, filterMonth: "2026-05", activeBoekjeId: "boekje-1" },
  });
  expect(screen.getByText("Transacties 2026-05")).toBeInTheDocument();
});

it("updates AnimatedNumber values correctly when transactions are updated", () => {
  const transacties = [
    createMockTransactie({ id: "t1", type: "inkomsten", amount: 1250 }),
    createMockTransactie({ id: "t2", type: "uitgave", amount: 250 }),
  ];

  renderWithProviders(<TransactieList />, {
    boekje: { ...defaultMockBoekje, transacties, activeBoekjeId: "boekje-1" },
  });

  // Verify that the rendered summaries match expected formatted amounts
  expect(screen.getByText("€ 1.250,00")).toBeInTheDocument(); // Inkomsten
  expect(screen.getByText("€ 1.000,00")).toBeInTheDocument(); // Balans
  expect(screen.getByText("€ 250,00")).toBeInTheDocument(); // Uitgaven
});
