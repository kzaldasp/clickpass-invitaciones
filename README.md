# Invitaciones digitales · ClickPass

Invitaciones de una sola pantalla, pensadas para abrirse desde WhatsApp en un
teléfono. El foco es visual: animación ligada al scroll, no posicionamiento.

## Cómo funciona

El sistema separa **datos** de **tema**:

- Un evento es un archivo JSON en `src/content/eventos/`. El nombre del archivo
  es la URL: `mateo-6-anios.json` → `/mateo-6-anios`.
- Un tema es una carpeta en `src/themes/` con sus componentes y animaciones.
  Un mismo tema sirve a todos los eventos que quieran ese estilo.

Crear una invitación con un tema que ya existe = escribir un JSON. Nada más.

## Crear una invitación nueva

1. Copia `src/content/eventos/mateo-6-anios.json` con el slug del evento.
2. Rellena los campos. El schema (`src/content.config.ts`) valida en el build:
   si falta algo obligatorio, el build falla antes de publicar algo roto.
3. `npm run dev` y abre `/` — el panel interno lista todos los links.

Campos que conviene no olvidar:

| Campo | Por qué importa |
|---|---|
| `estado` | `borrador` mientras el cliente revisa, `publicado` al entregar, `archivado` cuando pasó (deja de generarse y el link muere) |
| `fecha` | ISO **con offset**: `"2026-11-14T16:00:00-06:00"` |
| `zonaHoraria` | Sin esto un evento de noche puede imprimirse con la fecha del día siguiente |
| `pases.modo` | `generico` (un link para todos) o `lista` (un link por invitado) |

### Los dos modos de pases

**Genérico** — un solo link, se reenvía a todo el mundo:

```json
"pases": { "modo": "generico", "cantidad": 2 }
```

**Lista** — cada invitado recibe su propio link con su nombre y sus pases:

```json
"pases": {
  "modo": "lista",
  "invitados": [
    { "slug": "familia-lopez", "nombre": "Familia López", "pases": 4 }
  ]
}
```

Genera `/mateo-6-anios/familia-lopez` además del link general. El link general
sigue existiendo y sirve como vista previa para el cliente.

## Crear un tema nuevo

1. Copia `src/themes/aracnido/` a `src/themes/<nombre>/`.
2. Agrega el nombre al enum `tema` en `src/content.config.ts`.
3. Regístralo en `src/components/Tema.astro`.

Son las dos únicas líneas de código que cambian al sumar un tema.

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
