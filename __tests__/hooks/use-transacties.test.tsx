import { render, act } from "@testing-library/react";
import { useTransacties } from "@/app/lib/hooks/use-transacties";

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
  filterMonth,
}: {
  boekjeId: string | undefined | null;
  filterMonth: string;
}) {
  const { transacties, loading, error } = useTransacties(boekjeId, filterMonth);
  return (
    <div>
      <span data-testid="count">{transacties.length}</span>
      <span data-testid="loading">{loading ? "true" : "false"}</span>
      <span data-testid="error">{error ?? "null"}</span>
    </div>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

it("does not subscribe when boekjeId is null", () => {
  render(<TestComponent boekjeId={null} filterMonth="2026-05" />);
  expect(mockOnSnapshot).not.toHaveBeenCalled();
});

it("does not subscribe when boekjeId is undefined", () => {
  render(<TestComponent boekjeId={undefined} filterMonth="2026-05" />);
  expect(mockOnSnapshot).not.toHaveBeenCalled();
});

it("subscribes when boekjeId is provided", () => {
  const mockUnsubscribe = jest.fn();
  mockOnSnapshot.mockImplementation(
    (_q: unknown, onData: (snapshot: unknown) => void) => {
      act(() => {
        onData({ docs: [], forEach: () => {} });
      });
      return mockUnsubscribe;
    }
  );
  render(<TestComponent boekjeId="boekje-1" filterMonth="2026-05" />);
  expect(mockOnSnapshot).toHaveBeenCalled();
});
