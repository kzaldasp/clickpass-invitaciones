# ClickPass · Invitaciones digitales

Plataforma para vender invitaciones digitales de eventos (bodas, XV años,
cumpleaños, bautizos…). El cliente elige un diseño del catálogo, llena sus
datos, sube su lista de invitados y reparte un link personal a cada uno por
WhatsApp. Los invitados confirman asistencia y el cliente ve las respuestas en
su panel. En la puerta, el QR de cada pase marca el ingreso.

Principios:

- **Sencillo y rápido**, para el cliente y para nosotros.
- **No hacemos SEO.** Las metaetiquetas son para la vista previa de WhatsApp.
- **Las invitaciones son mobile-first** (390×844). Catálogo, admin y panel son
  responsivos: usan todo el escritorio y se adaptan a móvil.
- **Un evento nuevo es una fila en la base, no código.** Solo una plantilla
  nueva es código.

---

## Arrancar en local

Requisitos: Node 22 y la CLI de Turso (`curl -sSfL https://get.tur.so/install.sh | bash`).

```bash
npm install
cp .dev.vars.example .dev.vars      # variables para astro dev (corre en workerd)
npm run db:dev                       # terminal 1: base local en http://127.0.0.1:8880
npm run db:migrate                   # crea las tablas
npm run db:seed                      # datos de prueba (admin, 2 clientes, 2 eventos)
astro dev --background               # http://localhost:4321
```

Con la semilla:

| Qué | Dónde |
|---|---|
| Admin | `/admin` · `admin@clickpass.test` / `clickpass-dev` |
| Panel de un cliente | `/panel/panelMateo01` |
| Invitación personal | `/mateo-6-anios/invLopez001` |
| Evento en borrador | `/ana-y-luis` |
| Catálogo | `/catalogo` |

Para un admin real: `npm run admin:crear -- correo@dominio.com "Nombre" "clave larga"`.

> Si instalas o quitas dependencias con el servidor corriendo, reinícialo
> (`astro dev stop`, borra `node_modules/.vite` y vuelve a arrancar): el
> optimizador de Vite en workerd no se recupera solo.

## Comandos

| Comando | Qué hace |
|---|---|
| `astro dev --background` | Servidor local (workerd, igual que producción) |
| `npm run build` | Build para Cloudflare Workers |
| `npm run check` | Tipos de Astro y TypeScript |
| `npm test` | Pruebas de la lógica pura (`tests/`) |
| `npm run db:dev` | Base libSQL local (`local.db`) en el puerto 8880 |
| `npm run db:generate` | Crea una migración en `drizzle/` a partir de `src/db/schema.ts` |
| `npm run db:migrate` | Aplica las migraciones pendientes |
| `npm run db:studio` | Drizzle Studio para ver y editar la base |
| `npm run db:seed` | Datos de prueba |
| `npm run admin:crear` | Crea un admin o cambia su clave |

---

## Flujo

1. El cliente mira el **catálogo** (`/catalogo`) y nos escribe por WhatsApp
   con el botón "La quiero".
2. Creamos el evento en **/admin**: cliente, plantilla, paleta, país y zona
   horaria, fecha, límite de invitados, precio y qué pregunta la confirmación.
   Nace en `borrador`, con los textos de ejemplo de la plantilla.
3. Le mandamos el **link privado de su panel** por WhatsApp (botón "Enviar al
   cliente"), o el cliente entra con su **correo y un código**.
4. En el panel, el cliente (o nosotros por él) edita los textos, ve la vista
   previa, **importa su Excel** o pega la lista y ajusta el mensaje de WhatsApp.
   Nosotros subimos fotos y música desde la ficha del evento.
5. Cuando paga (registramos los abonos), lo **publicamos** y los links de
   invitado se activan.
6. El cliente toca **Enviar** junto a cada invitado: WhatsApp se abre con el
   mensaje y el link listos. A quien abrió y no responde le toca **Recordar**.
7. El invitado abre su link, ve su nombre y sus pases, **confirma** y puede
   agregar el evento a su calendario. Puede cambiar su respuesta hasta la fecha
   límite.
8. En la fiesta, quien recibe abre **Entrada con QR** en su celular y escanea
   el QR de cada pase.
9. Pasada la fiesta tocamos **Finalizar**: se borran invitados y respuestas. El
   link general sigue vivo como recuerdo.

## Decisiones

| Tema | Decisión |
|---|---|
| Venta | Asistida. El admin crea el evento; no hay pago en línea. |
| Acceso del cliente | Link privado `/panel/{token}` **o** correo con código de un solo uso. |
| Quién llena | El cliente, o el admin por él con el mismo editor. |
| Qué edita el cliente | Textos y datos. Diseño, paleta, fotos y música los ponemos nosotros. |
| Publicación | Nace en `borrador`. Los links de invitado solo abren en `publicado`. |
| Límite de invitados | Lo fija el admin por evento, según lo que pagó. |
| Importar | Excel/CSV (se convierte en el navegador) o lista pegada. Columnas *Nombre* (obligatoria), *Pases*, *Teléfono*, *Nota*, en cualquier orden. Reimportar **agrega**; los duplicados se ignoran. |
| Confirmación | Configurable por evento: pases, mensaje, preguntas extra (texto, opción, sí/no) y fecha límite. |
| Cambiar respuesta | Permitido hasta la fecha límite (o hasta el evento). |
| Link general | Solo muestra la invitación. Para confirmar hace falta el link personal. |
| WhatsApp | `wa.me` uno por uno, sin API. Mensaje editable con `{nombre}`, `{festejado}`, `{pases}` y `{link}`. |
| Cobros | Precio por evento más historial de abonos. Saldo = precio − pagos. |
| Admins | De 1 a 3, todos con los mismos permisos. Entran con correo y clave. |
| Finalizar | Botón manual. Borra invitados y confirmaciones; conserva pagos, medios y el link general. |
| País por defecto | Ecuador: `America/Guayaquil`, prefijo `593`, `USD`, `es-EC`. |
| Stack | Astro (SSR) · Cloudflare Workers · Turso (libSQL) + Drizzle · R2 · Resend · GSAP + Lenis. |

## Arquitectura

Un solo proyecto Astro. Todas las zonas comparten base, plantillas y tipos; los
permisos los resuelve `src/middleware.ts`.

| Ruta | Quién | Qué |
|---|---|---|
| `/{evento}` | Cualquiera | Invitación general (sin confirmar) |
| `/{evento}/{token}` | Invitado | Invitación con su nombre, QR y confirmación |
| `/{evento}/calendario.ics` | Invitado | Evento para el calendario |
| `/catalogo`, `/catalogo/{plantilla}` | Cualquiera | Diseños públicos y su demo |
| `/entrar` | Cliente | Login con código por correo |
| `/panel/{token}/…` | Cliente (y admin) | Resumen, Mi invitación, Invitados, Entrada con QR, CSV |
| `/admin/…` | Admin | Eventos, clientes, pagos, medios, plantillas |
| `/api/confirmar` | Invitado | Guarda la respuesta (JSON con JS, redirect sin JS) |
| `/medios/…` | Cualquiera | Fotos y música desde R2 |

```
src/
  db/            schema.ts (tablas), consultas.ts (lecturas), cliente.ts (Turso por HTTP)
  lib/           reglas de negocio puras: fechas, telefonos, lista, confirmar, contenido…
  lib/acciones/  escrituras por dominio: eventos, invitados, pagos, contenido, acceso, entrada
  lib/cliente/   JS del navegador de la plataforma (popups, toasts, modo oscuro)
  plantillas/    una carpeta por plantilla + compartidas/ + registro
  layouts/       Base, Shell (menu lateral), Admin, Panel, Publico, Simple, Invitacion
  pages/         rutas
  styles/        plataforma.css (sistema de diseño) y global.css (base de invitaciones)
```

Las páginas del admin y del panel procesan sus formularios en el propio
frontmatter (`POST` → acción → aviso flash → redirect). Si algo falla en un
formulario largo, la página se vuelve a pintar con lo escrito y el error.

## Plantillas

Una plantilla es **código**; el contenido de cada evento es **dato**.

```
src/plantillas/
  index.ts             ← registro de MANIFIESTOS (admin, panel, catálogo)
  componentes.ts       ← registro de COMPONENTES por versión (solo rutas que dibujan invitaciones)
  tipos.ts             ← el contrato
  compartidas/         ← Confirmacion, QrEntrada, AgregarCalendario, EtiquetaZona
  aracnido/
    manifiesto.ts
    Plantilla.astro
    secciones/…
```

### Contrato mínimo

Crear una plantilla **no exige ningún parámetro de diseño**. Estructura,
fuentes, colores, animación e ilustraciones son libres.

**Recibe** (`PropsPlantilla` en `tipos.ts`):
- `evento`: contenido, fecha (UTC), zona horaria, estado y paleta elegida.
- `invitado?`: solo en el link personal (nombre, pases, nota, token).
- `confirmacion`: modo (`invitado`, `general` o `demo`), config del evento, si
  está abierta, fecha límite y respuesta actual.

**Declara** un `manifiesto.ts`: `nombre`, `slug`, `version`, `visibilidad`
(`publica` o `privada`), `tiposEvento`, `portada` (JPG 1200×630, sirve para el
catálogo y WhatsApp), `colorTema`, `demo` (contenido, confirmación e invitado de
ejemplo), y opcionalmente `extras` (campos propios que el editor muestra) y
`presets` (paletas: variables CSS que el admin elige sin tocar código).

**Obligaciones:**
- Colocar `<Confirmacion />` en algún lugar. La plantilla decide cómo se ve
  (variables `--conf-*` o clases `.conf__*`); qué pregunta lo decide el evento.
- Scopear sus estilos globales bajo `html[data-tema='<slug>']`: todas las
  plantillas conviven en las mismas rutas.

Las demás piezas compartidas son opcionales: `<QrEntrada />` (el QR del pase),
`<AgregarCalendario />`, `<EtiquetaZona />` ("hora de Ecuador" cuando el
invitado está en otra zona).

**Sumar una plantilla:** crear la carpeta, una línea en `index.ts` y otra en
`componentes.ts`.

### Plantillas disponibles

| Plantilla | Para | Qué la hace especial |
|---|---|---|
| `jardin` | Boda, aniversario | Acuarela botánica: sobre con lacre que se abre en 3D, ramas que se dibujan, hojas que caen, fotos con telón y parallax, save the date, mesa de regalos (extras: link, datos bancarios, lluvia de sobres, hashtag, historia). Paletas salvia, terracota y azul polvo. |
| `aracnido` | Fiesta infantil, cumpleaños | Héroe que baja por su telaraña con el scroll. |

En `jardin`, `galeria[0]` va en el arco de la presentación, `[1]` en "Nuestra
historia" y `[2]` en el cierre. Si faltan, en borrador y vista previa se ve el
hueco "Aquí va su foto"; publicada, la sección se oculta. Las fotos de la demo
son de Unsplash (ver `public/demo/jardin/CREDITOS.md`).

### Reutilizar, personalizar y versionar

- **Paleta distinta** del mismo diseño: un `preset` en el manifiesto. El admin
  lo elige en "Configurar"; el catálogo lo muestra como muestras de color.
- **Diseño a medida** para un cliente: una plantilla más con
  `visibilidad: 'privada'` (solo el admin ve su demo). Para venderla a otros,
  cámbiala a `publica`.
- **Cambio incompatible:** sube `version` y deja el componente viejo en
  `componentes.ts`. Cada evento guarda `plantilla_version` y sigue igual.
- El **núcleo del contenido** (`src/lib/contenido.ts`) es común a todas: un
  evento puede cambiar de plantilla sin reescribir nada.

## Sistema de diseño (catálogo, admin y panel)

Las invitaciones no lo usan: cada plantilla trae el suyo. Vive en
`src/styles/plataforma.css`.

- **Estilo:** minimalista, clásico y moderno. Aire, líneas de 1px, radios de
  6–12px, sombras casi nulas; la jerarquía la da la tipografía.
- **Tipografía:** *Playfair Display* en títulos, *Inter* en la interfaz (números
  tabulares en tablas y montos).
- **Color:** neutros cálidos con **verde botella** de acento; rojo solo para lo
  destructivo. Todo son tokens en `:root`.
- **Claro/oscuro:** sigue al sistema, se cambia con un botón y se recuerda. El
  **menú lateral es siempre oscuro** (tokens `--lateral-*`).
- **Popups** (`<dialog>`, `src/components/Dialogo.astro`) para alertas,
  confirmaciones y formularios cortos; en móvil suben como hoja. **Formularios
  largos** en página propia con barra de guardar fija. Avisos como **toasts**.
- **Responsivo:** en escritorio menú fijo y contenido a todo el ancho; en móvil
  cajón con barra superior y tablas convertidas en tarjetas (`.tabla--tarjetas`).

## Zona horaria y localización

- **La base solo guarda instantes UTC.** Lo que se escribe en un
  `datetime-local` es hora local **del evento** y se convierte con
  `localAInstante(fecha, evento.zona_horaria)` (`src/lib/fechas.ts`).
- **Siempre se muestra en la zona del evento**, nunca en la del servidor ni en
  la del navegador. La cuenta regresiva, el `.ics` y Google Calendar usan el
  instante absoluto.
- El **país** del evento sugiere zona y prefijo (`src/lib/config.ts`).
- La **fecha límite de confirmación** usa la misma zona.
- Las **horas de cada lugar** (`"16:00"`) son hora local del evento.
- Si el invitado está en otra zona, junto a la hora aparece "(hora de Ecuador)".

## Modelo de datos

Turso, una sola base con schema compartido (`src/db/schema.ts`). El contenido
JSON se valida con zod (`src/lib/contenido.ts`).

| Tabla | Qué guarda |
|---|---|
| `usuarios` | Admins (con clave) y clientes (email opcional) |
| `codigos_acceso` | Códigos por correo (hash, expiración, intentos) |
| `sesiones` | Sesiones por cookie (se guarda el hash del token) |
| `eventos` | Slug, cliente, plantilla, versión, paleta, estado, fecha UTC, zona, país, contenido, config de confirmación, fecha límite, límite de invitados, mensaje de WhatsApp, prefijo, token del panel, precio y moneda |
| `invitados` | Token, nombre, teléfono, pases, nota, cuándo abrió, respuesta, pases confirmados, mensaje, respuestas extra, ingreso con QR |
| `pagos` | Abonos: monto, método, fecha y quién lo registró |

Las plantillas no tienen tabla (viven en código). Una respuesta por invitado, en
su misma fila. Dinero en centavos enteros.

## Reglas y casos borde

**Links**
- Link personal con el evento en `borrador` → "Tu invitación está en camino".
  El link general en borrador muestra la cinta de aviso.
- Evento `finalizado` → cualquier link personal redirige al general.
- Token inválido o de otro evento → 404.
- Tokens aleatorios (10 caracteres base62), nunca el nombre.
- Link del panel filtrado → el admin lo regenera y el viejo muere.

**Confirmación**
- `pases_confirmados` ≤ `pases`; si no asiste, 0. Sin pedir pases, usa todos.
- Preguntas obligatorias solo si asiste. Opciones fuera de la lista se rechazan.
- Pasada la fecha límite el formulario se cierra y muestra lo que respondió.
- Gana la última respuesta. La primera apertura llena `abierto_en`.
- Sin JS el formulario funciona con POST normal.

**Invitados**
- Importar por encima del límite → entran hasta el tope y se avisa.
- Duplicados (mismo teléfono o nombre normalizado) → se ignoran.
- Teléfonos: se quita el 0 inicial y se antepone el prefijo del evento; los
  internacionales (`+57…`, `0057…`) se respetan. Inválido → sin WhatsApp.
- Bajar los pases de un invitado recorta sus pases confirmados.
- Sin teléfono, "Enviar" abre WhatsApp para elegir el contacto.

**Entrada**
- Un invitado ingresa una vez; el segundo escaneo avisa "ya ingresó". Dos
  celulares en la puerta no lo marcan dos veces.
- Sin cámara (o sin permiso), se marca a mano desde la lista.
- En iPhone se usa jsQR (no hay `BarcodeDetector`); se carga solo si hace falta.

**Acceso y seguridad**
- Códigos por correo: 10 minutos, un solo uso, 5 intentos, máximo 3 envíos cada
  15 minutos. La respuesta no revela si el correo existe.
- Sin `RESEND_API_KEY`, el código se imprime en la consola (solo en dev). Resend
  necesita **dominio verificado** para enviar a cualquiera.
- Formularios protegidos por el `checkOrigin` de Astro (CSRF). Cookies
  `httpOnly` y `sameSite=lax`. Nada privado se cachea.
- El CSV neutraliza celdas que Excel leería como fórmula.

**Contenido y publicación**
- Las ediciones se ven al instante en los links ya enviados, pero **WhatsApp
  cachea la vista previa** de un link ya compartido.
- Antes de finalizar, exporta el CSV: el borrado no se deshace.
- Eliminar un evento borra también sus archivos de R2.

## Despliegue (Cloudflare + Turso)

1. **Turso:** `turso db create clickpass` y `turso db tokens create clickpass`.
2. **R2:** `npx wrangler r2 bucket create clickpass-medios`.
3. **Secretos del Worker:** `npx wrangler secret put TURSO_DATABASE_URL`
   (y `TURSO_AUTH_TOKEN`, `CONTACTO_WHATSAPP`, `RESEND_API_KEY`).
4. **Primer deploy a mano:** `TURSO_DATABASE_URL=… TURSO_AUTH_TOKEN=… npm run db:migrate`,
   luego `npm run build && npx wrangler deploy`, y crea el admin con
   `npm run admin:crear` apuntando a Turso.
5. **Automático:** `.github/workflows/ci.yml` verifica cada push y, en `main`,
   migra y publica si existen los secretos de GitHub `CLOUDFLARE_API_TOKEN`,
   `CLOUDFLARE_ACCOUNT_ID`, `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`.

Mientras no haya dominio propio, el sitio vive en `clickpass.<cuenta>.workers.dev`.

## Fases

| Fase | Estado | Qué incluye |
|---|---|---|
| 0 | ✅ | Planteamiento, schema, utilidades de fechas y tokens |
| 1 | ✅ | SSR en Workers, invitación y confirmación desde la base, contrato de plantillas, panel (editor, invitados, importar, WhatsApp, CSV, vista previa) y admin (eventos, publicar, finalizar, pagos, clientes, plantillas) |
| 2 | ✅ | Catálogo público con demos y paletas, login por correo, fotos y música en R2, imagen OG por evento |
| 3 | ✅ | Paletas sin código, QR de entrada con escáner, recordatorios, agregar al calendario |

Pendiente fuera del código: comprar el dominio, verificarlo en Resend, las
ilustraciones finales del tema arácnido (ver
[docs/ilustraciones.md](docs/ilustraciones.md)) y el número de WhatsApp de
ventas (`CONTACTO_WHATSAPP`).

---

## Animación de las invitaciones

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

Van en `public/ilustraciones/<plantilla>/` como PNG con canal alfa. Las rutas se
declaran una sola vez, en la constante `ILUSTRACIONES` de cada plantilla. La
portada del catálogo se regenera con `node scripts/portada-aracnido.mjs`.

Los SVG (telarañas, hilos) se dibujan en código: pesan nada, se recolorean con
CSS y GSAP puede animarlos trazo por trazo.
