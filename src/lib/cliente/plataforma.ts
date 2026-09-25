/**
 * Comportamiento comun de la plataforma, por atributos data-*. Nada de esto
 * es necesario para leer la pagina; si el JS falla, los formularios siguen
 * enviando por POST normal.
 *
 *   data-abrir="id"        abre el <dialog id="id"> (popup)
 *   data-valores='{...}'   junto a data-abrir: rellena los campos del popup por name
 *   data-cerrar            cierra el popup que lo contiene
 *   data-copiar="texto"    copia al portapapeles y avisa
 *   data-modo              alterna claro/oscuro y lo recuerda
 *   data-menu              abre/cierra el menu lateral en movil
 *   data-autoenviar        en un <select>: envia su formulario al cambiar
 */

export function toast(texto: string, tipo: 'exito' | 'error' | 'info' = 'exito'): void {
  const contenedor = document.querySelector<HTMLElement>('[data-toasts]');
  if (!contenedor) return;
  const el = document.createElement('div');
  el.className = `toast toast--${tipo}`;
  el.setAttribute('role', 'status');
  el.textContent = texto;
  contenedor.append(el);
  programarSalida(el);
}

function programarSalida(el: HTMLElement): void {
  setTimeout(() => {
    el.dataset.saliendo = '';
    setTimeout(() => el.remove(), 300);
  }, 4200);
}

function rellenar(form: HTMLFormElement | null, valores: Record<string, unknown>): void {
  if (!form) return;
  for (const [nombre, valor] of Object.entries(valores)) {
    const campos = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      `[name="${CSS.escape(nombre)}"]`,
    );
    campos.forEach((campo) => {
      if (campo instanceof HTMLInputElement && (campo.type === 'checkbox' || campo.type === 'radio')) {
        campo.checked = campo.type === 'checkbox' ? Boolean(valor) : campo.value === String(valor);
      } else {
        campo.value = valor === null || valor === undefined ? '' : String(valor);
      }
    });
  }
  // Textos que dependen del registro ("Borrar a {nombre}").
  form.querySelectorAll<HTMLElement>('[data-texto]').forEach((el) => {
    const clave = el.dataset.texto!;
    if (clave in valores) el.textContent = String(valores[clave] ?? '');
  });
}

function modoEfectivo(): 'light' | 'dark' {
  const fijo = document.documentElement.dataset.theme;
  if (fijo === 'light' || fijo === 'dark') return fijo;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function iniciarPlataforma(): void {
  document.querySelectorAll<HTMLElement>('.toast').forEach(programarSalida);

  document.addEventListener('click', async (e) => {
    const objetivo = e.target as HTMLElement;

    const abrir = objetivo.closest<HTMLElement>('[data-abrir]');
    if (abrir) {
      const dialogo = document.getElementById(abrir.dataset.abrir!) as HTMLDialogElement | null;
      if (dialogo) {
        e.preventDefault();
        const form = dialogo.querySelector('form');
        if (abrir.dataset.valores) {
          form?.reset();
          rellenar(form, JSON.parse(abrir.dataset.valores));
        }
        dialogo.showModal();
        dialogo.querySelector<HTMLElement>('[autofocus]')?.focus();
      }
      return;
    }

    if (objetivo.closest('[data-cerrar]')) {
      objetivo.closest('dialog')?.close();
      return;
    }

    // Clic en el velo (fuera de la caja) cierra el popup.
    if (objetivo instanceof HTMLDialogElement && objetivo.open) {
      const caja = objetivo.getBoundingClientRect();
      const { clientX: x, clientY: y } = e as MouseEvent;
      if (x < caja.left || x > caja.right || y < caja.top || y > caja.bottom) objetivo.close();
      return;
    }

    const copiar = objetivo.closest<HTMLElement>('[data-copiar]');
    if (copiar) {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(copiar.dataset.copiar!);
        toast(copiar.dataset.copiarAviso ?? 'Copiado al portapapeles');
      } catch {
        toast('No se pudo copiar', 'error');
      }
      return;
    }

    if (objetivo.closest('[data-modo]')) {
      const nuevo = modoEfectivo() === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = nuevo;
      try {
        localStorage.setItem('cp-modo', nuevo);
      } catch {
        /* Modo privado: el cambio dura esta pagina. */
      }
      return;
    }

    if (objetivo.closest('[data-menu]')) {
      const lateral = document.querySelector<HTMLElement>('.lateral');
      const velo = document.querySelector<HTMLElement>('.velo-lateral');
      const abierto = lateral?.toggleAttribute('data-abierto');
      if (velo) velo.hidden = !abierto;
      document.querySelectorAll('[data-menu]').forEach((b) => b.setAttribute('aria-expanded', String(!!abierto)));
    }
  });

  document.addEventListener('change', (e) => {
    const el = e.target as HTMLElement;
    if (el.matches('select[data-autoenviar]')) (el as HTMLSelectElement).form?.requestSubmit();
  });

  // Evita doble envio: el boton se desactiva al enviar.
  document.addEventListener('submit', (e) => {
    const form = e.target as HTMLFormElement;
    if (form.method === 'dialog' || e.defaultPrevented) return;
    const boton = (e as SubmitEvent).submitter as HTMLButtonElement | null;
    if (boton) setTimeout(() => (boton.disabled = true));
  });
}
