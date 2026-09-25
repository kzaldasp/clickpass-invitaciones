import type { Manifiesto } from '../tipos';

export const manifiesto: Manifiesto = {
  slug: 'rosa',
  nombre: 'Rosa',
  descripcion:
    'Rosa empolvado y oro: una tarjeta que abre sus puertas, flores que florecen, mariposas y destellos. Sobria, femenina y elegante para unos XV inolvidables.',
  version: 1,
  visibilidad: 'publica',
  tiposEvento: ['xv', 'cumpleanos'],
  portada: '/ilustraciones/rosa/portada.jpg',
  colorTema: '#fbf6f4',
  extras: [
    { clave: 'mensaje', etiqueta: 'Palabras de la quinceañera', tipo: 'texto_largo', ayuda: 'Aparece junto a la segunda foto.' },
    { clave: 'padrinos', etiqueta: 'Padrinos (uno por línea)', tipo: 'texto_largo' },
    { clave: 'vals', etiqueta: 'Canción del vals', tipo: 'texto', ayuda: 'Opcional. Ej: "Tiempo de vals" – Chayanne' },
    { clave: 'hashtag', etiqueta: 'Hashtag', tipo: 'texto', ayuda: 'Sin el #. Ej: MisXVValentina' },
    { clave: 'regalosTexto', etiqueta: 'Regalos · mensaje', tipo: 'texto_largo' },
    { clave: 'regalosLink', etiqueta: 'Regalos · link de la mesa', tipo: 'texto', ayuda: 'Opcional. Link completo, con https://' },
    { clave: 'datosBancarios', etiqueta: 'Datos para transferencia', tipo: 'texto_largo' },
    { clave: 'lluviaSobres', etiqueta: 'Habrá lluvia de sobres', tipo: 'si_no' },
  ],
  demo: {
    diasHastaEvento: 64,
    zonaHoraria: 'America/Guayaquil',
    contenido: {
      tipo: 'Mis XV años',
      festejado: { nombre: 'Valentina', edad: 15 },
      frase: 'Hay sueños que se esperan toda una vida',
      anfitriones: { titulo: 'Con el amor de mis padres', nombres: ['Andrés Paredes', 'Mariela Coronel'] },
      lugares: [
        {
          titulo: 'Misa de acción de gracias',
          hora: '18:00',
          nombre: 'Basílica del Voto Nacional',
          direccion: 'Calle Carchi y Venezuela, Quito',
          mapa: 'https://maps.google.com/?q=Basilica+del+Voto+Nacional',
        },
        {
          titulo: 'Recepción',
          hora: '20:00',
          nombre: 'Quinta Miraflores',
          direccion: 'Av. Interoceánica km 12, Cumbayá',
          mapa: 'https://maps.google.com/?q=Cumbaya+Quito',
        },
      ],
      dressCode: { titulo: 'Formal', nota: 'El rosa lo reservamos para la quinceañera.' },
      galeria: ['/demo/xv/tiara.jpg', '/demo/xv/vestido.jpg', '/demo/xv/ventana.jpg'],
      despedida: 'Gracias por ser parte de esta noche tan especial',
      extras: {
        mensaje: 'Quince años de risas, abrazos y sueños. Quiero celebrar este comienzo con las personas que más quiero.',
        padrinos: 'Jorge Coronel y Sofía Vega\nDaniel Paredes y Ana Ruiz',
        vals: '“Tiempo de vals” – Chayanne',
        hashtag: 'MisXVValentina',
        regalosTexto: 'Tu presencia es mi mejor regalo. Si deseas tener un detalle conmigo, habrá lluvia de sobres.',
        lluviaSobres: true,
      },
    },
    confirmacion: {
      pedirPases: true,
      pedirMensaje: true,
      preguntas: [{ id: 'cancion', tipo: 'texto', etiqueta: 'Una canción que no puede faltar', obligatoria: false }],
    },
    invitado: { nombre: 'Familia Ortiz', pases: 4 },
  },
  presets: [
    { id: 'rosa', nombre: 'Rosa empolvado', muestra: '#d7a1a6', variables: {} },
    {
      id: 'lila',
      nombre: 'Lila',
      muestra: '#b6a0c8',
      variables: {
        '--x-rosa': '#bca7cd',
        '--x-rosa-osc': '#7d6394',
        '--x-rubor': '#eadff1',
        '--x-papel': '#faf7fb',
      },
    },
    {
      id: 'champana',
      nombre: 'Champaña',
      muestra: '#cdb28b',
      variables: {
        '--x-rosa': '#d6bf9d',
        '--x-rosa-osc': '#8d6e45',
        '--x-rubor': '#f1e6d6',
        '--x-papel': '#fbf8f2',
      },
    },
    {
      id: 'azul-cielo',
      nombre: 'Azul cielo',
      muestra: '#9db4cf',
      variables: {
        '--x-rosa': '#a9bfd8',
        '--x-rosa-osc': '#4f6a8c',
        '--x-rubor': '#e2ebf5',
        '--x-papel': '#f7f9fb',
      },
    },
  ],
};
