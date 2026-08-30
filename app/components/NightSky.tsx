'use client';

import { useEffect, useRef } from 'react';
import catalog from '../lib/sky/star-catalog.json';
import {
  localSiderealDegrees,
  projectSky,
  starAlpha,
  starRadius,
  SPIKE_MAGNITUDE,
  type ProjectedStar,
  type StarTuple,
} from '../lib/sky/projection';

const STARS = catalog as StarTuple[];

const COLOR_LUZ = '255, 201, 122'; // --luz
const INTRO_MS = 2500;
const TWINKLE_COUNT = 4;
const TWINKLE_AMPLITUDE = 0.08; // ±8%
const MAX_DPR = 2; // Más de 2 no se distingue y cuesta relleno en móviles baratos.

export interface NightSkyProps {
  /** Instante de la misa, en epoch ms. El cielo arranca aquí. */
  fromInstant: number;
  /** Instante de la recepción. El scroll rota el cielo hasta aquí. */
  toInstant: number;
}

/**
 * El cielo real sobre San Cristóbal la noche de la boda.
 *
 * Decorativo a efectos de accesibilidad: `aria-hidden`, fuera del orden de
 * foco, y `pointer-events: none` para que nunca robe un toque.
 *
 * Si algo falla —sin canvas 2D, contexto perdido, catálogo corrupto— el
 * componente simplemente no dibuja. El fondo `--noche` del body queda visible y
 * la invitación funciona igual. Nunca bloquea el contenido ni el scroll.
 */
export function NightSky({ fromInstant, toInstant }: NightSkyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return; // Sin contexto: se queda el fondo liso y ya.

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let projected: ProjectedStar[] = [];
    let twinklers: ProjectedStar[] = [];
    let appearOrder = new Map<ProjectedStar, number>();

    // Capa estática: todas las estrellas menos las que titilan. Se reconstruye
    // solo al rotar o redimensionar; el bucle por frame solo la copia y pinta
    // las cuatro que respiran. Seis operaciones de dibujo por frame en vez de
    // trescientas.
    const staticLayer = document.createElement('canvas');
    const staticCtx = staticLayer.getContext('2d');
    if (!staticCtx) return;

    // Alias no-nulos: TypeScript pierde el narrowing dentro de los closures de
    // abajo, y arrastrar `!` por todo el archivo esconde errores de verdad.
    const el: HTMLCanvasElement = canvas;
    const main: CanvasRenderingContext2D = ctx;
    const layer: CanvasRenderingContext2D = staticCtx;

    let staticBuiltFor = Number.NaN;
    let introStart = 0;
    let introDone = reduceMotion;
    let frame = 0;

    // -- sprites -------------------------------------------------------------
    // El halo se dibuja una vez por tamaño y luego se copia. Un gradiente radial
    // por estrella y por frame es lo que hace lentos estos fondos.
    const sprites = new Map<number, HTMLCanvasElement>();

    function spriteFor(radius: number): HTMLCanvasElement {
      const key = Math.round(radius * 4) / 4;
      const cached = sprites.get(key);
      if (cached) return cached;

      const glow = key * 3.2;
      const size = Math.ceil(glow * 2) + 2;
      const sprite = document.createElement('canvas');
      sprite.width = size;
      sprite.height = size;

      const sctx = sprite.getContext('2d');
      if (sctx) {
        const c = size / 2;
        const gradient = sctx.createRadialGradient(c, c, 0, c, c, glow);
        gradient.addColorStop(0, `rgba(${COLOR_LUZ}, 0.95)`);
        gradient.addColorStop(0.18, `rgba(${COLOR_LUZ}, 0.55)`);
        gradient.addColorStop(1, `rgba(${COLOR_LUZ}, 0)`);
        sctx.fillStyle = gradient;
        sctx.fillRect(0, 0, size, size);
      }

      sprites.set(key, sprite);
      return sprite;
    }

    function paintStar(
      target: CanvasRenderingContext2D,
      star: ProjectedStar,
      alpha: number,
      guarded = false,
    ) {
      if (alpha <= 0.002) return;

      const radius = starRadius(star.mag);
      const sprite = spriteFor(radius);
      const half = sprite.width / 2;

      // Composición aditiva: la luz se SUMA, no se superpone. Es lo que hace
      // que el halo y el núcleo florezcan en vez de taparse, y lo que separa un
      // campo de estrellas de una cuadrícula de puntos grises.
      const previousMode = target.globalCompositeOperation;
      target.globalCompositeOperation = 'lighter';

      target.globalAlpha = alpha;
      target.drawImage(sprite, star.x - half, star.y - half);

      // Núcleo nítido encima del halo: sin esto las estrellas se ven borrosas.
      target.beginPath();
      target.arc(star.x, star.y, Math.max(0.5, radius * 0.42), 0, Math.PI * 2);
      target.fillStyle = `rgba(${COLOR_LUZ}, 1)`;
      target.fill();

      // Destello solo en las más brillantes: a la hora de la misa son cuatro.
      if (star.mag < SPIKE_MAGNITUDE && !guarded) {
        const arm = radius * 7;
        target.globalAlpha = alpha * 0.5;
        target.strokeStyle = `rgba(${COLOR_LUZ}, 1)`;
        target.lineWidth = 1.1;
        target.beginPath();
        target.moveTo(star.x - arm, star.y);
        target.lineTo(star.x + arm, star.y);
        target.moveTo(star.x, star.y - arm);
        target.lineTo(star.x, star.y + arm);
        target.stroke();
      }

      target.globalAlpha = 1;
      target.globalCompositeOperation = previousMode;
    }

    // -- guardarraíl de contraste --------------------------------------------
    // Una estrella brillante detrás de una letra baja el contraste del texto de
    // 15:1 a ~1.2:1. Los elementos con `data-sky-guard` proyectan una zona donde
    // las estrellas se atenúan y pierden el destello.
    //
    // El canvas es `fixed`, así que sus coordenadas y las de getBoundingClientRect
    // están en el mismo sistema. Los rectángulos se recalculan en cada
    // reproyección, que es también cada vez que cambia el scroll.
    const GUARD_DIM = 0.22;
    const GUARD_PAD = 14;
    let guards: { left: number; top: number; right: number; bottom: number }[] = [];

    function readGuards() {
      guards = Array.from(document.querySelectorAll('[data-sky-guard]')).map((node) => {
        const r = node.getBoundingClientRect();
        return {
          left: r.left - GUARD_PAD,
          top: r.top - GUARD_PAD,
          right: r.right + GUARD_PAD,
          bottom: r.bottom + GUARD_PAD,
        };
      });
    }

    function isGuarded(star: ProjectedStar): boolean {
      for (const g of guards) {
        if (star.x >= g.left && star.x <= g.right && star.y >= g.top && star.y <= g.bottom) {
          return true;
        }
      }
      return false;
    }

    // -- geometría -----------------------------------------------------------
    function scrollProgress(): number {
      if (reduceMotion) return 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return 0;
      return Math.min(1, Math.max(0, window.scrollY / scrollable));
    }

    function currentLst(): number {
      // Se interpola el INSTANTE, no el ángulo: así la rotación es la real que
      // ocurre entre la misa y la recepción, no una aproximación.
      const instant = fromInstant + scrollProgress() * (toInstant - fromInstant);
      return localSiderealDegrees(instant);
    }

    function reproject(lst: number) {
      projected = projectSky(STARS, { width, height, lstDegrees: lst });
      readGuards();

      // Las que titilan son las más brillantes del marco: son las que el ojo
      // sigue, y las únicas donde un cambio del 8% se nota.
      const byBrightness = [...projected].sort((a, b) => a.mag - b.mag);
      twinklers = byBrightness.slice(0, TWINKLE_COUNT);
      const twinkleSet = new Set(twinklers);

      // Orden de aparición: primero las brillantes, después las tenues. Es el
      // orden real en que salen al anochecer.
      appearOrder = new Map();
      byBrightness.forEach((star, i) => {
        appearOrder.set(star, byBrightness.length <= 1 ? 0 : i / (byBrightness.length - 1));
      });

      layer.setTransform(1, 0, 0, 1, 0, 0);
      layer.clearRect(0, 0, staticLayer.width, staticLayer.height);
      layer.scale(dpr, dpr);
      for (const star of projected) {
        if (twinkleSet.has(star)) continue;
        const guarded = isGuarded(star);
        paintStar(layer, star, starAlpha(star.mag) * (guarded ? GUARD_DIM : 1), guarded);
      }
      staticBuiltFor = lst;
    }

    function resize() {
      dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;

      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;

      staticLayer.width = el.width;
      staticLayer.height = el.height;

      staticBuiltFor = Number.NaN;
    }

    // -- dibujo --------------------------------------------------------------
    function drawIntro(elapsed: number) {
      const t = Math.min(1, elapsed / INTRO_MS);
      main.setTransform(dpr, 0, 0, dpr, 0, 0);
      main.clearRect(0, 0, width, height);

      for (const star of projected) {
        // Cada estrella tiene su propio arranque según su rango de brillo, y
        // entra en el 45% final de la ventana.
        const start = (appearOrder.get(star) ?? 0) * 0.55;
        const local = Math.min(1, Math.max(0, (t - start) / 0.45));
        // easeOutCubic: aparecen rápido y se asientan.
        const eased = 1 - Math.pow(1 - local, 3);
        const guarded = isGuarded(star);
        paintStar(main, star, starAlpha(star.mag) * eased * (guarded ? GUARD_DIM : 1), guarded);
      }

      if (t >= 1) introDone = true;
    }

    /**
     * Velo de noche que crece con el scroll.
     *
     * El hero es del cielo; de ahí para abajo el cielo cede y el texto manda.
     * Es la otra mitad de "de crepúsculo a noche cerrada": el campo no solo
     * rota, también se hunde.
     *
     * Tope al 35% y no al 55%: con el contador sin fondo, un velo fuerte
     * apagaba justo las estrellas que se supone deben verse a través de él.
     * Oscurecer lo suficiente para que el texto mande, no tanto como para que
     * el cielo desaparezca.
     */
    function drawVeil() {
      const veil = scrollProgress() * 0.35;
      if (veil <= 0.001) return;
      main.setTransform(1, 0, 0, 1, 0, 0);
      main.globalCompositeOperation = 'source-over';
      main.globalAlpha = veil;
      main.fillStyle = '#0d1226';
      main.fillRect(0, 0, el.width, el.height);
      main.globalAlpha = 1;
    }

    function drawSteady(now: number) {
      main.setTransform(1, 0, 0, 1, 0, 0);
      main.clearRect(0, 0, el.width, el.height);
      main.drawImage(staticLayer, 0, 0);

      main.setTransform(dpr, 0, 0, dpr, 0, 0);
      twinklers.forEach((star, i) => {
        const guarded = isGuarded(star);
        const base = starAlpha(star.mag) * (guarded ? GUARD_DIM : 1);
        if (reduceMotion) {
          paintStar(main, star, base, guarded);
          return;
        }
        // Ciclos desfasados de 4 a 6 s, ±8%. Apenas perceptible: la diferencia
        // entre un diagrama y una habitación con las luces prendidas.
        const period = 4000 + i * 700;
        const phase = (now / period + i * 0.37) * Math.PI * 2;
        const factor = 1 + Math.sin(phase) * TWINKLE_AMPLITUDE;
        paintStar(main, star, Math.min(1, base * factor), guarded);
      });
    }

    function tick(now: number) {
      if (!introStart) introStart = now;

      const lst = currentLst();
      if (!Number.isFinite(staticBuiltFor) || Math.abs(lst - staticBuiltFor) > 0.02) {
        reproject(lst);
      }

      if (introDone) drawSteady(now);
      else drawIntro(now - introStart);

      drawVeil();

      // Con movimiento reducido no hay bucle: se dibuja una vez y se redibuja
      // solo si cambia el tamaño de la ventana.
      if (!reduceMotion) frame = requestAnimationFrame(tick);
    }

    let resizeTimer = 0;
    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        if (reduceMotion) tick(performance.now());
      }, 120);
    }

    try {
      resize();
      frame = requestAnimationFrame(tick);
    } catch {
      return; // Cualquier fallo deja el fondo liso. La página sigue viva.
    }

    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, [fromInstant, toInstant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      role="presentation"
      tabIndex={-1}
      className="fixed inset-0 -z-10 h-dvh w-full pointer-events-none"
    />
  );
}
