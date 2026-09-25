import type { Manifiesto } from '../tipos';
import { EXTRAS_COMUNES } from '../kit/extras';

export const manifiesto: Manifiesto = {
  slug: 'jurasico',
  nombre: 'Jurásico',
  descripcion: 'Un huevo de dinosaurio que se rompe, huellas que aparecen al bajar y hojas de selva que se mecen. ¡Para cumpleaños con rugido!',
  version: 1,
  visibilidad: 'publica',
  tiposEvento: ['infantil', 'cumpleanos'],
  portada: '/ilustraciones/jurasico/portada.jpg',
  colorTema: '#f4ead5',
  extras: EXTRAS_COMUNES,
  demo: {
    diasHastaEvento: 28,
    zonaHoraria: 'America/Guayaquil',
    contenido: {
      tipo: '¡Mi dino-cumpleaños!',
      festejado: { nombre: 'Martín', edad: 4 },
      frase: '¡RAWR! Eso significa "ven a mi fiesta" en idioma dinosaurio',
      anfitriones: { titulo: 'Los exploradores', nombres: ['Javier León y Daniela Pazmiño'] },
      lugares: [
        { titulo: 'La expedición', hora: '10:30', nombre: 'Granja Aventura', direccion: 'Vía a Tumbaco km 8, Quito', mapa: 'https://maps.google.com/?q=Tumbaco' },
      ],
      dressCode: { titulo: 'Explorador', nota: 'Ropa cómoda para jugar: ¡habrá excavación de fósiles!' },
      galeria: ['/demo/jurasico/pastel.jpg'],
      despedida: '¡Gracias por venir a mi aventura jurásica!',
      extras: { hashtag: 'DinoMartin4', regalosTexto: 'Tu presencia es mi mejor fósil.' },
    },
    confirmacion: { pedirPases: true, pedirMensaje: false, preguntas: [] },
    invitado: { nombre: 'Explorador Joaquín', pases: 2 },
  },
  presets: [
    { id: 'selva', nombre: 'Selva', muestra: '#2f6b3a', variables: {} },
    { id: 'volcan', nombre: 'Volcán', muestra: '#e0532f', variables: { '--ju-verde': '#8a3a22', '--ju-lima': '#f2a33a', '--ju-naranja': '#e0532f' } },
    { id: 'lagos', nombre: 'Lagos', muestra: '#2a8a8a', variables: { '--ju-verde': '#1f6f73', '--ju-lima': '#8fd4c6', '--ju-naranja': '#f2b33a' } },
  ],
};
