import type { ConfigConfirmacion, RespuestasExtra } from './contenido';

export interface RespuestaValida {
  respuesta: 'asiste' | 'no_asiste';
  pasesConfirmados: number;
  mensaje: string | null;
  respuestasExtra: RespuestasExtra;
}

type Resultado = { ok: true; datos: RespuestaValida } | { ok: false; error: string };

const texto = (v: FormDataEntryValue | null, max: number) =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;

/**
 * Valida lo que envia el formulario de <Confirmacion /> contra la config del
 * evento y los pases del invitado. Funcion pura: no toca la base.
 *
 * Reglas:
 *  - no asiste -> 0 pases, preguntas extra no obligatorias.
 *  - asiste sin pedir pases -> usa todos sus pases.
 *  - pases entre 1 y los asignados.
 *  - opcion debe ser una de las declaradas; si_no llega como "si"/"no".
 */
export function validarRespuesta(form: FormData, config: ConfigConfirmacion, pasesAsignados: number): Resultado {
  const respuesta = form.get('respuesta');
  if (respuesta !== 'asiste' && respuesta !== 'no_asiste') {
    return { ok: false, error: 'Elige si asistirás o no.' };
  }
  const asiste = respuesta === 'asiste';

  let pasesConfirmados = 0;
  if (asiste) {
    if (config.pedirPases && pasesAsignados > 1) {
      const n = Number(form.get('pases'));
      if (!Number.isInteger(n) || n < 1 || n > pasesAsignados) {
        return { ok: false, error: `Elige entre 1 y ${pasesAsignados} pases.` };
      }
      pasesConfirmados = n;
    } else {
      pasesConfirmados = pasesAsignados;
    }
  }

  const respuestasExtra: RespuestasExtra = {};
  for (const p of config.preguntas) {
    const crudo = form.get(`extra_${p.id}`);
    let valor: string | boolean | null = null;

    if (p.tipo === 'texto') valor = texto(crudo, 300);
    if (p.tipo === 'si_no') valor = crudo === 'si' ? true : crudo === 'no' ? false : null;
    if (p.tipo === 'opcion') {
      const v = texto(crudo, 200);
      if (v && !p.opciones.includes(v)) return { ok: false, error: `Opción no válida en “${p.etiqueta}”.` };
      valor = v;
    }

    if (valor === null) {
      if (asiste && p.obligatoria) return { ok: false, error: `Responde “${p.etiqueta}”.` };
      continue;
    }
    respuestasExtra[p.id] = valor;
  }

  return {
    ok: true,
    datos: {
      respuesta,
      pasesConfirmados,
      mensaje: config.pedirMensaje ? texto(form.get('mensaje'), 500) : null,
      respuestasExtra,
    },
  };
}

export function textoResumen(d: Pick<RespuestaValida, 'respuesta' | 'pasesConfirmados'>): string {
  if (d.respuesta === 'no_asiste') return 'Respondiste que no podrás asistir.';
  return `Confirmaste tu asistencia con ${d.pasesConfirmados === 1 ? '1 pase' : `${d.pasesConfirmados} pases`}.`;
}
