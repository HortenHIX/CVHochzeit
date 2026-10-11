import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import { Monogram } from '@/components/illustrations';
import { Badge } from '@/components/ui/Badge';
import { site } from '@/content/site';
import { logout } from '@/lib/auth/actions';
import styles from '../admin.module.css';

/** Kopf der Verwaltung: Monogramm klein, Badge „Verwaltung“, rechts „Abmelden“. */
export function AdminHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.headerBar}>
        <Link href="/" className={styles.brand}>
          <Monogram
            variant="small"
            size={40}
            label={`C&V – zur Website von ${site.couple.first} & ${site.couple.second}`}
          />
        </Link>
        <Badge variant="neutral">Verwaltung</Badge>
        <span className={styles.headerSpacer} />
        <Link href="/" className={styles.headerLink}>
          Zur Website
        </Link>
        <form action={logout}>
          <button type="submit" className={styles.logout}>
            <Icon name="logout" size={20} />
            <span className={styles.logoutText}>Abmelden</span>
          </button>
        </form>
      </div>
    </header>
  );
}
