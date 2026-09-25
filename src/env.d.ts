/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Usuario con sesion (admin o cliente que entro por correo). */
    usuario?: import('./db/schema').Usuario;
    /** Evento del panel, resuelto por el token de la URL en el middleware. */
    evento?: import('./db/schema').Evento;
    /** Aviso flash pendiente de mostrar como toast. */
    aviso?: import('./lib/aviso').Aviso;
  }
}
