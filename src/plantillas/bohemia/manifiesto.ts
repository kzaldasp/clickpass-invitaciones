import type { Manifiesto } from '../tipos';
import { EXTRAS_COMUNES } from '../kit/extras';

export const manifiesto: Manifiesto = {
  slug: 'bohemia',
  nombre: 'Bohemia',
  descripcion: 'Boho y cálida: papel vegetal que se levanta, un arco con sol, pampas que se mecen con el viento y tonos terracota. Para bodas al aire libre.',
  version: 1,
  visibilidad: 'publica',
  tiposEvento: ['boda', 'aniversario', 'baby_shower'],
  portada: '/ilustraciones/bohemia/portada.jpg',
  colorTema: '#f3ebe0',
  extras: EXTRAS_COMUNES,
  demo: {
    diasHastaEvento: 88,
    zonaHoraria: 'America/Guayaquil',
    contenido: {
      tipo: 'Nos casamos',
      festejado: { nombre: 'Emilia & Joaquín' },
      frase: 'Bajo el sol de la tarde, entre amigos y flores secas',
      anfitriones: { titulo: 'Con el cariño de nuestras familias', nombres: ['Familia Cordero Ríos', 'Familia Salgado Mejía'] },
      lugares: [
        { titulo: 'Ceremonia al aire libre', hora: '16:00', nombre: 'Hacienda El Refugio', direccion: 'Vía a Puembo km 4, Quito', mapa: 'https://maps.google.com/?q=Puembo' },
        { titulo: 'Fiesta', hora: '18:00', nombre: 'El granero de la hacienda', direccion: 'Mismo lugar' },
      ],
      dressCode: { titulo: 'Boho chic', nota: 'Tonos tierra, lino y comodidad: la ceremonia es sobre césped.' },
      galeria: ['/demo/bohemia/pareja.jpg', '/demo/bohemia/ramo.jpg', '/demo/bohemia/atardecer.jpg'],
      despedida: 'Gracias por ser parte de nuestra tribu',
      extras: { hashtag: 'EmiYJoaco', historia: 'Nos conocimos en un festival de música. Queremos celebrar igual: al aire libre, descalzos y con todos ustedes.', regalosTexto: 'Su compañía es el mejor regalo. Para nuestra aventura juntos:', datosBancarios: 'Banco Pichincha · Ahorros\n2200000001\nEmilia Cordero · CI 1700000002', lluviaSobres: true },
    },
    confirmacion: { pedirPases: true, pedirMensaje: true, preguntas: [{ id: 'alergias', tipo: 'texto', etiqueta: '¿Alguna alergia o restricción?', obligatoria: false }] },
    invitado: { nombre: 'Familia Granda', pases: 4 },
  },
  presets: [
    { id: 'terracota', nombre: 'Terracota', muestra: '#c0714f', variables: {} },
    { id: 'salvia', nombre: 'Salvia y arena', muestra: '#8b9a78', variables: { '--bo-terracota': '#8b9a78', '--bo-arcilla': '#5d6b4c' } },
    { id: 'mostaza', nombre: 'Mostaza', muestra: '#c99a3a', variables: { '--bo-terracota': '#c99a3a', '--bo-arcilla': '#8a6420' } },
  ],
};
