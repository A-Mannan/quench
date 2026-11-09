import { useEffect, useId, useRef } from 'react';
import { useReducedMotion } from '../lib/useReducedMotion';

/**
 * liquid-type: a large statement that ripples under a fine pointer and settles
 * back to crisp type. The SVG displacement filter exists only while the ripple
 * is alive. Touch, coarse pointers and reduced motion get plain, static type.
 */
export function LiquidType({
  lines,
  className,
  testId,
  id,
}: {
  lines: [string, string];
  className?: string;
  testId?: string;
  id?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();
  const rawId = useId();
  const filterId = `liquid-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  useEffect(() => {
    const type = ref.current;
    if (!type || reducedMotion) return;
    if (typeof SVGFEDisplacementMapElement === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;pointer-events:none';

    const filter = document.createElementNS(ns, 'filter');
    filter.setAttribute('id', filterId);
    filter.setAttribute('x', '-5%');
    filter.setAttribute('y', '-20%');
    filter.setAttribute('width', '110%');
    filter.setAttribute('height', '140%');
    filter.setAttribute('color-interpolation-filters', 'sRGB');

    const turbulence = document.createElementNS(ns, 'feTurbulence');
    turbulence.setAttribute('type', 'fractalNoise');
    turbulence.setAttribute('baseFrequency', '0.006 0.013');
    turbulence.setAttribute('numOctaves', '1');
    turbulence.setAttribute('seed', '7');
    turbulence.setAttribute('result', 'noise');

    const displacement = document.createElementNS(ns, 'feDisplacementMap');
    displacement.setAttribute('in', 'SourceGraphic');
    displacement.setAttribute('in2', 'noise');
    displacement.setAttribute('scale', '0');
    displacement.setAttribute('xChannelSelector', 'R');
    displacement.setAttribute('yChannelSelector', 'G');

    filter.append(turbulence, displacement);
    svg.append(filter);
    document.body.append(svg);

    let energy = 0;
    let raf = 0;
    let on = false;
    let lastX = 0;
    let lastY = 0;
    let hasLast = false;
    let clock = 0;
    let px = 0.5;

    const apply = () => {
      const scale = Math.min(44, energy);
      if (scale < 0.6) {
        if (on) {
          type.style.filter = '';
          on = false;
        }
        return false;
      }
      displacement.setAttribute('scale', scale.toFixed(1));
      const dx = 0.006 + (px - 0.5) * 0.002;
      const dy = 0.013 + Math.sin(clock / 700) * 0.003;
      turbulence.setAttribute('baseFrequency', `${dx.toFixed(4)} ${dy.toFixed(4)}`);
      if (!on) {
        type.style.filter = `url(#${filterId})`;
        on = true;
      }
      return true;
    };

    const tick = (now: number) => {
      raf = 0;
      clock = now;
      energy *= 0.93;
      if (apply()) raf = requestAnimationFrame(tick);
      else energy = 0;
    };

    const move = (event: PointerEvent) => {
      const rect = type.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const inside =
        x > -rect.width * 0.04 &&
        x < rect.width * 1.04 &&
        y > -rect.height * 0.2 &&
        y < rect.height * 1.2;
      if (!inside) {
        hasLast = false;
        return;
      }
      px = Math.max(0, Math.min(1, x / rect.width));
      if (hasLast) {
        const velocity = Math.hypot(event.clientX - lastX, event.clientY - lastY);
        energy = Math.min(44, energy + Math.min(9, velocity * 0.3) * 0.8);
      }
      lastX = event.clientX;
      lastY = event.clientY;
      hasLast = true;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const leave = () => {
      hasLast = false;
    };

    type.addEventListener('pointermove', move, { passive: true });
    type.addEventListener('pointerleave', leave);

    return () => {
      type.removeEventListener('pointermove', move);
      type.removeEventListener('pointerleave', leave);
      if (raf) cancelAnimationFrame(raf);
      type.style.filter = '';
      svg.remove();
    };
  }, [filterId, reducedMotion]);

  return (
    <h2 ref={ref} id={id} className={className} data-testid={testId}>
      <span className="moment__line">{lines[0]}</span>{' '}
      <span className="moment__line moment__line--right">{lines[1]}</span>
    </h2>
  );
}
