import React from "react";

interface MockContainerProps {
  children?: React.ReactNode;
  width?: string | number;
  height?: string | number;
}

interface MockChartProps {
  children?: React.ReactNode;
}

const MockResponsiveContainer = ({ children, width, height }: MockContainerProps) => (
  <div data-testid="responsive-container" style={{ width, height }}>{children}</div>
);

const MockLineChart = ({ children }: MockChartProps) => <div data-testid="line-chart">{children}</div>;
const MockBarChart = ({ children }: MockChartProps) => <div data-testid="bar-chart">{children}</div>;
const MockLine = () => <div data-testid="line" />;
const MockBar = ({ children }: MockChartProps) => <div data-testid="bar">{children}</div>;
const MockCell = () => <div data-testid="cell" />;
const MockXAxis = () => <div data-testid="x-axis" />;
const MockYAxis = () => <div data-testid="y-axis" />;
const MockCartesianGrid = () => <div data-testid="cartesian-grid" />;
const MockTooltip = () => <div data-testid="tooltip" />;

export const ResponsiveContainer = MockResponsiveContainer;
export const LineChart = MockLineChart;
export const BarChart = MockBarChart;
export const Line = MockLine;
export const Bar = MockBar;
export const Cell = MockCell;
export const XAxis = MockXAxis;
export const YAxis = MockYAxis;
export const CartesianGrid = MockCartesianGrid;
export const Tooltip = MockTooltip;

const recharts = {
  ResponsiveContainer: MockResponsiveContainer,
  LineChart: MockLineChart,
  BarChart: MockBarChart,
  Line: MockLine,
  Bar: MockBar,
  Cell: MockCell,
  XAxis: MockXAxis,
  YAxis: MockYAxis,
  CartesianGrid: MockCartesianGrid,
  Tooltip: MockTooltip,
};

export default recharts;
