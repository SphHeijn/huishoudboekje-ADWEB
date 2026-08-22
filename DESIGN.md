---
name: Huishoudboekje
description: Een technisch, minimalistisch financieel dashboard voor veeleisende gebruikers.
colors:
  primary: "#4f46e5"
  primary-hover: "#4338ca"
  neutral-bg: "#0d0e12"
  neutral-fg: "#e8e8ed"
  neutral-surface: "#14151a"
  neutral-border: "#1d1e24"
  success: "#10b981"
  danger: "#ef4444"
  warning: "#f59e0b"
typography:
  display:
    fontFamily: "var(--font-mono), monospace"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "var(--font-sans), sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "4px"
  md: "6px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.sm}"
    padding: "16px"
---

# Design System: Huishoudboekje

## 1. Overview

**Creative North Star: "The Financial Control Deck"**

Dit design system is ontworpen als een technisch controlepaneel voor persoonlijk financieel beheer. Het richt zich op maximale informatiedichtheid, directe bruikbaarheid en visuele rust. De esthetiek leent zich van professionele developer-tools zoals Raycast en command consoles: donkere, rustige interfaces met uiterst dunne borders, strakke rasters en scherpe lay-outs.

Het systeem verwerpt expliciet de typische, met witruimte gevulde SaaS-sjablonen en vrolijke grafische elementen. In plaats daarvan stelt het betrouwbaarheid en directe toegang tot financiële cijfers voorop.

**Key Characteristics:**
- **Donker Gecentreerd**: Focus op een rustgevende, diepe indigo-grijze achtergrond om vermoeidheid van de ogen te voorkomen.
- **Extreme Dichtheid**: Geoptimaliseerde spatiëring en compacte tabellen zodat veel gegevens in één oogopslag zichtbaar zijn.
- **Scherpe Radii**: Gebruik van een uiterst kleine hoekafronding (4px) voor een strak, technisch karakter.
- **Geen Vulling of Ruis**: Geen overbodige schaduwen, kleurverlopen of decoratieve borders.

## 2. Colors

Het kleurenschema is opgebouwd rond een gedempte, donkere basis met een enkele, levendige accentkleur voor interactieve focus.

### Primary
- **Electric Indigo** (#4f46e5 / oklch(62% 0.18 260)): Uitsluitend gebruikt voor primaire acties, actieve focus en selectie-indicatoren.

### Neutral
- **Deep Tech Dark** (#0d0e12 / oklch(14% 0.006 280)): De primaire achtergrondkleur van de applicatie.
- **Surface Gray** (#14151a / oklch(17% 0.006 280)): Achtergrondkleur voor kaarten, formulieren en dashboardsecties.
- **Off-White Text** (#e8e8ed / oklch(92% 0.005 280)): Primaire tekstkleur voor hoge leesbaarheid.
- **Muted Slate** (#9ca3af / oklch(69% 0.005 280)): Secundaire en gedempte tekstkleur.
- **Console Border** (#1d1e24 / oklch(24% 0.008 280)): Strakke, dunne borders die de secties afbakenen.

### Named Rules
**The Accented 10% Rule.** De primaire accentkleur mag nooit meer dan 10% van het schermoppervlak innemen. Het moet spaarzaam worden ingezet om de aandacht van de gebruiker direct naar de belangrijkste actie te leiden.
**The High Contrast Rule.** Grensvlakken en invoervelden mogen nooit zachte kleurverlopen of vage schaduwen gebruiken. Gebruik heldere, effen achtergronden en scherpe 1px borders voor structurele duidelijkheid.

## 3. Typography

Het lettertype-systeem combineert een strak schreefloos lettertype voor lopende tekst met een monospace lettertype voor alle cijfers en technische data.

**Display Font:** Geist Mono (fallback: monospace)
**Body Font:** Geist Sans (fallback: sans-serif)

### Hierarchy
- **Display** (Geist Mono, 600, 1.5rem, line-height 1.2): Grote titels, boekjes-hoofdingen en hoofdsaldi.
- **Headline** (Geist Mono, 600, 1.25rem, line-height 1.3): Sectiekoppen, categorie-namen.
- **Title** (Geist Sans, 600, 1rem, line-height 1.4): Kaartkoppen en formulierlabels.
- **Body** (Geist Sans, 400, 0.875rem, line-height 1.5): Standaard tekst en tabelcellen. Maximaal 70ch breed.
- **Label** (Geist Mono, 400, 0.75rem, letter-spacing 0.05em): Categorie-tags, bedragen, transactie-statistieken en metadata.

### Named Rules
**The Monospace Numbers Rule.** Alle numerieke waarden, valuta-bedragen, datums en budgetpercentages moeten verplicht in Geist Mono worden weergegeven om perfecte verticale uitlijning in tabellen en lijsten te garanderen.

## 4. Elevation

Dit design system is plat bij verstek. Diepte wordt uitsluitend gecreëerd door het stapelen van tinten (neutraal-bg naar neutraal-surface) en het gebruik van dunne borders.

Er worden geen box-shadows gebruikt voor kaarten, knoppen of tabellen. Dit versterkt de technische en directe uitstraling.

### Named Rules
**The Flat-Default Rule.** Alle elementen liggen plat op het oppervlak. Zwevende elementen zoals dropdowns en popovers krijgen geen schaduw, maar worden afgebakend met een 1px solid border (#1d1e24) en een contrasterende achtergrond.

## 5. Components

### Buttons
- **Shape:** Scherpe hoeken met een radius van 4px.
- **Primary:** Electric Indigo (#4f46e5) achtergrond met witte tekst, uiterst compacte padding (6px 12px).
- **Hover / Focus:** Achtergrond verschuift naar Darker Indigo (#4338ca) met een outline van 2px in oklch(62% 0.18 260 / 30%) bij focus.
- **Secondary / Ghost:** Dunne border (#1d1e24) met een transparante of surface achtergrond.

### Cards / Containers
- **Corner Style:** 4px radius.
- **Background:** Surface Gray (#14151a).
- **Shadow Strategy:** Geen.
- **Border:** 1px solid Console Border (#1d1e24).
- **Internal Padding:** Compact (12px tot 16px).

### Inputs / Fields
- **Style:** Dunne 1px border (#1d1e24), donkere achtergrond (#0d0e12), 4px radius.
- **Focus:** Border kleurt naar Electric Indigo (#4f46e5) met een scherpe, gekleurde rand.

### Navigation
- **Header:** Ligt vast aan de bovenkant met een hoogte van 50px, een onderrand van 1px (#1d1e24), en geen schaduw. Actieve links hebben een subtiele onderstreping van 2px in Electric Indigo.

## 6. Do's and Don'ts

### Do:
- **Do** gebruik Geist Mono voor elk financieel getal en bedrag om tabel-uitlijning te behouden.
- **Do** houd de tussenruimtes en paddings compact om de informatiedichtheid te maximaliseren.
- **Do** gebruik dunne borders van 1px (#1d1e24) om containers en secties visueel van elkaar te scheiden.
- **Do** zorg voor een duidelijke focus-ring bij toetsenbordnavigatie.

### Don't:
- **Don't** gebruik border-left of border-right dikker dan 1px als gekleurde accenten op kaarten of lijsten.
- **Don't** gebruik verlopende kleuren (gradients) in teksten of knoppen.
- **Don't** gebruik glassmorphism of achtergrond-blurring voor kaarten.
- **Don't** grote, lege kaartenrasters gebruiken die de gebruiker dwingen te scrollen voor data.
- **Don't** getallen of bedragen afronden of verbergen om de interface "vriendelijker" te maken.
