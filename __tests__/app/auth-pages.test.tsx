import { render, screen } from "@testing-library/react";
import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";
import AuthLayout from "@/app/(auth)/layout";
import { mockRouter } from "next/navigation";

const mockUseAuth = jest.fn();

jest.mock("@/app/lib/contexts/auth-context", () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  AuthContext: null,
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  getAuth: jest.fn(() => ({ currentUser: null })),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("LoginPage", () => {
  it("renders login form", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: "Inloggen" })).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Wachtwoord")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inloggen" })).toBeInTheDocument();
  });
});

describe("RegisterPage", () => {
  it("renders register form", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });
    render(<RegisterPage />);
    expect(screen.getByRole("heading", { name: "Account aanmaken" })).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Wachtwoord")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Account aanmaken" })).toBeInTheDocument();
  });
});

describe("AuthLayout", () => {
  it("shows loading spinner when auth is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });
    render(
      <AuthLayout>
        <div data-testid="child">content</div>
      </AuthLayout>
    );
    expect(document.querySelector(".spinner")).toBeInTheDocument();
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });

  it("renders children when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });
    render(
      <AuthLayout>
        <div data-testid="child">content</div>
      </AuthLayout>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("redirects to dashboard when already authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { uid: "test", email: "test@example.com" },
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });
    render(
      <AuthLayout>
        <div data-testid="child">content</div>
      </AuthLayout>
    );
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("returns null when authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { uid: "test", email: "test@example.com" },
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });
    const { container } = render(
      <AuthLayout>
        <div data-testid="child">content</div>
      </AuthLayout>
    );
    expect(container.textContent).toBeFalsy();
  });
});
