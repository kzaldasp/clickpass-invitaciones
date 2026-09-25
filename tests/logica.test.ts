/**
 * Pruebas de la logica pura (sin base ni Astro). Correr con: npm test
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validarRespuesta } from '../src/lib/confirmar';
import type { ConfigConfirmacion } from '../src/lib/contenido';
import { contenidoEvento } from '../src/lib/contenido';
import { etiquetaZona, horaLegible, instanteALocal, localAInstante } from '../src/lib/fechas';
import { filas, centavos, rutaSegura } from '../src/lib/formularios';
import { leerLista } from '../src/lib/lista';
import { normalizarTelefono } from '../src/lib/telefonos';
import { normalizarNombre, rellenar, slugificar } from '../src/lib/texto';
import { tokenSeguro } from '../src/lib/tokens';
import { hashClave, verificarClave } from '../src/lib/claves';
import { manifiesto as aracnido } from '../src/plantillas/aracnido/manifiesto';

const form = (datos: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(datos)) f.append(k, v);
  return f;
};

describe('fechas por zona', () => {
  it('convierte hora local del evento a UTC', () => {
    assert.equal(localAInstante('2026-11-14T20:00', 'America/Guayaquil').toISOString(), '2026-11-15T01:00:00.000Z');
    assert.equal(localAInstante('2026-07-14T20:00', 'Europe/Madrid').toISOString(), '2026-07-14T18:00:00.000Z');
    assert.equal(localAInstante('2026-11-14T20:00', 'Europe/Madrid').toISOString(), '2026-11-14T19:00:00.000Z');
  });

  it('ida y vuelta devuelve la misma hora local', () => {
    for (const zona of ['America/Guayaquil', 'America/Bogota', 'Europe/Madrid', 'America/New_York', 'America/Santiago']) {
      assert.equal(instanteALocal(localAInstante('2026-12-12T21:30', zona), zona), '2026-12-12T21:30');
    }
  });

  it('rechaza formatos invalidos', () => {
    assert.throws(() => localAInstante('14/11/2026 20:00', 'America/Guayaquil'));
  });

  it('formatea horas y etiquetas', () => {
    assert.match(horaLegible('16:00'), /^4:00/);
    assert.equal(etiquetaZona('America/Guayaquil'), 'hora de Ecuador');
    assert.equal(etiquetaZona('Pacific/Galapagos'), 'hora de Galapagos');
  });
});

describe('telefonos', () => {
  it('normaliza numeros locales con el prefijo del evento', () => {
    assert.equal(normalizarTelefono('099 123 4567', '593'), '593991234567');
    assert.equal(normalizarTelefono('0991234567', '593'), '593991234567');
    assert.equal(normalizarTelefono('991234567', '593'), '593991234567');
  });

  it('respeta numeros internacionales', () => {
    assert.equal(normalizarTelefono('+57 300 123 4567', '593'), '573001234567');
    assert.equal(normalizarTelefono('0057 300 123 4567', '593'), '573001234567');
    assert.equal(normalizarTelefono('593991234567', '593'), '593991234567');
  });

  it('descarta lo que no es telefono', () => {
    assert.equal(normalizarTelefono('abc', '593'), null);
    assert.equal(normalizarTelefono('123', '593'), null);
    assert.equal(normalizarTelefono('', '593'), null);
    assert.equal(normalizarTelefono(null, '593'), null);
  });
});

describe('lista de invitados', () => {
  it('lee Excel pasado a texto con encabezado en cualquier orden', () => {
    const { filas: f } = leerLista('Teléfono\tNombre\tCupos\n0991234567\tFamilia López\t4\n\tTía Sofía\t');
    assert.deepEqual(f, [
      { nombre: 'Familia López', pases: 4, telefono: '0991234567', nota: '' },
      { nombre: 'Tía Sofía', pases: 1, telefono: '', nota: '' },
    ]);
  });

  it('lee lista pegada sin encabezado, con comas o punto y coma', () => {
    assert.equal(leerLista('Ana, 2, 099\nLuis, 1').filas.length, 2);
    assert.equal(leerLista('Ana; 2; 099').filas[0].pases, 2);
  });

  it('acota pases, colapsa espacios e ignora filas sin nombre', () => {
    const r = leerLista('Nombre,Pases\nJOSÉ   pérez,999\n,3');
    assert.equal(r.filas[0].nombre, 'JOSÉ pérez');
    assert.equal(r.filas[0].pases, 50);
    assert.equal(r.descartadas, 1);
  });

  it('quita el BOM de Excel', () => {
    assert.equal(leerLista('﻿Nombre\nAna').filas[0].nombre, 'Ana');
  });
});

describe('confirmacion', () => {
  const config: ConfigConfirmacion = {
    pedirPases: true,
    pedirMensaje: true,
    preguntas: [
      { id: 'menu', tipo: 'opcion', etiqueta: 'Menú', opciones: ['Carne', 'Pescado'], obligatoria: true },
      { id: 'disfraz', tipo: 'si_no', etiqueta: '¿Disfraz?', obligatoria: false },
    ],
  };

  it('acepta una respuesta valida', () => {
    const r = validarRespuesta(form({ respuesta: 'asiste', pases: '3', extra_menu: 'Carne', extra_disfraz: 'si', mensaje: ' hola ' }), config, 4);
    assert.ok(r.ok);
    assert.deepEqual(r.ok && r.datos, {
      respuesta: 'asiste',
      pasesConfirmados: 3,
      mensaje: 'hola',
      respuestasExtra: { menu: 'Carne', disfraz: true },
    });
  });

  it('no deja pasar mas pases de los asignados', () => {
    assert.equal(validarRespuesta(form({ respuesta: 'asiste', pases: '5', extra_menu: 'Carne' }), config, 4).ok, false);
  });

  it('exige obligatorias solo si asiste', () => {
    assert.equal(validarRespuesta(form({ respuesta: 'asiste', pases: '1' }), config, 4).ok, false);
    const no = validarRespuesta(form({ respuesta: 'no_asiste' }), config, 4);
    assert.ok(no.ok && no.datos.pasesConfirmados === 0);
  });

  it('rechaza opciones inventadas', () => {
    assert.equal(validarRespuesta(form({ respuesta: 'asiste', pases: '1', extra_menu: 'Pizza' }), config, 4).ok, false);
  });

  it('sin pedir pases usa todos los asignados', () => {
    const r = validarRespuesta(form({ respuesta: 'asiste' }), { ...config, pedirPases: false, preguntas: [] }, 3);
    assert.ok(r.ok && r.datos.pasesConfirmados === 3);
  });
});

describe('utilidades', () => {
  it('slug, nombres y plantillas de mensaje', () => {
    assert.equal(slugificar('Ana & Luis — 2027!'), 'ana-luis-2027');
    assert.equal(normalizarNombre('  José   PÉREZ '), 'jose perez');
    assert.equal(rellenar('Hola {nombre}: {link} {otro}', { nombre: 'Ana', link: 'x' }), 'Hola Ana: x {otro}');
  });

  it('dinero en centavos y rutas seguras', () => {
    assert.equal(centavos(form({ p: '45,5' }), 'p'), 4550);
    assert.equal(centavos(form({ p: '45.999' }), 'p'), null);
    assert.equal(rutaSegura('//malo.com', '/admin'), '/admin');
    assert.equal(rutaSegura('/admin/clientes', '/admin'), '/admin/clientes');
  });

  it('filas repetibles en orden y sin vacias', () => {
    const f = filas(form({ 'l.1.a': 'dos', 'l.0.a': 'uno', 'l.2.a': '' }), 'l');
    assert.deepEqual(f, [{ a: 'uno' }, { a: 'dos' }]);
  });

  it('tokens de 10 caracteres base62 sin repetirse', () => {
    const muchos = new Set(Array.from({ length: 2000 }, () => tokenSeguro()));
    assert.equal(muchos.size, 2000);
    for (const t of muchos) assert.match(t, /^[A-Za-z0-9]{10}$/);
  });

  it('claves con PBKDF2', async () => {
    const h = await hashClave('clave-de-prueba');
    assert.ok(await verificarClave('clave-de-prueba', h));
    assert.ok(!(await verificarClave('otra', h)));
  });
});

describe('plantillas', () => {
  it('el contenido de demo de cada manifiesto es valido', () => {
    assert.ok(contenidoEvento.safeParse(aracnido.demo.contenido).success);
  });
});
