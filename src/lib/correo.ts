import { CORREO_REMITENTE, RESEND_API_KEY } from 'astro:env/server';

/**
 * Envio de correos con Resend (API HTTP, funciona en Workers). Sin clave, en
 * desarrollo el correo se imprime en la consola del servidor.
 *
 * Resend exige un dominio verificado para enviar a cualquier destinatario:
 * hasta comprar el dominio, solo funciona el link privado del panel.
 */
export async function enviarCorreo(para: string, asunto: string, texto: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.info(`[correo] (sin RESEND_API_KEY) Para: ${para}\nAsunto: ${asunto}\n${texto}`);
    return import.meta.env.DEV;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: CORREO_REMITENTE, to: [para], subject: asunto, text: texto }),
  });
  if (!res.ok) console.error(`[correo] Resend respondio ${res.status}: ${await res.text()}`);
  return res.ok;
}
