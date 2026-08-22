import { render, screen } from "@testing-library/react";
import { BalanceChart } from "@/app/ui/charts/balance-chart";
import { createMockTransactie } from "../../test-utils";

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe("BalanceChart", () => {
  it("shows empty state when no transactions", () => {
    render(<BalanceChart transacties={[]} />);
    expect(screen.getByText("Nog geen data")).toBeInTheDocument();
    expect(screen.getByText("Voeg transacties toe om het saldoverloop te zien.")).toBeInTheDocument();
  });

  it("renders chart when transactions exist", () => {
    const transacties = [
      createMockTransactie({ id: "t1", date: "2026-05-01", type: "inkomsten", amount: 100 }),
      createMockTransactie({ id: "t2", date: "2026-05-02", type: "uitgave", amount: 30 }),
    ];
    render(<BalanceChart transacties={transacties} />);
    expect(screen.getByText("Saldoverloop")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });
});
