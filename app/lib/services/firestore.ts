"use client";

import { Observable } from "rxjs";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
} from "firebase/firestore";
import { getFirebaseDb } from "@/app/lib/firebase";
import {
  boekjeSchema,
  transactieSchema,
  categorieSchema,
  type Boekje,
  type Transactie,
  type Categorie,
  type BoekjeDoc,
  type TransactieDoc,
  type CategorieDoc,
} from "@/app/lib/schemas";

function docToData<T extends { id: string }>(
  snapshot: DocumentSnapshot | QueryDocumentSnapshot
): T {
  const data = snapshot.data();
  if (!data) throw new Error(`Document ${snapshot.id} niet gevonden`);
  const converted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      converted[key] = value.toDate();
    } else {
      converted[key] = value;
    }
  }
  if (converted.members !== undefined && converted.archived === undefined) {
    converted.archived = false;
  }
  return { id: snapshot.id, ...converted } as T;
}

function getMonthRange(filterMonth: string): { start: string; end: string } {
  const [year, month] = filterMonth.split("-").map(Number);
  const start = `${filterMonth}-01`;
  const endDate = new Date(year, month, 1);
  const y = endDate.getFullYear();
  const m = String(endDate.getMonth() + 1).padStart(2, "0");
  const d = String(endDate.getDate()).padStart(2, "0");
  return { start, end: `${y}-${m}-${d}` };
}

// ───── Boekjes ─────

export function subscribeBoekjes(userId: string): Observable<BoekjeDoc[]> {
  return new Observable((subscriber) => {
    const db = getFirebaseDb();
    const q = query(
      collection(db, "huishoudboekjes"),
      where("members", "array-contains", userId)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const boekjes = snapshot.docs
          .map((d) => docToData<BoekjeDoc>(d))
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        subscriber.next(boekjes);
      },
      (err) => subscriber.error(new Error(err.message))
    );
    return () => unsubscribe();
  });
}

export async function getBoekje(id: string): Promise<BoekjeDoc | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, "huishoudboekjes", id));
  if (!snap.exists()) return null;
  return docToData<BoekjeDoc>(snap);
}

export async function createBoekje(
  data: Boekje,
  userId: string
): Promise<string> {
  const db = getFirebaseDb();
  const parsed = boekjeSchema.parse(data);
  const cleanData = Object.fromEntries(
    Object.entries(parsed).filter(([, v]) => v !== undefined)
  );
  const docRef = await addDoc(collection(db, "huishoudboekjes"), {
    ...cleanData,
    members: [userId],
    createdBy: userId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateBoekje(
  id: string,
  data: Partial<Boekje & { members: string[] }>
): Promise<void> {
  const db = getFirebaseDb();
  const parsed = boekjeSchema.partial().parse(data);
  const updateData: Record<string, unknown> = Object.fromEntries(
    Object.entries(parsed).filter(([, v]) => v !== undefined)
  );
  if (data.members !== undefined) {
    updateData.members = data.members;
  }
  await updateDoc(doc(db, "huishoudboekjes", id), updateData);
}

export async function deleteBoekje(id: string): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, "huishoudboekjes", id));
}

// ───── Transacties ─────

export function subscribeTransacties(
  boekjeId: string,
  filterMonth: string
): Observable<TransactieDoc[]> {
  return new Observable((subscriber) => {
    const db = getFirebaseDb();
    const { start, end } = getMonthRange(filterMonth);
    const q = query(
      collection(db, "huishoudboekjes", boekjeId, "transacties"),
      where("date", ">=", start),
      where("date", "<", end),
      orderBy("date", "desc")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const transacties = snapshot.docs.map((d) => docToData<TransactieDoc>(d));
        subscriber.next(transacties);
      },
      (err) => subscriber.error(new Error(err.message))
    );
    return () => unsubscribe();
  });
}

export async function getTransactie(
  boekjeId: string,
  id: string
): Promise<TransactieDoc | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(
    doc(db, "huishoudboekjes", boekjeId, "transacties", id)
  );
  if (!snap.exists()) return null;
  return docToData<TransactieDoc>(snap);
}

export async function createTransactie(
  data: Transactie,
  userId: string
): Promise<string> {
  const db = getFirebaseDb();
  const parsed = transactieSchema.parse(data);
  const cleanData = Object.fromEntries(
    Object.entries(parsed).filter(([, v]) => v !== undefined)
  );
  const docRef = await addDoc(
    collection(db, "huishoudboekjes", parsed.boekjeId, "transacties"),
    {
      ...cleanData,
      createdBy: userId,
      createdAt: serverTimestamp(),
    }
  );
  return docRef.id;
}

export async function updateTransactie(
  boekjeId: string,
  id: string,
  data: Partial<Transactie>
): Promise<void> {
  const db = getFirebaseDb();
  const parsed = transactieSchema.partial().parse(data);
  const cleanData = Object.fromEntries(
    Object.entries(parsed).filter(([, v]) => v !== undefined && v !== "")
  );
  const fieldDeletes = Object.keys(
    Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => v === "")
    )
  );
  const updateData: Record<string, unknown> = { ...cleanData };
  for (const key of fieldDeletes) {
    updateData[key] = deleteField();
  }
  await updateDoc(
    doc(db, "huishoudboekjes", boekjeId, "transacties", id),
    updateData
  );
}

export async function deleteTransactie(
  boekjeId: string,
  id: string
): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, "huishoudboekjes", boekjeId, "transacties", id));
}

// ───── Categorieën ─────

export function subscribeCategorieen(
  boekjeId: string
): Observable<CategorieDoc[]> {
  return new Observable((subscriber) => {
    const db = getFirebaseDb();
    const q = query(
      collection(db, "huishoudboekjes", boekjeId, "categorieen")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const categorieen = snapshot.docs.map((d) => docToData<CategorieDoc>(d));
        subscriber.next(categorieen);
      },
      (err) => subscriber.error(new Error(err.message))
    );
    return () => unsubscribe();
  });
}

export async function createCategorie(
  boekjeId: string,
  data: Categorie,
  userId: string
): Promise<string> {
  const db = getFirebaseDb();
  const parsed = categorieSchema.parse(data);
  const cleanData = Object.fromEntries(
    Object.entries(parsed).filter(([, v]) => v !== undefined)
  );
  const docRef = await addDoc(
    collection(db, "huishoudboekjes", boekjeId, "categorieen"),
    {
      ...cleanData,
      createdBy: userId,
      createdAt: serverTimestamp(),
    }
  );
  return docRef.id;
}

export async function updateCategorie(
  boekjeId: string,
  id: string,
  data: Partial<Categorie>
): Promise<void> {
  const db = getFirebaseDb();
  const parsed = categorieSchema.partial().parse(data);
  const cleanData = Object.fromEntries(
    Object.entries(parsed).filter(([, v]) => v !== undefined)
  );
  await updateDoc(
    doc(db, "huishoudboekjes", boekjeId, "categorieen", id),
    cleanData
  );
}

export async function deleteCategorie(
  boekjeId: string,
  id: string
): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, "huishoudboekjes", boekjeId, "categorieen", id));
}

export async function getUserByEmail(email: string): Promise<string | null> {
  const db = getFirebaseDb();
  const q = query(collection(db, "users"), where("email", "==", email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].id;
}

export async function getUserEmails(uids: string[]): Promise<Record<string, string>> {
  if (uids.length === 0) return {};
  const db = getFirebaseDb();
  const emails: Record<string, string> = {};
  for (const uid of uids) {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const data = snap.data();
        emails[uid] = data.email || "Onbekende gebruiker";
      } else {
        emails[uid] = "Onbekende gebruiker";
      }
    } catch {
      emails[uid] = "Fout bij laden";
    }
  }
  return emails;
}

export async function getTransactiesByCategory(
  boekjeId: string,
  categoryId: string
): Promise<TransactieDoc[]> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, "huishoudboekjes", boekjeId, "transacties"),
    where("categoryId", "==", categoryId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToData<TransactieDoc>(d));
}

export async function deleteCategorieWithTransactions(
  boekjeId: string,
  categoryId: string
): Promise<void> {
  const db = getFirebaseDb();
  const transacties = await getTransactiesByCategory(boekjeId, categoryId);
  const batch = writeBatch(db);
  for (const t of transacties) {
    batch.delete(doc(db, "huishoudboekjes", boekjeId, "transacties", t.id));
  }
  batch.delete(doc(db, "huishoudboekjes", boekjeId, "categorieen", categoryId));
  await batch.commit();
}

export async function unlinkTransactionsFromCategory(
  boekjeId: string,
  categoryId: string
): Promise<void> {
  const db = getFirebaseDb();
  const transacties = await getTransactiesByCategory(boekjeId, categoryId);
  const batch = writeBatch(db);
  for (const t of transacties) {
    batch.update(doc(db, "huishoudboekjes", boekjeId, "transacties", t.id), {
      categoryId: deleteField(),
    });
  }
  batch.delete(doc(db, "huishoudboekjes", boekjeId, "categorieen", categoryId));
  await batch.commit();
}
