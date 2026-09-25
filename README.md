# ClickPass · Invitaciones digitales

Plataforma para vender invitaciones digitales de eventos (bodas, XV años,
cumpleaños, bautizos…). El cliente elige una plantilla del catálogo, llena sus
datos, sube su lista de invitados y reparte un link personal a cada uno por
WhatsApp. Los invitados confirman asistencia y el cliente ve las respuestas en su
panel.

Principios:

- **Sencillo y rápido**, para el cliente y para nosotros.
- **No hacemos SEO.** Las metaetiquetas son para la vista previa de WhatsApp.
- **Las invitaciones son mobile-first** (390×844). El catálogo, el admin y el
  panel son responsivos: usan todo el escritorio y se adaptan a móvil.
- **Un evento nuevo es una fila en la base, no código.** Solo una plantilla
  nueva es código.

> **Estado actual (fase 0).** El sitio que corre hoy sigue siendo estático: los
> eventos son JSON en `src/content/eventos/` y el tema arácnido vive en
> `src/themes/`. El schema de la base (`src/db/schema.ts`) ya está listo; la
> fase 1 migra las invitaciones a SSR leyendo de la base. Ver [Fases](#fases).

---

## Flujo

1. El cliente nos escribe por WhatsApp y elige una plantilla del **catálogo**.
2. Creamos el evento en **/admin**: plantilla, cliente, fecha, país y zona
   horaria, límite de invitados, precio y configuración de la confirmación. El
   evento nace en `borrador`.
3. Le mandamos al cliente el **link privado de su panel** (o entra con correo y
   código).
4. En el panel, el cliente (o nosotros por él, si prefiere mandarnos los datos)
   llena los textos, ve la vista previa, sube su **Excel de invitados** y edita
   el mensaje de WhatsApp.
5. Cuando paga, pasamos el evento a `publicado` y los links de invitado se
   activan.
6. El cliente toca **Enviar** junto a cada invitado. Se abre WhatsApp con el
   mensaje y el link ya escritos.
7. El invitado abre su link, ve la invitación con su nombre y **confirma**. Puede
   cambiar su respuesta hasta la fecha límite.
8. El cliente ve en su panel quién abrió, quién confirmó y quién falta, y puede
   exportarlo a CSV.
9. Pasada la fiesta, tocamos **Finalizar**: se borran invitados y confirmaciones.
   El link general de la invitación sigue vivo como recuerdo.

## Decisiones

| Tema | Decisión |
|---|---|
| Venta | Asistida. El admin crea el evento; no hay autoservicio ni pago en línea. |
| Acceso del cliente | Link privado al panel **o** correo con código de un solo uso. |
| Quién llena | El cliente, o el admin por él con el mismo editor. |
| Qué edita el cliente | Solo textos y datos. Diseño, fotos y música los ponemos nosotros. |
| Publicación | Nace en `borrador`. Los links de invitado solo funcionan en `publicado`. |
| Límite de invitados | Lo fija el admin por evento, según lo que pagó. |
| Importar Excel | Columnas *Nombre* (obligatoria), *Pases* (por defecto 1) y *Teléfono* (opcional). Reimportar **agrega** y los duplicados se ignoran. |
| Confirmación | Configurable por evento: pases, mensaje, preguntas extra (texto, opción o sí/no) y fecha límite. |
| Cambiar respuesta | Permitido hasta la fecha límite. |
| Link general | Solo muestra la invitación. Para confirmar hace falta el link personal. |
| Mensaje de WhatsApp | Editable por el cliente, con `{nombre}` y `{link}`. Se envía con `wa.me`, uno por uno (sin API de WhatsApp). |
| Cobros | Precio por evento más un historial de pagos (abonos). Saldo = precio − pagos. |
| Admins | De 1 a 3, todos con los mismos permisos. |
| Finalizar | Botón manual. Borra invitados y confirmaciones; el evento queda `finalizado`. |
| Catálogo | `/catalogo` público con las plantillas públicas y una demo de cada una. |
| País por defecto | Ecuador: `America/Guayaquil`, prefijo `593`, `USD`, `es-EC`. |

## Arquitectura

Es **un solo proyecto Astro** con SSR. Todas las zonas comparten la misma base,
las mismas plantillas y los mismos tipos:

| Ruta | Quién | Qué |
|---|---|---|
| `/{evento}` | Cualquiera | Invitación general (sin confirmar) |
| `/{evento}/{token}` | Invitado | Invitación con su nombre y el formulario de confirmación |
| `/catalogo` | Cualquiera | Plantillas públicas con su demo |
| `/panel/...` | Cliente | Editar datos, invitados, envíos y confirmaciones |
| `/admin/...` | Nosotros | Eventos, clientes, pagos y plantillas |

Los permisos se controlan con middleware y no con proyectos separados. Si algún
día el admin necesita vivir aparte, las carpetas `src/db` y `src/plantillas` se
extraen a paquetes de un monorepo.

**Stack:** Astro (SSR) · Turso (libSQL) · Drizzle · Cloudflare Workers · R2 para
fotos y música · GSAP + Lenis en las invitaciones. Mientras no tengamos dominio,
usamos `*.workers.dev`. Vercel no sirve: su plan gratis no permite uso comercial.

## Plantillas

Una plantilla es **código**; el contenido de cada evento es **dato**.

```
src/plantillas/
  index.ts              ← registro: una línea por plantilla
  aracnido/
    manifiesto.ts
    Plantilla.astro
    secciones/...
  compartidas/          ← piezas opcionales: Confirmacion, CuentaRegresiva, Lugares…
```

### Contrato mínimo

Crear una plantilla **no exige ningún parámetro de diseño**. La libertad visual
es total: estructura, fuentes, colores, animación e ilustraciones. Solo hay un
contrato de entrada y salida.

**Recibe** tres props:
- `evento`: contenido, fecha y zona horaria.
- `invitado?`: presente solo en el link personal.
- `confirmacion`: la configuración del evento y la respuesta actual del invitado.

**Declara** un `manifiesto.ts`:

| Campo | Para qué |
|---|---|
| `nombre`, `slug`, `version` | Identidad. `version` sube con cada cambio incompatible |
| `visibilidad` | `publica` (sale en el catálogo) o `privada` (hecha a medida) |
| `tiposEvento` | Boda, XV, cumpleaños… Sirve para filtrar el catálogo |
| `portada` | Imagen de la tarjeta del catálogo |
| `demo` | Contenido de ejemplo para la demo del catálogo y la vista previa |
| `extras` | Opcional: campos propios, con un tipo simple, que el editor muestra |

**Única obligación:** colocar `<Confirmacion />` en algún lugar. La plantilla
decide cómo se ve; qué pregunta lo decide la configuración del evento. El resto
de piezas compartidas (`<CuentaRegresiva />`, `<Lugares />`…) son opcionales:
una plantilla puede usarlas y darles estilo, o hacer las suyas.

### Reutilizar y personalizar

- **Una plantilla a medida** para un cliente se hace como cualquier otra, con
  `visibilidad: 'privada'`. Cuando la queramos vender a otros, pasa a `publica`
  y entra al catálogo.
- **Versionado:** si un cambio rompe el contenido de eventos existentes, se crea
  una versión nueva. Cada evento guarda `plantilla_version` y no se entera del
  cambio.
- **El núcleo del contenido es común** a todas las plantillas (ver
  `src/lib/contenido.ts`). Por eso un evento puede cambiar de plantilla sin
  reescribir nada.

## Sistema de diseño (catálogo, admin y panel)

Las invitaciones no siguen este sistema: cada plantilla tiene el suyo.

- **Estilo:** minimalista, clásico y moderno. Mucho aire, líneas de 1px, radios
  pequeños (6–8px), sombras casi nulas. La jerarquía la da la tipografía, no las
  cajas.
- **Tipografía:** *Playfair Display* en los títulos (lo clásico) e *Inter* en la
  interfaz (lo moderno; sus números tabulares alinean tablas y montos).
- **Color:** neutros cálidos (crema, blanco roto, tinta casi negra) con **verde
  botella** como acento. El rojo es solo para acciones destructivas. Todo va en
  tokens CSS en `:root`.
- **Modo claro u oscuro:** arranca con el del sistema, se puede cambiar y se
  recuerda. Se aplica con `data-theme` en `<html>`. **El menú lateral es siempre
  oscuro**: usa sus propios tokens.
- **Popups** (`<dialog>` nativo) para alertas, confirmaciones ("¿Finalizar
  evento?", con botón rojo explícito) y formularios cortos (hasta ~4 campos:
  registrar un pago, agregar un invitado). Los avisos de éxito son toasts.
- **Formularios largos** (crear o editar un evento, contenido de la invitación):
  en una página propia con botón de volver.
- **Responsivo:** en escritorio, menú lateral fijo y contenido a todo el ancho.
  En móvil, el menú pasa a un cajón con barra superior y las tablas se vuelven
  tarjetas. El panel del cliente se piensa primero para móvil, porque lo abre
  desde WhatsApp.
- **Catálogo:** cuadrícula con filtro por tipo de evento. La demo se abre en un
  marco de teléfono en escritorio y a pantalla completa en móvil.

## Zona horaria y localización

Un evento puede ser en otro país, y el servidor corre en UTC. Reglas:

- **La base solo guarda instantes UTC.** Lo que escribe el admin o el cliente
  (`datetime-local`) es **hora local del evento**, y se convierte con
  `localAInstante(fecha, evento.zona_horaria)` (`src/lib/fechas.ts`).
- **Siempre se muestra en la zona del evento** (`timeZone: evento.zona_horaria`),
  nunca en la del servidor ni en la del navegador. La cuenta regresiva usa el
  instante absoluto, así que es correcta desde cualquier país.
- Al elegir el **país** del evento se sugieren su zona y su prefijo telefónico
  (`src/lib/config.ts`). La zona se puede cambiar a mano en países con varias.
- La **fecha límite de confirmación** usa la misma zona.
- Las **horas de cada lugar** (`"16:00"`) son hora local del evento.
- Si el invitado abre la invitación **desde otra zona**, junto a la hora se
  muestra la etiqueta ("hora de Ecuador").
- En el admin y el panel, toda fecha de un evento lleva la etiqueta de su zona.

## Modelo de datos

Turso con una sola base y schema compartido. Definido en `src/db/schema.ts`; el
contenido JSON se valida con `src/lib/contenido.ts`.

| Tabla | Qué guarda |
|---|---|
| `usuarios` | Admins y clientes. El email es opcional: un cliente puede entrar solo con su link privado |
| `codigos_acceso` | Códigos de un solo uso para entrar por correo (hash, expiración, intentos) |
| `sesiones` | Sesiones por cookie |
| `eventos` | Slug, cliente, plantilla y versión, estado, fecha (UTC), zona, país, contenido, config de confirmación, fecha límite, límite de invitados, mensaje de WhatsApp, prefijo telefónico, token del panel, precio y moneda |
| `invitados` | Token del link, nombre, teléfono, pases, nota, cuándo abrió, respuesta, pases confirmados, mensaje, respuestas extra |
| `pagos` | Abonos de cada evento: monto, método, fecha y quién lo registró |

- Las **plantillas no tienen tabla**: viven en código y `eventos.plantilla`
  apunta a su slug.
- **No hay tabla de confirmaciones**: una respuesta por invitado, en su misma
  fila. Cambiarla la sobrescribe.
- **Dinero en centavos enteros** y **fechas en UTC**.

## Reglas y casos borde

**Links**
- Link de invitado con el evento en `borrador` → aviso "Esta invitación aún no
  está disponible". El link general en borrador muestra la cinta de aviso (sirve
  de vista previa).
- Evento `finalizado` → el link de invitado redirige al general, sin formulario.
- Token inválido → 404 amable, con el estilo de la plataforma.
- Los tokens son aleatorios (10 caracteres en base62), **nunca el nombre**: así
  no se pueden adivinar los links de otros invitados.
- Si el link del panel se filtra, el admin lo regenera y el viejo deja de
  funcionar.

**Confirmación**
- `pases_confirmados` ≤ `pases`. Si no asiste, queda en 0.
- Si el evento no pide pases, confirmar "asiste" usa todos los pases del
  invitado.
- Pasada la fecha límite, el formulario se cierra y muestra la respuesta que ya
  dio.
- Doble envío o dos pestañas → gana la última respuesta.
- Si se borra una pregunta extra, las respuestas viejas a esa pregunta se
  ignoran.
- La primera apertura del link llena `abierto_en`, que separa "no lo ha visto"
  de "lo vio y no responde".

**Invitados**
- Importar por encima del límite → se cargan hasta el tope y se avisa cuántos
  quedaron fuera.
- Duplicados (mismo teléfono o mismo nombre normalizado) → se ignoran al
  reimportar. Los que ya existen no se tocan, para no perder links enviados ni
  confirmaciones.
- Teléfonos: se quitan espacios y el 0 inicial, y se antepone el prefijo del
  evento (`0991234567` → `593991234567`). Si es inválido, el invitado se guarda
  sin teléfono y sin botón de WhatsApp.
- Borrar un invitado desactiva su link.
- El cliente también puede agregar o editar invitados uno por uno (popup).

**Contenido y publicación**
- Las ediciones se ven al instante en todos los links ya enviados. Pero
  **WhatsApp cachea la vista previa** (título e imagen) de un link ya compartido.
- Antes de finalizar, se ofrece exportar las confirmaciones a CSV: **el borrado
  no se puede deshacer**.
- Finalizar no borra los pagos: el historial de cobros se conserva.

**Acceso**
- El login por correo necesita un dominio verificado para enviar correos (por
  ejemplo con Resend). Hasta comprar el dominio, solo funciona el link privado.
- Los códigos por correo expiran y se invalidan tras 5 intentos fallidos.

## Fases

| Fase | Qué incluye |
|---|---|
| **0** ✅ | Planteamiento (este README), schema de la base, utilidades de fechas y tokens |
| **1** | SSR con adaptador de Cloudflare. Invitación y confirmación leídas de la base. Migrar el tema arácnido a `src/plantillas/`. Panel del cliente (link privado): editar, importar Excel, enviar y ver confirmaciones. Admin mínimo: eventos, clientes, pagos y finalizar |
| **2** | Catálogo público con demos, login por correo (con dominio propio), subida de fotos y música a R2, imagen OG por evento |
| **3** | Presets de color sin código, QR de entrada, recordatorios y otros extras |

---

## Animación

- **GSAP** (gratis desde 2025, todos los plugins incluidos) para la coreografía.
- **Lenis** para el scroll con inercia.
- **ScrollTrigger** con `scrub` ata la animación al dedo del usuario.

El motor vive en `src/lib/escena.ts`. Reglas que sostiene:

- Nada se anima hasta que el invitado toca "Abrir invitación". La portada emite
  `invitacion:abierta` y cada sección monta sus animaciones ahí. Calcular
  posiciones con el scroll bloqueado da medidas equivocadas.
- Sin JS la invitación se ve completa. Los estados iniciales ocultos viven bajo
  `.js`, que solo se añade si el script corre.
- `prefers-reduced-motion` desactiva Lenis y todos los reveals.
- `destruirEscena()` corre en `astro:before-swap`: sin eso los ScrollTriggers se
  acumulan entre navegaciones hasta trabar el scroll.

## Ilustraciones

Ver [docs/ilustraciones.md](docs/ilustraciones.md) para los prompts listos para
generar y el flujo de recorte.

Van en `public/ilustraciones/<tema>/` como PNG con canal alfa. Las rutas se
declaran una sola vez, en la constante `ILUSTRACIONES` de cada tema.

Los SVG (telarañas, hilos) se dibujan en código: pesan nada, se recolorean con
CSS y GSAP puede animarlos trazo por trazo.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor local |
| `npm run build` | Genera `dist/`. Valida todos los JSON de paso |
| `npm run preview` | Sirve el build |
| `npm run db:generate` | Crea una migración en `drizzle/` a partir de `src/db/schema.ts` |
| `npm run db:migrate` | Aplica las migraciones pendientes (en local, a `local.db`) |
| `npm run db:studio` | Abre Drizzle Studio para ver y editar la base |

Para la base local, copia `.env.example` a `.env`. Por defecto usa
`file:local.db`, sin cuenta de Turso.
