import { Icon } from '@/components/icons/Icon';
import type { NoteItem } from '@/lib/rsvp/stats';
import styles from '../admin.module.css';
import { dateTimeLabel } from './rows';

/** Nachrichten und Musikwünsche der Gäste. */
export function NotesCards({ messages, songs }: { messages: NoteItem[]; songs: NoteItem[] }) {
  return (
    <div className={styles.pair}>
      <section aria-labelledby="nachrichten-titel" className={styles.card}>
        <div className={styles.cardHead}>
          <h2 id="nachrichten-titel" className={styles.cardTitle}>
            Nachrichten
          </h2>
          <p className={styles.cardMeta}>{messages.length}</p>
        </div>
        {messages.length === 0 ? (
          <p className={styles.empty}>Noch keine Nachrichten.</p>
        ) : (
          <ul role="list" className={styles.notes}>
            {messages.map((note) => (
              <li key={note.entryId} className={styles.note}>
                <figure className={styles.noteFigure}>
                  <blockquote className={styles.noteText}>
                    {note.text.split(/\n+/).map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </blockquote>
                  <figcaption className={styles.noteBy}>
                    {note.name}
                    <span className={styles.noteDate}>
                      {' · '}
                      <time dateTime={note.updatedAt}>{dateTimeLabel(note.updatedAt)}</time>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="musik-titel" className={styles.card}>
        <div className={styles.cardHead}>
          <h2 id="musik-titel" className={styles.cardTitle}>
            Musikwünsche
          </h2>
          <p className={styles.cardMeta}>{songs.length}</p>
        </div>
        {songs.length === 0 ? (
          <p className={styles.empty}>Noch keine Musikwünsche.</p>
        ) : (
          <ul role="list" className={styles.songs}>
            {songs.map((song) => (
              <li key={song.entryId} className={styles.song}>
                <Icon name="music" size={20} className={styles.songIcon} />
                <div>
                  <p className={styles.songTitle}>{song.text}</p>
                  <p className={styles.songBy}>von {song.name}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
