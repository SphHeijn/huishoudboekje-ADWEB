import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "@/app/ui/header";
import { mockRouter } from "next/navigation";
import { renderWithProviders, defaultMockAuth, defaultMockBoekje, createMockBoekje } from "../test-utils";

beforeEach(() => {
  jest.clearAllMocks();
});

it("renders the app name and user email", () => {
  renderWithProviders(<Header />);
  expect(screen.getByText("Huishoudboekje")).toBeInTheDocument();
  expect(screen.getByText("test@example.com")).toBeInTheDocument();
});

it("renders logout button", () => {
  renderWithProviders(<Header />);
  expect(screen.getByText("Uitloggen")).toBeInTheDocument();
});

it("renders boekje selector with options", async () => {
  const user = userEvent.setup();
  const boekjes = [
    createMockBoekje({ id: "b1", title: "Boekje 1" }),
    createMockBoekje({ id: "b2", title: "Boekje 2" }),
  ];
  renderWithProviders(<Header />, {
    boekje: { ...defaultMockBoekje, boekjes },
  });
  expect(screen.getByText("Kies een boekje...")).toBeInTheDocument();
  await user.click(screen.getByText("Kies een boekje..."));
  expect(screen.getByText("Boekje 1")).toBeInTheDocument();
  expect(screen.getByText("Boekje 2")).toBeInTheDocument();
});

it("selects a boekje and navigates", async () => {
  const user = userEvent.setup();
  const mockSetActiveBoekje = jest.fn();
  const boekjes = [createMockBoekje({ id: "b1", title: "Boekje 1" })];
  renderWithProviders(<Header />, {
    boekje: { ...defaultMockBoekje, boekjes, setActiveBoekje: mockSetActiveBoekje },
  });
  await user.click(screen.getByText("Kies een boekje..."));
  await user.click(screen.getByText("Boekje 1"));
  expect(mockSetActiveBoekje).toHaveBeenCalledWith("b1");
  expect(mockRouter.push).toHaveBeenCalledWith("/boekje/b1");
});

it("calls logout and redirects", async () => {
  const user = userEvent.setup();
  const mockLogout = jest.fn().mockResolvedValue(undefined);
  renderWithProviders(<Header />, { auth: { ...defaultMockAuth, logout: mockLogout } });
  await user.click(screen.getByText("Uitloggen"));
  expect(mockLogout).toHaveBeenCalled();
  expect(mockRouter.push).toHaveBeenCalledWith("/login");
});

it("app name button navigates to home", async () => {
  const user = userEvent.setup();
  renderWithProviders(<Header />);
  await user.click(screen.getByText("Huishoudboekje"));
  expect(mockRouter.push).toHaveBeenCalledWith("/");
});
