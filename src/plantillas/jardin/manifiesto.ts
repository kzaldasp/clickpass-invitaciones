import type { Manifiesto } from '../tipos';

export const manifiesto: Manifiesto = {
  slug: 'jardin',
  nombre: 'Jardín',
  descripcion:
    'Acuarela botánica en verde salvia: sobre con sello de lacre, save the date, cuenta regresiva y mesa de regalos. Elegante y romántica.',
  version: 1,
  visibilidad: 'publica',
  tiposEvento: ['boda', 'aniversario'],
  portada: '/ilustraciones/jardin/portada.jpg',
  colorTema: '#f6f3ec',
  extras: [
    { clave: 'hashtag', etiqueta: 'Hashtag de la boda', tipo: 'texto', ayuda: 'Sin el #. Ej: VictoriaYHassan' },
    { clave: 'regalosTexto', etiqueta: 'Mesa de regalos · mensaje', tipo: 'texto_largo' },
    { clave: 'regalosLink', etiqueta: 'Mesa de regalos · link de la tienda', tipo: 'texto', ayuda: 'Opcional. Link completo, con https://' },
    { clave: 'datosBancarios', etiqueta: 'Datos para transferencia', tipo: 'texto_largo', ayuda: 'Banco, tipo y número de cuenta, titular y cédula.' },
    { clave: 'lluviaSobres', etiqueta: 'Habrá lluvia de sobres', tipo: 'si_no' },
    { clave: 'historia', etiqueta: 'Nuestra historia (frase junto a la foto)', tipo: 'texto_largo' },
  ],
  demo: {
    diasHastaEvento: 82,
    zonaHoraria: 'America/Guayaquil',
    contenido: {
      tipo: 'Nuestra boda',
      festejado: { nombre: 'Victoria & Hassan' },
      frase: 'Dos caminos que hoy se vuelven uno',
      anfitriones: {
        titulo: 'Con la bendición de nuestros padres',
        nombres: ['Rafael Andrade y Elena Cordero', 'Omar Haddad y Lucía Montalvo'],
      },
      lugares: [
        {
          titulo: 'Ceremonia religiosa',
          hora: '17:00',
          nombre: 'Iglesia de San Francisco',
          direccion: 'Plaza de San Francisco, Centro Histórico, Quito',
          mapa: 'https://maps.google.com/?q=Iglesia+de+San+Francisco+Quito',
        },
        {
          titulo: 'Recepción',
          hora: '19:30',
          nombre: 'Hacienda La Carriona',
          direccion: 'Km 2.5 vía Sangolquí–Amaguaña',
          mapa: 'https://maps.google.com/?q=Hacienda+La+Carriona',
        },
      ],
      dressCode: { titulo: 'Cóctel', nota: 'Con cariño, reservamos el blanco para la novia.' },
      galeria: ['/demo/jardin/pareja-jardin.jpg', '/demo/jardin/manos.jpg', '/demo/jardin/colinas.jpg'],
      despedida: 'Gracias por ser parte de nuestra historia',
      extras: {
        hashtag: 'VictoriaYHassan',
        historia: 'Nos conocimos una tarde de lluvia y desde entonces cada día ha sido un poco más nuestro.',
        regalosTexto: 'Tu presencia es nuestro mejor regalo. Si deseas tener un detalle con nosotros, te dejamos estas opciones.',
        regalosLink: 'https://www.example.com/mesa-de-regalos',
        datosBancarios: 'Banco Pichincha · Cuenta de ahorros\n2201234567\nVictoria Andrade · CI 1712345678',
        lluviaSobres: true,
      },
    },
    confirmacion: {
      pedirPases: true,
      pedirMensaje: true,
      preguntas: [
        { id: 'menu', tipo: 'opcion', etiqueta: 'Menú', opciones: ['Carne', 'Pescado', 'Vegetariano'], obligatoria: false },
      ],
    },
    invitado: { nombre: 'Familia Salazar', pases: 3 },
  },
  presets: [
    { id: 'salvia', nombre: 'Salvia', muestra: '#8a9a78', variables: {} },
    {
      id: 'terracota',
      nombre: 'Terracota',
      muestra: '#b0704f',
      variables: {
        '--j-salvia': '#b58a6c',
        '--j-salvia-osc': '#7d4f36',
        '--j-hoja': '#c9a489',
        '--j-sello': '#8a3b25',
        '--j-papel': '#f7f1ea',
      },
    },
    {
      id: 'azul-polvo',
      nombre: 'Azul polvo',
      muestra: '#7f93a8',
      variables: {
        '--j-salvia': '#8497ab',
        '--j-salvia-osc': '#4d6178',
        '--j-hoja': '#a9b8c7',
        '--j-sello': '#2f4560',
        '--j-papel': '#f4f5f4',
      },
    },
  ],
};
