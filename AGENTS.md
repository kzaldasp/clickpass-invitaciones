# ClickPass · Invitaciones digitales

Plataforma para vender invitaciones digitales (cumpleaños, bodas, XV) en Astro
SSR sobre Cloudflare Workers, con Turso. Las invitaciones se abren desde
WhatsApp en un teléfono. Lee `README.md` para el producto, las decisiones, la
arquitectura y el modelo de datos, y `docs/ilustraciones.md` para el arte.

## Reglas del proyecto

- **No hacemos SEO.** Las metaetiquetas que hay son para el preview de WhatsApp.
  Lo que importa es lo visual, la animación y la experiencia en móvil.
- **Invitaciones mobile-first literal.** Diseña a 390x844. Catálogo, admin y
  panel son responsivos (escritorio completo y móvil); ver "Sistema de diseño"
  en el README.
- **Datos separados de la plantilla.** Un evento nuevo es una fila en la base
  (`src/db/schema.ts`), no código. Si algo se va a repetir entre eventos, va al
  schema o a `src/lib/contenido.ts`, no hardcodeado en la plantilla.
- **Fechas en UTC, mostradas en la zona del evento.** Nunca la del servidor ni
  la del navegador. Conversión en `src/lib/fechas.ts`; Ecuador por defecto
  (`src/lib/config.ts`).
- **Plantillas sin parámetros de diseño.** Libertad visual total; el contrato es
  solo props de entrada (`src/plantillas/tipos.ts`), `manifiesto.ts` y colocar
  `<Confirmacion />`. Sus estilos globales van bajo `html[data-tema='<slug>']`.
- **Plantillas nuevas: usa el kit** (`src/plantillas/kit/`) para las secciones
  comunes y pon el caracter en la portada, la presentacion y la decoracion. Las
  variables del tema van en `html[data-tema='x'] [data-kit]`. Sin personajes ni
  logos con marca.
- **Manifiestos y componentes en registros separados.** Admin, panel y catálogo
  importan `src/plantillas/index.ts` (solo datos). Solo las rutas que dibujan
  una invitación importan `src/plantillas/componentes.ts`: importar un `.astro`
  arrastra su CSS a la página.
- **La plataforma usa `src/styles/plataforma.css`.** Tokens en `:root`, modo
  claro/oscuro, menú lateral siempre oscuro, popups con `<Dialogo />` para lo
  corto y página propia para lo largo.
- **Formularios por página:** POST en el frontmatter → `src/lib/acciones/*` →
  `ponerAviso()` → redirect. Si falla, se re-renderiza con lo escrito.
- **Lógica pura en `src/lib/`** (sin `astro:*` ni base) y con prueba en
  `tests/`. Lo que toca la base va en `src/db/consultas.ts` o `src/lib/acciones/`.
- **Nada se rompe sin JS.** Los estados ocultos de animación viven bajo `.js`.
- **`prefers-reduced-motion` se respeta siempre**, y la sección encoge cuando el
  recorrido de scroll deja de tener sentido.

## Animación

GSAP + ScrollTrigger + Lenis. Motor en `src/lib/escena.ts`.

- Las secciones montan sus animaciones al oír `invitacion:abierta`, nunca antes:
  con el scroll bloqueado por la portada, ScrollTrigger mide mal.
- `destruirEscena()` en `astro:before-swap` es obligatorio. Sin eso los triggers
  se acumulan entre rutas.
- Los estilos con scope de Astro **no alcanzan al SVG dentro de un componente
  hijo**. Para posicionar un `<Telarana />` hay que envolverlo en un elemento
  del propio componente padre.
- Un path SVG recto (vertical u horizontal) tiene bounding box de ancho cero:
  un `linearGradient` sobre él no renderiza nada. Usa color sólido.

## Development

La base local la sirve `npm run db:dev` (Turso en el puerto 8880; `astro dev`
corre en workerd y no puede leer archivos). Después, `npm run db:migrate` y
`npm run db:seed`. Verifica con `npm run check`, `npm test` y `npm run build`.

Toda dependencia nueva va también en `optimizeDeps.include` (cliente) o
`ssr.optimizeDeps.include` (servidor) de `astro.config.mjs`; si no, Vite la
descubre tarde y el dev en workerd da 500. Si pasa, reinicia y borra
`node_modules/.vite`.

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
