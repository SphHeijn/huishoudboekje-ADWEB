# Huishoudboekje

Een rich web applicatie voor het beheren van je financiële balans. Gebruikers kunnen inkomsten, uitgaven en categoriebudgetten bijhouden in persoonlijke boekjes.

Dit project is de eindopdracht voor het vak **ADWEB**.

## Technologische Stack

- **React 19+** met **Next.js 16** (App Router)
- **Firebase / Cloud Firestore** — database, real-time updates en authenticatie
- **TypeScript** — strict mode
- **Zod 4** — schema validatie
- **motion** — animaties
- **Recharts** — grafieken
- **@dnd-kit** — drag-and-drop
- **Jest** — unit tests
- **ESLint 9** (flat config)

## Functionaliteiten

### Must-haves

- **Boekjes** — aanmaken, aanpassen en archiveren van huishoudboekjes
- **Transacties** — inkomsten en uitgaven toevoegen, bekijken per maand, verwijderen
- **Categorieën** — transacties koppelen aan categorieën met visuele budget-indicatie (resterend budget / overschrijding)

### Nice-to-haves

- **Grafieken** — staaf- en lijndiagrammen voor balans en categorie-overzichten
- **Drag-and-drop** — transacties soepel naar een categorie slepen
- **Uitnodigingen** — andere deelnemers veilig uitnodigen via Firebase rules

## Aan de slag

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

## Commands

| Commando | Doel |
|---|---|
| `npm run dev` | Ontwikkelserver starten |
| `npm run build` | Productiebuild |
| `npm run lint` | ESLint (flat config) |
| `npx jest` | Unit tests draaien |
| `npx jest --watch` | Tests in watch-modus |
| `npx jest --coverage` | Coverage rapport (drempel: 80%) |

## Projectstructuur

- `app/` — Next.js App Router pagina's en layouts
- `app/lib/` — Firebase init, Firestore CRUD, contexts, hooks, schemas
- `__tests__/` — Unit tests (spiegelt `app/`-structuur)
- `__mocks__/` — Manual mocks voor Firebase, dnd-kit, motion, etc.

## Codekwaliteit

- **Separation of concern** — gestructureerde scheiding van logica, data en presentatie
- **Unit tests** — verplichte coverage > 80% voor happy flows, met asserts en mocks
- **TypeScript strict** — volledige type-veiligheid

## Beoordeling

In week 9 wordt het project gepresenteerd en verdedigd. Beide studenten moeten alle code zelfstandig kunnen uitleggen. Onderdelen die niet uitgelegd kunnen worden leveren geen punten op (score: 1).

## Team

Project uitgevoerd in duo-verband voor ADWEB.
