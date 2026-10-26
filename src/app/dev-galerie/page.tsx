import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Icon } from '@/components/icons/Icon';
import {
  ArchFrame,
  CornerBouquet,
  EucalyptusBranch,
  HalfSun,
  HalfWreath,
  LeafNode,
  MapPlaceholder,
  Monogram,
  Moon,
  OliveBranch,
  Ornament,
  PampasBundle,
  PampasGrass,
  Rings,
  StoryVignette,
  SunPath,
  VenueVignette,
  VINE_TILE_URL,
} from '@/components/illustrations';
import { ICON_NAMES, site } from '@/content/site';
import { Replay } from './Replay';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Galerie (nur Entwicklung)',
  robots: { index: false, follow: false },
};

const GROUNDS = [
  { key: 'linen', label: 'linen', className: styles.linen },
  { key: 'sand', label: 'sand', className: styles.sand },
  { key: 'sage', label: 'sage-100', className: styles.sage },
  { key: 'dark', label: 'sage-900', className: `${styles.dark} on-dark` },
] as const;

function Motif({ id, title, note, children }: { id: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section id={id} className={styles.motif} aria-labelledby={`${id}-t`}>
      <h2 id={`${id}-t`} className={styles.motifTitle}>
        {title}
      </h2>
      {note ? <p className={styles.note}>{note}</p> : null}
      {children}
    </section>
  );
}

/** Ein Motiv auf allen vier Hintergründen. */
function Grounds({ children, tall = false }: { children: ReactNode; tall?: boolean }) {
  return (
    <div className={styles.grounds}>
      {GROUNDS.map((g) => (
        <figure key={g.key} className={`${styles.tile} ${tall ? styles.tall : ''} ${g.className}`}>
          <div className={styles.stage}>{children}</div>
          <figcaption className={styles.caption}>{g.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function Zoom({ children, label, id }: { children: ReactNode; label: string; id?: string }) {
  return (
    <figure className={`${styles.zoom} ${styles.linen}`} id={id}>
      <div className={styles.stage}>{children}</div>
      <figcaption className={styles.caption}>{label}</figcaption>
    </figure>
  );
}

const SCHEDULE_POINTS = site.schedule.items.map((i) => ({ time: i.time }));

export default function DevGalleryPage() {
  if (process.env.NODE_ENV !== 'development') notFound();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Nur in der Entwicklung</p>
        <h1 className={styles.title}>Illustrationen &amp; Icons</h1>
        <p className={styles.note}>
          Alle Motive aus docs/design.md (E1–E16) auf linen, sand, sage-100 und sage-900. Animationen laufen nur ohne
          „Bewegung reduzieren“.
        </p>
        <nav className={styles.toc} aria-label="Motive">
          {['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'e10', 'e11', 'e12', 'e13', 'e14', 'e15', 'e16', 'brand'].map(
            (id) => (
              <a key={id} href={`#${id}`}>
                {id.toUpperCase()}
              </a>
            ),
          )}
        </nav>
      </header>

      <Motif id="e1" title="E1 Eukalyptus-Zweig" note="filled · line · silhouette · animiert">
        <Grounds tall>
          <EucalyptusBranch size={96} />
          <EucalyptusBranch size={64} />
          <EucalyptusBranch size={96} variant="line" />
        </Grounds>
        <div className={styles.row}>
          <Zoom label="filled, 240 px" id="e1-zoom">
            <EucalyptusBranch size={240} />
          </Zoom>
          <Zoom label="line, 240 px">
            <EucalyptusBranch size={240} variant="line" />
          </Zoom>
          <figure className={`${styles.zoom} ${styles.dark}`}>
            <div className={styles.stage}>
              <EucalyptusBranch size={160} variant="silhouette" />
            </div>
            <figcaption className={styles.caption}>silhouette (Footer)</figcaption>
          </figure>
          <Zoom label="animated">
            <Replay>
              <EucalyptusBranch size={180} animated />
            </Replay>
          </Zoom>
        </div>
      </Motif>

      <Motif id="e2" title="E2 Eck-Bouquet" note="bottom-left · top-right · top-left · bottom-right · line">
        <Grounds tall>
          <CornerBouquet size={180} />
        </Grounds>
        <div className={styles.row}>
          <Zoom label="bottom-left, 300 px" id="e2-zoom">
            <CornerBouquet size={300} />
          </Zoom>
          <Zoom label="top-right">
            <CornerBouquet size={200} corner="top-right" />
          </Zoom>
          <Zoom label="top-left">
            <CornerBouquet size={200} corner="top-left" />
          </Zoom>
          <Zoom label="bottom-right">
            <CornerBouquet size={200} corner="bottom-right" />
          </Zoom>
          <Zoom label="line (QR-Karte)">
            <CornerBouquet size={200} variant="line" />
          </Zoom>
          <Zoom label="animated">
            <Replay>
              <CornerBouquet size={260} animated />
            </Replay>
          </Zoom>
        </div>
      </Motif>

      <Motif id="e3" title="E3 Pampasgras" note="Rispe · Bündel">
        <Grounds tall>
          <PampasGrass size={56} />
          <PampasBundle size={110} />
        </Grounds>
        <div className={styles.row}>
          <Zoom label="Rispe, 120 px" id="e3-zoom">
            <PampasGrass size={120} />
          </Zoom>
          <Zoom label="Bündel, 200 px">
            <PampasBundle size={200} />
          </Zoom>
          <Zoom label="animated">
            <PampasBundle size={160} animated />
          </Zoom>
        </div>
      </Motif>

      <Motif id="e4" title="E4 Olivenzweig">
        <Grounds>
          <OliveBranch size={200} />
        </Grounds>
        <div className={styles.row}>
          <Zoom label="600 px" id="e4-zoom">
            <OliveBranch size={600} />
          </Zoom>
        </div>
      </Motif>

      <Motif id="e5" title="E5 Doppelbogen" note="frame · card">
        <div className={styles.row}>
          <figure className={`${styles.zoom} ${styles.linen} ${styles.archFigure}`} id="e5-zoom">
            <ArchFrame className={styles.archDemo} innerClassName={styles.archInner}>
              <p className={styles.archText}>Rahmen (Hero)</p>
            </ArchFrame>
          </figure>
          <figure className={`${styles.zoom} ${styles.linen} ${styles.archFigure}`}>
            <ArchFrame className={styles.archDemo} innerClassName={styles.archInner} variant="card">
              <Monogram variant="large" />
              <p className={styles.archText}>Karte (Login)</p>
            </ArchFrame>
          </figure>
          <figure className={`${styles.zoom} ${styles.sand} ${styles.archFigureWide}`}>
            <ArchFrame className={styles.archDemoWide} innerClassName={styles.archInner} surface="paper">
              <p className={styles.archText}>Rahmen auf paper, breit</p>
            </ArchFrame>
          </figure>
        </div>
      </Motif>

      <Motif id="e6" title="E6 Halbsonne & Mond">
        <Grounds>
          <HalfSun size={160} />
          <Moon size={28} />
        </Grounds>
        <div className={styles.row}>
          <Zoom label="400 px" id="e6-zoom">
            <HalfSun size={400} />
          </Zoom>
          <Zoom label="Mond 96 px">
            <Moon size={96} />
          </Zoom>
        </div>
      </Motif>

      <Motif id="e7" title="E7 Ringe">
        <Grounds>
          <Rings size={56} />
          <span className={styles.medallion}>
            <Rings size={36} />
          </span>
        </Grounds>
        <div className={styles.row}>
          <Zoom label="240 px" id="e7-zoom">
            <Rings size={240} />
          </Zoom>
        </div>
      </Motif>

      <Motif id="e8" title="E8 Trennornament">
        <Grounds>
          <Ornament />
          <Ornament size={120} />
        </Grounds>
        <div className={styles.row}>
          <Zoom label="600 px" id="e8-zoom">
            <Ornament size={600} />
          </Zoom>
        </div>
      </Motif>

      <Motif id="e9" title="E9 Halbkranz" note="mit Häkchen · animiert (Erfolg)">
        <Grounds>
          <HalfWreath size={96} withCheck />
          <HalfWreath size={96} />
        </Grounds>
        <div className={styles.row}>
          <Zoom label="400 px" id="e9-zoom">
            <HalfWreath size={400} withCheck />
          </Zoom>
          <Zoom label="animated, 160 px">
            <Replay>
              <HalfWreath size={160} withCheck animated />
            </Replay>
          </Zoom>
        </div>
      </Motif>

      <Motif id="e10" title="E10 Monogramm" note="small 44 · default 56 · large 120">
        <Grounds>
          <Monogram variant="small" />
          <Monogram />
          <Monogram variant="large" />
        </Grounds>
        <div className={styles.row}>
          <Zoom label="default, 240 px" id="e10-zoom">
            <Monogram size={240} />
          </Zoom>
          <Zoom label="large, 240 px">
            <Monogram size={240} variant="large" />
          </Zoom>
          <Zoom label="small, 160 px">
            <Monogram size={160} variant="small" />
          </Zoom>
          <figure className={`${styles.zoom} ${styles.dark} on-dark`}>
            <div className={styles.stage}>
              <Monogram size={160} variant="large" />
              <Monogram size={64} />
              <Monogram size={40} variant="small" />
            </div>
            <figcaption className={styles.caption}>onDark</figcaption>
          </figure>
        </div>
      </Motif>

      <Motif id="e11" title="E11 Orts-Vignetten" note="Kapelle · Scheune">
        <Grounds>
          <VenueVignette variant="chapel" size={140} />
          <VenueVignette variant="barn" size={140} />
        </Grounds>
        <div className={styles.row}>
          <figure className={`${styles.venueCard}`} id="e11-zoom">
            <div className={styles.venueHead}>
              <VenueVignette variant="chapel" size="auto" className={styles.venueSvg} />
            </div>
            <figcaption className={styles.caption}>Kartenkopf sand, 160 px hoch</figcaption>
          </figure>
          <figure className={`${styles.venueCard}`}>
            <div className={styles.venueHead}>
              <VenueVignette variant="barn" size="auto" className={styles.venueSvg} />
            </div>
            <figcaption className={styles.caption}>Scheune</figcaption>
          </figure>
          <Zoom label="Kapelle 420 px">
            <VenueVignette variant="chapel" size={420} />
          </Zoom>
          <Zoom label="Scheune 420 px">
            <VenueVignette variant="barn" size={420} />
          </Zoom>
        </div>
      </Motif>

      <Motif id="e12" title="E12 Geschichts-Vignetten" note="im sage-100-Bogen 4:5, max. 15rem">
        <div className={styles.row} id="e12-zoom">
          {(['meet', 'travel', 'home', 'proposal', 'wedding'] as const).map((v) => (
            <figure key={v} className={styles.storyFigure}>
              <div className={styles.storyArch}>
                <StoryVignette variant={v} size="100%" />
              </div>
              <figcaption className={styles.caption}>{v}</figcaption>
            </figure>
          ))}
        </div>
      </Motif>

      <Motif id="e13" title="E13 Ranken-Kachel & Blattpaar-Knoten">
        <div className={styles.row}>
          <figure className={`${styles.zoom} ${styles.linen}`} id="e13-zoom">
            <div className={styles.vineDemo} style={{ backgroundImage: VINE_TILE_URL }}>
              <LeafNode className={styles.vineNode} style={{ top: 40 }} />
              <LeafNode className={styles.vineNode} style={{ top: 220 }} />
            </div>
            <figcaption className={styles.caption}>Spur 48 px, repeat-y</figcaption>
          </figure>
          <Zoom label="Knoten 160 px">
            <LeafNode size={160} />
          </Zoom>
        </div>
      </Motif>

      <Motif id="e14" title="E14 Sonnenlauf" note="Punkte aus site.schedule · Labels ab 45em · aktiver Punkt">
        <div className={styles.stack}>
          <figure className={`${styles.wideTile} ${styles.sand}`} id="e14-zoom">
            <SunPath points={SCHEDULE_POINTS} className={styles.sunPath} />
            <figcaption className={styles.caption}>Standard (auto)</figcaption>
          </figure>
          <figure className={`${styles.wideTile} ${styles.sand}`}>
            <SunPath points={SCHEDULE_POINTS} activeIndex={3} showLabels className={styles.sunPath} />
            <figcaption className={styles.caption}>activeIndex 3, Labels immer</figcaption>
          </figure>
          <figure className={`${styles.wideTile} ${styles.sand}`}>
            <SunPath
              points={[{ time: '14:00' }, { time: '15:00' }, { time: '16:30' }, { time: '18:30' }, { time: '21:00' }, { time: '00:00' }, { time: '01:00' }]}
              showLabels
              className={styles.sunPath}
            />
            <figcaption className={styles.caption}>Beispiel aus J: 14:00 bis 01:00</figcaption>
          </figure>
        </div>
      </Motif>

      <Motif id="e15" title="E15 Karten-Platzhalter" note="16:10, slice">
        <div className={styles.row}>
          <figure className={styles.mapTile} id="e15-zoom">
            <MapPlaceholder className={styles.mapSvg} />
            <figcaption className={styles.caption}>16:10</figcaption>
          </figure>
          <figure className={`${styles.mapTile} ${styles.mapTall}`}>
            <MapPlaceholder className={styles.mapSvg} />
            <figcaption className={styles.caption}>schmal (slice)</figcaption>
          </figure>
        </div>
      </Motif>

      <Motif id="e16" title="E16 Icons" note={`${ICON_NAMES.length} Icons · 24 px (Inhalt) und 16 px (Fehlermeldung/Badge)`}>
        <ul className={styles.icons} role="list">
          {ICON_NAMES.map((name) => (
            <li key={name} className={styles.iconCell}>
              <span className={styles.iconSizes}>
                <Icon name={name} size={32} />
                <Icon name={name} size={24} />
                <Icon name={name} size={16} />
              </span>
              <code className={styles.iconName}>{name}</code>
            </li>
          ))}
        </ul>
        <div className={`${styles.iconStrip} ${styles.dark} on-dark`}>
          {ICON_NAMES.map((name) => (
            <Icon key={name} name={name} size={20} />
          ))}
        </div>
      </Motif>

      <Motif id="brand" title="Favicon, Apple-Icon, Link-Vorschau">
        <div className={styles.row}>
          <figure className={`${styles.zoom} ${styles.linen}`}>
            <div className={styles.stage}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" width={16} height={16} alt="Favicon 16 px" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" width={32} height={32} alt="Favicon 32 px" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" width={96} height={96} alt="Favicon 96 px" />
            </div>
            <figcaption className={styles.caption}>icon.svg</figcaption>
          </figure>
          <figure className={`${styles.zoom} ${styles.dark}`}>
            <div className={styles.stage}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" width={16} height={16} alt="Favicon 16 px auf Dunkel" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" width={32} height={32} alt="Favicon 32 px auf Dunkel" />
            </div>
            <figcaption className={styles.caption}>icon.svg (dunkle Tab-Leiste)</figcaption>
          </figure>
          <figure className={`${styles.zoom} ${styles.linen}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/apple-icon" width={180} height={180} alt="Apple-Icon" className={styles.appleIcon} />
            <figcaption className={styles.caption}>apple-icon 180 px</figcaption>
          </figure>
        </div>
        <figure className={`${styles.wideTile} ${styles.linen}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/opengraph-image" width={1200} height={630} alt="Link-Vorschau" className={styles.ogImage} />
          <figcaption className={styles.caption}>opengraph-image 1200 × 630</figcaption>
        </figure>
      </Motif>
    </main>
  );
}
