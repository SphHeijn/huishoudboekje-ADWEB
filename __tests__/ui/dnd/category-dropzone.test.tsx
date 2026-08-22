import { render, screen } from "@testing-library/react";
import { CategoryDropzone } from "@/app/ui/dnd/category-dropzone";
import { createMockCategorie } from "../../test-utils";

jest.mock("@dnd-kit/core", () => ({
  useDroppable: () => ({
    setNodeRef: jest.fn(),
    isOver: false,
  }),
}));

describe("CategoryDropzone", () => {
  it("renders category name and icon", () => {
    const cat = createMockCategorie({ name: "Boodschappen", icon: "🛒" });
    render(<CategoryDropzone categorie={cat} transacties={[]} isOver={false} />);
    expect(screen.getByText("Boodschappen")).toBeInTheDocument();
    expect(screen.getByText("🛒")).toBeInTheDocument();
  });

  it("shows drop instruction text", () => {
    const cat = createMockCategorie({ name: "Vervoer" });
    render(<CategoryDropzone categorie={cat} transacties={[]} isOver={false} />);
    expect(screen.getByText("Sleep een uitgave hierheen")).toBeInTheDocument();
  });

  it("shows '📁' when no icon provided", () => {
    const cat = createMockCategorie({ icon: "" });
    render(<CategoryDropzone categorie={cat} transacties={[]} isOver={false} />);
    expect(screen.getByText("📁")).toBeInTheDocument();
  });
});
