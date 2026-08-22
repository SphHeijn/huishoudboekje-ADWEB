import { render, screen } from "@testing-library/react";
import { DraggableTransaction } from "@/app/ui/dnd/draggable-transaction";
import { createMockTransactie } from "../../test-utils";

jest.mock("@dnd-kit/core", () => ({
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    isDragging: false,
  }),
}));

describe("DraggableTransaction", () => {
  it("renders transaction description and amount", () => {
    const t = createMockTransactie({ description: "Boodschappen", amount: 45.50 });
    render(<DraggableTransaction transaction={t} />);
    expect(screen.getByText("Boodschappen")).toBeInTheDocument();
    expect(screen.getByText(/€\s*45,50/)).toBeInTheDocument();
  });

  it("shows 'Transactie' placeholder when no description", () => {
    const t = createMockTransactie({ description: "", amount: 10 });
    render(<DraggableTransaction transaction={t} />);
    expect(screen.getByText("Transactie")).toBeInTheDocument();
  });
});
