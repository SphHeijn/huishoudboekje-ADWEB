import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BoekjeDetailPage from "@/app/(dashboard)/boekje/[id]/page";
import { setMockParams } from "next/navigation";
import { getUserByEmail, getUserEmails } from "@/app/lib/services/firestore";

const mockSetActiveBoekje = jest.fn();
const mockSetFilterMonth = jest.fn();
const mockUseBoekjeContext = jest.fn();

jest.mock("@/app/lib/contexts/boekje-context", () => ({
  useBoekjeContext: () => mockUseBoekjeContext(),
  BoekjeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/app/lib/services/firestore", () => ({
  getUserEmails: jest.fn().mockResolvedValue({ "test-user-uid": "test@example.com" }),
  getUserByEmail: jest.fn().mockResolvedValue("test-user-uid"),
  subscribeBoekjes: jest.fn(() => jest.fn()),
  subscribeTransacties: jest.fn(() => jest.fn()),
  subscribeCategorieen: jest.fn(() => jest.fn()),
}));

jest.mock("@/app/lib/contexts/auth-context", () => ({
  useAuth: () => ({
    user: { uid: "test-user-uid" },
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  AuthContext: null,
}));

jest.mock("@/app/ui/charts/balance-chart", () => ({
  BalanceChart: () => <div data-testid="balance-chart">BalanceChart</div>,
}));

jest.mock("@/app/ui/charts/category-chart", () => ({
  CategoryChart: () => <div data-testid="category-chart">CategoryChart</div>,
}));

jest.mock("@/app/ui/dnd/transaction-dnd-wrapper", () => ({
  TransactionDndWrapper: () => <div data-testid="dnd-wrapper">TransactionDndWrapper</div>,
}));

beforeEach(() => {
  jest.clearAllMocks();
  setMockParams({ id: "boekje-1" });
  mockUseBoekjeContext.mockReturnValue({
    activeBoekje: { id: "boekje-1", title: "Test Boekje", description: "A test", currency: "EUR", members: ["test-user-uid"] },
    activeBoekjeId: "boekje-1",
    setActiveBoekje: mockSetActiveBoekje,
    transacties: [],
    categorieen: [],
    filterMonth: "2026-05",
    setFilterMonth: mockSetFilterMonth,
    loading: false,
    error: null,
    boekjes: [],
    createBoekje: jest.fn(),
    updateBoekje: jest.fn(),
    deleteBoekje: jest.fn(),
    createTransactie: jest.fn(),
    updateTransactie: jest.fn(),
    deleteTransactie: jest.fn(),
    createCategorie: jest.fn(),
    updateCategorie: jest.fn(),
    deleteCategorie: jest.fn(),
    deleteCategorieWithTransactions: jest.fn(),
    deleteCategorieKeepTransactions: jest.fn(),
  });
});

describe("BoekjeDetailPage", () => {
  it("shows spinner and sets active boekje when no activeBoekje", async () => {
    mockUseBoekjeContext.mockReturnValue({
      activeBoekje: null,
      activeBoekjeId: null,
      setActiveBoekje: mockSetActiveBoekje,
      transacties: [],
      categorieen: [],
      filterMonth: "2026-05",
      setFilterMonth: mockSetFilterMonth,
      loading: false,
      error: null,
      boekjes: [],
      createBoekje: jest.fn(),
      updateBoekje: jest.fn(),
      deleteBoekje: jest.fn(),
      createTransactie: jest.fn(),
      updateTransactie: jest.fn(),
      deleteTransactie: jest.fn(),
      createCategorie: jest.fn(),
      updateCategorie: jest.fn(),
      deleteCategorie: jest.fn(),
      deleteCategorieWithTransactions: jest.fn(),
      deleteCategorieKeepTransactions: jest.fn(),
    });
    render(<BoekjeDetailPage />);
    expect(document.querySelector(".spinner")).toBeInTheDocument();
    await waitFor(() => {
      expect(mockSetActiveBoekje).toHaveBeenCalledWith("boekje-1");
    });
  });

  it("renders boekje title and description", () => {
    render(<BoekjeDetailPage />);
    expect(screen.getByText("Test Boekje")).toBeInTheDocument();
    expect(screen.getByText("A test")).toBeInTheDocument();
  });

  it("renders all four tabs", () => {
    render(<BoekjeDetailPage />);
    expect(screen.getByText("Transacties")).toBeInTheDocument();
    expect(screen.getByText("Categorieën")).toBeInTheDocument();
    expect(screen.getByText("Grafieken")).toBeInTheDocument();
    expect(screen.getByText("Slepen & Koppelen")).toBeInTheDocument();
  });

  it("shows Transacties content by default", () => {
    render(<BoekjeDetailPage />);
    expect(screen.getByText("Nog geen transacties")).toBeInTheDocument();
  });

  it("switches to Categorieën tab", async () => {
    const user = userEvent.setup();
    render(<BoekjeDetailPage />);
    await act(async () => { await Promise.resolve(); });
    await user.click(screen.getByText("Categorieën"));
    expect(screen.getByText("Nog geen categorieën")).toBeInTheDocument();
  });

  it("switches to Grafieken tab", async () => {
    const user = userEvent.setup();
    render(<BoekjeDetailPage />);
    await act(async () => { await Promise.resolve(); });
    await user.click(screen.getByText("Grafieken"));
    expect(screen.getByTestId("balance-chart")).toBeInTheDocument();
    expect(screen.getByTestId("category-chart")).toBeInTheDocument();
  });

  it("switches to Slepen & Koppelen tab", async () => {
    const user = userEvent.setup();
    render(<BoekjeDetailPage />);
    await act(async () => { await Promise.resolve(); });
    await user.click(screen.getByText("Slepen & Koppelen"));
    expect(screen.getByTestId("dnd-wrapper")).toBeInTheDocument();
  });

  it("shows month filter select", async () => {
    render(<BoekjeDetailPage />);
    await act(async () => { await Promise.resolve(); });
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  it("calls setFilterMonth when month changes", async () => {
    const user = userEvent.setup();
    render(<BoekjeDetailPage />);
    await act(async () => { await Promise.resolve(); });
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "2026-04");
    expect(mockSetFilterMonth).toHaveBeenCalledWith("2026-04");
  });

  it("does not render description when not provided", () => {
    mockUseBoekjeContext.mockReturnValue({
      activeBoekje: { id: "boekje-1", title: "No desc", currency: "EUR", members: ["test-user-uid"] },
      activeBoekjeId: "boekje-1",
      setActiveBoekje: mockSetActiveBoekje,
      transacties: [],
      categorieen: [],
      filterMonth: "2026-05",
      setFilterMonth: mockSetFilterMonth,
      loading: false,
      error: null,
      boekjes: [],
      createBoekje: jest.fn(),
      updateBoekje: jest.fn(),
      deleteBoekje: jest.fn(),
      createTransactie: jest.fn(),
      updateTransactie: jest.fn(),
      deleteTransactie: jest.fn(),
      createCategorie: jest.fn(),
      updateCategorie: jest.fn(),
      deleteCategorie: jest.fn(),
      deleteCategorieWithTransactions: jest.fn(),
      deleteCategorieKeepTransactions: jest.fn(),
    });
    render(<BoekjeDetailPage />);
    expect(screen.getByText("No desc")).toBeInTheDocument();
  });

  it("shows gearchiveerd message when boekje is archived", async () => {
    mockUseBoekjeContext.mockReturnValue({
      activeBoekje: { id: "boekje-1", title: "Archived Book", currency: "EUR", members: ["test-user-uid"], archived: true },
      activeBoekjeId: "boekje-1",
      setActiveBoekje: mockSetActiveBoekje,
      transacties: [],
      categorieen: [],
      filterMonth: "2026-05",
      setFilterMonth: mockSetFilterMonth,
      loading: false,
      error: null,
      boekjes: [],
      createBoekje: jest.fn(),
      updateBoekje: jest.fn(),
      deleteBoekje: jest.fn(),
      createTransactie: jest.fn(),
      updateTransactie: jest.fn(),
      deleteTransactie: jest.fn(),
      createCategorie: jest.fn(),
      updateCategorie: jest.fn(),
      deleteCategorie: jest.fn(),
      deleteCategorieWithTransactions: jest.fn(),
      deleteCategorieKeepTransactions: jest.fn(),
    });
    render(<BoekjeDetailPage />);
    expect(screen.getByText("Boekje is gearchiveerd")).toBeInTheDocument();
  });

  it("shows geen toegang message when user is not a member", async () => {
    mockUseBoekjeContext.mockReturnValue({
      activeBoekje: { id: "boekje-1", title: "Private Book", currency: "EUR", members: ["some-other-user"] },
      activeBoekjeId: "boekje-1",
      setActiveBoekje: mockSetActiveBoekje,
      transacties: [],
      categorieen: [],
      filterMonth: "2026-05",
      setFilterMonth: mockSetFilterMonth,
      loading: false,
      error: null,
      boekjes: [],
      createBoekje: jest.fn(),
      updateBoekje: jest.fn(),
      deleteBoekje: jest.fn(),
      createTransactie: jest.fn(),
      updateTransactie: jest.fn(),
      deleteTransactie: jest.fn(),
      createCategorie: jest.fn(),
      updateCategorie: jest.fn(),
      deleteCategorie: jest.fn(),
      deleteCategorieWithTransactions: jest.fn(),
      deleteCategorieKeepTransactions: jest.fn(),
    });
    render(<BoekjeDetailPage />);
    expect(screen.getByText("Geen toegang")).toBeInTheDocument();
  });

  it("renders participants tab and handles invitations and member removal", async () => {
    const user = userEvent.setup();
    const mockUpdateBoekje = jest.fn().mockResolvedValue(undefined);
    
    const mockGetUserByEmail = getUserByEmail as jest.Mock;
    const mockGetUserEmails = getUserEmails as jest.Mock;

    mockGetUserEmails.mockResolvedValue({
      "test-user-uid": "owner@example.com",
      "member-2": "member2@example.com",
    });

    mockUseBoekjeContext.mockReturnValue({
      activeBoekje: {
        id: "boekje-1",
        title: "Test Boekje",
        currency: "EUR",
        createdBy: "test-user-uid",
        members: ["test-user-uid", "member-2"],
      },
      activeBoekjeId: "boekje-1",
      setActiveBoekje: mockSetActiveBoekje,
      transacties: [],
      categorieen: [],
      filterMonth: "2026-05",
      setFilterMonth: mockSetFilterMonth,
      loading: false,
      error: null,
      boekjes: [],
      updateBoekje: mockUpdateBoekje,
    });

    render(<BoekjeDetailPage />);
    await act(async () => { await Promise.resolve(); });

    await user.click(screen.getByText("Deelnemers"));
    
    await waitFor(() => {
      expect(screen.getByText("owner@example.com")).toBeInTheDocument();
      expect(screen.getByText("member2@example.com")).toBeInTheDocument();
    });

    mockGetUserByEmail.mockResolvedValue("new-user-uid");
    fireEvent.change(screen.getByPlaceholderText("deelnemer@example.com"), { target: { value: "new@example.com" } });
    await user.click(screen.getByRole("button", { name: "Toevoegen" }));
    
    await waitFor(() => {
      expect(mockUpdateBoekje).toHaveBeenCalledWith("boekje-1", {
        members: ["test-user-uid", "member-2", "new-user-uid"],
      });
    });
    expect(await screen.findByText("Deelnemer succesvol toegevoegd!")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("deelnemer@example.com"), { target: { value: "member2@example.com" } });
    mockGetUserByEmail.mockResolvedValue("member-2");
    await user.click(screen.getByRole("button", { name: "Toevoegen" }));
    expect(await screen.findByText("Deze gebruiker is al deelnemer van dit boekje.")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("deelnemer@example.com"), { target: { value: "notreg@example.com" } });
    mockGetUserByEmail.mockResolvedValue(null);
    await user.click(screen.getByRole("button", { name: "Toevoegen" }));
    expect(await screen.findByText("Gebruiker met dit e-mailadres is niet geregistreerd.")).toBeInTheDocument();

    const removeButtons = screen.getAllByTitle("Deelnemer verwijderen");
    await user.click(removeButtons[0]);
    expect(screen.getByText("Deelnemer verwijderen")).toBeInTheDocument();
    await user.click(screen.getByText("Verwijderen"));
    await waitFor(() => {
      expect(mockUpdateBoekje).toHaveBeenCalledWith("boekje-1", {
        members: ["test-user-uid"],
      });
    });
  });
});

