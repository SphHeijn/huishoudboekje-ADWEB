export function formatEur(amount: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(amount);
}

const FIREBASE_ERROR_MAP: Record<string, string> = {
  "Missing or insufficient permissions": "Ontbrekende of onvoldoende rechten",
  "Firebase: Error (auth/email-already-in-use)": "E-mailadres is al in gebruik",
  "Firebase: Error (auth/user-not-found)": "Gebruiker niet gevonden",
  "Firebase: Error (auth/wrong-password)": "Ongeldig wachtwoord",
  "Firebase: Error (auth/invalid-credential)": "Ongeldige inloggegevens",
  "Firebase: Error (auth/too-many-requests)": "Te veel pogingen, probeer later opnieuw",
  "Firebase: Error (auth/weak-password)": "Wachtwoord is te zwak",
  "Firebase: Error (auth/invalid-email)": "Ongeldig e-mailadres",
  "Firebase: Error (auth/operation-not-allowed)": "Bewerking niet toegestaan",
  "Firebase: Error (auth/requires-recent-login)": "Log opnieuw in om deze actie uit te voeren",
};

export function translateFirebaseError(error: unknown): string {
  const msg = typeof error === "string" ? error : error instanceof Error ? error.message : "Onbekende fout";
  for (const [en, nl] of Object.entries(FIREBASE_ERROR_MAP)) {
    if (msg.includes(en)) return nl;
  }
  return msg;
}
