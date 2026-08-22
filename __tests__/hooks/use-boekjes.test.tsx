import { render, screen, act, waitFor } from "@testing-library/react";
import { useBoekjes } from "@/app/lib/hooks/use-boekjes";

jest.mock("firebase/firestore", () => ({
  onSnapshot: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDoc: jest.fn(),
  serverTimestamp: jest.fn(() => ({ toDate: () => new Date() })),
  Timestamp: { now: jest.fn(), fromDate: jest.fn() },
}));

import { onSnapshot as mockOnSnapshot, query as mockQuery } from "firebase/firestore";

function TestComponent({ userId }: { userId: string | undefined }) {
  const { boekjes, loading, error } = useBoekjes(userId);
  return (
    <div>
      <span data-testid="count">{boekjes.length}</span>
      <span data-testid="loading">{loading ? "true" : "false"}</span>
      <span data-testid="error">{error ?? "null"}</span>
    </div>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

it("does not subscribe when userId is undefined", () => {
  render(<TestComponent userId={undefined} />);
  expect(mockOnSnapshot).not.toHaveBeenCalled();
});

it("subscribes to Firestore when userId is provided", () => {
  const mockUnsubscribe = jest.fn();
  mockOnSnapshot.mockImplementation(
    (_q: unknown, onData: (snapshot: unknown) => void) => {
      act(() => {
        onData({ docs: [], forEach: () => {} });
      });
      return mockUnsubscribe;
    }
  );
  render(<TestComponent userId="user-1" />);
  expect(mockOnSnapshot).toHaveBeenCalled();
  expect(mockQuery).toHaveBeenCalled();
});

it("sets loading to false after data arrives", async () => {
  const mockUnsubscribe = jest.fn();
  mockOnSnapshot.mockImplementation(
    (_q: unknown, onData: (snapshot: unknown) => void) => {
      act(() => {
        onData({ docs: [], forEach: () => {} });
      });
      return mockUnsubscribe;
    }
  );
  render(<TestComponent userId="user-1" />);
  await waitFor(() => {
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });
});

it("does not show error for permission-denied onSnapshot failure", async () => {
  jest.useFakeTimers();
  const mockUnsubscribe = jest.fn();
  mockOnSnapshot.mockImplementation(
    (
      _q: unknown,
      _onData: (snapshot: unknown) => void,
      onError: (err: { message: string }) => void
    ) => {
      act(() => {
        onError({ message: "Missing or insufficient permissions" });
      });
      return mockUnsubscribe;
    }
  );
  render(<TestComponent userId="user-1" />);

  // Exhaust all retries (MAX_RETRIES = 3)
  for (let i = 0; i < 3; i++) {
    act(() => {
      jest.advanceTimersByTime(2000);
    });
  }

  await waitFor(() => {
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });
  expect(screen.getByTestId("error").textContent).toBe("null");
  jest.useRealTimers();
});

it("retries on permission error and succeeds on retry", async () => {
  jest.useFakeTimers();
  const mockUnsubscribe = jest.fn();
  let callCount = 0;
  mockOnSnapshot.mockImplementation(
    (
      _q: unknown,
      onData: (snapshot: unknown) => void,
      onError: (err: { message: string }) => void
    ) => {
      act(() => {
        callCount++;
        if (callCount === 1) {
          onError({ message: "Missing or insufficient permissions" });
        } else {
          onData({ docs: [], forEach: () => {} });
        }
      });
      return mockUnsubscribe;
    }
  );
  render(<TestComponent userId="user-1" />);

  // First attempt failed, retry is scheduled
  act(() => {
    jest.advanceTimersByTime(2000);
  });

  await waitFor(() => {
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });
  expect(screen.getByTestId("error").textContent).toBe("null");
  expect(callCount).toBe(2);
  jest.useRealTimers();
});

it("unsubscribes on unmount", () => {
  const mockUnsubscribe = jest.fn();
  mockOnSnapshot.mockImplementation(
    (_q: unknown, onData: (snapshot: unknown) => void) => {
      act(() => {
        onData({ docs: [], forEach: () => {} });
      });
      return mockUnsubscribe;
    }
  );
  const { unmount } = render(<TestComponent userId="user-1" />);
  unmount();
  expect(mockUnsubscribe).toHaveBeenCalled();
});

it("shows error for non-permission onSnapshot failure", async () => {
  const mockUnsubscribe = jest.fn();
  mockOnSnapshot.mockImplementation(
    (
      _q: unknown,
      _onData: (snapshot: unknown) => void,
      onError: (err: { message: string }) => void
    ) => {
      onError({ message: "Firebase: Error (auth/too-many-requests)" });
      return mockUnsubscribe;
    }
  );
  render(<TestComponent userId="user-1" />);
  await waitFor(() => {
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });
  expect(screen.getByTestId("error").textContent).not.toBe("null");
});
