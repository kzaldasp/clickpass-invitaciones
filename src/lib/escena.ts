import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let ticker: ((time: number) => void) | null = null;

/** Quien pidio menos movimiento en su sistema no recibe scroll con inercia ni reveals. */
export const movimientoReducido = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Arranca el scroll con inercia y lo sincroniza con ScrollTrigger.
 *
 * Lenis moderno mueve el scroll real de la ventana (no un transform), asi que
 * ScrollTrigger lee posiciones correctas sin necesidad de scrollerProxy.
 * Lo unico imprescindible es avisarle en cada frame.
 */
export function iniciarScroll() {
  if (movimientoReducido() || lenis) return lenis;

  lenis = new Lenis({
    duration: 1.1,
    // Curva con frenada larga: es lo que da la sensacion "cara".
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    // En tactil dejamos la inercia nativa del sistema: pelear contra ella se siente mal.
    smoothWheel: true,
    syncTouch: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  ticker = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(ticker);
  // Sin esto GSAP intenta "recuperar" frames perdidos y el scroll da saltos.
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

/**
 * Entrada de cada elemento marcado con data-anim al asomar en pantalla.
 * `once: true` porque una invitacion se lee de arriba a abajo una vez;
 * re-animar al subir se siente nervioso.
 */
export function revelarPorScroll(raiz: ParentNode = document) {
  if (movimientoReducido()) return;

  const elementos = raiz.querySelectorAll<HTMLElement>('[data-anim]');

  elementos.forEach((el) => {
    const retraso = Number(el.dataset.animRetraso ?? 0);

    gsap.to(el, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.9,
      delay: retraso,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
    });
  });
}

/**
 * Anima grupos: los hijos de [data-anim-grupo] entran escalonados.
 */
export function revelarEnCascada(raiz: ParentNode = document) {
  if (movimientoReducido()) return;

  raiz.querySelectorAll<HTMLElement>('[data-anim-grupo]').forEach((grupo) => {
    const hijos = grupo.querySelectorAll<HTMLElement>(':scope > *');
    if (!hijos.length) return;

    gsap.to(hijos, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: grupo, start: 'top 80%', once: true },
    });
  });
}

/**
 * Limpieza obligatoria antes de cambiar de ruta.
 *
 * ScrollTrigger y SplitText dejan instancias y wrappers en el DOM que no se van
 * solas cuando Astro reemplaza la pagina con View Transitions. Sin esto, cada
 * navegacion acumula listeners y triggers muertos hasta que el scroll se traba.
 */
export function destruirEscena() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.globalTimeline.clear();

  if (ticker) {
    gsap.ticker.remove(ticker);
    ticker = null;
  }

  lenis?.destroy();
  lenis = null;
}

export { gsap, ScrollTrigger };
