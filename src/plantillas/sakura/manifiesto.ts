import type { Manifiesto } from '../tipos';
import { EXTRAS_COMUNES } from '../kit/extras';

export const manifiesto: Manifiesto = {
  slug: 'sakura',
  nombre: 'Sakura',
  descripcion: 'Estilo anime y manga: puertas shoji que se deslizan, viñetas con líneas de velocidad y pétalos de cerezo que caen. Para fans del anime.',
  version: 1,
  visibilidad: 'publica',
  tiposEvento: ['cumpleanos', 'infantil', 'xv'],
  portada: '/ilustraciones/sakura/portada.jpg',
  colorTema: '#fff5f7',
  extras: EXTRAS_COMUNES,
  demo: {
    diasHastaEvento: 26,
    zonaHoraria: 'America/Guayaquil',
    contenido: {
      tipo: 'Fiesta de cumpleaños',
      festejado: { nombre: 'Akemi', edad: 13 },
      frase: 'Capítulo 13: el comienzo de una nueva aventura',
      anfitriones: { titulo: 'Organizan', nombres: ['Familia Torres Ayala'] },
      lugares: [
        { titulo: 'Episodio 1 · La fiesta', hora: '17:00', nombre: 'Café Temático Tanuki', direccion: 'Calle La Ronda 7-40, Quito', mapa: 'https://maps.google.com/?q=La+Ronda+Quito' },
        { titulo: 'Episodio 2 · Karaoke', hora: '19:30', nombre: 'Sala Neo Tokyo', direccion: 'Mismo lugar, segundo piso' },
      ],
      dressCode: { titulo: 'Cosplay', nota: 'Ven como tu personaje favorito o con algo rosa.' },
      galeria: ['/demo/sakura/calle.jpg', '/demo/sakura/noche.jpg', '/demo/sakura/esquina.jpg'],
      despedida: 'Continuará… ¡gracias por ser parte de mi historia!',
      extras: { hashtag: 'Akemi13', historia: 'Cada año es un nuevo arco. Este quiero vivirlo con mis amigos.', regalosTexto: 'Tu presencia es el mejor regalo del capítulo.', lluviaSobres: true },
    },
    confirmacion: { pedirPases: true, pedirMensaje: true, preguntas: [{ id: 'anime', tipo: 'texto', etiqueta: 'Tu anime favorito', obligatoria: false }] },
    invitado: { nombre: 'Sofía y Emi', pases: 2 },
  },
  presets: [
    { id: 'sakura', nombre: 'Cerezo', muestra: '#f29bb2', variables: {} },
    { id: 'noche', nombre: 'Noche de Tokio', muestra: '#6b5bff', variables: { '--sk-rosa': '#8b7bff', '--sk-rojo': '#ff4d8d', '--sk-papel': '#f5f3ff' } },
    { id: 'matcha', nombre: 'Matcha', muestra: '#8fb56b', variables: { '--sk-rosa': '#a9cc85', '--sk-rojo': '#5f8a3b', '--sk-papel': '#f6faf0' } },
  ],
};
