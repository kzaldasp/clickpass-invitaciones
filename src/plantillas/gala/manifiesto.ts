import type { Manifiesto } from '../tipos';
import { EXTRAS_COMUNES } from '../kit/extras';

export const manifiesto: Manifiesto = {
  slug: 'gala',
  nombre: 'Gala',
  descripcion: 'Art déco en negro y oro: puertas de ascensor que se abren, un abanico de rayos que se dibuja y marcos escalonados. Para bodas de noche y de etiqueta.',
  version: 1,
  visibilidad: 'publica',
  tiposEvento: ['boda', 'aniversario', 'xv', 'graduacion'],
  portada: '/ilustraciones/gala/portada.jpg',
  colorTema: '#0e0e0e',
  extras: EXTRAS_COMUNES,
  demo: {
    diasHastaEvento: 120,
    zonaHoraria: 'America/Guayaquil',
    contenido: {
      tipo: 'Una noche de gala',
      festejado: { nombre: 'Valeria & Sebastián' },
      frase: 'Brindemos por el amor, por los años locos y por lo que viene',
      anfitriones: { titulo: 'Junto a nuestras familias', nombres: ['Familia Carrión Andrade', 'Familia Vásconez Paz'] },
      lugares: [
        { titulo: 'Ceremonia religiosa', hora: '18:00', nombre: 'Iglesia de la Compañía', direccion: 'García Moreno y Sucre, Quito', mapa: 'https://maps.google.com/?q=Iglesia+de+la+Compania+Quito' },
        { titulo: 'Recepción', hora: '20:00', nombre: 'Gran Salón Imperial', direccion: 'Av. Amazonas N34-311, Quito', mapa: 'https://maps.google.com/?q=Amazonas+Quito' },
      ],
      dressCode: { titulo: 'Etiqueta rigurosa', nota: 'Esmoquin y vestido largo. Los brillos dorados son bienvenidos.' },
      galeria: ['/demo/gala/ramo-rojo.jpg', '/demo/gala/ceremonia.jpg', '/demo/gala/novia.jpg'],
      despedida: 'Salud por nosotros y por ustedes',
      extras: { hashtag: 'LaGalaDeValeYSebas', historia: 'Nos enamoramos bailando. Esa noche habrá pista hasta el amanecer.', regalosTexto: 'Su presencia es nuestro mayor lujo. Si desean hacernos un obsequio:', datosBancarios: 'Produbanco · Corriente\n0000000000\nSebastián Vásconez · CI 1700000001' },
    },
    confirmacion: { pedirPases: true, pedirMensaje: true, preguntas: [{ id: 'menu', tipo: 'opcion', etiqueta: 'Menú', opciones: ['Lomo', 'Salmón', 'Risotto de hongos'], obligatoria: true }] },
    invitado: { nombre: 'Sr. y Sra. Montalvo', pases: 2 },
  },
  presets: [
    { id: 'oro', nombre: 'Negro y oro', muestra: '#c9a45c', variables: {} },
    { id: 'esmeralda', nombre: 'Esmeralda', muestra: '#0f5e4a', variables: { '--ga2-negro': '#0b2a22', '--ga2-negro-2': '#113a2f' } },
    { id: 'vino', nombre: 'Vino', muestra: '#5a1a2a', variables: { '--ga2-negro': '#2a0c14', '--ga2-negro-2': '#3a1420' } },
  ],
};
