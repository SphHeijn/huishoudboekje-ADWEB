import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "@/app/ui/register-form";
import { mockRouter } from "next/navigation";
import { renderWithProviders, defaultMockAuth } from "../test-utils";

beforeEach(() => {
  jest.clearAllMocks();
});

it("renders the register form with all fields", () => {
  renderWithProviders(<RegisterForm />);
  expect(screen.getByRole("heading", { name: "Account aanmaken" })).toBeInTheDocument();
  expect(screen.getByText("Maak een nieuw account voor Huishoudboekje")).toBeInTheDocument();
  expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
  expect(screen.getByLabelText("Wachtwoord")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Account aanmaken" })).toBeInTheDocument();
  expect(screen.getByText("Inloggen")).toBeInTheDocument();
});

it("has minLength 6 on password field", () => {
  renderWithProviders(<RegisterForm />);
  expect(screen.getByLabelText("Wachtwoord")).toHaveAttribute("minLength", "6");
});

it("calls register and redirects on successful submit", async () => {
  const user = userEvent.setup();
  const mockRegister = jest.fn().mockResolvedValue(undefined);
  renderWithProviders(<RegisterForm />, { auth: { ...defaultMockAuth, register: mockRegister } });
  await user.type(screen.getByLabelText("E-mail"), "new@example.com");
  await user.type(screen.getByLabelText("Wachtwoord"), "password123");
  await user.click(screen.getByRole("button", { name: "Account aanmaken" }));
  expect(mockRegister).toHaveBeenCalledWith("new@example.com", "password123");
  expect(mockRouter.push).toHaveBeenCalledWith("/");
});

it("shows error message when registration fails", async () => {
  const user = userEvent.setup();
  const mockRegister = jest.fn().mockRejectedValue(new Error("E-mailadres is al in gebruik"));
  renderWithProviders(<RegisterForm />, { auth: { ...defaultMockAuth, register: mockRegister } });
  await user.type(screen.getByLabelText("E-mail"), "existing@example.com");
  await user.type(screen.getByLabelText("Wachtwoord"), "password123");
  await user.click(screen.getByRole("button", { name: "Account aanmaken" }));
  expect(await screen.findByText("E-mailadres is al in gebruik")).toBeInTheDocument();
});

it("has a link to the login page", () => {
  renderWithProviders(<RegisterForm />);
  const link = screen.getByText("Inloggen");
  expect(link).toHaveAttribute("href", "/login");
});
