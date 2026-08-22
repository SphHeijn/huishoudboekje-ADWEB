import React from "react";

const MockDndContext = ({ children }: { children?: React.ReactNode }) => <div data-testid="dnd-context">{children}</div>;
const MockDragOverlay = ({ children }: { children?: React.ReactNode }) => <div data-testid="drag-overlay">{children}</div>;
const MockuseDraggable = (_props: { id: string }) => {
  void _props;
  return {
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    isDragging: false,
  };
};
const MockuseDroppable = (_props: { id: string }) => {
  void _props;
  return {
    setNodeRef: jest.fn(),
    isOver: false,
  };
};

export const DndContext = MockDndContext;
export const DragOverlay = MockDragOverlay;
export const closestCenter = jest.fn();
export const PointerSensor = jest.fn();
export const useSensor = jest.fn(() => ({}));
export const useSensors = jest.fn(() => []);
export const useDraggable = MockuseDraggable;
export const useDroppable = MockuseDroppable;

const dndKitCore = {
  DndContext: MockDndContext,
  DragOverlay: MockDragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable: MockuseDraggable,
  useDroppable: MockuseDroppable,
};
export default dndKitCore;
