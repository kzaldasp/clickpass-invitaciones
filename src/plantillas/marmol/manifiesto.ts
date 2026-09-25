import type { Manifiesto } from '../tipos';
import { EXTRAS_COMUNES } from '../kit/extras';

export const manifiesto: Manifiesto = {
  slug: 'marmol',
  nombre: 'Mármol',
  descripcion: 'Moderna y minimalista: una tarjeta que sale de su funda negra, textura de mármol, pan de oro que brilla y fotos en blanco y negro.',
  version: 1,
  visibilidad: 'publica',
  tiposEvento: ['boda', 'aniversario', 'corporativo'],
  portada: '/ilustraciones/marmol/portada.jpg',
  colorTema: '#f4f2ee',
  extras: EXTRAS_COMUNES,
  demo: {
    diasHastaEvento: 95,
    zonaHoraria: 'America/Guayaquil',
    contenido: {
      tipo: 'Nos casamos',
      festejado: { nombre: 'Camila & Nicolás' },
      frase: 'Menos, pero para siempre',
      anfitriones: { titulo: 'Junto a nuestros padres', nombres: ['Hugo Vela y Rosa Ortiz', 'Marco Espinosa y Inés Lara'] },
      lugares: [
        { titulo: 'Ceremonia civil', hora: '17:30', nombre: 'Casa Gangotena', direccion: 'Bolívar Oe6-41, Plaza San Francisco, Quito', mapa: 'https://maps.google.com/?q=Casa+Gangotena+Quito' },
        { titulo: 'Cena y fiesta', hora: '19:00', nombre: 'Terraza Gangotena', direccion: 'Mismo lugar, último piso' },
      ],
      dressCode: { titulo: 'Black tie', nota: 'Negro, blanco y dorado son bienvenidos.' },
      galeria: ['/demo/marmol/ceremonia-bn.jpg', '/demo/marmol/ramo.jpg', '/demo/marmol/orilla.jpg'],
      despedida: 'Gracias por ser parte de nuestro sí',
      extras: { hashtag: 'CamiYNico', historia: 'Nos gustan las cosas simples y bien hechas. Por eso queremos celebrar con pocas personas, las más importantes.', regalosTexto: 'Su compañía es el mejor regalo. Si desean tener un detalle, les dejamos estas opciones.', datosBancarios: 'Banco Pichincha · Ahorros\n2200000000\nCamila Vela · CI 1700000000' },
    },
    confirmacion: { pedirPases: true, pedirMensaje: true, preguntas: [{ id: 'menu', tipo: 'opcion', etiqueta: 'Menú', opciones: ['Carne', 'Pescado', 'Vegetariano'], obligatoria: true }] },
    invitado: { nombre: 'Familia Andrade', pases: 2 },
  },
  presets: [
    { id: 'oro', nombre: 'Blanco y oro', muestra: '#b89a5a', variables: {} },
    { id: 'plata', nombre: 'Blanco y plata', muestra: '#9aa0a6', variables: { '--ma-oro': '#8f969d', '--ma-oro-claro': '#e4e7ea' } },
    { id: 'verde', nombre: 'Verde esmeralda', muestra: '#1f5a4a', variables: { '--ma-negro': '#123a30', '--ma-oro': '#b89a5a' } },
  ],
};
