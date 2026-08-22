import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/app/ui/login-form";
import { mockRouter } from "next/navigation";
import { renderWithProviders, defaultMockAuth } from "../test-utils";

beforeEach(() => {
  jest.clearAllMocks();
});

it("renders the login form with all fields", () => {
  renderWithProviders(<LoginForm />);
  expect(screen.getByRole("heading", { name: "Inloggen" })).toBeInTheDocument();
  expect(screen.getByText("Welkom terug bij Huishoudboekje")).toBeInTheDocument();
  expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
  expect(screen.getByLabelText("Wachtwoord")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Inloggen" })).toBeInTheDocument();
  expect(screen.getByText("Registreer")).toBeInTheDocument();
});

it("allows typing in email and password fields", async () => {
  const user = userEvent.setup();
  renderWithProviders(<LoginForm />);
  const emailInput = screen.getByLabelText("E-mail");
  const passwordInput = screen.getByLabelText("Wachtwoord");
  await user.type(emailInput, "test@example.com");
  await user.type(passwordInput, "mypassword");
  expect(emailInput).toHaveValue("test@example.com");
  expect(passwordInput).toHaveValue("mypassword");
});

it("calls login and redirects on successful submit", async () => {
  const user = userEvent.setup();
  const mockLogin = jest.fn().mockResolvedValue(undefined);
  renderWithProviders(<LoginForm />, { auth: { ...defaultMockAuth, login: mockLogin } });
  await user.type(screen.getByLabelText("E-mail"), "test@example.com");
  await user.type(screen.getByLabelText("Wachtwoord"), "password");
  await user.click(screen.getByRole("button", { name: "Inloggen" }));
  expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password");
  expect(mockRouter.push).toHaveBeenCalledWith("/");
});

it("shows error message when login fails", async () => {
  const user = userEvent.setup();
  const mockLogin = jest.fn().mockRejectedValue(new Error("Ongeldige inloggegevens"));
  renderWithProviders(<LoginForm />, { auth: { ...defaultMockAuth, login: mockLogin } });
  await user.type(screen.getByLabelText("E-mail"), "test@example.com");
  await user.type(screen.getByLabelText("Wachtwoord"), "wrong");
  await user.click(screen.getByRole("button", { name: "Inloggen" }));
  expect(await screen.findByText("Ongeldige inloggegevens")).toBeInTheDocument();
});

it("shows loading state while submitting", async () => {
  const user = userEvent.setup();
  const mockLogin = jest.fn().mockImplementation(() => new Promise(() => {}));
  renderWithProviders(<LoginForm />, { auth: { ...defaultMockAuth, login: mockLogin } });
  await user.type(screen.getByLabelText("E-mail"), "test@example.com");
  await user.type(screen.getByLabelText("Wachtwoord"), "password");
  await user.click(screen.getByRole("button", { name: "Inloggen" }));
  expect(screen.getByRole("button", { name: "Bezig..." })).toBeDisabled();
});

it("has a link to the register page", () => {
  renderWithProviders(<LoginForm />);
  const link = screen.getByText("Registreer");
  expect(link).toHaveAttribute("href", "/register");
});
