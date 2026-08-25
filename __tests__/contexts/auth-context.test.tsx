import { render, screen, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/app/lib/contexts/auth-context";
import type { ReactNode } from "react";

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  getAuth: () => ({ _mockAuth: true, currentUser: null }),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn((...args) => ({ _type: "doc", args })),
  setDoc: jest.fn(() => Promise.resolve()),
  serverTimestamp: jest.fn(() => "mock-timestamp"),
}));

import {
  onAuthStateChanged as mockOnAuthStateChanged,
  signInWithEmailAndPassword as mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as mockCreateUserWithEmailAndPassword,
  signOut as mockSignOut,
} from "firebase/auth";

import {
  doc as mockDoc,
  setDoc as mockSetDoc,
} from "firebase/firestore";

function TestConsumer() {
  const { user, loading, login, register, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{loading ? "true" : "false"}</span>
      <span data-testid="user">{user ? user.email : "null"}</span>
      <button data-testid="login" onClick={() => login("a@b.com", "pw")}>
        login
      </button>
      <button data-testid="register" onClick={() => register("a@b.com", "pw")}>
        register
      </button>
      <button data-testid="logout" onClick={() => logout()}>
        logout
      </button>
    </div>
  );
}

function renderWithAuth(children: ReactNode) {
  return render(<AuthProvider>{children}</AuthProvider>);
}

beforeEach(() => {
  jest.clearAllMocks();
});

it("starts with loading state and no user", () => {
  const mockUnsubscribe = jest.fn();
  mockOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: unknown) => void) => {
    cb(null);
    return mockUnsubscribe;
  });
  renderWithAuth(<TestConsumer />);
  expect(screen.getByTestId("user").textContent).toBe("null");
});

it("sets user when onAuthStateChanged fires with a user", async () => {
  const mockUnsubscribe = jest.fn();
  const mockFirebaseUser = { uid: "uid-1", email: "test@example.com" };
  mockOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: unknown) => void) => {
    cb(mockFirebaseUser);
    return mockUnsubscribe;
  });
  renderWithAuth(<TestConsumer />);
  await waitFor(() => {
    expect(screen.getByTestId("user").textContent).toBe("test@example.com");
  });
  expect(screen.getByTestId("loading").textContent).toBe("false");
});

it("calls signInWithEmailAndPassword on login", async () => {
  const mockUnsubscribe = jest.fn();
  mockOnAuthStateChanged.mockImplementation(() => mockUnsubscribe);
  mockSignInWithEmailAndPassword.mockResolvedValue({});
  renderWithAuth(<TestConsumer />);
  await act(async () => {
    screen.getByTestId("login").click();
  });
  expect(mockSignInWithEmailAndPassword).toHaveBeenCalled();
});

it("calls createUserWithEmailAndPassword on register and creates user document", async () => {
  const mockUnsubscribe = jest.fn();
  mockOnAuthStateChanged.mockImplementation(() => mockUnsubscribe);
  mockCreateUserWithEmailAndPassword.mockResolvedValue({
    user: { uid: "uid-new", email: "a@b.com" },
  });
  renderWithAuth(<TestConsumer />);
  await act(async () => {
    screen.getByTestId("register").click();
  });
  expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalled();
  expect(mockDoc).toHaveBeenCalledWith(expect.anything(), "users", "uid-new");
  expect(mockSetDoc).toHaveBeenCalledWith(
    expect.objectContaining({ _type: "doc" }),
    { email: "a@b.com", createdAt: "mock-timestamp" }
  );
});

it("calls signOut on logout", async () => {
  const mockUnsubscribe = jest.fn();
  mockOnAuthStateChanged.mockImplementation(() => mockUnsubscribe);
  mockSignOut.mockResolvedValue(undefined);
  renderWithAuth(<TestConsumer />);
  await act(async () => {
    screen.getByTestId("logout").click();
  });
  expect(mockSignOut).toHaveBeenCalled();
});

it("unsubscribes on unmount", () => {
  const mockUnsubscribe = jest.fn();
  mockOnAuthStateChanged.mockImplementation(() => mockUnsubscribe);
  const { unmount } = renderWithAuth(<TestConsumer />);
  unmount();
  expect(mockUnsubscribe).toHaveBeenCalled();
});

it("throws useAuth error when used outside provider", () => {
  expect(() => render(<TestConsumer />)).toThrow(
    "useAuth moet binnen een AuthProvider worden gebruikt"
  );
});
