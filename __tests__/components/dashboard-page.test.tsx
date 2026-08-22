import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "@/app/(dashboard)/page";
import {
  renderWithProviders,
  defaultMockBoekje,
  createMockBoekje,
} from "../test-utils";

beforeEach(() => {
  jest.clearAllMocks();
});

it("renders page title and description", () => {
  renderWithProviders(<DashboardPage />);
  expect(screen.getByText("Mijn boekjes")).toBeInTheDocument();
  expect(screen.getByText("Beheer al je huishoudboekjes")).toBeInTheDocument();
});

it("shows loading spinner when loading", () => {
  renderWithProviders(<DashboardPage />, {
    boekje: { ...defaultMockBoekje, loading: true },
  });
  expect(document.querySelector(".spinner")).toBeInTheDocument();
});

it("shows empty state when no boekjes", () => {
  renderWithProviders(<DashboardPage />, {
    boekje: { ...defaultMockBoekje, boekjes: [] },
  });
  expect(screen.getByText("Nog geen actieve boekjes")).toBeInTheDocument();
});

it("renders boekje cards for each boekje", () => {
  const boekjes = [
    createMockBoekje({ id: "b1", title: "Boekje 1", description: undefined }),
    createMockBoekje({ id: "b2", title: "Boekje 2", description: undefined }),
  ];
  renderWithProviders(<DashboardPage />, {
    boekje: { ...defaultMockBoekje, boekjes },
  });
  expect(screen.getByText("Boekje 1")).toBeInTheDocument();
  expect(screen.getByText("Boekje 2")).toBeInTheDocument();
});

it("shows BoekjeForm when clicking '+ Nieuw boekje'", async () => {
  const user = userEvent.setup();
  renderWithProviders(<DashboardPage />, {
    boekje: { ...defaultMockBoekje, boekjes: [createMockBoekje({ id: "b1" })] },
  });
  await user.click(screen.getByRole("button", { name: "+ Nieuw boekje" }));
  expect(screen.getByText("Nieuw boekje")).toBeInTheDocument();
});

it("hides BoekjeForm when onDone is called", async () => {
  const user = userEvent.setup();
  renderWithProviders(<DashboardPage />, {
    boekje: { ...defaultMockBoekje, boekjes: [createMockBoekje({ id: "b1" })] },
  });
  await user.click(screen.getByRole("button", { name: "+ Nieuw boekje" }));
  await user.click(screen.getByText("Annuleren"));
  expect(screen.queryByText("Nieuw boekje")).not.toBeInTheDocument();
});
