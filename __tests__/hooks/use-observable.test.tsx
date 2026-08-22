import { render, screen } from "@testing-library/react";
import { of, throwError } from "rxjs";
import { useObservable } from "@/app/lib/hooks/use-observable";

function TestComponent({
  factory,
}: {
  factory: () => ReturnType<typeof of<string[]>>;
}) {
  const { data, loading, error } = useObservable(factory);
  return (
    <div>
      <span data-testid="count">{Array.isArray(data) ? data.length : "null"}</span>
      <span data-testid="loading">{loading ? "true" : "false"}</span>
      <span data-testid="error">{error ?? "null"}</span>
    </div>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

it("emits data from the observable", () => {
  render(
    <TestComponent factory={() => of(["a", "b"])} />
  );
  expect(screen.getByTestId("count").textContent).toBe("2");
  expect(screen.getByTestId("loading").textContent).toBe("false");
  expect(screen.getByTestId("error").textContent).toBe("null");
});

it("handles error from the observable", () => {
  render(
    <TestComponent factory={() => throwError(() => new Error("test error"))} />
  );
  expect(screen.getByTestId("error").textContent).toBe("test error");
  expect(screen.getByTestId("loading").textContent).toBe("false");
});

it("handles String error from the observable", () => {
  render(
    <TestComponent factory={() => throwError(() => "string error")} />
  );
  expect(screen.getByTestId("error").textContent).toBe("string error");
  expect(screen.getByTestId("loading").textContent).toBe("false");
});
