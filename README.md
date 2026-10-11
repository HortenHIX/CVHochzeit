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
Geschichte“) legt ihr in `public/images/` ab und tragt den Pfad, etwa
`/images/antrag.jpg`, beim jeweiligen Eintrag ein.

## Seiten im Überblick

| Adresse          | Inhalt                                                          |
| ---------------- | --------------------------------------------------------------- |
| `/`              | Die Hochzeitsseite (One-Pager mit allen Infos und Zusage)       |
| `/login`         | Eingabe des Gästecodes                                          |
| `/?code=…`       | Direkt-Anmeldung, z. B. als QR-Code auf der Einladungskarte     |
| `/kalender.ics`  | Kalendereintrag zum Herunterladen (mit Erinnerung am Vortag)    |
| `/admin/login`   | Anmeldung für die Verwaltung (eigenes Passwort)                 |
| `/admin`         | Verwaltung: alle Antworten, Kennzahlen, CSV-Export, Löschen     |
| `/fotos/karte`   | Druckbare QR-Tischkarte zum Fotoalbum (verlinkt aus `/admin`)   |
| `/datenschutz`   | Datenschutzhinweise (ohne Anmeldung erreichbar)                 |

### Für Gäste

- **Zusage online:** Formular mit Personen, Menüwahl, Kindern,
  Unverträglichkeiten, Programmpunkten, Übernachtung und Shuttle. Ein
  Entwurf wird im Browser zwischengespeichert. Nach dem Absenden merkt sich
  das Gerät die Antwort, zeigt eine Zusammenfassung und erlaubt Änderungen
  bis zur Frist („Antwort ändern“).
- **Infoblatt zum Drucken:** Unter „Orte & Anfahrt“ druckt der Knopf
  „Ablauf & Anfahrt als Infoblatt drucken“ nur Datum, Tagesablauf, Orte und
  Kontakte – praktisch für ältere Gäste, die lieber Papier in der Hand haben.
- **Kalender:** „Zum Kalender hinzufügen“ im Kopfbereich bietet Apple/Outlook
  (`.ics`) und Google Kalender an.
- **Karte:** Die OpenStreetMap-Karte lädt erst nach einem Klick (Datenschutz).

### Verwaltung (`/admin`)

Anmeldung unter `/admin/login` mit dem Admin-Passwort (`ADMIN_CODE`, siehe
unten; der Gästecode reicht dafür nicht). Dort findet ihr:

- **Kennzahlen:** Personen zugesagt, Absagen, Kinder, Shuttle hin/zurück,
  Hotel-Kontingent, Programmpunkte, Unverträglichkeiten
- **Menüwahl** als Balkenliste und eine **Unverträglichkeiten-Liste** mit
  Namen für den Caterer (mit „Liste kopieren“)
- **Alle Antworten** als Tabelle (am Handy als Karten) mit Suche, Filter
  „Zusagen/Absagen“, „Mit Allergien“, Sortierung und aufklappbaren Details
- **Löschen** einzelner Antworten (mit Rückfrage)
- **CSV-Export** für Excel (Semikolon, UTF-8): „Haushalte“ (eine Zeile pro
  Antwort, `cv-zusagen-JJJJ-MM-TT.csv`) und „Gäste pro Person“ für Catering
  und Sitzplan (`cv-gaeste-JJJJ-MM-TT.csv`)
- **QR-Tischkarte drucken:** öffnet `/fotos/karte`. Wählbar sind A6-Karten
  (4 pro A4, mit Schnittmarken) oder Aufsteller zum Falten (2 pro A4). Der
  QR-Code führt zum gemeinsamen Fotoalbum (`photos.albumUrl` in
  `src/content/site.ts`). Druckeinstellungen: A4, Skalierung 100 %, ohne
  Seitenränder.

## Zugang & Passwörter

Die Codes werden **nicht** im Code gespeichert, sondern als Umgebungsvariablen:

| Variable               | Bedeutung                                                                 |
| ---------------------- | ------------------------------------------------------------------------- |
| `GUEST_CODE`           | Gästecode von der Einladung (Groß-/Kleinschreibung und Leerzeichen egal) |
| `ADMIN_CODE`           | Passwort für `/admin` – muss sich vom Gästecode unterscheiden             |
| `SESSION_SECRET`       | Langer Zufallswert zum Signieren der Cookies (`openssl rand -base64 32`)  |
| `NEXT_PUBLIC_SITE_URL` | Optional: öffentliche Adresse, z. B. `https://christoph-und-vera.de`      |

`NEXT_PUBLIC_SITE_URL` braucht ihr auf Vercel normalerweise nicht: Ohne Angabe
wird automatisch die Produktions-Domain genommen. Die Adresse steckt im
Vorschaubild für WhatsApp & Co. und im Kalendereintrag.

Wird ein Code geändert, sind alle bestehenden Anmeldungen mit diesem Code
automatisch ungültig. Gegen Durchprobieren sind Anmeldung und Direkt-Link (`/?code=…`)
begrenzt: höchstens zehn Fehlversuche pro Minute und IP-Adresse – erfolgreiche Anmeldungen
zählen nicht mit, damit viele Gäste im selben WLAN sich problemlos anmelden können.
Für die Verwaltung gilt: höchstens fünf Versuche pro fünf Minuten und IP-Adresse.

**Tipp für die Einladungskarte:** Ein QR-Code auf `https://eure-domain.de/?code=EUERCODE`
meldet Gäste direkt an – sie müssen nichts eintippen.

## Veröffentlichen auf Vercel

1. Auf [vercel.com](https://vercel.com) mit GitHub anmelden und **Add New → Project**
   wählen, dieses Repository importieren (Framework wird automatisch erkannt).
2. Unter **Settings → Environment Variables** `GUEST_CODE`, `ADMIN_CODE` und
   `SESSION_SECRET` eintragen.
3. Speicher für die Zusagen anlegen: **Storage → Marketplace → Upstash (Redis)**
   auswählen, kostenlosen Tarif wählen und mit dem Projekt verbinden.
   - **Primary Region: Frankfurt (eu-central-1)** wählen – die
     Datenschutzhinweise gehen von einem Rechenzentrum in der EU aus.
   - Beim Verbinden das vorgeschlagene Variablen-Präfix **nicht ändern**: Es
     müssen `KV_REST_API_URL` und `KV_REST_API_TOKEN` entstehen (Vercel setzt
     sie automatisch).
   - Kontrolle: Fehlt der Speicher, zeigt `/admin` einen Einrichtungs-Hinweis.
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

Die Verwaltung erreicht ihr lokal unter <http://localhost:3000/admin/login>
(Passwort `admin`).

Weitere Befehle:

```bash
npm run build      # Produktions-Build
npm run lint       # Code-Prüfung (ESLint)
npm run typecheck  # TypeScript-Prüfung
npm run test:unit  # Unit-Tests (Session-Tokens, Codes, Weiterleitungen) – ohne Server
npm run test:e2e   # End-to-End-Tests im Browser (Playwright)
npm test           # beides nacheinander
```

### Tests

- **Unit-Tests** (`tests/unit/`) prüfen die reine Logik ohne Browser.
- **End-to-End-Tests** (`tests/e2e/`) laufen mit Playwright je einmal als
  Handy (Pixel 7) und als Desktop (1440 px): Zugangsschutz und Login,
  Zusage-Formular (Zusage, Änderung, Absage, Fehlermeldungen) und die
  Verwaltung (Kennzahlen, Filter, CSV-Export, Löschen).
  Sie bauen die Seite selbst (`next build`) und starten sie auf Port 3100 mit
  eigenen Test-Codes; Zusagen landen dabei in `.data/e2e-rsvps.json`, nicht
  in Redis. Beim ersten Mal einmalig den Browser installieren:
  `npx playwright install chromium`.

## Datenschutz

- Keine Tracker, keine externen Schriften (werden beim Build selbst gehostet).
- Die Karte (OpenStreetMap) wird erst nach einem Klick geladen.
- Suchmaschinen werden ausgesperrt (`robots.txt`, `X-Robots-Tag`).
- Die Datenschutzhinweise unter `/datenschutz` bitte mit euren Angaben prüfen
  (Verantwortliche in `src/content/site.ts` → `privacy`).
- Nach der Hochzeit: Zusagen im Admin-Bereich exportieren und anschließend löschen.
