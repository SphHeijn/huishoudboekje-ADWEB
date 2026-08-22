import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategorieManager } from "@/app/ui/categorie-manager";
import {
  renderWithProviders,
  defaultMockBoekje,
  createMockCategorie,
} from "../test-utils";

beforeEach(() => {
  jest.clearAllMocks();
});

it("renders form fields for creating a category", () => {
  renderWithProviders(<CategorieManager />, {
    boekje: { ...defaultMockBoekje, activeBoekjeId: "boekje-1" },
  });
  expect(screen.getByText("Categorieën")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Bijv. Boodschappen")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("🛒")).toBeInTheDocument();
  expect(screen.getByText("Toevoegen")).toBeInTheDocument();
});

it("renders color presets", () => {
  renderWithProviders(<CategorieManager />, {
    boekje: { ...defaultMockBoekje, activeBoekjeId: "boekje-1" },
  });
  const colorButtons = screen.getAllByRole("button");
  expect(colorButtons.length).toBeGreaterThanOrEqual(10);
});

it("renders empty state when no categories", () => {
  renderWithProviders(<CategorieManager />);
  expect(screen.getByText("Nog geen categorieën")).toBeInTheDocument();
  expect(
    screen.getByText("Maak categorieën aan om je transacties te organiseren.")
  ).toBeInTheDocument();
});

it("renders category cards", () => {
  const categorieen = [
    createMockCategorie({ id: "c1", name: "Boodschappen", icon: "🛒", color: "#ef4444" }),
    createMockCategorie({ id: "c2", name: "Huur", icon: "🏠", color: "#4f46e5" }),
  ];
  renderWithProviders(<CategorieManager />, {
    boekje: { ...defaultMockBoekje, categorieen, activeBoekjeId: "boekje-1" },
  });
  expect(screen.getByText("Boodschappen")).toBeInTheDocument();
  expect(screen.getByText("Huur")).toBeInTheDocument();
  expect(screen.getByText("🛒")).toBeInTheDocument();
  expect(screen.getByText("🏠")).toBeInTheDocument();
});

it("calls createCategorie on submit", async () => {
  const user = userEvent.setup();
  const mockCreateCategorie = jest.fn().mockResolvedValue("new-id");
  renderWithProviders(<CategorieManager />, {
    boekje: {
      ...defaultMockBoekje,
      activeBoekjeId: "boekje-1",
      createCategorie: mockCreateCategorie,
    },
  });
  await user.type(screen.getByPlaceholderText("Bijv. Boodschappen"), "Test Categorie");
  await user.click(screen.getByText("Toevoegen"));
  expect(mockCreateCategorie).toHaveBeenCalledWith("boekje-1", {
    name: "Test Categorie",
    icon: undefined,
    color: "#4f46e5",
  });
});

it("clears name input after successful create", async () => {
  const user = userEvent.setup();
  const mockCreateCategorie = jest.fn().mockResolvedValue("new-id");
  renderWithProviders(<CategorieManager />, {
    boekje: {
      ...defaultMockBoekje,
      activeBoekjeId: "boekje-1",
      createCategorie: mockCreateCategorie,
    },
  });
  const input = screen.getByPlaceholderText("Bijv. Boodschappen");
  await user.type(input, "Test");
  await user.click(screen.getByText("Toevoegen"));
  expect(input).toHaveValue("");
});

it("does not submit when name is empty", async () => {
  const user = userEvent.setup();
  const mockCreateCategorie = jest.fn();
  renderWithProviders(<CategorieManager />, {
    boekje: {
      ...defaultMockBoekje,
      activeBoekjeId: "boekje-1",
      createCategorie: mockCreateCategorie,
    },
  });
  await user.click(screen.getByText("Toevoegen"));
  expect(screen.getByText("Naam is verplicht")).toBeInTheDocument();
  expect(mockCreateCategorie).not.toHaveBeenCalled();
});

it("calls deleteCategorieKeepTransactions when delete is confirmed with keep option", async () => {
  const user = userEvent.setup();
  const mockDeleteCategorieKeepTransactions = jest.fn().mockResolvedValue(undefined);
  const categorieen = [createMockCategorie({ id: "c1", name: "Boodschappen" })];
  renderWithProviders(<CategorieManager />, {
    boekje: {
      ...defaultMockBoekje,
      categorieen,
      activeBoekjeId: "boekje-1",
      deleteCategorieKeepTransactions: mockDeleteCategorieKeepTransactions,
      deleteCategorieWithTransactions: jest.fn(),
    },
  });
  await user.click(screen.getByText("✕"));
  expect(screen.getByText("Categorie verwijderen")).toBeInTheDocument();
  await user.click(screen.getByText("Verwijderen"));
  expect(mockDeleteCategorieKeepTransactions).toHaveBeenCalledWith("boekje-1", "c1");
});

it("shows error when createCategorie throws", async () => {
  const user = userEvent.setup();
  const mockCreateCategorie = jest.fn().mockRejectedValue(new Error("Create failed"));
  renderWithProviders(<CategorieManager />, {
    boekje: {
      ...defaultMockBoekje,
      activeBoekjeId: "boekje-1",
      createCategorie: mockCreateCategorie,
    },
  });
  await user.type(screen.getByPlaceholderText("Bijv. Boodschappen"), "Test");
  await user.click(screen.getByText("Toevoegen"));
  expect(await screen.findByText("Create failed")).toBeInTheDocument();
});

it("shows budget validation error when negative or invalid budget is entered", async () => {
  const user = userEvent.setup();
  renderWithProviders(<CategorieManager />, {
    boekje: { ...defaultMockBoekje, activeBoekjeId: "boekje-1" },
  });
  await user.type(screen.getByPlaceholderText("Bijv. Boodschappen"), "Test Categorie");
  await user.type(screen.getByPlaceholderText("Bijv. 150.00"), "-10");
  await user.click(screen.getByText("Toevoegen"));
  expect(screen.getByText("Budget moet een geldig positief getal zijn")).toBeInTheDocument();
});

it("calls createCategorie with all optional fields and color select", async () => {
  const user = userEvent.setup();
  const mockCreateCategorie = jest.fn().mockResolvedValue("new-id");
  renderWithProviders(<CategorieManager />, {
    boekje: {
      ...defaultMockBoekje,
      activeBoekjeId: "boekje-1",
      createCategorie: mockCreateCategorie,
    },
  });
  await user.type(screen.getByPlaceholderText("Bijv. Boodschappen"), "Entertainment");
  await user.type(screen.getByPlaceholderText("Bijv. 150.00"), "75.50");
  const dateInput = screen.getByLabelText("Einddatum (optioneel)");
  await user.type(dateInput, "2026-12-31");
  await user.type(screen.getByPlaceholderText("🛒"), "🎮");
  
  const colorButtons = screen.getAllByRole("button");
  const presetButtons = colorButtons.filter(btn => btn.getAttribute("type") === "button");
  await user.click(presetButtons[1]); 

  await user.click(screen.getByText("Toevoegen"));
  expect(mockCreateCategorie).toHaveBeenCalledWith("boekje-1", {
    name: "Entertainment",
    maxBudget: 75.5,
    endDate: "2026-12-31",
    icon: "🎮",
    color: "#ef4444",
  });
});

it("populates form when edit button is clicked, supports editing, cancel, and update", async () => {
  const user = userEvent.setup();
  const mockUpdateCategorie = jest.fn().mockResolvedValue(undefined);
  const categorieen = [
    createMockCategorie({
      id: "c1",
      name: "Boodschappen",
      icon: "🛒",
      color: "#4f46e5",
      maxBudget: 200,
      endDate: "2026-06-30",
    }),
  ];
  renderWithProviders(<CategorieManager />, {
    boekje: {
      ...defaultMockBoekje,
      categorieen,
      activeBoekjeId: "boekje-1",
      updateCategorie: mockUpdateCategorie,
    },
  });

  await user.click(screen.getByTitle("Bewerken"));
  expect(screen.getByDisplayValue("Boodschappen")).toBeInTheDocument();
  expect(screen.getByDisplayValue("200")).toBeInTheDocument();
  expect(screen.getByDisplayValue("2026-06-30")).toBeInTheDocument();

  await user.click(screen.getByText("Annuleren"));
  expect(screen.queryByText("Annuleren")).not.toBeInTheDocument();

  await user.click(screen.getByTitle("Bewerken"));
  await user.clear(screen.getByPlaceholderText("Bijv. Boodschappen"));
  await user.type(screen.getByPlaceholderText("Bijv. Boodschappen"), "Supermarkt");
  await user.click(screen.getByText("Opslaan"));

  expect(mockUpdateCategorie).toHaveBeenCalledWith("boekje-1", "c1", {
    name: "Supermarkt",
    icon: "🛒",
    color: "#4f46e5",
    maxBudget: 200,
    endDate: "2026-06-30",
  });
});

it("displays warning and progress colors based on budget limit", () => {
  const categorieen = [
    createMockCategorie({ id: "c1", name: "Normal", maxBudget: 100 }),
    createMockCategorie({ id: "c2", name: "Warning", maxBudget: 100 }),
    createMockCategorie({ id: "c3", name: "Exceeded", maxBudget: 100 }),
  ];
  const transacties = [
    { id: "t1", boekjeId: "boekje-1", type: "uitgave" as const, amount: 50, categoryId: "c1", date: "2026-05-10", createdAt: new Date(), createdBy: "user-1", description: "a" },
    { id: "t2", boekjeId: "boekje-1", type: "uitgave" as const, amount: 85, categoryId: "c2", date: "2026-05-10", createdAt: new Date(), createdBy: "user-1", description: "b" },
    { id: "t3", boekjeId: "boekje-1", type: "uitgave" as const, amount: 110, categoryId: "c3", date: "2026-05-10", createdAt: new Date(), createdBy: "user-1", description: "c" },
  ];

  renderWithProviders(<CategorieManager />, {
    boekje: {
      ...defaultMockBoekje,
      categorieen,
      transacties,
      activeBoekjeId: "boekje-1",
    },
  });

  expect(screen.queryByText("⚠️ Budget bijna op!")).toBeInTheDocument();
  expect(screen.queryByText("⚠️ Budget overschreden!")).toBeInTheDocument();
});

