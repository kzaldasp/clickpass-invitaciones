# ClickPass · Invitaciones digitales

Invitaciones de evento (cumpleaños, bodas, XV) en Astro. Se abren desde WhatsApp
en un teléfono. Lee `README.md` para el modelo de datos y `docs/ilustraciones.md`
para el flujo de arte.

## Reglas del proyecto

- **No hacemos SEO.** Las metaetiquetas que hay son para el preview de WhatsApp.
  Lo que importa es lo visual, la animación y la experiencia en móvil.
- **Mobile-first literal.** Diseña a 390x844. El escritorio es el caso raro.
- **Datos separados del tema.** Un evento nuevo es un JSON, no código. Si algo
  se va a repetir entre eventos, va al schema, no hardcodeado en el tema.
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
