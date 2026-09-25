import type { Manifiesto } from '../tipos';
import { EXTRAS_COMUNES } from '../kit/extras';

export const manifiesto: Manifiesto = {
  slug: 'galaxia',
  nombre: 'Galaxia',
  descripcion: 'Un cohete que despega con cuenta atrás, un planeta con anillos y estrellas fugaces. Para pequeños astronautas.',
  version: 1,
  visibilidad: 'publica',
  tiposEvento: ['infantil', 'cumpleanos'],
  portada: '/ilustraciones/galaxia/portada.jpg',
  colorTema: '#0b1026',
  extras: EXTRAS_COMUNES,
  demo: {
    diasHastaEvento: 33,
    zonaHoraria: 'America/Guayaquil',
    contenido: {
      tipo: 'Misión cumpleaños',
      festejado: { nombre: 'Lucas', edad: 6 },
      frase: 'Prepárate para despegar hacia la fiesta más espacial del universo',
      anfitriones: { titulo: 'Control de misión', nombres: ['Esteban Mora y Paula Vinueza'] },
      lugares: [
        { titulo: 'Plataforma de lanzamiento', hora: '15:30', nombre: 'Planetario Kids', direccion: 'Parque La Carolina, Quito', mapa: 'https://maps.google.com/?q=Parque+La+Carolina+Quito' },
      ],
      dressCode: { titulo: 'Astronauta', nota: 'Traje espacial opcional. ¡Casco recomendado!' },
      galeria: ['/demo/galaxia/velas.jpg'],
      despedida: '¡Gracias por viajar conmigo hasta las estrellas!',
      extras: { hashtag: 'MisionLucas6', regalosTexto: 'Tu presencia es mi mejor regalo galáctico.' },
    },
    confirmacion: { pedirPases: true, pedirMensaje: false, preguntas: [] },
    invitado: { nombre: 'Cadete Martina', pases: 2 },
  },
  presets: [
    { id: 'nebula', nombre: 'Nebulosa', muestra: '#6d5dfc', variables: {} },
    { id: 'marte', nombre: 'Marte', muestra: '#ff6b3d', variables: { '--ga-violeta': '#ff6b3d', '--ga-cian': '#ffd166', '--ga-fondo': '#1a0b0b' } },
    { id: 'aurora', nombre: 'Aurora', muestra: '#2ee6a6', variables: { '--ga-violeta': '#2ee6a6', '--ga-cian': '#7aa8ff', '--ga-fondo': '#06141b' } },
  ],
};
