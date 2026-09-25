import type { Manifiesto } from '../tipos';
import { EXTRAS_COMUNES } from '../kit/extras';

export const manifiesto: Manifiesto = {
  slug: 'lucha',
  nombre: 'Lucha',
  descripcion: 'Lucha libre: suena la campana, las cuerdas del ring se abren, reflectores, un cinturón de campeón con tu nombre y un ¡K.O.! final. Sin marcas ni luchadores reales.',
  version: 1,
  visibilidad: 'publica',
  tiposEvento: ['infantil', 'cumpleanos'],
  portada: '/ilustraciones/lucha/portada.jpg',
  colorTema: '#0c0c0f',
  extras: EXTRAS_COMUNES,
  demo: {
    diasHastaEvento: 24,
    zonaHoraria: 'America/Guayaquil',
    contenido: {
      tipo: 'La pelea del año',
      festejado: { nombre: 'Santiago', edad: 9 },
      frase: 'Nueve años invicto. ¿Quién se atreve a subir al ring?',
      anfitriones: { titulo: 'Promotores de la velada', nombres: ['Ricardo Paz y Verónica Cano'] },
      lugares: [
        { titulo: 'Entrada al ring', hora: '16:00', nombre: 'Coliseo Kids Arena', direccion: 'Av. Eloy Alfaro N35-09, Quito', mapa: 'https://maps.google.com/?q=Eloy+Alfaro+Quito' },
        { titulo: 'Pelea estelar (y pastel)', hora: '17:30', nombre: 'Ring central', direccion: 'Mismo lugar' },
      ],
      dressCode: { titulo: '¡Trae tu máscara!', nota: 'Ven con tu máscara, capa o licra de luchador. Habrá premio a la mejor entrada.' },
      galeria: ['/demo/lucha/ring.jpg', '/demo/lucha/combate.jpg'],
      despedida: '¡Gracias por venir a la pelea del año!',
      extras: { hashtag: 'SantiagoCampeon9', regalosTexto: 'Tu presencia es mi mejor cinturón.' },
    },
    confirmacion: { pedirPases: true, pedirMensaje: false, preguntas: [{ id: 'nombreLuchador', tipo: 'texto', etiqueta: 'Tu nombre de luchador', obligatoria: false }] },
    invitado: { nombre: 'El Rayo Martín', pases: 2 },
  },
  presets: [
    { id: 'rojo', nombre: 'Rojo y oro', muestra: '#d7263d', variables: {} },
    { id: 'azul', nombre: 'Azul eléctrico', muestra: '#2d6bff', variables: { '--lu-rojo': '#2d6bff', '--lu-rojo-osc': '#173a99' } },
    { id: 'verde', nombre: 'Verde y oro', muestra: '#1fa35c', variables: { '--lu-rojo': '#1fa35c', '--lu-rojo-osc': '#0f5c33' } },
  ],
};
