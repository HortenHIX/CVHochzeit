import { paragraphs } from '@/lib/format';

/** Rendert einen Text mit Leerzeilen als einzelne Absätze. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {paragraphs(text).map((p, i) => (
        <p key={i} className={className}>
          {p}
        </p>
      ))}
    </>
  );
}
