// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
// GitHub Pages sirve el sitio desde una subcarpeta. Estas variables las
// inyecta el workflow de deploy; en local quedan vacias y el sitio corre en /.
const site = process.env.SITIO ?? 'https://inv.clickpass.com';
const base = process.env.BASE_URL ?? '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  image: {
    // Las ilustraciones llegan como PNG con alfa ya recortado en Photoshop.
    // Astro las reescribe a AVIF/WebP en varios tamanos al hacer build.
    responsiveStyles: true,
    layout: 'constrained',
  },
  vite: {
    build: {
      // GSAP y Lenis viven en un solo chunk compartido entre invitaciones.
      cssCodeSplit: false,
    },
  },
});
