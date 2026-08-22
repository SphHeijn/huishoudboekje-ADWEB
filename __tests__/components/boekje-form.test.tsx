import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BoekjeForm } from "@/app/ui/boekje-form";
import { renderWithProviders, defaultMockBoekje } from "../test-utils";

const mockOnDone = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

it("renders create form with correct heading", () => {
  renderWithProviders(<BoekjeForm onDone={mockOnDone} />);
  expect(screen.getByText("Nieuw boekje")).toBeInTheDocument();
  expect(screen.getByText("Titel")).toBeInTheDocument();
  expect(screen.getByText("Beschrijving (optioneel)")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Aanmaken" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Annuleren" })).toBeInTheDocument();
});

it("renders edit form with correct heading and pre-filled values", () => {
  renderWithProviders(
    <BoekjeForm
      onDone={mockOnDone}
      initial={{ title: "My Book", description: "My desc" }}
      boekjeId="boekje-1"
    />
  );
  expect(screen.getByText("Boekje bewerken")).toBeInTheDocument();
  const titleInput = screen.getByPlaceholderText("Bijv. Huishoudboekje 2025");
  expect(titleInput).toHaveValue("My Book");
  expect(screen.getByPlaceholderText("Korte omschrijving")).toHaveValue("My desc");
  expect(screen.getByRole("button", { name: "Opslaan" })).toBeInTheDocument();
});

it("calls createBoekje and onDone on valid submit", async () => {
  const user = userEvent.setup();
  const mockCreateBoekje = jest.fn().mockResolvedValue("new-id");
  renderWithProviders(<BoekjeForm onDone={mockOnDone} />, {
    boekje: { ...defaultMockBoekje, createBoekje: mockCreateBoekje },
  });
  await user.type(screen.getByPlaceholderText("Bijv. Huishoudboekje 2025"), "Mijn Boekje");
  await user.click(screen.getByRole("button", { name: "Aanmaken" }));
  expect(mockCreateBoekje).toHaveBeenCalledWith({
    title: "Mijn Boekje",
    description: undefined,
    currency: "EUR",
    archived: false,
  });
  expect(mockOnDone).toHaveBeenCalled();
});

it("calls updateBoekje on valid submit in edit mode", async () => {
  const user = userEvent.setup();
  const mockUpdateBoekje = jest.fn().mockResolvedValue(undefined);
  renderWithProviders(
    <BoekjeForm
      onDone={mockOnDone}
      initial={{ title: "Old Title" }}
      boekjeId="boekje-1"
    />,
    { boekje: { ...defaultMockBoekje, updateBoekje: mockUpdateBoekje } }
  );
  const titleInput = screen.getByPlaceholderText("Bijv. Huishoudboekje 2025");
  await user.clear(titleInput);
  await user.type(titleInput, "Updated Title");
  await user.click(screen.getByRole("button", { name: "Opslaan" }));
  expect(mockUpdateBoekje).toHaveBeenCalledWith("boekje-1", {
    title: "Updated Title",
    description: undefined,
    currency: "EUR",
    archived: false,
  });
  expect(mockOnDone).toHaveBeenCalled();
});

it("shows validation error for empty title", async () => {
  renderWithProviders(<BoekjeForm onDone={mockOnDone} />);
  fireEvent.submit(screen.getByRole("button", { name: "Aanmaken" }).closest("form")!);
  expect(await screen.findByText("Titel is verplicht")).toBeInTheDocument();
  expect(mockOnDone).not.toHaveBeenCalled();
});

it("calls onDone when cancel is clicked", async () => {
  const user = userEvent.setup();
  renderWithProviders(<BoekjeForm onDone={mockOnDone} />);
  await user.click(screen.getByRole("button", { name: "Annuleren" }));
  expect(mockOnDone).toHaveBeenCalled();
});

it("shows error when createBoekje throws", async () => {
  const user = userEvent.setup();
  const mockCreateBoekje = jest.fn().mockRejectedValue(new Error("Firestore fout"));
  renderWithProviders(<BoekjeForm onDone={mockOnDone} />, {
    boekje: { ...defaultMockBoekje, createBoekje: mockCreateBoekje },
  });
  await user.type(screen.getByPlaceholderText("Bijv. Huishoudboekje 2025"), "Test");
  await user.click(screen.getByRole("button", { name: "Aanmaken" }));
  expect(await screen.findByText("Firestore fout")).toBeInTheDocument();
});
