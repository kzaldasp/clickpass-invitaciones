import type { Manifiesto } from '../tipos';
import { EXTRAS_COMUNES } from '../kit/extras';

export const manifiesto: Manifiesto = {
  slug: 'neon',
  nombre: 'Neón',
  descripcion: 'Un letrero de neón que se enciende parpadeando, tubos de luz y destellos. Para cumpleaños de adultos, 18, 30, 40 y fiestas de noche.',
  version: 1,
  visibilidad: 'publica',
  tiposEvento: ['cumpleanos', 'graduacion', 'corporativo'],
  portada: '/ilustraciones/neon/portada.jpg',
  colorTema: '#0a0a12',
  extras: EXTRAS_COMUNES,
  demo: {
    diasHastaEvento: 21,
    zonaHoraria: 'America/Guayaquil',
    contenido: {
      tipo: 'Mis 30',
      festejado: { nombre: 'Daniela', edad: 30 },
      frase: 'Treinta y fabulosa. Esta noche se celebra en grande',
      lugares: [
        { titulo: 'La fiesta', hora: '21:00', nombre: 'Rooftop Luna', direccion: 'Av. 12 de Octubre N24-593, Quito', mapa: 'https://maps.google.com/?q=12+de+Octubre+Quito' },
      ],
      dressCode: { titulo: 'Brillos', nota: 'Algo que brille, metalizado o neón. ¡Todo vale!' },
      galeria: ['/demo/neon/confeti.jpg', '/demo/neon/amigos.jpg'],
      despedida: 'Nos vemos en la pista',
      extras: { hashtag: 'Dani30', historia: 'Treinta años, muchas historias y la mejor gente. Quiero que estés.', regalosTexto: 'Tu presencia es el regalo. Si quieres sumar, habrá lluvia de sobres.', lluviaSobres: true },
    },
    confirmacion: { pedirPases: true, pedirMensaje: true, preguntas: [{ id: 'cancion', tipo: 'texto', etiqueta: 'La canción que te hace bailar', obligatoria: false }] },
    invitado: { nombre: 'Andrés y Caro', pases: 2 },
  },
  presets: [
    { id: 'rosa', nombre: 'Rosa y cian', muestra: '#ff3ea5', variables: {} },
    { id: 'verde', nombre: 'Verde ácido', muestra: '#7cff4d', variables: { '--ne-a': '#7cff4d', '--ne-b': '#ffe14d' } },
    { id: 'violeta', nombre: 'Violeta y naranja', muestra: '#b14dff', variables: { '--ne-a': '#b14dff', '--ne-b': '#ff9a3d' } },
  ],
};
