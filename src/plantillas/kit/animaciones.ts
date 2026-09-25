import { gsap, ScrollTrigger, movimientoReducido } from '../../lib/escena';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(DrawSVGPlugin, SplitText, ScrollTrigger);

export { gsap, movimientoReducido };

/**
 * Animaciones comunes del kit. Se llaman al oir `invitacion:abierta`.
 *   - [data-k-split]: letra por letra
 *   - [data-k-foto]: la foto se descubre (segun `entradaFoto`) y hace parallax
 *   - [data-k-linea]: el hilo de la linea de tiempo sigue al scroll
 *   - [data-k-trazo] svg: sus trazos se dibujan al aparecer
 */
export function montarKit(opciones: { entradaFoto?: 'abajo' | 'centro' | 'circulo' | 'lados' } = {}) {
  if (movimientoReducido()) return;
  const inicio = {
    abajo: 'inset(100% 0% 0% 0%)',
    centro: 'inset(0% 50% 0% 50%)',
    circulo: 'circle(0% at 50% 50%)',
    lados: 'inset(50% 0% 50% 0%)',
  }[opciones.entradaFoto ?? 'abajo'];
  const fin = opciones.entradaFoto === 'circulo' ? 'circle(75% at 50% 50%)' : 'inset(0% 0% 0% 0%)';

  document.querySelectorAll<HTMLElement>('[data-k-split]').forEach((el) => {
    const partido = SplitText.create(el, { type: 'chars', aria: 'auto' });
    gsap.from(partido.chars, {
      opacity: 0,
      y: 22,
      filter: 'blur(6px)',
      duration: 0.9,
      stagger: 0.045,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onComplete: () => partido.revert(),
    });
  });

  document.querySelectorAll<HTMLElement>('[data-k-foto]').forEach((marco) => {
    gsap.fromTo(
      marco,
      { clipPath: inicio },
      {
        clipPath: fin,
        duration: 1.4,
        ease: 'power4.inOut',
        scrollTrigger: { trigger: marco, start: 'top 85%', once: true },
        onComplete: () => gsap.set(marco, { clearProps: 'clipPath' }),
      },
    );
    const img = marco.querySelector('img');
    if (img) {
      gsap.fromTo(
        img,
        { yPercent: -12, scale: 1.08 },
        { yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: marco, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
    }
  });

  document.querySelectorAll<HTMLElement>('[data-k-linea]').forEach((linea) => {
    const hilo = linea.querySelector('.klugares__hilo');
    if (hilo) {
      gsap.fromTo(
        hilo,
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: linea, start: 'top 75%', end: 'bottom 60%', scrub: true } },
      );
    }
  });

  document.querySelectorAll<SVGSVGElement>('[data-k-trazo]').forEach((svg) => {
    gsap.from(svg.querySelectorAll('path, line, circle, rect, polyline, ellipse'), {
      drawSVG: '0%',
      duration: 1.6,
      stagger: 0.05,
      ease: 'power2.inOut',
      scrollTrigger: { trigger: svg, start: 'top 88%', once: true },
    });
  });
}

/**
 * Particulas que caen (petalos, estrellas, confeti, hojas…) dentro de un
 * contenedor .k-particulas. Cada una reaparece arriba al terminar.
 */
export function lluvia(
  selector: string,
  opciones: { duracion?: [number, number]; balanceo?: number; giro?: number; subir?: boolean } = {},
) {
  if (movimientoReducido()) return;
  const { duracion = [10, 16], balanceo = 70, giro = 360, subir = false } = opciones;
  document.querySelectorAll<HTMLElement | SVGElement>(selector).forEach((el, i) => {
    const caer = () => {
      const alto = window.innerHeight;
      gsap.set(el, {
        x: gsap.utils.random(0, window.innerWidth - 24),
        y: subir ? alto + 40 : -40,
        rotation: gsap.utils.random(0, 360),
        opacity: 0,
      });
      gsap
        .timeline({ onComplete: caer, delay: gsap.utils.random(0, 5) + i * 0.6 })
        .to(el, { opacity: 1, duration: 1 })
        .to(el, { y: subir ? -60 : alto + 60, duration: gsap.utils.random(...duracion), ease: 'none' }, 0)
        .to(el, { x: `+=${gsap.utils.random(-balanceo, balanceo)}`, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: 4 }, 0)
        .to(el, { rotation: `+=${gsap.utils.random(giro / 2, giro)}`, duration: 14, ease: 'none' }, 0);
    };
    caer();
  });
}

/** Entrada de la portada: los elementos [data-p-entra] suben escalonados. */
export function entradaPortada(portada: HTMLElement | null) {
  if (!portada || movimientoReducido()) return gsap.timeline();
  return gsap
    .timeline({ defaults: { ease: 'power3.out' } })
    .from(portada.querySelectorAll('[data-p-entra]'), { opacity: 0, y: 22, duration: 0.9, stagger: 0.1 });
}
