import { render, screen } from "@testing-library/react";
import { CategoryChart } from "@/app/ui/charts/category-chart";
import { createMockTransactie, createMockCategorie } from "../../test-utils";

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }: { children: React.ReactNode }) => <div data-testid="bar">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe("CategoryChart", () => {
  it("shows empty state when no transactions", () => {
    render(<CategoryChart transacties={[]} categorieen={[]} />);
    expect(screen.getByText("Nog geen data")).toBeInTheDocument();
  });

  it("ignores inkomsten when computing uitgaven per category", () => {
    const transacties = [
      createMockTransactie({ id: "t1", type: "inkomsten", amount: 500, categoryId: "cat-1" }),
    ];
    const categorieen = [createMockCategorie({ id: "cat-1", name: "Salaris" })];
    render(<CategoryChart transacties={transacties} categorieen={categorieen} />);
    expect(screen.getByText("Nog geen data")).toBeInTheDocument();
  });

  it("renders chart with grouped uitgaven", () => {
    const transacties = [
      createMockTransactie({ id: "t1", type: "uitgave", amount: 50, categoryId: "cat-1" }),
      createMockTransactie({ id: "t2", type: "uitgave", amount: 30, categoryId: "cat-1" }),
      createMockTransactie({ id: "t3", type: "uitgave", amount: 20, categoryId: "cat-2" }),
    ];
    const categorieen = [
      createMockCategorie({ id: "cat-1", name: "Boodschappen", color: "#ff0000" }),
      createMockCategorie({ id: "cat-2", name: "Vervoer", color: "#00ff00" }),
    ];
    render(<CategoryChart transacties={transacties} categorieen={categorieen} />);
    expect(screen.getByText("Uitgaven per categorie")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("shows 'Onbekend' for transactions with unknown category", () => {
    const transacties = [
      createMockTransactie({ id: "t1", type: "uitgave", amount: 50, categoryId: "unknown-cat" }),
    ];
    render(<CategoryChart transacties={transacties} categorieen={[]} />);
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });
});
