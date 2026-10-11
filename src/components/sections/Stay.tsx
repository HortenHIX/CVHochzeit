import { Icon } from '@/components/icons/Icon';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { site, type Hotel, type ShuttleRide } from '@/content/site';
import { formatDate, formatTime, telHref } from '@/lib/format';
import { formatPhone } from '@/lib/format-pure';
import { SECTION_IDS } from '@/lib/navigation';
import { StayDeadline } from './StayDeadline';
import { timesOnWeddingDay } from './wedding-time';
import styles from './Stay.module.css';

/** „ab 95 € / Nacht (DZ inkl. Frühstück)“ → Preis fett, Zusatz in Klammern als ruhige zweite Zeile. */
function Price({ text }: { text: string }) {
  const m = /^(.*?)\s*\(([^()]+)\)\s*$/.exec(text);
  if (!m) return <p className={styles.price}>{text}</p>;
  return (
    <p className={styles.price}>
      {m[1]} <span className={styles.priceDetail}>({m[2]})</span>
    </p>
  );
}

function HotelCard({ hotel, index }: { hotel: Hotel; index: number }) {
  const titleId = `hotel-${index + 1}`;
  const coupon = hotel.keyword ? (
    <div className={styles.coupon}>
      <div className={styles.couponText}>
        <p className={styles.couponLabel}>Stichwort</p>
        <p className={styles.couponValue}>{hotel.keyword}</p>
      </div>
      <CopyButton value={hotel.keyword} label="Stichwort kopieren" toast="Stichwort kopiert" />
    </div>
  ) : null;

  return (
    <article className={styles.hotel} aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.hotelName}>
        {hotel.name}
      </h3>
      {hotel.category ? <p className={styles.category}>{hotel.category}</p> : null}

      <div className={styles.chips}>
        <Badge variant="neutral" icon="pin">
          {hotel.distance}
        </Badge>
        {hotel.shuttleStop ? (
          <Badge variant="sage" icon="bus">
            Shuttle hält hier
          </Badge>
        ) : null}
      </div>

      {hotel.price ? <Price text={hotel.price} /> : null}
      {hotel.description ? <p className={styles.hotelText}>{hotel.description}</p> : null}

      {coupon || hotel.bookingDeadline ? (
        <div className={styles.deal}>
          <StayDeadline
            deadline={hotel.bookingDeadline}
            deadlineLabel={hotel.bookingDeadline ? formatDate(`${hotel.bookingDeadline}T12:00:00Z`) : undefined}
            timeZone={site.wedding.timeZone}
            coupon={coupon}
          />
        </div>
      ) : null}

      {hotel.phone || hotel.url ? (
        <div className={`${styles.hotelActions} no-print`}>
          {hotel.phone ? (
            <ButtonLink href={telHref(hotel.phone)} variant="secondary" icon="phone">
              Anrufen
              <span className="visually-hidden">
                : {hotel.name}, {formatPhone(hotel.phone)}
              </span>
            </ButtonLink>
          ) : null}
          {hotel.url ? (
            <ButtonLink href={hotel.url} variant="ghost" iconAfter="external" external>
              Website<span className="visually-hidden"> von {hotel.name}</span>
            </ButtonLink>
          ) : null}
        </div>
      ) : null}
      {hotel.phone ? <p className={`${styles.printPhone} nums`}>Telefon: {formatPhone(hotel.phone)}</p> : null}
    </article>
  );
}

const DIRECTIONS: { key: ShuttleRide['direction']; label: string }[] = [
  { key: 'hin', label: 'Hinfahrt' },
  { key: 'zurueck', label: 'Rückfahrt' },
];

function ShuttleTicket() {
  const { text, rides } = site.stay.shuttle;
  // Bezug für „Folgetag“: erste Hinfahrt (sonst Beginn der Hochzeit)
  const reference = rides.find((r) => r.direction === 'hin')?.time ?? formatTime(site.wedding.start);
  const hasNotes = rides.some((r) => r.note);
  const blocks = DIRECTIONS.map((d) => {
    const list = rides.filter((r) => r.direction === d.key);
    const times = timesOnWeddingDay(
      list.map((r) => r.time),
      reference,
    );
    return { ...d, rides: list.map((r, i) => ({ ...r, iso: times[i].iso })) };
  }).filter((b) => b.rides.length > 0);

  return (
    <article id="shuttle" className={styles.ticket} aria-labelledby="shuttle-titel">
      <div className={styles.ticketHead}>
        <span className={styles.ticketIcon}>
          <Icon name="bus" size={24} />
        </span>
        <div className={styles.ticketIntro}>
          <h3 id="shuttle-titel" className={styles.ticketTitle}>
            Shuttle-Fahrplan
          </h3>
          {text ? <p className={styles.ticketText}>{text}</p> : null}
        </div>
      </div>

      <div className={styles.ticketBody}>
        {blocks.map((block) => (
          <div key={block.key} className={styles.block}>
            {/* ab 45em: Tabelle */}
            <table className={styles.table}>
              <caption className={styles.blockTitle}>{block.label}</caption>
              <thead>
                <tr>
                  <th scope="col">Abfahrt</th>
                  <th scope="col">Von</th>
                  <th scope="col">Nach</th>
                  {hasNotes ? <th scope="col">Hinweis</th> : null}
                </tr>
              </thead>
              <tbody>
                {block.rides.map((ride, i) => (
                  <tr key={`${ride.time}-${i}`}>
                    <td className={styles.depart}>
                      <time dateTime={ride.iso}>{ride.time}</time> <span className={styles.uhr}>Uhr</span>
                    </td>
                    <td>{ride.from}</td>
                    <td>{ride.to}</td>
                    {hasNotes ? <td className={styles.note}>{ride.note ?? ''}</td> : null}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* unter 45em: Liste */}
            <div className={styles.listView}>
              <h4 className={styles.blockTitle}>{block.label}</h4>
              <ul className={styles.rides} role="list">
                {block.rides.map((ride, i) => (
                  <li key={`${ride.time}-${i}`} className={styles.ride}>
                    <p className={styles.depart}>
                      <time dateTime={ride.iso}>{ride.time}</time> <span className={styles.uhr}>Uhr</span>
                    </p>
                    <div className={styles.rideInfo}>
                      <p className={styles.route}>
                        <span>{ride.from}</span>
                        <Icon name="arrow-right" size={16} className={styles.routeArrow} />
                        <span className="visually-hidden"> nach </span>
                        <span>{ride.to}</span>
                      </p>
                      {ride.note ? <p className={styles.note}>{ride.note}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {site.rsvp.askShuttle ? (
        <div className={`${styles.ticketFoot} no-print`}>
          <p>Fahrt ihr mit? Gebt es bitte im Zusageformular an.</p>
          <ButtonLink href={`#${SECTION_IDS.rsvp}`} variant="ghost" iconAfter="arrow-right">
            Zur Zusage
          </ButtonLink>
        </div>
      ) : null}
    </article>
  );
}

function Taxis() {
  const { taxis, taxiNote } = site.stay;
  return (
    <div className={styles.taxi} role="group" aria-labelledby="taxi-titel">
      <div className={styles.taxiHead}>
        <h3 id="taxi-titel" className={styles.taxiTitle}>
          <Icon name="taxi" size={24} className={styles.taxiIcon} />
          Taxi
        </h3>
        {taxiNote ? (
          <Badge variant="terra" icon="moon">
            {taxiNote}
          </Badge>
        ) : null}
      </div>
      <ul className={styles.taxiList} role="list">
        {taxis.map((taxi) => (
          <li key={taxi.phone} className={styles.taxiCard}>
            <p className={styles.taxiName}>{taxi.name}</p>
            <ButtonLink href={telHref(taxi.phone)} variant="secondary" size="lg" icon="phone" block>
              <span className="visually-hidden">{taxi.name} anrufen: </span>
              <span className="nums">{formatPhone(taxi.phone)}</span>
            </ButtonLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Übernachten & Shuttle (#uebernachten, design.md F6): Hotelkarten mit
 * Stichwort-Coupon und Frist, Shuttle-Fahrplan als Ticket, Taxi-Nummern.
 */
export function Stay() {
  const { hotels, shuttle, taxis, eyebrow, title, intro } = site.stay;
  const showShuttle = shuttle.enabled && shuttle.rides.length > 0;
  const showTaxis = taxis.length > 0;
  if (hotels.length === 0 && !showShuttle && !showTaxis) return null;

  return (
    <Section id={SECTION_IDS.stay} title={title} eyebrow={eyebrow} intro={intro} tone="alt">
      {hotels.length > 0 ? (
        <ul className={styles.hotels} role="list" data-count={hotels.length}>
          {hotels.map((hotel, i) => (
            <Reveal as="li" key={hotel.name} delay={Math.min(i, 4) * 80} className={styles.hotelItem}>
              <HotelCard hotel={hotel} index={i} />
            </Reveal>
          ))}
        </ul>
      ) : null}

      {showShuttle || showTaxis ? (
        <div className={styles.transport} data-both={showShuttle && showTaxis ? '' : undefined}>
          {showShuttle ? <ShuttleTicket /> : null}
          {showTaxis ? <Taxis /> : null}
        </div>
      ) : null}
    </Section>
  );
}
