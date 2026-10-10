# Hochzeitswebsite Christoph & Vera

Info-Seite für unsere Hochzeitsgäste: Ablauf, Anfahrt, Übernachtung, Dresscode,
Fotos, FAQ und Online-Zusage. Die Seite ist per **Gästecode** geschützt, die
Zusagen landen in einem geschützten **Admin-Bereich** mit CSV-Export.

Gebaut mit Next.js (App Router) für das Hosting auf Vercel.

---

## Inhalte anpassen

**Alle Texte, Zeiten, Orte, Hotels, FAQ usw. stehen in einer einzigen Datei:**

```
src/content/site.ts
```

Alles, was mit `PLATZHALTER` markiert ist, muss noch ersetzt werden. Hinweise
zum Format stehen oben in der Datei. Eigene Fotos (z. B. für „Unsere
Geschichte") legt ihr in `public/images/` ab und tragt den Pfad, etwa
`/images/antrag.jpg`, beim jeweiligen Eintrag ein.

## Seiten im Überblick

| Adresse          | Inhalt                                                      |
| ---------------- | ----------------------------------------------------------- |
| `/`              | Die Hochzeitsseite (One-Pager mit allen Infos und Zusage)   |
| `/login`         | Eingabe des Gästecodes                                      |
| `/?code=…`       | Direkt-Anmeldung, z. B. als QR-Code auf der Einladungskarte |
| `/fotos/karte`   | Druckbare Tischkarte mit QR-Code zum Fotoalbum              |
| `/kalender.ics`  | Kalendereintrag zum Herunterladen                           |
| `/admin`         | Übersicht aller Zusagen, Statistik, CSV-Export              |
| `/datenschutz`   | Datenschutzhinweise                                         |

## Zugang & Passwörter

Die Codes werden **nicht** im Code gespeichert, sondern als Umgebungsvariablen:

| Variable         | Bedeutung                                                                 |
| ---------------- | ------------------------------------------------------------------------- |
| `GUEST_CODE`     | Gästecode von der Einladung (Groß-/Kleinschreibung und Leerzeichen egal) |
| `ADMIN_CODE`     | Passwort für `/admin` – muss sich vom Gästecode unterscheiden             |
| `SESSION_SECRET` | Langer Zufallswert zum Signieren der Cookies (`openssl rand -base64 32`)  |

Wird ein Code geändert, sind alle bestehenden Anmeldungen mit diesem Code
automatisch ungültig.

**Tipp für die Einladungskarte:** Ein QR-Code auf `https://eure-domain.de/?code=EUERCODE`
meldet Gäste direkt an – sie müssen nichts eintippen.

## Veröffentlichen auf Vercel

1. Auf [vercel.com](https://vercel.com) mit GitHub anmelden und **Add New → Project**
   wählen, dieses Repository importieren (Framework wird automatisch erkannt).
2. Unter **Settings → Environment Variables** `GUEST_CODE`, `ADMIN_CODE` und
   `SESSION_SECRET` eintragen.
3. Speicher für die Zusagen anlegen: **Storage → Marketplace → Upstash (Redis)**
   auswählen, kostenlosen Tarif wählen und mit dem Projekt verbinden. Die
   nötigen Variablen (`KV_REST_API_URL`, `KV_REST_API_TOKEN`) setzt Vercel
   automatisch.
4. Einmal neu deployen (**Deployments → Redeploy**), damit die Variablen greifen.
5. Optional: Unter **Settings → Domains** eine eigene Domain verbinden.

Jeder Push auf den Hauptbranch wird danach automatisch veröffentlicht.

## Lokal entwickeln

```bash
npm install
npm run dev
```

Dann <http://localhost:3000> öffnen. In der Entwicklung gelten automatisch der
Gästecode `hochzeit` und das Admin-Passwort `admin`; Zusagen werden in
`.data/rsvps.json` gespeichert. Eigene Werte könnt ihr in `.env.local`
eintragen (Vorlage: `.env.example`).

Weitere Befehle:

```bash
npm run build      # Produktions-Build
npm run lint       # Code-Prüfung
npm run test:e2e   # End-to-End-Tests (Playwright)
```

## Datenschutz

- Keine Tracker, keine externen Schriften (werden beim Build selbst gehostet).
- Die Karte (OpenStreetMap) wird erst nach einem Klick geladen.
- Suchmaschinen werden ausgesperrt (`robots.txt`, `X-Robots-Tag`).
- Die Datenschutzhinweise unter `/datenschutz` bitte mit euren Angaben prüfen
  (Verantwortliche in `src/content/site.ts` → `privacy`).
- Nach der Hochzeit: Zusagen im Admin-Bereich exportieren und anschließend löschen.
