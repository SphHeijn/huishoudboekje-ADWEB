import { render, screen } from "@testing-library/react";
import DashboardLayout from "@/app/(dashboard)/layout";
import { mockRouter } from "next/navigation";

const mockUseAuth = jest.fn();

jest.mock("@/app/lib/contexts/auth-context", () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  AuthContext: null,
}));

jest.mock("@/app/ui/header", () => ({
  Header: () => <div data-testid="header">Huishoudboekje</div>,
}));

jest.mock("@/app/lib/contexts/boekje-context", () => ({
  BoekjeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useBoekjeContext: () => ({
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
    createBoekje: jest.fn(),
    updateBoekje: jest.fn(),
    deleteBoekje: jest.fn(),
    createTransactie: jest.fn(),
    updateTransactie: jest.fn(),
    deleteTransactie: jest.fn(),
    createCategorie: jest.fn(),
    updateCategorie: jest.fn(),
    deleteCategorie: jest.fn(),
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({
    user: { uid: "test-user-uid", email: "test@example.com" },
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  });
});

describe("DashboardLayout", () => {
  it("shows loading spinner when auth is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });
    render(<DashboardLayout><div data-testid="child">content</div></DashboardLayout>);
    expect(document.querySelector(".spinner")).toBeInTheDocument();
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });

  it("renders Header and children when authenticated", () => {
    render(<DashboardLayout><div data-testid="child">content</div></DashboardLayout>);
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("returns null and redirects when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });
    const { container } = render(<DashboardLayout><div>content</div></DashboardLayout>);
    expect(container.textContent).toBeFalsy();
    expect(mockRouter.push).toHaveBeenCalledWith("/login");
  });
});
