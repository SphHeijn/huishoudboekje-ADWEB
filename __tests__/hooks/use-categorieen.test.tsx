import { render, act } from "@testing-library/react";
import { useCategorieen } from "@/app/lib/hooks/use-categorieen";

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

import { onSnapshot as mockOnSnapshot } from "firebase/firestore";

function TestComponent({
  boekjeId,
}: {
  boekjeId: string | undefined | null;
}) {
  const { categorieen, loading, error } = useCategorieen(boekjeId);
  return (
    <div>
      <span data-testid="count">{categorieen.length}</span>
      <span data-testid="loading">{loading ? "true" : "false"}</span>
      <span data-testid="error">{error ?? "null"}</span>
    </div>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

it("does not subscribe when boekjeId is null", () => {
  render(<TestComponent boekjeId={null} />);
  expect(mockOnSnapshot).not.toHaveBeenCalled();
});

it("does not subscribe when boekjeId is undefined", () => {
  render(<TestComponent boekjeId={undefined} />);
  expect(mockOnSnapshot).not.toHaveBeenCalled();
});

it("subscribes when boekjeId is provided", () => {
  const mockUnsubscribe = jest.fn();
  mockOnSnapshot.mockImplementation(
    (_q: unknown, onData: (snapshot: unknown) => void) => {
      onData({ docs: [], forEach: () => {} });
      return mockUnsubscribe;
    }
  );
  render(<TestComponent boekjeId="boekje-1" />);
  expect(mockOnSnapshot).toHaveBeenCalled();
});
