import { render, screen } from "@testing-library/react";
import { TransactionDndWrapper } from "@/app/ui/dnd/transaction-dnd-wrapper";
import { createMockTransactie, createMockCategorie } from "../../test-utils";

const mockUseBoekjeContext = jest.fn();

jest.mock("@/app/lib/contexts/boekje-context", () => ({
  useBoekjeContext: () => mockUseBoekjeContext(),
}));

jest.mock("@/app/lib/contexts/auth-context", () => ({
  useAuth: () => ({ user: { uid: "test-user-uid" } }),
}));

jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div data-testid="dnd-context">{children}</div>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <div data-testid="drag-overlay">{children}</div>,
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    isDragging: false,
  }),
  useDroppable: () => ({
    setNodeRef: jest.fn(),
    isOver: false,
  }),
  closestCenter: jest.fn(),
  PointerSensor: jest.fn(),
  useSensor: jest.fn(() => ({})),
  useSensors: jest.fn(() => []),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockUseBoekjeContext.mockReturnValue({
    transacties: [],
    categorieen: [],
    updateTransactie: jest.fn(),
    activeBoekjeId: "boekje-1",
    activeBoekje: { id: "boekje-1", createdBy: "test-user-uid", members: ["test-user-uid"] },
  });
});

describe("TransactionDndWrapper", () => {
  it("shows empty state when no categories", () => {
    render(<TransactionDndWrapper />);
    expect(screen.getByText("Geen categorieën")).toBeInTheDocument();
  });

  it("shows empty state when no categories with transactions present", () => {
    mockUseBoekjeContext.mockReturnValue({
      transacties: [createMockTransactie({ id: "t1", description: "Boodschappen", amount: 20 })],
      categorieen: [],
      updateTransactie: jest.fn(),
      activeBoekjeId: "boekje-1",
      activeBoekje: { id: "boekje-1", createdBy: "test-user-uid", members: ["test-user-uid"] },
    });
    render(<TransactionDndWrapper />);
    expect(screen.getByText("Geen categorieën")).toBeInTheDocument();
  });

  it("renders both uitgaven and inkomsten as uncategorized", () => {
    mockUseBoekjeContext.mockReturnValue({
      transacties: [
        createMockTransactie({ id: "t1", description: "Boodschappen", amount: 20, type: "uitgave", categoryId: "" }),
        createMockTransactie({ id: "t2", description: "Salaris", amount: 1000, type: "inkomsten", categoryId: "" }),
      ],
      categorieen: [
        createMockCategorie({ id: "cat-1", name: "Boodschappen" }),
        createMockCategorie({ id: "cat-2", name: "Vervoer" }),
      ],
      updateTransactie: jest.fn(),
      activeBoekjeId: "boekje-1",
      activeBoekje: { id: "boekje-1", createdBy: "test-user-uid", members: ["test-user-uid"] },
    });
    render(<TransactionDndWrapper />);
    expect(screen.getByText("Geen categorie (2)")).toBeInTheDocument();
    expect(screen.getAllByText("Boodschappen").length).toBe(2);
    expect(screen.getByText("Vervoer")).toBeInTheDocument();
    expect(screen.getByText("Salaris")).toBeInTheDocument();
  });

  it("shows permission message when user is not the owner", () => {
    mockUseBoekjeContext.mockReturnValue({
      transacties: [createMockTransactie({ id: "t1", description: "Boodschappen", amount: 20 })],
      categorieen: [createMockCategorie({ id: "cat-1", name: "Boodschappen" })],
      updateTransactie: jest.fn(),
      activeBoekjeId: "boekje-1",
      activeBoekje: { id: "boekje-1", createdBy: "other-user", members: ["test-user-uid", "other-user"] },
    });
    render(<TransactionDndWrapper />);
    expect(screen.getByText("Alleen de eigenaar van dit boekje kan transacties koppelen aan categorieën.")).toBeInTheDocument();
  });
});
