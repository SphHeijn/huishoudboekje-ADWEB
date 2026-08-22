jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(() => Promise.resolve()),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => ({ toDate: () => new Date() })),
  Timestamp: jest.fn(),
}));

import {
  addDoc as mockAddDoc,
  updateDoc as mockUpdateDoc,
  deleteDoc as mockDeleteDoc,
  getDoc as mockGetDoc,
  getDocs as mockGetDocs,
  onSnapshot as mockOnSnapshot,
  collection as mockCollection,
  query as mockQuery,
  where as mockWhere,
  orderBy as mockOrderBy,
} from "firebase/firestore";

const {
  subscribeBoekjes,
  getBoekje,
  createBoekje,
  updateBoekje,
  deleteBoekje,
  subscribeTransacties,
  getTransactie,
  createTransactie,
  updateTransactie,
  deleteTransactie,
  subscribeCategorieen,
  createCategorie,
  updateCategorie,
  deleteCategorie,
  getUserByEmail,
  getUserEmails,
} = jest.requireActual("@/app/lib/services/firestore");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("subscribeBoekjes", () => {
  it("calls onSnapshot with correct query", () => {
    const mockUnsubscribe = jest.fn();
    mockOnSnapshot.mockReturnValue(mockUnsubscribe);
    subscribeBoekjes("user-1").subscribe();
    expect(mockCollection).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalledWith("members", "array-contains", "user-1");
    expect(mockQuery).toHaveBeenCalled();
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
  });

  it("returns an Observable that emits mapped documents", (done) => {
    const mockDocData = {
      id: "b1",
      data: () => ({
        title: "Test",
        members: ["user-1"],
        createdAt: new Date("2026-01-01"),
      }),
    };
    mockOnSnapshot.mockImplementation(
      (_q: unknown, onData: (snapshot: unknown) => void) => {
        onData({ docs: [mockDocData], forEach: () => {} });
        return jest.fn();
      }
    );
    subscribeBoekjes("user-1").subscribe({
      next: (boekjes) => {
        expect(boekjes).toEqual(
          expect.arrayContaining([expect.objectContaining({ id: "b1", title: "Test" })])
        );
        done();
      },
    });
  });

  it("emits error when snapshot fails", (done) => {
    mockOnSnapshot.mockImplementation(
      (
        _q: unknown,
        _onData: (snapshot: unknown) => void,
        onError: (err: { message: string }) => void
      ) => {
        onError({ message: "Permission error" });
        return jest.fn();
      }
    );
    subscribeBoekjes("user-1").subscribe({
      error: (err) => {
        expect(err.message).toBe("Permission error");
        done();
      },
    });
  });

  it("unsubscribes when subscription is unsubscribed", () => {
    const mockUnsubscribe = jest.fn();
    mockOnSnapshot.mockReturnValue(mockUnsubscribe);
    const subscription = subscribeBoekjes("user-1").subscribe();
    subscription.unsubscribe();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it("sorts boekjes by createdAt descending", (done) => {
    const older = {
      id: "b1",
      data: () => ({
        title: "Older",
        members: ["user-1"],
        createdAt: new Date("2025-01-01"),
      }),
    };
    const newer = {
      id: "b2",
      data: () => ({
        title: "Newer",
        members: ["user-1"],
        createdAt: new Date("2026-01-01"),
      }),
    };
    mockOnSnapshot.mockImplementation(
      (_q: unknown, onData: (snapshot: unknown) => void) => {
        onData({ docs: [older, newer], forEach: () => {} });
        return jest.fn();
      }
    );
    subscribeBoekjes("user-1").subscribe({
      next: (boekjes) => {
        expect(boekjes[0].id).toBe("b2");
        expect(boekjes[1].id).toBe("b1");
        done();
      },
    });
  });
});

describe("getBoekje", () => {
  it("returns null when doc does not exist", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false });
    const result = await getBoekje("b1");
    expect(result).toBeNull();
  });

  it("returns mapped data when doc exists", async () => {
    const mockSnapshot = {
      exists: () => true,
      id: "b1",
      data: () => ({ title: "Test", members: ["user-1"] }),
    };
    mockGetDoc.mockResolvedValue(mockSnapshot);
    const result = await getBoekje("b1");
    expect(result).toEqual(
      expect.objectContaining({ id: "b1", title: "Test" })
    );
  });
});

describe("createBoekje", () => {
  it("calls addDoc with parsed data", async () => {
    mockAddDoc.mockResolvedValue({ id: "new-id" });
    const id = await createBoekje(
      { title: "New Boekje", currency: "EUR" },
      "user-1"
    );
    expect(mockAddDoc).toHaveBeenCalled();
    expect(id).toBe("new-id");
  });

  it("throws validation error for invalid data", async () => {
    await expect(
      createBoekje({ title: "", currency: "EUR" }, "user-1")
    ).rejects.toThrow();
  });
});

describe("updateBoekje", () => {
  it("calls updateDoc with parsed partial data", async () => {
    await updateBoekje("b1", { title: "Updated" });
    expect(mockUpdateDoc).toHaveBeenCalled();
  });

  it("includes members in update when provided", async () => {
    await updateBoekje("b1", { members: ["user-1", "user-2"] });
    expect(mockUpdateDoc).toHaveBeenCalled();
    const args = mockUpdateDoc.mock.calls[0];
    expect(args[1]).toEqual(
      expect.objectContaining({ members: ["user-1", "user-2"] })
    );
  });
});

describe("deleteBoekje", () => {
  it("deletes the boekje document", async () => {
    await deleteBoekje("b1");
    expect(mockDeleteDoc).toHaveBeenCalled();
  });
});

describe("subscribeTransacties", () => {
  it("calls onSnapshot with date-range filtered query", () => {
    mockOnSnapshot.mockReturnValue(jest.fn());
    subscribeTransacties("boekje-1", "2026-05").subscribe();
    expect(mockCollection).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalledWith("date", ">=", "2026-05-01");
    expect(mockOrderBy).toHaveBeenCalledWith("date", "desc");
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
  });
});

describe("getTransactie", () => {
  it("returns null when doc does not exist", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false });
    const result = await getTransactie("b1", "t1");
    expect(result).toBeNull();
  });

  it("returns mapped data when doc exists", async () => {
    const mockSnapshot = {
      exists: () => true,
      id: "t1",
      data: () => ({ type: "uitgave", amount: 50, date: "2026-05-15" }),
    };
    mockGetDoc.mockResolvedValue(mockSnapshot);
    const result = await getTransactie("b1", "t1");
    expect(result).toEqual(
      expect.objectContaining({ id: "t1", amount: 50 })
    );
  });
});

describe("createTransactie", () => {
  it("calls addDoc with parsed data including createdBy", async () => {
    mockAddDoc.mockResolvedValue({ id: "new-trans" });
    const id = await createTransactie(
      {
        boekjeId: "b1",
        type: "uitgave",
        amount: 25,
        categoryId: "c1",
        date: "2026-05-15",
      },
      "user-1"
    );
    expect(mockAddDoc).toHaveBeenCalled();
    expect(id).toBe("new-trans");
  });

  it("strips undefined fields before calling addDoc", async () => {
    mockAddDoc.mockResolvedValue({ id: "new-trans-2" });
    const id = await createTransactie(
      {
        boekjeId: "b1",
        type: "uitgave",
        amount: 25,
        categoryId: undefined,
        date: "2026-05-15",
      },
      "user-1"
    );
    const callArg = (mockAddDoc as jest.Mock).mock.calls[0][1];
    expect(callArg).not.toHaveProperty("categoryId");
    expect(callArg).toHaveProperty("amount", 25);
    expect(callArg).toHaveProperty("createdBy", "user-1");
    expect(id).toBe("new-trans-2");
  });
});

describe("updateTransactie", () => {
  it("calls updateDoc", async () => {
    await updateTransactie("b1", "t1", { amount: 30 });
    expect(mockUpdateDoc).toHaveBeenCalled();
  });
});

describe("deleteTransactie", () => {
  it("calls deleteDoc", async () => {
    await deleteTransactie("b1", "t1");
    expect(mockDeleteDoc).toHaveBeenCalled();
  });
});

describe("subscribeCategorieen", () => {
  it("calls onSnapshot with category collection", () => {
    mockOnSnapshot.mockReturnValue(jest.fn());
    subscribeCategorieen("boekje-1").subscribe();
    expect(mockCollection).toHaveBeenCalledWith(expect.anything(), "huishoudboekjes", "boekje-1", "categorieen");
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
  });
});

describe("createCategorie", () => {
  it("calls addDoc with parsed data", async () => {
    mockAddDoc.mockResolvedValue({ id: "new-cat" });
    const id = await createCategorie("b1", {
      name: "Test",
    });
    expect(mockAddDoc).toHaveBeenCalled();
    expect(id).toBe("new-cat");
  });
});

describe("updateCategorie", () => {
  it("calls updateDoc", async () => {
    await updateCategorie("b1", "c1", { name: "Updated" });
    expect(mockUpdateDoc).toHaveBeenCalled();
  });
});

describe("deleteCategorie", () => {
  it("calls deleteDoc", async () => {
    await deleteCategorie("b1", "c1");
    expect(mockDeleteDoc).toHaveBeenCalled();
  });
});

describe("getUserByEmail", () => {
  it("returns null when user query is empty", async () => {
    mockGetDocs.mockResolvedValue({ empty: true });
    const result = await getUserByEmail("notfound@example.com");
    expect(result).toBeNull();
  });

  it("returns user id when user email matches", async () => {
    mockGetDocs.mockResolvedValue({
      empty: false,
      docs: [{ id: "user-123", data: () => ({ email: "found@example.com" }) }],
    });
    const result = await getUserByEmail("found@example.com");
    expect(result).toBe("user-123");
  });
});

describe("getUserEmails", () => {
  it("returns empty object when no uids passed", async () => {
    const result = await getUserEmails([]);
    expect(result).toEqual({});
  });

  it("returns mapped user emails", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ email: "u1@example.com" }),
    });
    const result = await getUserEmails(["user-1"]);
    expect(result).toEqual({ "user-1": "u1@example.com" });
  });

  it("handles non-existent user docs and errors", async () => {
    mockGetDoc
      .mockResolvedValueOnce({
        exists: () => false,
      })
      .mockRejectedValueOnce(new Error("fail"));

    const result = await getUserEmails(["user-1", "user-2"]);
    expect(result).toEqual({
      "user-1": "Onbekende gebruiker",
      "user-2": "Fout bij laden",
    });
  });
});
