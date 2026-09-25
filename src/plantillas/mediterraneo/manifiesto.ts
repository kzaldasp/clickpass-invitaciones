import type { Manifiesto } from '../tipos';
import { EXTRAS_COMUNES } from '../kit/extras';

export const manifiesto: Manifiesto = {
  slug: 'mediterraneo',
  nombre: 'Mediterráneo',
  descripcion: 'Azulejos azules, limones y una ventana en arco frente al mar. Una persiana de azulejos que se enrolla para revelar la invitación. Ideal para bodas de playa o civiles.',
  version: 1,
  visibilidad: 'publica',
  tiposEvento: ['boda', 'aniversario'],
  portada: '/ilustraciones/mediterraneo/portada.jpg',
  colorTema: '#fdfcf8',
  extras: EXTRAS_COMUNES,
  demo: {
    diasHastaEvento: 110,
    zonaHoraria: 'America/Guayaquil',
    contenido: {
      tipo: 'Nos casamos',
      festejado: { nombre: 'Lucía & Mateo' },
      frase: 'Con los pies en la arena y el corazón lleno',
      anfitriones: { titulo: 'Con la bendición de nuestros padres', nombres: ['Fernando Ruiz y Carmen Mora', 'Alberto Cedeño y Silvia Vera'] },
      lugares: [
        { titulo: 'Ceremonia en la playa', hora: '16:30', nombre: 'Playa Olón', direccion: 'Olón, Santa Elena', mapa: 'https://maps.google.com/?q=Olon+Santa+Elena' },
        { titulo: 'Recepción', hora: '18:30', nombre: 'Hotel Casa del Sol', direccion: 'Malecón de Olón', mapa: 'https://maps.google.com/?q=Olon+Ecuador' },
      ],
      dressCode: { titulo: 'Playero elegante', nota: 'Tonos claros, lino y sandalias cómodas.' },
      galeria: ['/demo/mediterraneo/playa-abrazo.jpg', '/demo/mediterraneo/playa-velo.jpg', '/demo/mediterraneo/ceremonia.jpg'],
      despedida: 'Gracias por cruzar el mar con nosotros',
      extras: { hashtag: 'LuciaYMateoEnOlon', historia: 'Nos conocimos en un viaje a la costa. Volvemos al mar para decir que sí.', regalosTexto: 'Su compañía es nuestro regalo. Si desean colaborar con nuestra luna de miel:', datosBancarios: 'Banco Guayaquil · Ahorros\n0000000000\nLucía Ruiz · CI 0900000000', lluviaSobres: true },
    },
    confirmacion: { pedirPases: true, pedirMensaje: true, preguntas: [{ id: 'hospedaje', tipo: 'si_no', etiqueta: '¿Necesitas hospedaje?', obligatoria: false }] },
    invitado: { nombre: 'Familia Zambrano', pases: 3 },
  },
  presets: [
    { id: 'azul', nombre: 'Azul y limón', muestra: '#1f4e8c', variables: {} },
    { id: 'terracota', nombre: 'Terracota y oliva', muestra: '#b8643c', variables: { '--me-azul': '#b8643c', '--me-azul-claro': '#e0b39a', '--me-limon': '#9aa35a' } },
    { id: 'turquesa', nombre: 'Turquesa', muestra: '#1b8a8f', variables: { '--me-azul': '#1b8a8f', '--me-azul-claro': '#9ed6d3', '--me-limon': '#f4c95d' } },
  ],
};
