// @ts-check
import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    // Las ilustraciones llegan como PNG con alfa ya recortado. Se optimizan al
    // hacer build; en runtime no transformamos imagenes.
    imageService: 'compile',
  }),
  env: {
    schema: {
      // Turso. En local: http://127.0.0.1:8880 (npm run db:dev), sin token.
      TURSO_DATABASE_URL: envField.string({ context: 'server', access: 'secret' }),
      TURSO_AUTH_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Correo para el login con codigo. Sin clave, el codigo se imprime en consola (solo dev).
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      // WhatsApp de ventas (solo digitos, con codigo de pais). Sin esto el
      // catalogo no muestra el boton "La quiero". Se lee en runtime (secret).
      CONTACTO_WHATSAPP: envField.string({ context: 'server', access: 'secret', optional: true }),
      CORREO_REMITENTE: envField.string({
        context: 'server',
        access: 'public',
        default: 'ClickPass <hola@clickpass.app>',
      }),
    },
  },
});
