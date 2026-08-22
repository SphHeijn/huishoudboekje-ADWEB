import { render, screen } from "@testing-library/react";
import { UncategorizedDropzone } from "@/app/ui/dnd/uncategorized-dropzone";
import { createMockTransactie } from "../../test-utils";

jest.mock("@dnd-kit/core", () => ({
  useDroppable: () => ({
    setNodeRef: jest.fn(),
    isOver: false,
  }),
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    isDragging: false,
  }),
}));

describe("UncategorizedDropzone", () => {
  it("renders title and count with 0 transactions", () => {
    render(<UncategorizedDropzone transacties={[]} isOver={false} />);
    expect(screen.getByText("Geen categorie (0)")).toBeInTheDocument();
    expect(
      screen.getByText("Sleep een transactie hierheen om de categorie te ontkoppelen")
    ).toBeInTheDocument();
  });

  it("renders transactions when present", () => {
    const t1 = createMockTransactie({ id: "t1", description: "Lunch", amount: 15 });
    render(<UncategorizedDropzone transacties={[t1]} isOver={false} />);
    expect(screen.getByText("Geen categorie (1)")).toBeInTheDocument();
    expect(screen.getByText("Lunch")).toBeInTheDocument();
  });

  it("shows drop release text when isOver is true", () => {
    render(<UncategorizedDropzone transacties={[]} isOver={true} />);
    expect(
      screen.getByText("Laat los om categorie te verwijderen")
    ).toBeInTheDocument();
  });
});
