import type { Manifiesto } from '../tipos';
import { EXTRAS_COMUNES } from '../kit/extras';

export const manifiesto: Manifiesto = {
  slug: 'castillo',
  nombre: 'Castillo',
  descripcion: 'Un libro de cuentos que se abre, un castillo que se dibuja solo y estrellas que titilan. Para princesas y princesos de cuento.',
  version: 1,
  visibilidad: 'publica',
  tiposEvento: ['infantil', 'cumpleanos'],
  portada: '/ilustraciones/castillo/portada.jpg',
  colorTema: '#f7f1fb',
  extras: EXTRAS_COMUNES,
  demo: {
    diasHastaEvento: 38,
    zonaHoraria: 'America/Guayaquil',
    contenido: {
      tipo: 'Mi cumpleaños real',
      festejado: { nombre: 'Isabella', edad: 5 },
      frase: 'Érase una vez una princesa que cumplía cinco años…',
      anfitriones: { titulo: 'Te invitan sus papás', nombres: ['Diego Salazar y Carolina Mena'] },
      lugares: [
        { titulo: 'El baile real', hora: '15:00', nombre: 'Salón Jardín Encantado', direccion: 'Av. González Suárez N27-142, Quito', mapa: 'https://maps.google.com/?q=Gonzalez+Suarez+Quito' },
      ],
      dressCode: { titulo: 'Realeza', nota: 'Ven con tu corona, tu capa o tu vestido más brillante.' },
      galeria: ['/demo/castillo/pastel.jpg'],
      despedida: 'Y vivieron felices… ¡y con pastel!',
      extras: { lluviaSobres: false, regalosTexto: 'Tu visita es mi mejor regalo real.', hashtag: 'ElReinoDeIsabella' },
    },
    confirmacion: { pedirPases: true, pedirMensaje: true, preguntas: [] },
    invitado: { nombre: 'Princesa Sofía y familia', pases: 3 },
  },
  presets: [
    { id: 'lila', nombre: 'Lila y oro', muestra: '#b49bd6', variables: {} },
    { id: 'rosa', nombre: 'Rosa chicle', muestra: '#f08fb0', variables: { '--ca-lila': '#ec8fb2', '--ca-lila-osc': '#b0487a', '--ca-cielo': '#fff0f6' } },
    { id: 'hielo', nombre: 'Azul hielo', muestra: '#8fc3e8', variables: { '--ca-lila': '#8fc0e6', '--ca-lila-osc': '#3d6f9e', '--ca-cielo': '#eef7fd' } },
  ],
};
