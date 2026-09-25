import type { Manifiesto } from '../tipos';
import { EXTRAS_COMUNES } from '../kit/extras';

export const manifiesto: Manifiesto = {
  slug: 'heroico',
  nombre: 'Heroico',
  descripcion: 'Estilo cómic: una portada de revista que se rasga, onomatopeyas que explotan y viñetas con trama de puntos. Para pequeños superhéroes.',
  version: 1,
  visibilidad: 'publica',
  tiposEvento: ['infantil', 'cumpleanos'],
  portada: '/ilustraciones/heroico/portada.jpg',
  colorTema: '#ffd23f',
  extras: EXTRAS_COMUNES,
  demo: {
    diasHastaEvento: 30,
    zonaHoraria: 'America/Guayaquil',
    contenido: {
      tipo: '¡Súper cumpleaños!',
      festejado: { nombre: 'Tomás', edad: 7 },
      frase: 'Todo héroe necesita a su equipo. ¡Tú eres parte del mío!',
      anfitriones: { titulo: 'La base secreta la organizan', nombres: ['Pablo Rivera y Andrea Ruiz'] },
      lugares: [
        { titulo: 'Cuartel general', hora: '16:00', nombre: 'Parque de Trampolines Salto Alto', direccion: 'Av. Simón Bolívar y Ruta Viva, Quito', mapa: 'https://maps.google.com/?q=Ruta+Viva+Quito' },
      ],
      dressCode: { titulo: '¡Con capa!', nota: 'Ven con tu traje de héroe. Habrá premio al disfraz más original.' },
      galeria: ['/demo/heroico/pastel.jpg'],
      despedida: '¡Misión cumplida! Gracias por venir',
      extras: { hashtag: 'ElEquipoDeTomas', regalosTexto: 'Tu presencia es mi mejor superpoder.' },
    },
    confirmacion: { pedirPases: true, pedirMensaje: false, preguntas: [{ id: 'poder', tipo: 'opcion', etiqueta: 'Tu superpoder favorito', opciones: ['Volar', 'Súper fuerza', 'Invisibilidad', 'Velocidad'], obligatoria: false }] },
    invitado: { nombre: 'Agente Mateo', pases: 2 },
  },
  presets: [
    { id: 'clasico', nombre: 'Rojo, azul y amarillo', muestra: '#e63946', variables: {} },
    { id: 'verde', nombre: 'Verde y morado', muestra: '#3fae49', variables: { '--he-rojo': '#3fae49', '--he-azul': '#6c3fb5', '--he-amarillo': '#c7f464' } },
    { id: 'noche', nombre: 'Negro y dorado', muestra: '#f4b400', variables: { '--he-rojo': '#f4b400', '--he-azul': '#222', '--he-amarillo': '#fff2c2' } },
  ],
};
