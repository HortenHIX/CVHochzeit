import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from '@/components/icons/Icon';
import type { IconName } from '@/content/site';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'md' | 'lg';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon vor dem Text */
  icon?: IconName;
  /** Icon nach dem Text */
  iconAfter?: IconName;
  /** Volle Breite (z. B. auf dem Handy) */
  block?: boolean;
  className?: string;
  children: ReactNode;
}

export function buttonClassName({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
}: Pick<CommonProps, 'variant' | 'size' | 'block' | 'className'> = {}): string {
  return [styles.button, styles[variant], styles[size], block ? styles.block : '', className]
    .filter(Boolean)
    .join(' ');
}

function Content({ icon, iconAfter, children }: Pick<CommonProps, 'icon' | 'iconAfter' | 'children'>) {
  return (
    <>
      {icon ? <Icon name={icon} size={20} className={styles.icon} /> : null}
      <span>{children}</span>
      {iconAfter ? <Icon name={iconAfter} size={20} className={styles.icon} /> : null}
    </>
  );
}

/**
 * Link im Button-Look. Interne Pfade und Anker nutzen next/link,
 * externe Links öffnen in einem neuen Tab.
 */
export function ButtonLink({
  href,
  external,
  download,
  variant,
  size,
  block,
  className,
  icon,
  iconAfter,
  children,
}: CommonProps & { href: string; external?: boolean; download?: boolean | string }) {
  const cls = buttonClassName({ variant, size, block, className });
  const isExternal = external ?? /^https?:\/\//.test(href);
  if (isExternal || download || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return (
      <a
        href={href}
        className={cls}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...(download ? { download: download === true ? '' : download } : {})}
      >
        <Content icon={icon} iconAfter={iconAfter}>
          {children}
        </Content>
        {isExternal ? <span className="visually-hidden"> (öffnet in neuem Tab)</span> : null}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      <Content icon={icon} iconAfter={iconAfter}>
        {children}
      </Content>
    </Link>
  );
}

export function Button({
  variant,
  size,
  block,
  className,
  icon,
  iconAfter,
  children,
  type = 'button',
  ...rest
}: CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>) {
  return (
    <button type={type} className={buttonClassName({ variant, size, block, className })} {...rest}>
      <Content icon={icon} iconAfter={iconAfter}>
        {children}
      </Content>
    </button>
  );
}
