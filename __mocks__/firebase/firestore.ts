const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockAddDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockOnSnapshot = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockServerTimestamp = jest.fn(() => ({ toDate: () => new Date() }));
const mockTimestamp = {
  now: jest.fn(() => ({ toDate: () => new Date() })),
  fromDate: jest.fn((d: Date) => ({ toDate: () => d })),
};

function mockSnapshot(docs: Array<{ id: string; data: () => Record<string, unknown> }>) {
  return {
    docs: docs.map((d) => ({
      id: d.id,
      data: d.data,
      exists: () => true,
    })),
    forEach: (cb: (doc: unknown) => void) =>
      docs.forEach((d) =>
        cb({
          id: d.id,
          data: d.data,
          exists: () => true,
        })
      ),
  };
}

function mockDocSnapshot(
  exists: boolean,
  data?: Record<string, unknown>
) {
  return {
    exists: () => exists,
    id: "mock-doc-id",
    data: () => data ?? null,
  };
}

export {
  mockCollection as collection,
  mockDoc as doc,
  mockAddDoc as addDoc,
  mockUpdateDoc as updateDoc,
  mockDeleteDoc as deleteDoc,
  mockGetDoc as getDoc,
  mockGetDocs as getDocs,
  mockOnSnapshot as onSnapshot,
  mockQuery as query,
  mockWhere as where,
  mockOrderBy as orderBy,
  mockServerTimestamp as serverTimestamp,
  mockTimestamp as Timestamp,
  mockSnapshot,
  mockDocSnapshot,
};

export const __mocks__ = {
  collection: mockCollection,
  doc: mockDoc,
  addDoc: mockAddDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  onSnapshot: mockOnSnapshot,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  serverTimestamp: mockServerTimestamp,
  Timestamp: mockTimestamp,
};
