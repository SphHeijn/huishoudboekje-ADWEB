import { z } from "zod";

export const boekjeSchema = z.object({
  title: z.string().min(1, "Titel is verplicht").max(100),
  description: z.string().max(500).optional(),
  currency: z.string().length(3).default("EUR"),
  archived: z.boolean().default(false),
});

export const transactieSchema = z.object({
  boekjeId: z.string(),
  type: z.enum(["uitgave", "inkomsten"], { message: "Type is verplicht" }),
  amount: z.number().positive("Bedrag moet positief zijn"),
  categoryId: z.string().optional(),
  date: z.string().date("Ongeldige datum"),
  description: z.string().max(200).optional(),
});

export const categorieSchema = z.object({
  name: z.string().min(1, "Naam is verplicht").max(50),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Ongeldige hex-kleur").optional(),
  maxBudget: z.number().nonnegative("Budget moet positief zijn").optional(),
  endDate: z.string().date("Ongeldige datum").optional().or(z.literal("")),
});

export type Boekje = z.infer<typeof boekjeSchema>;
export type Transactie = z.infer<typeof transactieSchema>;
export type Categorie = z.infer<typeof categorieSchema>;

export type TransactieType = Transactie["type"];

export interface BoekjeDoc extends Boekje {
  id: string;
  createdAt: Date;
  createdBy: string;
  members: string[];
}

export interface TransactieDoc extends Transactie {
  id: string;
  createdAt: Date;
  createdBy: string;
}

export interface CategorieDoc extends Categorie {
  id: string;
  createdAt: Date;
}
