import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransactieForm } from "@/app/ui/transactie-form";
import {
  renderWithProviders,
  defaultMockBoekje,
  createMockCategorie,
  createMockTransactie,
} from "../test-utils";

const mockOnDone = jest.fn();

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

beforeEach(() => {
  jest.clearAllMocks();
});

it("renders create form with all fields", () => {
  renderWithProviders(<TransactieForm onDone={mockOnDone} />);
  expect(screen.getByText("Nieuwe transactie")).toBeInTheDocument();
  expect(screen.getByText("Type")).toBeInTheDocument();
  expect(screen.getByText("Bedrag (€)")).toBeInTheDocument();
  expect(screen.getByText("Categorie")).toBeInTheDocument();
  expect(screen.getByText("Datum")).toBeInTheDocument();
  expect(screen.getByText("Omschrijving")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Toevoegen" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Annuleren" })).toBeInTheDocument();
});

it("renders category options from context", () => {
  const categorieen = [
    createMockCategorie({ id: "c1", name: "Boodschappen" }),
    createMockCategorie({ id: "c2", name: "Huur" }),
  ];
  renderWithProviders(<TransactieForm onDone={mockOnDone} />, {
    boekje: { ...defaultMockBoekje, categorieen, activeBoekjeId: "boekje-1" },
  });
  expect(screen.getByText("Boodschappen")).toBeInTheDocument();
  expect(screen.getByText("Huur")).toBeInTheDocument();
});

it("calls createTransactie on valid submit", async () => {
  const user = userEvent.setup();
  const mockCreateTransactie = jest.fn().mockResolvedValue("new-id");
  const categorieen = [createMockCategorie({ id: "c1", name: "Boodschappen" })];
  renderWithProviders(<TransactieForm onDone={mockOnDone} />, {
    boekje: {
      ...defaultMockBoekje,
      activeBoekjeId: "boekje-1",
      categorieen,
      createTransactie: mockCreateTransactie,
    },
  });
  await user.type(screen.getByPlaceholderText("0.00"), "25.50");
  await user.type(
    screen.getByPlaceholderText("Bijv. Boodschappen"),
    "Test transactie"
  );
  await user.selectOptions(screen.getAllByRole("combobox")[1], "c1");
  await user.click(screen.getByRole("button", { name: "Toevoegen" }));
  expect(mockCreateTransactie).toHaveBeenCalledWith({
    boekjeId: "boekje-1",
    type: "uitgave",
    amount: 25.5,
    categoryId: "c1",
    date: getTodayString(),
    description: "Test transactie",
  });
  expect(mockOnDone).toHaveBeenCalled();
});

it("renders edit form with pre-filled values", () => {
  const transactie = createMockTransactie({
    id: "t1",
    type: "inkomsten",
    amount: 1000,
    categoryId: "c1",
    date: "2026-05-01",
    description: "Salary",
  });
  renderWithProviders(<TransactieForm onDone={mockOnDone} initial={transactie} />, {
    boekje: { ...defaultMockBoekje, activeBoekjeId: "boekje-1" },
  });
  expect(screen.getByText("Transactie bewerken")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Opslaan" })).toBeInTheDocument();
  expect(screen.getByPlaceholderText("0.00")).toHaveValue(1000);
  expect(screen.getByPlaceholderText("Bijv. Boodschappen")).toHaveValue("Salary");
});

it("calls updateTransactie on valid submit in edit mode", async () => {
  const mockUpdateTransactie = jest.fn().mockResolvedValue(undefined);
  const transactie = createMockTransactie({ id: "t1", type: "uitgave", amount: 50 });
  renderWithProviders(
    <TransactieForm onDone={mockOnDone} initial={transactie} />,
    {
      boekje: {
        ...defaultMockBoekje,
        activeBoekjeId: "boekje-1",
        updateTransactie: mockUpdateTransactie,
      },
    }
  );
  const form = screen.getByRole("button", { name: "Opslaan" }).closest("form");
  fireEvent.submit(form!);
  await screen.findByText("Transactie bewerken");
  expect(mockUpdateTransactie).toHaveBeenCalled();
  expect(mockOnDone).toHaveBeenCalled();
});

it("calls updateTransactie with empty categoryId when removing category in edit mode", async () => {
  const user = userEvent.setup();
  const mockUpdateTransactie = jest.fn().mockResolvedValue(undefined);
  const categorieen = [createMockCategorie({ id: "c1", name: "Boodschappen" })];
  const transactie = createMockTransactie({
    id: "t1",
    type: "uitgave",
    amount: 50,
    categoryId: "c1",
    date: "2026-05-15",
    description: "Koffie",
  });
  renderWithProviders(
    <TransactieForm onDone={mockOnDone} initial={transactie} />,
    {
      boekje: {
        ...defaultMockBoekje,
        activeBoekjeId: "boekje-1",
        categorieen,
        updateTransactie: mockUpdateTransactie,
      },
    }
  );
  await user.selectOptions(screen.getAllByRole("combobox")[1], "");
  await user.click(screen.getByRole("button", { name: "Opslaan" }));
  expect(mockUpdateTransactie).toHaveBeenCalledWith("boekje-1", "t1", {
    boekjeId: "boekje-1",
    type: "uitgave",
    amount: 50,
    categoryId: "",
    date: "2026-05-15",
    description: "Koffie",
  });
  expect(mockOnDone).toHaveBeenCalled();
});

it("shows validation error for invalid amount", async () => {
  const user = userEvent.setup();
  const categorieen = [createMockCategorie({ id: "c1", name: "Boodschappen" })];
  renderWithProviders(<TransactieForm onDone={mockOnDone} />, {
    boekje: { ...defaultMockBoekje, activeBoekjeId: "boekje-1", categorieen },
  });
  await user.type(screen.getByPlaceholderText("0.00"), "-10");
  await user.selectOptions(screen.getAllByRole("combobox")[1], "c1");
  const form = screen.getByRole("button", { name: "Toevoegen" }).closest("form");
  fireEvent.submit(form!);
  expect(await screen.findByText("Bedrag moet positief zijn")).toBeInTheDocument();
  expect(mockOnDone).not.toHaveBeenCalled();
});

it("does not submit when no activeBoekjeId", async () => {
  const user = userEvent.setup();
  const mockCreateTransactie = jest.fn();
  renderWithProviders(<TransactieForm onDone={mockOnDone} />, {
    boekje: {
      ...defaultMockBoekje,
      activeBoekjeId: null,
      createTransactie: mockCreateTransactie,
    },
  });
  await user.type(screen.getByPlaceholderText("0.00"), "10");
  await user.click(screen.getByRole("button", { name: "Toevoegen" }));
  expect(mockCreateTransactie).not.toHaveBeenCalled();
});
