import type { Manifiesto } from '../tipos';

export const manifiesto: Manifiesto = {
  slug: 'aracnido',
  nombre: 'Arácnido',
  descripcion: 'Un héroe baja colgado de su telaraña mientras haces scroll. Para fiestas infantiles con mucha acción.',
  version: 1,
  visibilidad: 'publica',
  tiposEvento: ['infantil', 'cumpleanos'],
  portada: '/ilustraciones/aracnido/portada.svg',
  colorTema: '#0a0a14',
  demo: {
    diasHastaEvento: 45,
    zonaHoraria: 'America/Guayaquil',
    contenido: {
      tipo: 'Mi fiesta de cumpleaños',
      festejado: { nombre: 'Mateo', edad: 6 },
      frase: 'Un gran poder conlleva una gran fiesta',
      anfitriones: { titulo: 'Te esperan', nombres: ['Carlos Andrade', 'Lucía Ramírez'] },
      lugares: [
        {
          titulo: 'La misión',
          hora: '16:00',
          nombre: 'Salón Torre Web',
          direccion: 'Av. República de El Salvador N34-127, Quito',
          mapa: 'https://maps.google.com/?q=Av.+Republica+de+El+Salvador+Quito',
        },
        { titulo: 'El pastel', hora: '18:30', nombre: 'Terraza del salón', direccion: 'Mismo lugar, segundo piso' },
      ],
      dressCode: {
        titulo: 'Ven de héroe',
        nota: 'Disfraz opcional, pero muy recomendado. Hay premio al mejor traje.',
      },
      galeria: [],
      despedida: 'Nos vemos en la telaraña',
      extras: {},
    },
    confirmacion: {
      pedirPases: true,
      pedirMensaje: true,
      preguntas: [{ id: 'disfraz', tipo: 'si_no', etiqueta: '¿Vienes disfrazado?', obligatoria: false }],
    },
    invitado: { nombre: 'Familia López', pases: 4, nota: '¡Mateo quiere que llegues temprano!' },
  },
  presets: [
    {
      id: 'clasico',
      nombre: 'Clásico rojo y azul',
      muestra: '#e23636',
      variables: {},
    },
    {
      id: 'noche-verde',
      nombre: 'Noche verde',
      muestra: '#2fbf71',
      variables: {
        '--c-rojo': '#2fbf71',
        '--c-rojo-osc': '#16784a',
        '--c-azul': '#10302a',
        '--c-azul-cl': '#1f6b5a',
        '--c-oro': '#e8e36b',
      },
    },
    {
      id: 'rosa',
      nombre: 'Rosa y morado',
      muestra: '#ff4f9a',
      variables: {
        '--c-rojo': '#ff4f9a',
        '--c-rojo-osc': '#b0306a',
        '--c-azul': '#3a1f6b',
        '--c-azul-cl': '#6a3fc2',
        '--c-oro': '#ffd166',
      },
    },
  ],
};
