import { screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BoekjeCard } from "@/app/ui/boekje-card";
import { useRouter } from "next/navigation";
import { renderWithProviders, defaultMockBoekje, createMockBoekje } from "../test-utils";
const mockSetActiveBoekje = jest.fn();
const mockDeleteBoekje = jest.fn().mockResolvedValue(undefined);

beforeEach(() => {
  jest.clearAllMocks();
});

it("renders boekje title and description", () => {
  const boekje = createMockBoekje({ title: "Mijn Boekje", description: "Een test boekje" });
  renderWithProviders(<BoekjeCard boekje={boekje} />);
  expect(screen.getByText("Mijn Boekje")).toBeInTheDocument();
  expect(screen.getByText("Een test boekje")).toBeInTheDocument();
});

it("renders member count badge (singular)", () => {
  const boekje = createMockBoekje({ members: ["user-1"] });
  renderWithProviders(<BoekjeCard boekje={boekje} />);
  expect(screen.getByText("1 lid")).toBeInTheDocument();
});

it("renders member count badge (plural)", () => {
  const boekje = createMockBoekje({ members: ["user-1", "user-2"] });
  renderWithProviders(<BoekjeCard boekje={boekje} />);
  expect(screen.getByText("2 leden")).toBeInTheDocument();
});

it("navigates to boekje on click", async () => {
  const user = userEvent.setup();
  const router = useRouter();
  const boekje = createMockBoekje({ id: "boekje-1" });
  renderWithProviders(<BoekjeCard boekje={boekje} />, {
    boekje: { ...defaultMockBoekje, setActiveBoekje: mockSetActiveBoekje },
  });
  await user.click(screen.getByText("Test Boekje"));
  expect(mockSetActiveBoekje).toHaveBeenCalledWith("boekje-1");
  expect(router.push).toHaveBeenCalledWith("/boekje/boekje-1");
});

it("calls deleteBoekje when delete button is clicked", async () => {
  jest.useFakeTimers();
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const boekje = createMockBoekje({ id: "boekje-1", createdBy: "test-user-uid", archived: true });
  renderWithProviders(<BoekjeCard boekje={boekje} />, {
    boekje: { ...defaultMockBoekje, deleteBoekje: mockDeleteBoekje },
  });
  await user.click(screen.getByTitle("Verwijderen"));
  expect(screen.getByText("Boekje verwijderen")).toBeInTheDocument();
  await user.click(screen.getByText("Verwijderen"));
  jest.advanceTimersByTime(300);
  await act(async () => { await Promise.resolve(); });
  expect(mockDeleteBoekje).toHaveBeenCalledWith("boekje-1");
  jest.useRealTimers();
});

it("does not show description when absent", () => {
  const boekje = createMockBoekje({ description: undefined });
  renderWithProviders(<BoekjeCard boekje={boekje} />);
  expect(screen.getByText("Test Boekje")).toBeInTheDocument();
});

it("rolls back the animation when delete fails", async () => {
  jest.useFakeTimers();
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const mockDeleteBoekje = jest.fn().mockRejectedValue(new Error("delete failed"));
  const boekje = createMockBoekje({ id: "boekje-1", createdBy: "test-user-uid", archived: true });
  renderWithProviders(<BoekjeCard boekje={boekje} />, {
    boekje: { ...defaultMockBoekje, deleteBoekje: mockDeleteBoekje },
  });
  await user.click(screen.getByTitle("Verwijderen"));
  expect(screen.getByText("Boekje verwijderen")).toBeInTheDocument();
  await user.click(screen.getByText("Verwijderen"));
  jest.advanceTimersByTime(300);
  await act(async () => { await Promise.resolve(); });
  expect(mockDeleteBoekje).toHaveBeenCalledWith("boekje-1");
  jest.useRealTimers();
});

it("calls updateBoekje with archived true when archive button is clicked", async () => {
  const user = userEvent.setup();
  const mockUpdateBoekje = jest.fn().mockResolvedValue(undefined);
  const boekje = createMockBoekje({ id: "boekje-1", createdBy: "test-user-uid", archived: false });
  renderWithProviders(<BoekjeCard boekje={boekje} />, {
    boekje: { ...defaultMockBoekje, updateBoekje: mockUpdateBoekje },
  });
  await user.click(screen.getByTitle("Archiveer"));
  expect(screen.getByText("Boekje archiveren")).toBeInTheDocument();
  await user.click(screen.getByText("Archiveren"));
  await act(async () => { await Promise.resolve(); });
  expect(mockUpdateBoekje).toHaveBeenCalledWith("boekje-1", { archived: true });
});

it("calls updateBoekje with archived false when restore button is clicked", async () => {
  const user = userEvent.setup();
  const mockUpdateBoekje = jest.fn().mockResolvedValue(undefined);
  const boekje = createMockBoekje({ id: "boekje-1", createdBy: "test-user-uid", archived: true });
  renderWithProviders(<BoekjeCard boekje={boekje} />, {
    boekje: { ...defaultMockBoekje, updateBoekje: mockUpdateBoekje },
  });
  await user.click(screen.getByTitle("Herstellen"));
  await act(async () => { await Promise.resolve(); });
  expect(mockUpdateBoekje).toHaveBeenCalledWith("boekje-1", { archived: false });
});
