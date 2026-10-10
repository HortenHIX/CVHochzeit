# Finale Design-Spezifikation „C & V – Editorial Boho“

Diese Spezifikation ist verbindlich. Platzhalter stehen in [eckigen Klammern]. Alle Kontraste sind nach WCAG 2.x berechnet: sRGB linearisiert (c ≤ 0.04045 → c/12.92, sonst ((c+0.055)/1.055)^2.4), L = 0.2126 R + 0.7152 G + 0.0722 B, Kontrast = (L_hell + 0.05)/(L_dunkel + 0.05).

---

## 0. Design-Tokens als CSS

Die Datei ist `src/app/globals.css`. Die Schrift-Variablen `--font-display`, `--font-script` und `--font-sans` setzt next/font auf `<html>`.

```css
:root{
  /* ---------- Farben: Basis (16) ---------- */
  --c-linen:#FAF7F2;      /* Seitenhintergrund */
  --c-paper:#FFFDF8;      /* Karten, Felder, Menü */
  --c-sand:#F0E8DB;       /* Wechsel-Sektionen */
  --c-ink:#2B3530;        /* Text */
  --c-ink-soft:#525C55;   /* Hilfetext, Metadaten */
  --c-line:#DCD1C1;       /* dekorative Haarlinien */
  --c-stone:#807567;      /* UI-Rahmen (Felder, Checkbox) */
  --c-sage-100:#E2E9DF;   /* Tönung, Auswahl, Erfolg */
  --c-sage-400:#9AAE97;   /* Illustration: Blattfläche */
  --c-sage-700:#48604C;   /* Marke: Eyebrows, Icons, Auswahl */
  --c-sage-900:#2E4136;   /* Footer, Nacht, Toast */
  --c-terra-100:#F6E4D8;  /* Coupon, Hinweis „Wichtig“ */
  --c-terra-500:#C27453;  /* Illustration, nie Text */
  --c-terra-700:#96492E;  /* Aktion: Primär-Button, Links, Fokus */
  --c-terra-800:#7B3C26;  /* Aktion hover/active (= terra-700 82 % + Schwarz) */
  --c-error:#A3302A;
  --c-error-bg:#FBEDEA;

  /* ---------- Semantische Aliase ---------- */
  --bg:var(--c-linen); --bg-alt:var(--c-sand); --bg-tint:var(--c-sage-100); --bg-dark:var(--c-sage-900);
  --surface:var(--c-paper);
  --text:var(--c-ink); --text-muted:var(--c-ink-soft);
  --accent:var(--c-terra-700); --accent-hover:var(--c-terra-800);
  --brand:var(--c-sage-700);
  --border-deco:var(--c-line); --border-ui:var(--c-stone);
  --focus:var(--c-terra-700);
  --success:var(--c-sage-700); --success-bg:var(--c-sage-100);
  --error:var(--c-error); --error-bg-c:var(--c-error-bg);
  --illu-leaf:var(--c-sage-400); --illu-stem:var(--c-sage-700); --illu-warm:var(--c-terra-500);

  /* ---------- Schriften ---------- */
  --ff-display: var(--font-display), "Cormorant Garamond", Georgia, "Times New Roman", serif;
  --ff-script:  var(--font-script), "Pinyon Script", "Snell Roundhand", cursive;
  --ff-sans:    var(--font-sans), Figtree, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

  /* ---------- Typo-Skala (fluid 360 → 1280 px) ---------- */
  --fs-names: clamp(2.75rem, 1.4783rem + 5.6522vw, 6rem);       /* 44 → 96 */
  --fs-h1:    clamp(2.5rem, 1.9130rem + 2.6087vw, 4rem);        /* 40 → 64 */
  --fs-h2:    clamp(2.125rem, 1.6848rem + 1.9565vw, 3.25rem);   /* 34 → 52 */
  --fs-h3:    clamp(1.5rem, 1.3533rem + 0.6522vw, 1.875rem);    /* 24 → 30 */
  --fs-h4:    clamp(1.25rem, 1.1766rem + 0.3261vw, 1.4375rem);  /* 20 → 23 */
  --fs-count: clamp(2.5rem, 2.1087rem + 1.7391vw, 3.5rem);      /* 40 → 56 */
  --fs-time:  clamp(1.75rem, 1.6522rem + 0.4348vw, 2rem);       /* 28 → 32 */
  --fs-quote: clamp(1.375rem, 1.2283rem + 0.6522vw, 1.75rem);   /* 22 → 28 */
  --fs-lead:  clamp(1.1875rem, 1.1141rem + 0.3261vw, 1.375rem); /* 19 → 22 */
  --fs-body:  clamp(1.0625rem, 1.0136rem + 0.2174vw, 1.1875rem);/* 17 → 19 */
  --fs-ui:    1.0625rem;                                         /* 17 */
  --fs-small: clamp(0.9375rem, 0.9130rem + 0.1087vw, 1rem);     /* 15 → 16 */
  --fs-label: 0.875rem;                                          /* 14, versal */
  --lh-tight:1.1; --lh-snug:1.3; --lh-body:1.6;
  --tr-eyebrow:.16em; --tr-nav:.12em;

  /* ---------- Breiten ---------- */
  --w-text:38rem; --w-form:44rem; --w-content:72rem; --w-wide:80rem; --w-login:26rem;
  --gutter: clamp(1.25rem, 0.7609rem + 2.1739vw, 2.5rem);       /* 20 → 40 */
  --header-h:4rem;                                               /* 64; ab 64em: 4.5rem */

  /* ---------- Abstände ---------- */
  --space-1:.25rem; --space-2:.5rem; --space-3:.75rem; --space-4:1rem; --space-5:1.5rem;
  --space-6:2rem; --space-7:3rem; --space-8:4rem; --space-9:6rem; --space-10:8rem;
  --space-section: clamp(4rem, 2.4348rem + 6.9565vw, 8rem);     /* 64 → 128 */
  --space-stack:   clamp(2.5rem, 1.9130rem + 2.6087vw, 4rem);   /* 40 → 64 */
  --gap-cards: 1rem;                                             /* ab 45em: 1.5rem */

  /* ---------- Radien ---------- */
  --radius-sm:6px; --radius-md:10px; --radius-card-inner:12px; --radius-lg:16px; --radius-pill:999px;
  --radius-arch: 999px 999px var(--radius-lg) var(--radius-lg);

  /* ---------- Schatten ---------- */
  --shadow-sm:0 1px 2px rgb(43 53 48 / .06);
  --shadow-md:0 2px 4px rgb(43 53 48 / .04), 0 8px 24px -6px rgb(43 53 48 / .12);
  --shadow-lg:0 12px 40px -12px rgb(43 53 48 / .25);

  /* ---------- Linien ---------- */
  --hairline:1px solid var(--c-line);
  --double-line-color: rgb(72 96 76 / .45);

  /* ---------- Bewegung ---------- */
  --ease:cubic-bezier(.22,.61,.36,1);
  --dur-fast:150ms; --dur-base:250ms; --dur-slow:600ms; --dur-draw:1400ms;

  /* ---------- Ebenen ---------- */
  --z-illu:0; --z-content:1; --z-header:50; --z-menu:60; --z-toast:70;

  /* ---------- Textur (max. Deckkraft .05) ---------- */
  --texture:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .17 0 0 0 0 .21 0 0 0 0 .19 0 0 0 .05 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");

  interpolate-size: allow-keywords;
  color-scheme: light;
}
@media (min-width:64em){ :root{ --header-h:4.5rem; } }
@media (min-width:45em){ :root{ --gap-cards:1.5rem; } }

.onDark{ --text:var(--c-sand); --text-muted:var(--c-sage-100); --focus:var(--c-sand); --accent:var(--c-sand); color:var(--text); }

@media (prefers-contrast: more){
  :root{ --c-ink-soft:var(--c-ink); --border-ui:var(--c-ink); --c-line:#A89C8B; --texture:none; }
}

html{ font-size:100%; -webkit-text-size-adjust:100%; text-size-adjust:100%; }
body{ background:var(--bg); color:var(--text); font:400 var(--fs-body)/var(--lh-body) var(--ff-sans); }
:focus-visible{ outline:3px solid var(--focus); outline-offset:3px; }
```

---

## A) Konzept

**„Gedruckte Einladung, die man durchblättert.“** Viel Leinen-Weißraum, große Cormorant-Serifen, feine Haarlinien und Doppellinien wie bei Papeterie.

- **Leitform ist der Bogen (Arch).** Er rahmt Login, Hero, Foto-Platzhalter, Orts-Vignetten, Kontakt-Avatare und Farbfelder.
- **Eukalyptus** taucht nur an festen Punkten auf: Ecken, Trenner, Zeitleisten-Knoten. Höchstens ein großes Motiv pro Bildschirmhöhe.
- **Pampas und die Boho-Sonne** bringen die Wärme hinein.
- **Terrakotta** ist allem vorbehalten, was man **tun** soll (Zusagen, Links, Fokus).
- **Salbei** trägt Ruhe und Orientierung.
- **Persönliche Note:** Der Gästecode kennt den Haushalt. Die Seite begrüßt mit Namen („Liebe Anna, lieber Ben“), füllt die Personen im Formular vor und zeigt nur die Programmpunkte, zu denen der Haushalt eingeladen ist.

**Stimmungswörter:** ruhig · erwachsen · warm · luftig · papierhaft · handgemacht und präzise · zeitlos · Gartenfest am späten Nachmittag

---

## B) Farb-Tokens

### Basisfarben

| Token | HEX | Rolle |
|---|---|---|
| `--c-linen` | `#FAF7F2` | Seitenhintergrund (Standard-Sektionen) |
| `--c-paper` | `#FFFDF8` | Karten, Formularfelder, Menü-Overlay |
| `--c-sand` | `#F0E8DB` | Wechsel-Sektionen, Tabellenkopf, Info-Kreise |
| `--c-ink` | `#2B3530` | Fließtext, Überschriften |
| `--c-ink-soft` | `#525C55` | Hilfetext, Metadaten (nie für Uhrzeit, Adresse oder Frist) |
| `--c-line` | `#DCD1C1` | Haarlinien, Kartenrahmen (nur dekorativ) |
| `--c-stone` | `#807567` | Rahmen von Eingabefeldern, Checkboxen und Radio-Karten (UI, ≥ 3:1) |
| `--c-sage-100` | `#E2E9DF` | Tönung: Auswahl, Erfolg, Geschenke-Sektion |
| `--c-sage-400` | `#9AAE97` | Illustration: Blattfläche |
| `--c-sage-700` | `#48604C` | Marke: Eyebrows, Icons, Checkbox aktiv, Balken |
| `--c-sage-900` | `#2E4136` | Footer, Nacht-Medaillons, Toast |
| `--c-terra-100` | `#F6E4D8` | Stichwort-Coupon, Hinweis-Box „Wichtig“, „Lieber nicht“-Karte |
| `--c-terra-500` | `#C27453` | Illustration: Sonne, Pampas, Punkte (**nie Text, nie Buttonfläche**) |
| `--c-terra-700` | `#96492E` | Primär-Button, Links, Fokusring, „Jetzt“-Badge |
| `--c-terra-800` | `#7B3C26` | Primär hover/active |
| `--c-error` | `#A3302A` | Fehlerzustand |
| `--c-error-bg` | `#FBEDEA` | Hintergrund der Fehler-Zusammenfassung |

### Kontraste (nachgerechnet)

**Text (Ziel ≥ 4.5:1)**

| Vordergrund | linen | paper | sand | sage-100 | terra-100 | error-bg |
|---|---|---|---|---|---|---|
| ink | 11.88 | 12.48 | 10.44 | 10.25 | 10.28 | 11.12 |
| ink-soft `#525C55` | 6.51 | 6.84 | 5.72 | 5.61 | 5.63 | 6.09 |
| sage-700 | 6.44 | 6.77 | 5.66 | 5.55 | 5.57 | 6.03 |
| terra-700 | 5.97 | 6.28 | 5.25 | 5.15 | 5.17 | 5.60 |
| terra-800 | 7.81 | 8.21 | 6.86 | 6.74 | 6.76 | 7.31 |
| error | 6.52 | 6.85 | 5.73 | 5.63 | 5.64 | 6.11 |
| sage-900 | 10.21 | 10.73 | 8.97 | 8.81 | 8.83 | 9.56 |

**Ungünstigster Fall mit Textur** (Rauschen an der dunkelsten Stelle, 5 % ink über dem Grund):
- ink-soft: ≥ 5.16
- terra-700: ≥ 4.74
- sage-700: ≥ 5.10
- ink: ≥ 9.42

Alle Werte bleiben ≥ 4.5.

**Buttons und dunkle Flächen**

| Paar | Kontrast |
|---|---|
| paper auf terra-700 (Primär) | 6.28 |
| paper auf terra-800 (Primär hover) | 8.21 |
| paper auf sage-700 (Chip gewählt, Checkbox) | 6.77 |
| sage-900 auf sage-100 (Badge „Zusage“) | 8.81 |
| sand auf sage-900 (Footer-Text, Primär auf Dunkel) | 8.97 |
| linen auf sage-900 (Toast) | 10.21 |
| sage-100 auf sage-900 (gedämpfter Footer-Text) | 8.81 |
| ink-soft auf line (deaktiviert, ausgenommen von WCAG) | 4.61 |

**UI-Grafik (Ziel ≥ 3:1, WCAG 1.4.11)**

| Paar | Kontrast |
|---|---|
| stone auf paper / linen / sand / sage-100 | 4.43 / 4.22 / 3.71 / 3.64 (mit Textur ≥ 3.35) |
| Fokus terra-700 auf allen hellen Flächen | 5.15 bis 6.28 |
| Fokus sand auf sage-900 | 8.97 |
| gestrichelter Rahmen terra-700 auf terra-100 | 5.17 |

**Nur dekorativ (nie Text, nie bedeutungstragende UI)**

| Paar | Kontrast |
|---|---|
| terra-500 auf linen | 3.32 |
| paper auf terra-500 | 3.49, **deshalb als Button verboten** |
| sage-400 auf linen | 2.21 |
| line auf linen | 1.41 |
| sage-700 auf sage-900 (Footer-Silhouetten) | 1.59 |
| terra-700 auf sage-900 | 1.71, **verboten** |

### Farbregeln
- Fließtext ist immer `ink`.
- `ink-soft` nur für Hilfe und Meta.
- Links: `terra-700` **plus Unterstreichung** (1 px, Abstand .2em). Hover terra-800 mit 2 px.
- Status nie nur über Farbe, immer zusätzlich Icon und Wort.
- Auf `.onDark` (sage-900) sind Links, Text und Fokus sand.
- Inhaltsfarben für den Dresscode (Farbfelder) sind **keine** UI-Tokens.

---

## C) Typografie

```ts
// src/app/fonts.ts
import { Cormorant_Garamond, Pinyon_Script, Figtree } from 'next/font/google';
export const display = Cormorant_Garamond({ subsets:['latin'], weight:['400','500','600'],
  style:['normal','italic'], variable:'--font-display', display:'swap' });
export const script = Pinyon_Script({ subsets:['latin'], weight:'400', variable:'--font-script', display:'swap' });
export const sans = Figtree({ subsets:['latin'], variable:'--font-sans', display:'swap' }); // variabel 300–900
// <html lang="de" className={`${display.variable} ${script.variable} ${sans.variable}`}>
```

| Rolle | Schrift | Einsatz |
|---|---|---|
| Display | Cormorant Garamond 500/600, Italic 400/500 | H1–H3, Uhrzeiten, Countdown, Monogramm, Zitate, „&“ |
| Script | Pinyon Script 400 | **nur** „Christoph“/„Vera“ im Hero, auf der Login-Karte und der QR-Karte, **immer ≥ 2.75rem** |
| Text/UI | Figtree 400/500/600 | Fließtext, H4, Buttons, Formulare, Navigation, Admin |

**Regeln für Cormorant:** nie unter 1.25rem, unter 1.75rem immer Gewicht 600. Das „&“ zwischen den Namen ist **Cormorant Italic 400 in terra-700** in 0.6-facher Namensgröße, weil das Script-„&“ schlecht lesbar ist.

### Größenskala

| Token | 360 px | 1280 px | Schrift / Gewicht | Zeilenhöhe | Tracking |
|---|---|---|---|---|---|
| `--fs-names` | 44 | 96 | Pinyon 400 | 1.15 | 0 |
| `--fs-h1` | 40 | 64 | Cormorant 500 | 1.08 | −0.015em |
| `--fs-h2` | 34 | 52 | Cormorant 500 | 1.1 | −0.01em |
| `--fs-h3` | 24 | 30 | Cormorant 600 | 1.2 | 0 |
| `--fs-h4` | 20 | 23 | Figtree 600 | 1.3 | 0 |
| `--fs-count` | 40 | 56 | Cormorant 500 | 1.0 | 0 |
| `--fs-time` | 28 | 32 | Cormorant 600 | 1.0 | 0 |
| `--fs-quote` | 22 | 28 | Cormorant Italic 500 | 1.35 | 0 |
| `--fs-lead` | 19 | 22 | Figtree 400 | 1.55 | 0 |
| `--fs-body` | **17** | 19 | Figtree 400 | **1.6** | 0 |
| `--fs-ui` | 17 | 17 | Figtree 500/600 | 1.3 | .01em |
| `--fs-small` | 15 | 16 | Figtree 400 | 1.5 | 0 |
| `--fs-label` | 14 | 14 | Figtree 600, versal | 1.3 | Eyebrow .16em, Navigation .12em |

### Weitere Regeln
- **Versalien-Labels:** Figtree in Großbuchstaben, kein `font-variant-caps`. Höchstens 3 Wörter.
- **Ziffern:** Uhrzeiten und Countdown mit `font-variant-numeric: lining-nums tabular-nums`. Countdown-Zahlen mit `min-width:2ch`.
- **Zeilenlänge:** maximal `38rem`. Kein Blocksatz, keine langen Kursivtexte.
- **Umbruch:** `hyphens:auto` im Fließtext, `text-wrap:balance` für Überschriften, `text-wrap:pretty` für Absätze, `overflow-wrap:anywhere` für URLs und E-Mail-Adressen.
- **Deutsche Formate:** „Samstag, [19. Juni 2027]“, „14:30 Uhr“, Telefon „0171 234 5678“. Alle Datumsangaben über `Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin'})`.

---

## D) Layout und Raster

### Breiten und Breakpoints
- **Breiten:** Text `38rem`, Formular und FAQ `44rem`, Inhalt `72rem`, Admin `80rem`, Login `26rem`.
- **Container:** `width:min(100% - 2*var(--gutter), var(--w-content)); margin-inline:auto`
- **Breakpoints** (mobile-first, `min-width` in **em**, damit sie beim Zoomen mitgehen):
  - **30em** (480)
  - **45em** (720)
  - **64em** (1024)
  - **75em** (1200, volle Desktop-Navigation)

### Abstände
- Raster: 4 px. Tokens `--space-1` bis `--space-10` siehe Abschnitt 0.
- Sektionen: `padding-block: var(--space-section)`. Vom Sektionskopf zum Inhalt `--space-stack`.
- Karten: Abstand zwischen Karten 16 px, ab 45em 24 px. Innenabstand 24 px, ab 64em 32 px.
- Anker: `section{scroll-margin-top:calc(var(--header-h) + 1rem)}`.

### Sektionskopf (überall gleich, zentriert)
Eyebrow (`--fs-label`, sage-700) → 12 px → H2 → 16 px → Trenner E8 (160 px, ab 64em 200 px) → 24 px → Lead (`--fs-lead`, ink, max. 34rem) → `--space-stack` → Inhalt (linksbündig).

Die Eyebrow darf poetisch sein. Die H2 bleibt funktional, denn sie ist zugleich das Navigationslabel.

### Hintergrund-Folge

| Sektion | Hintergrund |
|---|---|
| Hero, Geschichte | linen (dazwischen eine Doppel-Haarlinie mit Monogramm-Siegel) |
| Tagesablauf | sand |
| Orte & Anfahrt | linen |
| Unterkünfte & Shuttle | sand |
| Dresscode | linen |
| Geschenke | **sage-100** |
| Fotos | linen |
| Zusage | sand (Formular auf paper-Karte) |
| FAQ | linen |
| Kontakt | sand |
| Footer | **sage-900** |

Die Kanten zwischen Sektionen sind gerade, ohne Wellen. Jede Sektion bekommt `position:relative; isolation:isolate; overflow-x:clip;`. `clip` statt `hidden` erhält den Sticky-Header und verhindert horizontales Scrollen durch Illustrationen.

### Radien
- sm 6 px (Checkbox), md 10 px (Felder), 12 px (innere Karten), lg 16 px (Karten), pill (Buttons, Badges, Chips).
- **Bogen:** `border-radius:999px 999px 16px 16px`. Bedingung: Höhe ≥ Breite/2 + 16 px.
- **Bogen mit fester Proportion 4:5:** `border-radius:50% 50% 16px 16px / 40% 40% 16px 16px`.

### Schatten und Linien
- Karten haben standardmäßig 1 px line-Rahmen und **keinen** Schatten.
- `--shadow-md` nur für die Formularkarte, die Login-Karte und interaktive Karten bei Hover.
- `--shadow-lg` nur für Menü und Popover.
- **Doppellinie** (Einladungsrahmen): 1 px Linie, 3 px Abstand, 1 px Linie, jeweils `rgb(72 96 76/.45)`. Umgesetzt mit `border-top` plus `::before`.

---

## E) Illustrations-System

**Gemeinsame Regeln**
- Linien in sage-700, 1.25 px, `vector-effect:non-scaling-stroke`, `stroke-linecap/linejoin: round`.
- Blätter: sage-400 als Fläche ohne Kontur, Deckkraft **.9** vorn und **.6** hinten.
- Warme Akzente: terra-500 mit Deckkraft .2 bis .55.
- Alle Motive liegen in `src/components/illustrations/`. Jede Komponente trägt `aria-hidden="true" focusable="false"` und hat die Props `size`, `flip` (scaleX(−1)), `rotate` und `className`.
- Unter `forced-colors` und im Druck der Hauptseite werden sie ausgeblendet. Die QR-Karte ist davon ausgenommen.
- Illustrationen liegen **nie** hinter Fließtext. Hinter Überschriften höchstens mit Deckkraft .6.

**Motive** (Bauanleitungen in Abschnitt J)

| ID | Motiv |
|---|---|
| E1 | Eukalyptus-Zweig „Silberdollar“ (Hauptmotiv) |
| E2 | Eck-Bouquet |
| E3 | Pampasgras (mit Bündel-Variante) |
| E4 | Olivenzweig |
| E5 | Doppelbogen-Rahmen (CSS) |
| E6 | Boho-Halbsonne |
| E7 | Ringe |
| E8 | Trennornament |
| E9 | Halbkranz |
| E10 | Monogramm |
| E11 | Orts-Vignetten (Kapelle, Scheune) |
| E12 | Geschichts-Vignetten |
| E13 | Ranken-Kachel |
| E14 | Sonnenlauf |
| E15 | Karten-Platzhalter |
| E16 | Icon-Set |

### Papier-Textur
- `.section{ background: var(--texture), var(--section-bg); }`
- Die Textur ist eine Hintergrund-Ebene, kein Overlay. Deckkraft höchstens .05, also **nicht** `position:fixed`.
- Footer zusätzlich mit `background-blend-mode:soft-light`.
- Keine Textur auf Karten, Feldern, im Admin, im Druck, unter `forced-colors` und unter `prefers-contrast: more`.

### Platzierung (höchstens ein großes Motiv pro Bildschirmhöhe)

| Ort | Motiv | Größe mobil / Desktop |
|---|---|---|
| Login | E2 links oben und rechts unten am Viewport; E6 hinter der Bogenspitze (Deckkraft .55); Desktop zusätzlich E3-Bündel links unten | `clamp(140px, 28vw, 300px)` |
| Hero | E2 links unten am Bogen (24 px überlappend), E1 rechts oben, E6 hinter der Bogenspitze; ab 64em zusätzlich E3-Bündel rechts unten | E2 140 / 260 px; E1 96 / 180 px |
| Übergang Hero → Geschichte | Doppel-Haarlinie plus E10 (56 px) als Siegel | – |
| Jede H2 | E8 | 160 / 200 px |
| Geschichte | E13 als Ranke, Blattpaar-Knoten, E12 | – |
| Tagesablauf | E14 „Sonnenlauf“ | 100 % / max. 640 px |
| Orte | E11 im Bogenkopf der Karte, E15 für die Karte | 160 px Höhe |
| Dresscode | keine Illustration (die Farbfelder sind das Bild) | – |
| Geschenke | E4 über der H2 | 160 / 200 px |
| Zusage | E10-Siegel auf der Karte; im Erfolgsfall E9 um ein Häkchen | 56 px / 96 px |
| Mobiles Menü | E2 rechts unten (Deckkraft .5) | 160 px |
| Footer | E1-Silhouetten an der Oberkante (sage-700 auf sage-900) | 80 px |
| QR-Karte | E2 links oben und rechts unten (Linien-Variante) | 28 mm |

---

## F) Sektionen

### Login (`/login`, erster Eindruck)

**Seite**
- `min-height:100svh`, linen mit Textur, Inhalt mittig, kein Header.
- Abstände berücksichtigen `env(safe-area-inset-*)`.

**Karte**
- paper, Bogenform, `width:min(100%, 26rem)`.
- 1 px line-Rahmen plus Doppelbogen innen (E5), `--shadow-md`.
- Innenabstand: oben 5.5rem (wegen der Bogenkurve), seitlich 2rem, unten 2.5rem.

**Inhalt der Karte, von oben nach unten**
1. E10 groß (72 px)
2. Eyebrow „Herzlich willkommen“
3. „Christoph & Vera“: Namen in Pinyon 2.75rem, „&“ in Cormorant Italic terra-700
4. Datum in Cormorant Italic 1.25rem (600)
5. E8 (120 px)
6. Text: „Bitte gebt den Gästecode von eurer Einladungskarte ein.“
7. Label „Gästecode“
8. Eingabefeld: 56 px hoch, zentriert, Figtree 600 1.25rem, `letter-spacing:.2em`, versal. Attribute: `type="text" autocapitalize="characters" autocomplete="off" spellcheck="false"`.
9. Checkbox „Auf diesem Gerät angemeldet bleiben“, vorausgewählt (Cookie 12 Monate)
10. Primär-Button lg, volle Breite: „Weiter“ mit Pfeil. Während der Prüfung: „Einen Moment …“
11. Hilfezeile `--fs-small`: „Code nicht zur Hand? Ruft [Name] an: [0171 234 5678]“ (tel-Link)
12. Link „Datenschutz“ (die Datenschutzseite ist ohne Login erreichbar)

**Komfort**
- Groß- und Kleinschreibung, Leerzeichen und Bindestriche werden ignoriert.
- Codes enthalten keine verwechselbaren Zeichen (kein I, l, 1, O, 0), z. B. „SONNE-24“.
- Der QR-Code auf der Einladung enthält `/?code=…` und meldet automatisch an.

**Fehler**
- „Dieser Code passt leider nicht. Schaut noch einmal auf eure Karte, oder meldet euch bei uns.“ Das Feld bekommt den Fehlerzustand, der Fokus bleibt im Feld.
- Nach 5 Fehlversuchen: „Bitte in einer Minute erneut versuchen.“

**Bewegung:** Die Zweige zeichnen sich ein und wiegen sich (siehe H).

### 1. Header und Navigation

**Grundform**
- Sticky und immer sichtbar (blendet sich beim Scrollen nicht aus).
- Höhe `--header-h` (64 px, ab 64em 72 px) zuzüglich `env(safe-area-inset-top)`.
- Hintergrund `rgb(250 247 242/.92)` mit `backdrop-filter:blur(10px)`.
- Die untere Haarlinie erscheint erst nach 8 px Scrollen (IntersectionObserver auf einem Sentinel-Element).
- Erstes fokussierbares Element: Skip-Link „Zum Inhalt springen“.

**Links:** E10 klein (40 px), verlinkt auf `#start`.

**Rechts, unter 75em**
- Primär-Button „Zusagen“ (44 px hoch, Innenabstand 0 18px).
- Menü-Button 48×48 mit Icon **und** dem Wort „Menü“ (Figtree 600 .75rem unter dem Icon), `aria-expanded`, `aria-controls`.

**Ab 75em**
- Links: Geschichte · Ablauf · Anfahrt · Unterkunft · Dresscode · Geschenke · Fotos · FAQ.
- Stil: `--fs-label`, Tracking .12em, ink, 44 px Trefferhöhe. Hover terra-700.
- Scrollspy: aktiver Link mit 1 px terra-700-Unterstrich, 6 px unter dem Text, `aria-current="true"`.
- Ganz rechts der Button „Zusagen“ (md).

**Mobiles Menü**
- Vollbild auf paper, Einblendung von oben (siehe H).
- Oben rechts ein Button „Schließen“ mit ✕-Icon **und Wort**, 48 px.
- Zeilen 56 px hoch mit Haarlinie: 24-px-Icon in sage-700, Text Cormorant 600 1.625rem.
- Unten: Primär lg „Jetzt zusagen“ (volle Breite) und Ghost „Abmelden“.
- E2 rechts unten mit Deckkraft .5.
- Verhalten: Fokus bleibt im Menü (Fokusfalle), Esc schließt, der Body scrollt nicht. Ein Klick auf einen Link schließt das Menü und springt zum Anker. Danach geht der Fokus zurück auf „Menü“.

**Zustände des Zusagen-Buttons**
- Nach erfolgter Zusage: sage-Badge-Stil mit Häkchen „Zugesagt“, führt zur Zusammenfassung.
- Nach einer Absage: „Eure Antwort“.
- Nach der Frist ohne Antwort: ausgeblendet.

### 2. Hero (`#start`)

**Mobil**
- `min-height:calc(100svh - var(--header-h))`, Innenabstand 32 px oben und 48 px unten.
- Doppelbogen E5 mit `width:min(100%, 22rem)`. Der Wrapper hat `container-type:inline-size`, der Innenabstand oben ist `28cqi`.

Im Bogen, zentriert:
1. Persönliche Begrüßung aus dem Gästecode: `--fs-lead` ink, z. B. „Liebe Anna, lieber Ben,“. Ohne Daten entfällt die Zeile.
2. Eyebrow „Wir heiraten“
3. H1: „Christoph“ / „&“ / „Vera“ in je einer Zeile. Namen in Pinyon `--fs-names`, „&“ in Cormorant Italic terra-700 (0.6×). Das „&“ ist `aria-hidden`, daneben steht ein `sr-only` „und“.
4. E8 (120 px)
5. „Samstag, [19. Juni 2027]“ in Cormorant 600 1.375rem
6. „[Hofgut …] · [Ort]“ in Figtree `--fs-small` ink

Unter dem Bogen:
- **Countdown:** 3 Zellen à mindestens 84 px, getrennt durch 1 px line (48 px hoch). Zahl in `--fs-count`, Label in `--fs-label` („Tage / Stunden / Minuten“).
- **Buttons** gestapelt, `max-width:22rem`:
  - Primär lg „Jetzt zusagen“
  - Sekundär lg „Zum Kalender hinzufügen“ mit Kalender-Icon. Öffnet ein Popover mit 48-px-Zeilen „Apple / Outlook (.ics)“ (Route `/kalender.ics` mit Ort, Beschreibung inkl. Seiten-URL und Erinnerung 1 Tag vorher) und „Google Kalender“.
- Hinweis `--fs-small` ink-soft: „Bitte gebt uns bis [Donnerstag, 1. April 2027] Bescheid.“

**Desktop (ab 64em)**
- Bogen 30rem breit. Buttons nebeneinander mit 16 px Abstand.
- E2 und E3-Bündel größer. Die Komposition bleibt symmetrisch und zentriert wie eine Einladung.

**Zustände**
- Vor dem Tag: Countdown, aktualisiert jede Minute.
- Am Hochzeitstag: „Heute ist es so weit!“ plus Button „Zum Tagesablauf“.
- Danach: „Danke, dass ihr mit uns gefeiert habt“ plus Button „Zum Fotoalbum“.

**Abschluss:** Doppel-Haarlinie über die Inhaltsbreite, mittig darauf das E10-Siegel (56 px auf einem paper-Kreis).

### 3. Unsere Geschichte: „Herbarium-Ranke“

**Mobil**
- `<ol>` mit linker Spur von 48 px. Darin E13 als `repeat-y`-Hintergrund.
- An jedem Meilenstein ein **Blattpaar-Knoten** (40×24): zwei runde Blätter r 7, in der Mitte ein Punkt r 3 in terra-500, darunter ein paper-Kreis r 10 als Unterlage.
- Rechts der Inhalt:
  - Datum als Label in sage-700 („Sommer 2016“, `<time>`)
  - H3 („Ein Kaffee zu viel“)
  - Text, 2 bis 4 Zeilen
  - Foto-Bogen 4:5 mit `max-width:15rem`
- Abstand zwischen den Einträgen 48 px.

**Desktop (ab 64em)**
- Raster `1fr 96px 1fr`, die Ranke läuft in der Mitte.
- Text und Bogenbild wechseln pro Meilenstein die Seite, das Bild steht immer gegenüber dem Text.
- Der Text bleibt linksbündig.

**Ohne Fotos:** E12-Vignetten in einem sage-100-Bogen. Mit Foto: `next/image`, `object-fit:cover`, gleiche Bogenmaske, 1 px Innenlinie in line mit 6 px Einzug.

**Abschluss:** E7 in einem 56-px-Kreis (paper, line-Rahmen), Titel „Und jetzt: Ja!“.

**Meilensteine (Vorschlag):** Kennenlernen · Erste Reise · Erste Wohnung · Antrag · Hochzeit. Höchstens 6.

**Bewegung:** Die Ranke „wächst“ beim Scrollen (siehe H).

### 4. Tagesablauf: „Sonnenlauf, vom Tag in die Nacht“

**Kopfgrafik:** E14, `aria-hidden`.
- Mobil: nur Punkte.
- Ab 45em: Uhrzeiten an den Punkten in Figtree 600 .875rem ink.

**Liste** (die eigentliche Information) als `<ol>` mit `<time datetime>`

*Mobil:* Raster `44px 1fr`, Abstand 16 px. Links das Medaillon, rechts:
- Uhrzeit in `--fs-time` terra-700, daneben „Uhr“ als Label
- Titel H4
- Ort als Label in sage-700
- Beschreibung `--fs-body` ink
- optional Ghost-Link „Route“ oder Badge „Shuttle ab 13:15 Uhr“

*Ab 64em:* Raster `7rem 44px 1fr`, die Uhrzeit steht rechtsbündig links.

**Medaillon:** 44 px rund, Icon 22 px. Die Farbe folgt der Tageszeit:
- bis 18 Uhr: paper mit 1.5 px terra-700-Rahmen und terra-700-Icon
- 18 bis 22 Uhr: sage-100 mit sage-700
- ab 22 Uhr: sage-900 mit sand-Icon

**Verbindungslinie:** 1 px durch die Medaillons mit `linear-gradient(var(--c-terra-500), var(--c-sage-700), var(--c-sage-900))`.

**Live am Hochzeitstag**
- Der laufende Punkt erhält das Badge „Jetzt“, einen 3-px-terra-700-Ring (2 px Abstand) um das Medaillon und `aria-current="step"`.
- Vergangene Punkte bleiben voll lesbar, kein Ausgrauen.

**Beispiele:**
- 14:00 Trauung
- 15:00 Sektempfang
- 16:30 Kaffee & Kuchen
- 18:30 Abendessen
- 21:00 Eröffnungstanz & Party
- 00:00 Mitternachtssnack
- 02:00 Letzter Shuttle
- (So 10:30 Brunch, nur wenn für den Gästecode freigegeben)

### 5. Orte und Anfahrt

**Karten:** 1 Spalte, ab 45em 2 Spalten. paper, Radius 16. Aufbau:
1. Kopf: Bogenfläche sand (160 px hoch) mit E11 (Kapelle bzw. Scheune)
2. Label „Trauung · 14:00 Uhr“
3. Name als H3
4. `<address>` in `--fs-body` ink
5. Buttons Sekundär md: „Google Maps“ (`https://www.google.com/maps/dir/?api=1&destination=…`) und „Apple Karten“ (`https://maps.apple.com/?daddr=…`). Mobil gestapelt in voller Breite.
6. Ghost „Adresse kopieren“ mit Kopier-Icon. Bestätigung: Icon wechselt 2 s auf ein Häkchen, dazu Toast „Adresse kopiert“.

**Verbindungs-Chip:** Zwischen den beiden Karten mobil eine gestrichelte senkrechte Linie (1 px stone, Dasharray 3 4) mit dem Chip „ca. [10] Min. Fahrt“ (Auto-Icon). Ab 45em steht der Chip waagerecht zwischen den Kartenköpfen.

**Karte mit Einwilligung** (eine Fläche für beide Orte)
- 16:10, sand, Radius 16, darin E15.
- Mittig ein paper-Panel mit:
  - Sekundär-Button „Karte anzeigen“
  - `--fs-small` ink-soft: „Beim Laden werden Daten (u. a. eure IP-Adresse) an Google übertragen. Mehr in der Datenschutzerklärung.“
  - Checkbox „Karten künftig immer laden“ (localStorage, mit try/catch)
- Erst nach dem Klick wird das iframe gerendert (`loading="lazy"`, `title` gesetzt).

**Info-Zeilen** (Icon-Kreis 40 px sand mit sage-700-Icon, Text daneben, ab 45em zweispaltig)
- **Parken:** Ort, Kapazität, „ca. 3 Min. Fußweg über Kies“
- **Mit Bahn & Bus:** nächster Bahnhof, Anschluss, Verweis auf den Shuttle
- **Barrierefreiheit:** Stufen, Wege, WC

**Ganz unten:** Ghost-Button „Ablauf & Anfahrt als Infoblatt drucken“. Er setzt `body.print-infosheet` und ruft `window.print()` auf. Das Druck-Stylesheet zeigt dann nur Hero-Daten, Ablauf, Orte und Kontakt.

### 6. Unterkünfte und Shuttle

**Hotelkarten:** 1 Spalte, ab 45em 2, ab 64em 3. Inhalt:
- Name in Cormorant 600 1.375rem, Kategorie als Text („3 Sterne“)
- Chips „[2,4] km · [5] Min. Auto“, optional sage-Badge „Shuttle hält hier“
- Preis in `--fs-body` 600: „ab [95] € / Nacht (DZ inkl. Frühstück)“
- **Stichwort-Coupon:**
  - terra-100, `1.5px dashed` terra-700, Radius 10, Innenabstand 12 px 16 px
  - Label „Stichwort“ (`--fs-label`, terra-700)
  - Wert in Figtree 600 1.125rem, Tracking .04em, ink
  - rechts Icon-Button 44×44 „Stichwort kopieren“
- **Frist-Badge** (terra-Kontur, Kalender-Icon): „Kontingent bis [1. März 2027]“.
  - Weniger als 14 Tage vorher zusätzlich „· noch [9] Tage“ in 600.
  - Nach Ablauf das neutrale Badge „Kontingent abgelaufen, bitte direkt anfragen“, der Coupon wird ausgeblendet.
- Aktionen: „Anrufen“ (Sekundär md, tel) und „Website“ (Ghost, extern)

**Shuttle-Fahrplan als Ticket-Karte**
- paper, Radius 16, max. 46rem.
- Kopf: Bus-Icon und H3 „Shuttle-Fahrplan“.
- Darunter eine Perforation: `1px dashed` line mit halbrunden Kerben (r 12) links und rechts per `mask: radial-gradient(circle 12px at 0 50%, #0000 98%, #000) …`.
- Zwei Blöcke „Hinfahrt“ und „Rückfahrt“, jeweils als `<table>` mit `<caption>`.
  - Spalten: Abfahrt | Von | Nach | Hinweis.
  - Abfahrt in Cormorant 600 1.5rem, lining tabular, terra-700.
  - Zeilen mindestens 52 px hoch, getrennt durch eine gepunktete Linie.
- Unter 45em wird jede Zeile ein Listen-Element: große Zeit links, Route „Hotel Linde → Kapelle“ mit Pfeil-Icon, Hinweis darunter.
- Fußzeile: „Bitte gebt im Zusageformular an, ob ihr mitfahrt.“ mit Link `#zusage`.

**Taxi**
- Karten mit Name und einem großen tel-Button (Sekundär lg, 56 px, volle Breite), die Nummer steht sichtbar im Label („[07771 123 45]“).
- Badge „Nachts bitte vorbestellen“.
- Ab 64em stehen Fahrplan und Taxi nebeneinander, `2fr 1fr`.

### 7. Dresscode

**Text:** Lead „Sommerlich-elegant, gern in natürlichen Farben.“ in Cormorant Italic `--fs-quote`. Darunter ein Absatz Erklärung (max. 38rem, zentriert).

**Farbfelder** (Inhaltsdaten, keine UI-Tokens)
- Bogenform `border-radius:50% 50% 8px 8px / 37% 37% 8px 8px`.
- Größe 64×88 mobil (3 pro Reihe), ab 45em 88×120 (6 in einer Reihe).
- Rahmen 1 px `rgb(43 53 48/.15)`, darunter das Label in Figtree 15 px 600 ink. Die Bedeutung trägt immer das Label.
- Farben:
  - Salbei `#9AAE97`
  - Eukalyptus `#6F8A78`
  - Sand `#E3D3BC`
  - Terrakotta `#C27453`
  - Rosenholz `#C49A8F`
  - Olive `#7D7A4F`
- Kein Weiß, Creme oder Elfenbein in der Palette. Darunter: „Inspiration, kein Muss.“

**„Gerne“ / „Lieber nicht“:** zwei Karten, ab 45em nebeneinander.
- **Gerne:** paper. Überschrift als Text mit Häkchen-Kreis sage-700. Liste mit Häkchen:
  - Blockabsatz oder flache Schuhe (wir feiern auf der Wiese)
  - Leinen, Anzug gern ohne Krawatte
  - Jacke oder Stola für den Abend
- **Lieber nicht:** terra-100. Kreuz in terra-700, nicht in Fehlerrot. Liste:
  - Weiß, Creme oder Elfenbein (das bleibt der Braut vorbehalten)
  - Stilettos auf dem Rasen
- Info-Zeile: „Absatzschoner liegen am Eingang bereit.“

### 8. Geschenke (sage-100)
- Einspaltig, max. 36rem, zentriert. E4 über der H2.
- Zitat in `--fs-quote` (höchstens 3 Zeilen): „Das schönste Geschenk ist, dass ihr mit uns feiert.“
- Danach Fließtext zum Flitterwochen-Beitrag.
- Info-Zeile mit Briefumschlag-Icon: „Am Hochzeitstag steht eine Kartenbox für euch bereit.“
- **Optional:**
  - Aufklapper (`<details>`) „Bankverbindung anzeigen“: IBAN in 4er-Gruppen, tabular, mit Kopier-Button. Standardmäßig zu.
  - 3 kleine „Postkarten“-Kacheln mit Reise-Stationen (Strich-Icons Berg, Meer, Stadt).

### 9. Fotos

**Desktop (ab 64em, zweispaltig)**
- Links:
  - 3 nummerierte Schritte (Zahl in Cormorant 600 in einem 36-px-Kreis mit 1 px sage-700): „Album öffnen“, „Fotos auswählen“, „Hochladen, ohne App und Konto“
  - Primär lg „Zum gemeinsamen Album“ (extern)
  - Info-Box sage-100: „Unplugged-Trauung: Während der Zeremonie bitte keine Handys, unser Fotograf ist für euch da.“
- Rechts: paper-Karte mit Doppel-Haarlinie, darin der QR-Code (180 px, ink auf `#FFFFFF`, 4 Module Ruhezone, serverseitig als SVG über `qrcode`) und die Unterschrift „Mit der Handykamera scannen“.

**Mobil**
- Schritte, Button, Info-Box.
- Darunter ein Aufklapper „QR-Code für andere zeigen“ (240 px), damit man den Code am Tisch weiterzeigen kann.

**Vor dem Hochzeitstag:** neutrales Badge „Album öffnet am [19. Juni]“, wenn das Album noch gesperrt ist.

Der Link zur Druckkarte steht nur im Admin.

### 10. Zusage (RSVP, `#zusage`)

**Rahmen**
- sand-Sektion, darin die paper-Formularkarte: `--w-form`, Radius 16, `--shadow-md`, Innenabstand 24 px, ab 64em 40 px.
- Das E10-Siegel (56 px) überlappt die Oberkante mittig.

**Kopf**
- „Bitte bis [1. April 2027]“ mit Frist-Badge.
- Wenn über den Gästecode bekannt: „Eure Einladung gilt für [2] Personen.“

**Gruppen** als `<fieldset>`. Die Legend steht in Cormorant 600 1.5rem, davor ein Nummernkreis (28 px, 1 px sage-700, Figtree 600 .875rem). Zwischen den Gruppen eine Haarlinie und 40 px Abstand.

1. **Kommt ihr?**
   - Zwei Radio-Karten: „Ja, wir kommen gern“ (E7-Icon) und „Leider nicht“ (Olivenzweig-Icon). Unter 30em gestapelt, darüber nebeneinander.
   - Name (`autocomplete="name"`) und E-Mail (`type="email" autocomplete="email"`, Hinweis „für eure Bestätigung“).
   - Bei „Nein“ folgen nur noch Gruppe 5 und das Absenden.
2. **Wer kommt?** Wird nur bei Zusage eingeblendet (Höhen-Transition).
   - Personenkarten: linen, 1 px line, Radius 12, Innenabstand 20 px.
   - Kopf „Person 1“. Ab Person 2 ein Ghost-Button „Entfernen“ (44 px) mit Rückgängig-Toast.
   - Vorbelegt aus dem Gästecode: Namen ausgefüllt, dazu je ein Schalter „kommt mit“.
   - Inhalt jeder Personenkarte:
     - Name
     - Menü als Chip-Radios im 2×2-Raster, je ≥ 48 px: Fleisch / Fisch / Vegetarisch / Vegan
     - Checkbox „Kind (unter 12 Jahren)“. Aktiv: zusätzlicher Chip „Kindermenü“, Select „Alter“ (0–2 / 3–6 / 7–12) und Checkbox „Hochstuhl benötigt“
     - „Unverträglichkeiten (optional)“: Checkbox-Chips Gluten / Laktose / Nüsse / Sonstiges. „Sonstiges“ blendet ein Textfeld ein (Hinweis „z. B. Sellerie“).
   - Darunter der Button „Weitere Person hinzufügen“: Sekundär, 56 px, volle Breite, gestrichelter stone-Rahmen, Plus-Icon. Dazu der Zähler „[2] von max. [4] Personen laut Einladung“. Ist das Kontingent voll, ist der Button deaktiviert und der Grund steht als Text daneben.
3. **Programm**
   - Checkbox-Karten (56 px, Icon links): „Trauung · 14:00 Uhr“, „Feier ab 16:00 Uhr“, „Brunch am Sonntag · 10:30 Uhr“.
   - Freigegebene Punkte sind vorausgewählt. Nicht freigegebene Punkte werden gar nicht gerendert.
4. **Übernachtung und Shuttle**
   - Radio-Karten (≥ 64 px): „Im Hotel-Kontingent“ / „Wir organisieren selbst“ / „Wir fahren heim“
   - Checkboxen „Shuttle Hinfahrt (13:15 Uhr)“ und „Shuttle Rückfahrt (ab 23:00 Uhr)“
   - Ist ein Shuttle gewählt: Select „Ab welchem Hotel?“ und Stepper „Plätze“
5. **Noch etwas?**
   - „Musikwunsch (optional)“
   - „Nachricht an uns (optional)“: Textarea, mindestens 128 px hoch, Zähler „0 / 500“ (`aria-live="polite"`, meldet erst ab 450 Zeichen)
   - Einwilligungs-Checkbox (Pflicht): „Ich bin einverstanden, dass meine Angaben zur Planung der Hochzeit gespeichert werden.“ plus Link „Datenschutz“

**Absenden**
- Primär lg (56 px), mobil volle Breite, ab 45em auto-breit und zentriert: „Antwort senden“.
- Darunter `--fs-small`: „Ihr könnt eure Antwort bis [1. April] jederzeit ändern.“
- Beim Senden: Spinner, „Wird gesendet …“, `aria-busy="true"`, doppeltes Absenden blockiert.
- Der Button ist **nie vorab deaktiviert**. Geprüft wird beim Absenden.

**Entwurf:** Das Formular speichert lokal (localStorage, try/catch) und zeigt dezent „Entwurf gespeichert“.

**Fehler**
- Oben erscheint eine Box: error-bg, 4 px linker Rand in error, Titel „Bitte prüft noch:“, Liste mit Ankerlinks zu den Feldern. Sie hat `role="alert"` und `tabindex="-1"` und bekommt den Fokus.
- Die Felder selbst siehe G.

**Bestätigung** (ersetzt den Karteninhalt, Fokus auf die H3 mit `tabindex="-1"`)
- E9 um ein Häkchen (96 px, sage-700), zeichnet sich ein
- H3 „Danke, [Anna]!“, Text „Wir haben eure Zusage für [2] Personen erhalten. Wir freuen uns auf euch.“
- Zusammenfassung als `<dl>`: Label und Wert, ab 30em zweispaltig
- Hinweis „Eine Bestätigung ist an [anna@…] unterwegs.“
- Buttons „Antwort ändern“ (Sekundär, öffnet das Formular vorausgefüllt) und „Zum Kalender hinzufügen“ (Primär)

**Absage:** Olivenzweig und „Schade, dass ihr nicht dabei sein könnt. Danke für eure Rückmeldung.“

**Nach der Frist:** schreibgeschützte Zusammenfassung mit „Für Änderungen meldet euch bitte direkt bei [Lisa]“ (tel-Link).

### 11. FAQ
- **Mobil:** Sektionskopf, darunter das Akkordeon in `--w-form`. Oben rechts ein Ghost-Button „Alle aufklappen“ bzw. „Alle zuklappen“.
- **Ab 64em:** Raster `1fr 2fr`. Links sticky (top = Header + 32 px): H2, Lead, „Eure Frage fehlt? Schreibt uns“ (Link zu `#kontakt`). Rechts das Akkordeon.
- **Akkordeon:** natives `<details>` **ohne** `name`, damit mehrere Einträge offen bleiben können. Die Browser-Suche (Strg+F) öffnet Treffer automatisch.
- **Fragen:**
  - Sind Kinder willkommen?
  - Wo kann ich parken?
  - Bis wann sollen wir zusagen?
  - Wir möchten eine Rede, ein Spiel oder eine Überraschung beitragen, an wen wenden wir uns? (Antwort: die Trauzeugen, bis [Datum], Link zu Kontakt)
  - Was passiert bei Regen?
  - Darf ich während der Trauung fotografieren?
  - Wie lange geht die Feier, und wie komme ich nachts zurück?
  - Gibt es Essen für Allergiker, Vegetarier und Veganer?
- Antworten verlinken in die passenden Sektionen.

### 12. Kontakt (`#kontakt`)

**Karten:** mobil gestapelt, ab 45em 2 bzw. 3 Spalten. Inhalt:
- Bogen-Avatar 64×80 (ab 64em 96×120): sage-100 mit Initialen in Cormorant 600 2rem sage-700, später optional ein Foto
- Name H4, Rolle als Label („Trauzeugin von Vera“), Zeile „Ansprechpartnerin für Reden, Spiele, Überraschungen“
- Telefonnummer **sichtbar als Text** (`--fs-lead`, tabular)
- tel-Button „Anrufen“ (Sekundär md, volle Breite), dazu Ghost „E-Mail schreiben“, optional „WhatsApp“ (`https://wa.me/…`)

**Hinweis-Box** (terra-100): „Reden, Spiele und Überraschungen bitte bis [1. Mai] bei [Lisa & Jonas] anmelden, damit alles in den Ablauf passt.“

Darunter eine Zeile mit den Kontaktdaten des Brautpaars.

### 13. Footer (sage-900, `.onDark`)
- E1-Silhouetten an der Oberkante (sage-700 auf sage-900, dekorativ).
- Innenabstand 64 px oben, 48 px unten zuzüglich `env(safe-area-inset-bottom)`.
- Zentriert:
  - E10 groß in sand-Kontur (72 px)
  - „[19. Juni 2027] · [Ort]“ in Cormorant Italic 1.25rem (600), sand
  - „Wir freuen uns auf euch.“
- Links in sand, unterstrichen: Datenschutz · Impressum · Abmelden · Nach oben. Je 44 px hoch, mobil zweispaltig.
- Der Fokusring ist hier sand.

### Admin (`/admin`, eigenes Passwort, gleiche Login-Optik mit Eyebrow „Verwaltung“)

**Rahmen**
- Header: E10 klein, neutrales Badge „Verwaltung“, rechts „Abmelden“.
- Inhalt in `--w-wide` auf linen, ohne Textur und ohne Illustrationen (außer E8 unter der H1). Der Fließtext darf auf 1rem sinken.

**Kopfzeile**
- H1 „Übersicht“ (`--fs-h1`), daneben `--fs-small` „Stand: [heute, 14:32 Uhr]“.
- Rechts:
  - Primär „CSV exportieren“. Öffnet ein Popover mit zwei Exporten: „Haushalte“ und „Gäste pro Person (Catering, Sitzplan)“.
  - Sekundär „Aktualisieren“.
  - Ghost „QR-Tischkarte drucken“.

**Kacheln:** 2 Spalten, ab 64em 4. paper, 1 px line, Radius 16, Innenabstand 20 px. Label `--fs-label` ink-soft, Zahl in Cormorant 500 2.5rem lining ink (keine farbigen Zahlen), Unterzeile `--fs-small` ink-soft. Inhalte:
- Personen zugesagt („aus [23] Haushalten“)
- Absagen
- Noch offen: Codes ohne Antwort, mit Fortschrittsbalken 8 px sage-700 auf sage-100
- Kinder
- Shuttle hin / zurück
- Hotel-Kontingent
- Brunch
- Unverträglichkeiten: die Kachel ist klickbar und setzt den Filter

**Menüwahl:** horizontale Balkenliste, eine Zeile pro Menü, eine Farbe (sage-700, 6.77:1 auf paper).
- Label 9rem links in ink.
- Balken 12 px hoch, Radius 4 px nur am Ende.
- Wert rechts davon in ink tabular.
- Keine Legende, kein Tooltip, alle Werte sind direkt beschriftet.

**Unverträglichkeiten:** Karte mit allen Angaben und Personennamen, für den Caterer.

**Werkzeugleiste**
- Suchfeld „Name suchen“ (48 px)
- Segmentsteuerung „Alle | Zusagen | Absagen | Offen“ (44 px, aktiv = sage-700-Fläche mit paper-Text)
- Filter-Chip „Mit Allergien“

**Tabelle**
- paper, Kopfzeile sand und sticky, Label-Stil. Sortierbar über Kopf-Buttons mit `aria-sort`.
- Zeilen mindestens 56 px hoch, Zellen 12 px 16 px, 1 px line unten, Hover sand.
- Spalten:
  - Name (Haushalt)
  - Status-Badge: „Zusage“ (sage mit Häkchen) / „Absage“ (terra-Kontur mit Kreuz) / „Offen“ (neutral)
  - Personen (rechtsbündig)
  - Menüs („2× Veg., 1× Fisch“)
  - Kinder
  - Programm
  - Übernachtung
  - Shuttle
  - Allergien (Warn-Icon)
  - Nachricht (eine Zeile, gekürzt)
  - Datum
- Ein Chevron-Button pro Zeile klappt die Details auf.
- Unter 48em wird jede Zeile eine Karte: Name, Badge, Personen, „Details“.

**CSV:** Semikolon als Trenner, UTF-8 mit BOM (für deutsches Excel), Dateiname `cv-zusagen-JJJJ-MM-TT.csv`.

### Druckbare QR-Tischkarte (`/fotos/karte`, nur über den Admin erreichbar)

**Bildschirm**
- sand-Hintergrund, Vorschau der Karten auf paper mit `--shadow-md`.
- Formatwahl als Radio-Karten: „A6-Karte, 4 pro A4“ / „A5-Aufsteller zum Falten“.
- Primär „Drucken“ (`window.print()`) und der Hinweis „A4, Skalierung 100 %, ohne Seitenränder“.

**Druck**
- `@page{size:A4;margin:0}`, Raster 2×2 à 105×148.5 mm.
- Schnittmarken 0.25 pt, 3 mm außerhalb. Sicherheitsabstand innen 8 mm.
- `print-color-adjust:exact`. Keine vollflächigen Hintergründe.

**Karteninhalt**
- E2 in der Linien-Variante in zwei Ecken (28 mm)
- E10 (18 mm)
- „Christoph & Vera“ in Pinyon 20 pt
- „Teilt eure Fotos“ in Cormorant 500 22 pt
- Figtree 10.5 pt: „Scannt den Code und ladet eure schönsten Momente in unser Album.“
- **QR 45×45 mm**, ink auf Weiß, Fehlerkorrektur Q, 4 Module Ruhezone, als SVG
- Kurz-URL Figtree 9 pt
- Datum Cormorant Italic 11 pt
- Rahmen als Doppel-Haarlinie

**A5-Aufsteller:** zwei A6-Felder übereinander, das obere um 180° gedreht, Falzlinie gestrichelt.

### Datenschutz und Impressum
- Erreichbar ohne Login.
- Header ohne Ankerlinks, nur „Zurück zur Startseite“.
- Textspalte `--w-text`, H1 in Cormorant, Skala wie oben, Footer wie oben.

---

## G) Komponenten

### Buttons

| | Primär | Sekundär | Ghost |
|---|---|---|---|
| Ruhe | Fläche terra-700, Text paper (6.28) | transparent, 1.5 px Rahmen ink, Text ink | Text terra-700, Unterstrich 1 px mit Abstand .25em, Innenabstand 10px 4px |
| Hover (`@media (hover:hover)`) | terra-800 (8.21) | Fläche `color-mix(in srgb, var(--c-ink) 6%, transparent)` | Unterstrich 2 px |
| Active | terra-800, `translateY(1px)` | 10 % ink, `translateY(1px)` | terra-800 |
| Fokus | `outline:3px solid var(--focus); outline-offset:3px` | gleich | gleich, Radius 6 px |
| Ladend | Spinner 18 px plus Text, `aria-busy="true"` | – | – |

- **Form:** Pill, Figtree 600 `--fs-ui`, Tracking .01em, Icon 20 px mit 8 px Abstand. `touch-action:manipulation`, Übergänge 150 ms.
- **Größen:**
  - md: 48 px / 0 24px
  - lg: 56 px / 0 32px
  - Header-CTA: 44 px / 0 18px
  - sm: 40 px, nur Admin-Desktop, Trefferfläche über `::after` auf 44 px erweitert
- **Icon-Button:** 44×44 rund, 1 px stone, Icon 20 px, `aria-label` ist Pflicht. Auf der Gästeseite nur für Kopieren.
- **Auf Dunkel:** Primär mit Fläche sand und Text sage-900 (8.97). Sekundär mit 1.5 px sand-Rahmen und sand-Text.
- **Deaktiviert:** Fläche line, Text ink-soft (4.61). Nur wo unvermeidbar, nie beim Absenden.
- Primär-Aktionen sind mobil volle Breite, ab 30em inline.

### Formularfelder
- **Label** oben: Figtree 600 1rem ink, 8 px Abstand. Optionale Felder sind mit „(optional)“ in ink-soft 400 markiert. Pflicht ist der Normalfall, keine Sternchen.
- **Hinweis** zwischen Label und Feld: `--fs-small` ink-soft, per `aria-describedby` verbunden.
- **Input und Select:**
  - 52 px hoch, Innenabstand 0 16px, 1.0625rem (kein iOS-Zoom), paper, 1 px stone (4.43), Radius 10.
  - Hover: Rahmen ink-soft. Fokus: Rahmen ink plus Fokusring.
  - Select mit `appearance:none` und eigenem Chevron (20 px, 16 px vom rechten Rand).
  - `inputmode` und `autocomplete` immer gesetzt.
- **Textarea:** mindestens 128 px hoch, `resize:vertical`.
- **Fehler:**
  - 2 px Rahmen in error, `aria-invalid="true"`.
  - Meldung darunter: 16-px-Warn-Icon und Text `--fs-small` 600 in error, formuliert als Lösung („Bitte wählt ein Menü für Person 2.“).
  - Der eingegebene Wert bleibt erhalten.
  - Erste Prüfung beim Absenden, danach live bei Blur.
- **Checkbox:** 24×24, 1.5 px stone, Radius 6. Aktiv: sage-700-Fläche mit paper-Häkchen (6.77). Die ganze Zeile ist das Label, ≥ 48 px hoch, 12 px Abstand.
- **Schalter** („kommt mit“): Track 52×32, aus = sand mit stone-Rahmen, an = sage-700. Knopf 24 px paper. `role="switch"`, der Zustand steht zusätzlich als Text „Ja“/„Nein“ daneben.
- **Radio- und Checkbox-Karte:**
  - Natives Input visuell versteckt, aber fokussierbar. Das `<label>` ist die Karte.
  - Höhe ≥ 88 px (Zu-/Absage) bzw. ≥ 56 bis 64 px. Innenabstand 20 px, Radius 12.
  - Inhalt: Icon 32 px sage-700, Titel Cormorant 600 1.5rem, Untertitel `--fs-small`.
  - Ruhe: paper mit 1 px stone. Hover: Rahmen ink-soft.
  - **Gewählt** (`:has(:checked)`): 2 px sage-700, sage-100-Fläche, Häkchen-Kreis 24 px oben rechts.
  - Fokus: `:has(:focus-visible)` gibt der Karte den Fokusring.
- **Chip-Radio und Chip-Checkbox:** Pill 48 px, Innenabstand 0 18px, 1 px stone, Text ink. Gewählt: sage-700-Fläche, paper-Text **mit vorangestelltem Häkchen-Icon**. Umbruch erlaubt, 8 px Abstand.
- **Stepper:** [−] Wert [+]. Buttons 44×44 rund mit 1 px stone, Wert 56 px breit in Figtree 600 1.25rem tabular, `aria-live="polite"`.

### Karten
- **Basis:** paper, 1 px line, Radius 16, Innenabstand 24 bzw. 32 px.
- **Interaktiv:** bei Hover `--shadow-md` und `translateY(-2px)` (nur `(hover:hover) and (pointer:fine)`).
- **Bogenkarte:** Kopfbereich mit `border-radius:999px 999px 0 0`.
- **Hinweis-Box:** Radius 12, Innenabstand 16px 20px, Icon 24 px links.
  - Info: sage-100
  - Wichtig: terra-100
  - Neutral: sand
  - Fehler: error-bg mit 4 px linkem Rand
- **Info-Zeile:** Icon-Kreis 40 px sand, Icon 20 px sage-700, Text daneben.
- **Ticket:** siehe Shuttle.

### Badges
28 px hoch, Innenabstand 0 12px, Pill, Figtree 600 .875rem, Tracking .02em, optional Icon 14 px.

| Variante | Stil | Kontrast |
|---|---|---|
| neutral | sand mit ink | 10.44 |
| sage | sage-100 mit sage-900 | 8.81 |
| terra-Kontur | transparent, 1 px terra-700, Text terra-700 | ≥ 5.15 |
| Jetzt | terra-700-Fläche, Text paper | 6.28 |

### Akkordeon
- `<details>/<summary>`, Marker ausgeblendet (`list-style:none`, `::-webkit-details-marker{display:none}`). Einträge sind oben und unten durch 1 px line getrennt.
- **Summary:** Flex mit `space-between`, Innenabstand 20px 0, ≥ 56 px hoch, Figtree 600 1.125rem ink. Hover terra-700.
- **Symbol:** 32-px-Kreis mit 1 px stone, darin ein Plus aus zwei 12-px-Linien (1.5 px ink). Beim Öffnen dreht sich die senkrechte Linie um 90° zu einem Minus.
- **Antwort:** Innenabstand 0 0 24px, max. 38rem.
- **Fokus:** Ring mit `outline-offset:4px` und Radius 8.
- **Druck:** alle Einträge offen.

### Weitere
- **Toast:** unten mittig, 16 px plus Safe-Area über dem Rand. sage-900 mit linen-Text (10.21), 48 px hoch, Pill, `role="status"`, 2.5 s sichtbar.
- **Kopier-Button:** Das Icon wechselt 2 s lang auf ein Häkchen, dazu der Toast.
- **„Nach oben“:** erscheint nach zwei Bildschirmhöhen. 48 px, sand mit line-Rahmen, unten rechts 16 px plus Safe-Area, `aria-label="Nach oben"`.
- **Popover** (Kalender, CSV): paper, `--shadow-lg`, Radius 12, Zeilen 48 px. Mit `popover`-Attribut oder eigenem Fokus-Management, Esc schließt.

---

## H) Bewegung

**Tokens:** `--ease: cubic-bezier(.22,.61,.36,1)`, Dauern 150 / 250 / 600 / 1400 ms.

**Einblenden beim Scrollen**
- IntersectionObserver mit `threshold:.15` und `rootMargin:'0px 0px -10% 0px'`, wirkt einmalig.
- Listen werden um 80 ms pro Element versetzt eingeblendet, höchstens 5 Elemente.
- Ohne JS ist alles sichtbar:

```css
@media (scripting: enabled) and (prefers-reduced-motion: no-preference){
  .reveal:not(.isVisible){ opacity:0; transform:translateY(16px); }
  .reveal{ transition: opacity var(--dur-slow) var(--ease), transform var(--dur-slow) var(--ease); }
}
```

**Hero und Login**
- **Stiel zeichnet sich:** `pathLength="1"`, `stroke-dasharray:1`, `stroke-dashoffset` von 1 auf 0 in 1400 ms, Verzögerung 200 ms.
- **Blätter:** `transform-box:fill-box`, Ursprung am Blattstiel. Skalierung .6 → 1 mit Einblendung, je 70 ms versetzt, Start nach 400 ms.
- **Wiegen:** `@keyframes sway{0%,100%{rotate:-1deg}50%{rotate:1deg}}`, 9 s, ease-in-out, unendlich, Ursprung am Zweigfuß. Pampas ±1.5° in 6 s. Nur Hero und Login. Pausiert außerhalb des Viewports (`animation-play-state` per IntersectionObserver).

**Ranke „Geschichte“**

```css
@supports (animation-timeline: view()){
  @media (prefers-reduced-motion: no-preference){
    .vine{ animation: grow linear both; animation-timeline: view(); animation-range: entry 10% cover 60%; }
    @keyframes grow{ from{ clip-path: inset(0 0 100% 0); } to{ clip-path: inset(0); } }
  }
}
```

Ohne Unterstützung blendet die Ranke einmalig über 1.2 s ein.

**Interaktion**
- Buttons: Farbe in 150 ms.
- Karten: Anheben in 250 ms, nur bei `(hover:hover) and (pointer:fine)`.
- Menü: Einblendung in 200 ms mit 16 px Einschub von oben.
- Akkordeon:

```css
details::details-content{ block-size:0; overflow:clip;
  transition: block-size var(--dur-base) var(--ease), content-visibility var(--dur-base) allow-discrete; }
details[open]::details-content{ block-size:auto; }
```

  Ältere Browser öffnen ohne Animation. Das Plus-Symbol dreht sich in 200 ms.
- Countdown: aktualisiert jede Minute, ohne Animation.
- Bestätigung: E9 zeichnet sich in 900 ms (Dashoffset), danach das Häkchen in 400 ms.

**Sanftes Scrollen**

```css
@media (prefers-reduced-motion: no-preference){ html{ scroll-behavior:smooth; } }
```

**Bei reduzierter Bewegung**

```css
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{ animation-duration:.01ms!important; animation-iteration-count:1!important;
    transition-duration:.01ms!important; scroll-behavior:auto!important; }
  .reveal{ opacity:1!important; transform:none!important; }
}
```

Zweige stehen dann sofort im Endzustand, ohne Wiegen und ohne Einschub.

---

## I) Barrierefreiheit und Mobil-Details

**Fokus**
- Global `:focus-visible{outline:3px solid var(--focus);outline-offset:3px}`. terra-700 erreicht auf allen hellen Flächen 5.15 bis 6.28, sand auf dem Footer 8.97.
- Nie `outline:none` ohne Ersatz.
- Fokusführung: Menü öffnen → „Schließen“, Menü schließen → „Menü“. Nach dem Absenden auf die Fehlerbox bzw. die Bestätigungsüberschrift.
- Unter `forced-colors`: `outline-color:Highlight`, Buttons mit `border:1px solid ButtonText`, Illustrationen und Textur ausgeblendet.

**Tap-Targets**
- Mindestens 44×44 px, Standard 48 px, Haupt-Aktionen 56 px. Mindestens 8 px Abstand zwischen benachbarten Zielen.
- Telefon, Mail und Karten-Apps sind Buttons und Ein-Tipp-Aktionen.
- Links im Fließtext bekommen `padding-block:.15em`.
- Keine Funktion nur per Hover.

**Kontrast**
- Text überall ≥ 4.5 (ungünstigster Fall: terra-700 auf sage-100 mit Textur, 4.74).
- Fließtext ≥ 10.25. UI-Rahmen ≥ 3.35.
- Information nie nur über Farbe.

**Lesbarkeit für ältere Gäste**
- Fließtext 17 bis 19 px, Zeilenhöhe 1.6, nichts Informatives unter 15 px (Ausnahme: 14-px-Labels in Versalien mit 600).
- Script-Schrift nur für die Namen.
- Datum ausgeschrieben, Zeiten mit „Uhr“ im 24-h-Format, Telefonnummern sichtbar und gruppiert.
- Klare Verben auf Buttons. „Menü“ und „Schließen“ als Wort. „Alle aufklappen“ im FAQ. Infoblatt zum Drucken.

**Zoom und Umbruch**
- Viewport-Meta ohne `maximum-scale` und ohne `user-scalable=no`.
- Funktioniert bei 320 px Breite und 200 % Zoom ohne horizontales Scrollen.
- Größen in rem, Media-Queries in em, keine festen Höhen.

**Struktur**
- `<html lang="de">`, Landmarks `header/nav[aria-label="Hauptnavigation"]/main/footer`.
- Jede Sektion `<section aria-labelledby>`.
- Überschriften: H1 = Namen im Hero, dann H2 pro Sektion, dann H3.
- Zeitleiste und Ablauf als `<ol>` mit `<time datetime>`, Orte in `<address>`.
- Formulare mit `fieldset/legend`.

**Countdown:** `<time datetime>` plus ein visuell versteckter Satz („Noch 214 Tage, 5 Stunden und 12 Minuten bis zur Hochzeit“), `aria-live="off"`.

**Externe Links:** Icon plus `sr-only` „(öffnet in neuem Tab)“, `rel="noopener noreferrer"`.

**Mobil**
- `100svh` statt `100vh`. `env(safe-area-inset-*)` in Header, Menü, Toast und Footer.
- Keine fixe Leiste am unteren Rand (sie würde bei offener Tastatur Felder verdecken).
- `theme-color` `#FAF7F2`.
- Bilder mit `loading="lazy"`, außer im Hero.

**Druck der Hauptseite**
- Navigation, Texturen, Illustrationen, Countdown und Formular ausblenden.
- ink auf Weiß, `break-inside:avoid` für Karten.
- Akkordeons offen.
- `a[href^="http"]::after{content:" (" attr(href) ")"}`, ausgenommen Karten-Links, deren Adresse ohnehin im Text steht.

**Performance und Datenschutz**
- Drei Schriftfamilien, nur `latin`, selbst gehostet, `display:swap`, automatischer Fallback-Abgleich durch next/font.
- SVGs inline mit wenigen Pfaden. Pampas-Fiedern werden einmalig per `useMemo` berechnet oder als statisches Array erzeugt.
- Karten-iframes erst nach Einwilligung. Kein Tracking, keine CDNs.

---

## J) SVG-Motiv-Bauanleitungen

Für alle Motive gilt, sofern nicht anders angegeben: Linien `stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"`, `fill="none"`.

**Farben**
- Stiel (STEM) = `var(--c-sage-700)`
- Blatt (LEAF) = `var(--c-sage-400)`
- Warm (WARM) = `var(--c-terra-500)`

Farben werden über CSS-Variablen gesetzt, damit die Druck- und Dunkel-Varianten nur Variablen austauschen.

### E1 Eukalyptus-Zweig „Silberdollar“, viewBox `0 0 120 240`
- **Stiel:** `M60 238 C58 196 64 160 60 124 C57 96 60 62 68 8`, STEM, 1.25.
- **9 Blätter:** Ellipsen mit `rx=r`, `ry=0.88r`. Linke Blätter `transform="rotate(30 cx cy)"`, rechte `rotate(-30 cx cy)`.

| # | cx | cy | r | Seite | Deckkraft |
|---|---|---|---|---|---|
| 1 | 37 | 206 | 17 | L | .9 |
| 2 | 83 | 184 | 16 | R | .6 |
| 3 | 39 | 160 | 15 | L | .9 |
| 4 | 81 | 138 | 14 | R | .6 |
| 5 | 40 | 112 | 13 | L | .9 |
| 6 | 77 | 90 | 12 | R | .6 |
| 7 | 44 | 68 | 10.5 | L | .9 |
| 8 | 75 | 48 | 9 | R | .6 |
| 9 | 55 | 24 | 7 | L | .9 |

- **Blattstiel:** Linie vom Stiel (x am Stiel auf Höhe cy+4, etwa 60) bis zum stielseitigen Blattrand (cx ± r·0.85), STEM, 1.
- **Mittelrippe:** vom Blattstiel-Ansatz durch den Mittelpunkt bis 70 % des Durchmessers, Stroke linen, 0.75, Deckkraft .5. Nur ab 96 px Darstellungshöhe.
- **Knospe:** Ellipse (68, 8), rx 2.5, ry 4.5, STEM, Deckkraft .8.
- **Zeichenreihenfolge:** Blätter 2, 4, 6, 8 (.6), dann der Stiel, dann die Blätter 1, 3, 5, 7, 9 (.9).
- **Linien-Variante** (Druck, Footer): gleiche Geometrie, `fill="none"`, Kontur STEM 0.75 bis 1 bei Deckkraft .6.
- **Animation:** Stiel mit `pathLength="1"`. Jedes Blatt in einer `<g>` mit `transform-origin` am Blattstiel-Ansatz.

### E2 Eck-Bouquet, viewBox `0 0 300 300`
- Ursprung (20, 290) links unten. Drei E1-Instanzen als `<g transform="translate(20 290) rotate(θ) scale(s) translate(-60 -238)">`:

| Instanz | Skalierung s | Rotation θ |
|---|---|---|
| A | 1.0 | 20° |
| B | 0.8 | 55° |
| C | 0.65 | −10° |

- Dahinter E3: Skalierung .9, rotate(38°), Deckkraft .5.
- **Rechte obere Ecke:** `transform="rotate(180 150 150)"`. Für links oben bzw. rechts unten zusätzlich `scale(-1 1)`.

### E3 Pampasgras, viewBox `0 0 80 300`
- **Halm:** `M42 298 Q46 190 34 30`, WARM, 1, Deckkraft .55.
- **Rispe:** 30 Fiedern auf dem Halm zwischen y 30 und y 170.
  - Für jede Fieder i = 0…29: p = i/29, Punkt auf dem Halm bei t = 0.0 + 0.5·p (Parameter der Q-Kurve von der Spitze aus).
  - Richtung: Halmtangente gegen die Wuchsrichtung, gedreht um ±(25° + (i mod 3 − 1)·4°). Abwechselnd links und rechts, nach oben zeigend.
  - Länge L = 6 + 20·sin(π·p).
  - Form: `M P Q (P + Richtung·L/2 + Normale·2) (P + Richtung·L)`, also leicht nach außen gewölbt.
  - Strich WARM, 0.75, Deckkraft .45.
- **Bündel-Variante** `PampasBundle`: 3 Rispen aus einem Fußpunkt (42, 298), rotate(−14°) / 0° / +11°, Skalierung .85 / 1 / .9.

### E4 Olivenzweig, viewBox `0 0 200 60`
- **Stiel:** `M6 36 Q100 20 194 28`, STEM, 1.25, Deckkraft .8.
- **10 Blätter:** Form `M0 0 Q12 -3.2 24 0 Q12 3.2 0 0Z`, lanzettlich, zeigt nach +x.
  - Positionen bei x = 20, 38, 56, …, 182 auf dem Stiel (y aus der Kurve).
  - Abwechselnd oben (Stieltangente −35°) und unten (+35°), zur Spitze geneigt.
  - Skalierung von 1.0 auf 0.7 zur Spitze.
  - Füllung LEAF .85, jedes dritte Blatt STEM .55.
- **Oliven:** Ellipsen rx 3.6, ry 2.8 bei (70, 40) und (122, 16), jeweils an einem 4-px-Stielchen, STEM .6.
- **Endblatt:** in Stielrichtung bei (194, 28).

### E5 Doppelbogen-Rahmen (CSS)

```css
.archWrap{ container-type:inline-size; }
.arch{ border-radius: 50cqi 50cqi var(--radius-lg) var(--radius-lg); border:1px solid rgb(72 96 76/.55); position:relative; }
.arch::before{ content:""; position:absolute; inset:8px; border:1px solid rgb(72 96 76/.35);
  border-radius: calc(50cqi - 8px) calc(50cqi - 8px) 10px 10px; pointer-events:none; }
```

Fallback ohne Container-Query-Einheiten: `border-radius:999px 999px 16px 16px`.

### E6 Boho-Halbsonne, viewBox `0 0 200 100`, Mittelpunkt (100, 100)
- **Scheibe:** `M64 100 A36 36 0 0 1 136 100Z`, WARM, Deckkraft .2.
- **Bögen:** `M(100−r) 100 A r r 0 0 1 (100+r) 100`.
  - r 52: WARM 1, Deckkraft .45
  - r 66: WARM 1, Deckkraft .3
- **11 Strahlen** bei φ = 15°, 30°, …, 165°: von (100 + 76·cos φ, 100 − 76·sin φ) bis (100 + 88·cos φ, 100 − 88·sin φ), WARM 1, Deckkraft .35.
- **Variante „Nacht“** (Ende des Sonnenlaufs): Mondsichel aus zwei Kreisen. Kreis (0, 0) r 10 in sage-900, ausgeschnitten mit Kreis (4, −3) r 9 per `mask`.

### E7 Ringe, viewBox `0 0 48 36`
- **Ringe:** Kreis A (18, 22) r 11 und Kreis B (30, 22) r 11, Stroke 1.5 `currentColor` (Standard sage-700).
- **Diamant:** `M30 4 L34 8 L30 12 L26 8Z`, Füllung WARM, Stielchen `M30 12 V11` …
- **Verschränkung:** An der rechten Schnittstelle (ca. 24 bis 26, 12 bis 16) liegt über Ring B ein 3 px breites Bogenstück von A in der Hintergrundfarbe (`var(--illu-bg, var(--c-paper))`). Darüber wird A noch einmal in Linienfarbe gezeichnet. So liegt A sichtbar „über“ B.
- **Funkeln (optional):** Sterne `M0 -s Q0 0 s 0 Q0 0 0 s Q0 0 -s 0 Q0 0 0 -s` bei (42, 6) mit s = 3 und (6, 9) mit s = 2, WARM .6.

### E8 Trennornament, viewBox `0 0 240 24`
- **Linien:** `M0 12 H92` und `M148 12 H240`, STEM 1, Deckkraft .45.
- **Punkt:** Kreis (120, 12) r 2.5, WARM.
- **Blätter:**
  - Ellipse (108, 12) rx 7, ry 5, `rotate(-18 108 12)`, LEAF
  - Ellipse (132, 12) rx 7, ry 5, `rotate(18 132 12)`, LEAF
  - Kleine Ellipsen (98, 9) und (142, 9) rx 4.5, ry 3.5, rotate(−20) bzw. (20), LEAF .6

### E9 Halbkranz, viewBox `0 0 160 100`
- **Linker Ast:** `M78 92 A70 70 0 0 1 12 34`, also ein Kreisbogen um (80, 22) mit r 70. STEM 1.25.
- **8 runde Blätter** gleichmäßig auf dem Bogen (Winkelschritte):
  - Radien von unten nach oben 6, 5.6, 5.2, 4.8, 4.4, 4, 3.8, 3.5
  - abwechselnd außen (Deckkraft .9) und innen (Deckkraft .6) am Bogen, um r+1 vom Bogen versetzt
  - Ellipsen mit ry = 0.88r, Längsachse 30° zur Bogentangente
- **Rechter Ast:** gespiegelt mit `transform="matrix(-1 0 0 1 160 0)"`.
- **Verbindung:** Kreis (80, 93) r 2.5, WARM.
- Für den Erfolgszustand liegt in der Mitte ein Häkchen: `M62 52 L74 64 L98 38`, STEM 2.5.

### E10 Monogramm, viewBox `0 0 120 120`
- **Kreise:** Kreis (60, 60) r 57, STEM 1, Deckkraft .7. Kreis r 53, STEM 1, Deckkraft .4.
- **Buchstaben:** `<text>` mit `style="font-family:var(--ff-display)"`, die Schriftvariable greift im Inline-SVG.
  - „C“ bei (40, 70) und „V“ bei (80, 70): weight 500, size 44, fill ink, `text-anchor="middle"`
  - „&“ bei (60, 64): Italic 400, size 22, fill terra-700
- **Große Variante** (≥ 72 px): Buchstaben bei y = 62, darunter E9 auf 84 Einheiten Breite (`translate(18 78) scale(.525)`).
- **Kleine Variante** (≤ 48 px, Header): nur der äußere Kreis (Stroke 1.5) und „C&V“ als ein Text, size 40, „&“ in terra-700.
- **Auf Dunkel:** Kreise und Buchstaben in sand, „&“ in sand.
- Das Monogramm bekommt `role="img" aria-label="Christoph und Vera"`, wenn es als Link dient. Sonst `aria-hidden`.

### E11 Orts-Vignetten, viewBox `0 0 160 120`
Nur Strich, STEM 1.25.

**Kapelle**
- Boden `M10 110H150`
- Schiff `rect x52 y56 w56 h54`
- Dach `M46 58 L80 30 L114 58`
- Turm `rect x70 y14 w20 h22`, Spitze `M68 16 L80 2 L92 16`
- Tür `M72 110V92 A8 8 0 0 1 88 92V110`
- Rundfenster Kreis (80, 48) r 5
- Baum: Kreis (130, 78) r 14 mit Füllung LEAF .35, Stamm `M130 92V110`

**Scheune**
- Korpus `M30 110V60 L80 28 L130 60V110Z`
- Tor `rect x62 y74 w36 h36` mit `M62 74L98 110M98 74L62 110`
- Luke `rect x72 y46 w16 h14`
- Lichterkette `M30 60 Q55 70 80 62 Q105 70 130 60` mit `stroke-dasharray="1 3"`, dazu Kreise r 1.5 in WARM alle 10 Einheiten entlang der Kurve (berechnet, 10 Stück)
- Baum links: Kreis (16, 84) r 10 mit LEAF .35, Stamm `M16 94V110`
- Boden `M6 110H154`

### E12 Geschichts-Vignetten (Foto-Platzhalter), viewBox `0 0 120 120`
- Strich STEM 1.25. Das Motiv füllt 50 % der Bogenbreite und sitzt zentriert im sage-100-Bogen.
- Dahinter E6 auf 70 % Breite mit Deckkraft .6, an der unteren Motivkante.

| Vignette | Konstruktion |
|---|---|
| **Kennenlernen** | Tasse L `M28 70 h26 v14 a10 10 0 0 1 -10 10 h-6 a10 10 0 0 1 -10 -10Z`, Henkel `M54 74 a5 5 0 0 1 0 10`. Tasse R gespiegelt um x = 60. Die Dampflinien `M41 62 C36 52 46 46 41 36` (und gespiegelt) laufen oben in einem Herz zusammen: `M60 44 C54 36 44 40 50 48 L60 56 L70 48 C76 40 66 36 60 44Z` in WARM .6. |
| **Erste Reise** | Bergkette `M14 92 L44 54 L58 70 L76 46 L106 92`. Koffer `rect x44 y66 w32 h26 rx4`, Griff `M54 66 v-5 h12 v5`, Riemen `M52 66 v26 M68 66 v26`. |
| **Erste Wohnung** | Schlüssel: Schaft `M40 80 H92`, Bart `M84 80 v8 M76 80 v6`. Griff als Haus `M24 82 V68 L36 58 L48 68 V82Z`, darin ein Herz r 3 in WARM. |
| **Antrag** | Schachtel unten `rect x34 y70 w52 h24 rx3`, Deckel offen `M34 70 L42 46 H78 L86 70`. Ring: Kreis (60, 66) r 9, Diamant `M60 49 l5 5 -5 6 -5 -6Z` in WARM. |
| **Hochzeit** | E7, auf 60 Einheiten skaliert und zentriert. |

### E13 Ranken-Kachel (Zeitleiste), Kachel 48 × 160, `repeat-y`
- **Stiel:** `M24 0 C16 40 32 120 24 160`, STEM 1.25. Start- und Endtangente sind identisch (−8, 40), dadurch ist die Kachel nahtlos.
- **Blätter:** Ellipse (15, 52) rx 7, ry 6, rotate(−20) und Ellipse (33, 108) rx 7, ry 6, rotate(20), beide LEAF .6.
- **Einbindung:** als Data-URI-Hintergrund `background: url(...) center top / 48px 160px repeat-y` oder als Inline-SVG mit `<pattern>`.
- **Blattpaar-Knoten**, viewBox `0 0 40 24`: paper-Kreis (20, 12) r 10, Ellipsen (11, 12) und (29, 12) mit rx 7, ry 6.2 in LEAF .9, Kreis (20, 12) r 3 in WARM.

### E14 Sonnenlauf (Kopfgrafik Tagesablauf), viewBox `0 0 720 200`
- **Bogen:** `M40 190 A320 170 0 0 1 680 190`, STEM 1, Deckkraft .4, `stroke-dasharray="2 6"`.
- **Punkt pro Programmpunkt:** Anteil f = (t − t_start)/(t_end − t_start) (z. B. 14:00 bis 01:00; Zeiten nach Mitternacht +24 h). Daraus φ = π·(1 − f), x = 360 + 320·cos φ, y = 190 − 170·sin φ.
  - Kreis r 4, paper-Füllung.
  - Kontur 1.5 in terra-700 (vor 18 Uhr), sage-700 (18 bis 22 Uhr) oder sage-900 (ab 22 Uhr).
  - Am Hochzeitstag: laufender Punkt r 6, gefüllt terra-700.
- **Ab 45em:** Uhrzeit-Label bei (x, y − 14), `text-anchor="middle"`, Figtree 600, 13 Einheiten.
- **Sonne:** E6 skaliert auf 64 Einheiten breit, Basis bei (40, 190), Scheibe WARM .3.
- **Mond:** Sichel (E6-Variante „Nacht“) bei (680, 180), r 10.
- **Horizontlinie:** `M20 190 H700`, line 1.

### E15 Karten-Platzhalter, viewBox `0 0 320 200`, `preserveAspectRatio="xMidYMid slice"`
- **Fläche:** `rect` voll, sand.
- **Straßen:** je doppelt gezeichnet, unten paper mit Stroke 6, darüber line mit Stroke 2:
  - `M-10 140 C80 120 140 160 330 110`
  - `M90 -10 C110 60 80 130 120 210`
  - `M200 -10 C190 80 240 120 230 210`
- **Bach:** `M-10 60 C60 80 120 40 200 70 S300 50 330 80`, sage-100, Stroke 5.
- **Pins:** Pfad `M0 0 C-8 -10 -8 -20 0 -20 C8 -20 8 -10 0 0Z` (Spitze unten) in terra-700, mit paper-Kreis r 3 bei (0, −13).
  - Pin 1 (Trauung) bei (118, 128)
  - Pin 2 (Feier) bei (222, 96)
  - Ziffer im Kreis, Figtree 600, 8 Einheiten

### E16 Icon-Set (`src/components/icons/Icon.tsx`)

**Grundregeln**
- viewBox `0 0 24 24`, `fill="none" stroke="currentColor" stroke-width="1.75"`, runde Enden.
- Größe 20 px in Buttons, 22 bis 24 px im Inhalt. Farbe erbt (Standard sage-700).
- Immer `aria-hidden`, es sei denn, es ist ein reiner Icon-Button.

**Benötigte Icons:**
- menu, close, arrow-right, chevron-down, external, copy, check, x, alert, phone, mail, chat, calendar, calendar-plus, pin, car, parking, train, bus, taxi, accessibility, bed, euro, tag, clock, rings, glasses, utensils, cake, music, moon, coffee, camera, qr, upload, image, link, printer, envelope, gift, plane, shirt, shoe, sun, plus, minus, trash, download, search, filter, user, child, leaf, key, heart

**Bauvorgaben (Auswahl):**

| Icon | Pfade |
|---|---|
| menu | `M4 7h16M4 12h16M4 17h16` |
| close | `M6 6l12 12M18 6L6 18` |
| copy | `rect x8 y8 w12 h12 rx2` + `M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2` |
| pin | `M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z` + Kreis (12, 10) r 2.5 |
| glasses (Sekt) | `M8 3h4l-.5 6a1.5 1.5 0 0 1-3 0zM10 10.5V20M7.5 20h5` und gespiegelt ab x 12 |
| moon | `M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z` |
| rings | Kreise (9, 14) r 5 und (15, 14) r 5, Diamant `M15 4l2 2-2 2.5-2-2.5z` |
| leaf | `M5 19C5 10 11 5 19 5c0 8-5 14-14 14zM5 19l7-7` |

Alle übrigen Icons folgen derselben Strichlogik: maximal 3 Pfade und Formen auf einem 2-px-Raster mit 2 px Rand zur viewBox.