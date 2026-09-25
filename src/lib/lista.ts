import { normalizarNombre } from './texto';

/**
 * Convierte una lista pegada (o un Excel ya pasado a texto en el navegador) en
 * filas de invitados. Acepta separadores tab, punto y coma o coma.
 *
 * Con encabezado ("Nombre, Pases, Teléfono, Nota") las columnas se buscan por
 * nombre y pueden venir en cualquier orden. Sin encabezado: nombre, pases,
 * telefono, nota.
 */
export interface FilaLista {
  nombre: string;
  pases: number;
  telefono: string;
  nota: string;
}

const ALIAS: Record<keyof FilaLista, string[]> = {
  nombre: ['nombre', 'nombres', 'invitado', 'invitados', 'name', 'familia'],
  pases: ['pases', 'pase', 'cupos', 'cupo', 'cantidad', 'personas', 'lugares', 'asistentes'],
  telefono: ['telefono', 'tel', 'celular', 'whatsapp', 'movil', 'numero', 'phone', 'contacto'],
  nota: ['nota', 'notas', 'mensaje', 'comentario', 'observacion'],
};

function separador(linea: string): string | RegExp {
  if (linea.includes('\t')) return '\t';
  if (linea.includes(';')) return ';';
  return ',';
}

function columnaDe(celda: string): keyof FilaLista | null {
  const c = normalizarNombre(celda).replace(/[^a-z]/g, '');
  for (const [campo, alias] of Object.entries(ALIAS)) {
    if (alias.some((a) => c === a || c.startsWith(a))) return campo as keyof FilaLista;
  }
  return null;
}

export function leerLista(texto: string, maxPases = 50): { filas: FilaLista[]; descartadas: number } {
  const lineas = texto
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lineas.length) return { filas: [], descartadas: 0 };

  const sep = separador(lineas[0]);
  const celdas = (l: string) => l.split(sep).map((c) => c.trim().replace(/^"|"$/g, ''));

  // Encabezado: la primera linea tiene una columna "nombre" reconocible.
  let orden: (keyof FilaLista | null)[] = ['nombre', 'pases', 'telefono', 'nota'];
  const primera = celdas(lineas[0]).map(columnaDe);
  if (primera.includes('nombre')) {
    orden = primera;
    lineas.shift();
  }

  const filas: FilaLista[] = [];
  let descartadas = 0;
  for (const linea of lineas) {
    const fila: FilaLista = { nombre: '', pases: 1, telefono: '', nota: '' };
    celdas(linea).forEach((valor, i) => {
      const campo = orden[i];
      if (!campo || !valor) return;
      if (campo === 'pases') {
        const n = parseInt(valor, 10);
        fila.pases = Number.isFinite(n) ? Math.min(Math.max(n, 1), maxPases) : 1;
      } else {
        fila[campo] = valor.replace(/\s+/g, ' ').slice(0, campo === 'nombre' ? 120 : 200);
      }
    });
    if (fila.nombre) filas.push(fila);
    else descartadas++;
  }
  return { filas, descartadas };
}
