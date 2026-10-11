import type { ReactNode, SVGProps } from 'react';
import { AnimatedSvg } from './AnimatedSvg';
import { illustrationAttrs, type IllustrationProps } from './shared';

/**
 * Gemeinsame SVG-Wurzel aller Motive: setzt Größe, Spiegelung, Drehung und
 * die A11y-Attribute. Mit `animated` übernimmt ein kleiner Client-Wrapper das
 * Pausieren außerhalb des Viewports.
 */
export function Svg({
  props,
  viewBox,
  defaultSize,
  animated = false,
  extra,
  children,
}: {
  props: IllustrationProps;
  viewBox: string;
  defaultSize: number | string;
  animated?: boolean;
  extra?: SVGProps<SVGSVGElement> & Record<`data-${string}`, string | undefined>;
  children: ReactNode;
}) {
  const attrs = { viewBox, ...illustrationAttrs(props, defaultSize), ...extra };
  if (animated) return <AnimatedSvg {...attrs}>{children}</AnimatedSvg>;
  return <svg {...attrs}>{children}</svg>;
}
