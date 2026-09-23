# Ilustraciones

## Flujo

1. Mandas el prompt a la IA generadora (la que tiene el estilo sticker infantil).
2. Recortas el fondo en Photoshop y exportas **PNG con canal alfa**.
3. Lo guardas en `public/ilustraciones/<tema>/<nombre>.png`.
4. Cambias la extensión en la constante `ILUSTRACIONES` del tema.

El fondo blanco del prompt original **no sirve tal cual**: estas invitaciones
tienen fondos oscuros, y un PNG con blanco se ve como un recuadro pegado encima.
Por eso el paso 2 no es opcional.

### Exportar bien

- **Tamaño**: la ilustración más grande se ve a ~360 px de ancho en pantalla.
  Exporta a 1080 px de ancho: cubre pantallas a 3x y Astro genera el resto.
- **Recorte**: ajustado al contenido, sin márgenes blancos sobrantes. El margen
  vacío desplaza el punto de anclaje de las animaciones.
- **Sombras**: ninguna en el PNG. Las pone el CSS con `drop-shadow`, que sigue
  el contorno real de la figura y se adapta al fondo de cada tema.

### Sobre personajes con derechos

Si pides "Spiderman" la IA probablemente se niegue. Describe al personaje por
sus rasgos —traje rojo y azul, máscara con ojos blancos— y no lo nombres. Los
prompts de abajo ya están escritos así.

---

## Tema arácnido

Paleta del tema: `#E23636` `#9C1D1D` `#2E4DA7` `#1B2A6B` `#F5C451` `#F3F0EA`

### 1. heroe-colgado.png — **la que se usa ahora**

Es la ilustración principal: baja colgada del hilo mientras el invitado hace
scroll. Requisito crítico: **la mano que agarra debe quedar en el borde superior
de la imagen, centrada horizontalmente**. Ahí es donde el código la ancla al hilo.

```
heroe-colgado.png

Pequeño héroe infantil colgando boca abajo de un hilo, visto de frente.
Un brazo completamente estirado hacia arriba, con la mano cerrada en el
borde superior de la imagen y centrada horizontalmente. El cuerpo cuelga
relajado debajo, con las piernas ligeramente dobladas y el otro brazo
suelto hacia un costado. Traje ajustado rojo #E23636 en torso, brazos y
capucha, con pantalón azul #2E4DA7 en las piernas. Máscara que cubre toda
la cara, sin boca ni nariz, con dos ojos grandes en forma de gota
#F3F0EA delineados en negro. Proporción cabezona y tierna, estilo
personaje de dibujo animado para niños. Formato vertical 1080x1500 px.
```

### 2. pastel-telarana.png

```
pastel-telarana.png

Pastel de cumpleaños de dos pisos decorado con un patrón de telaraña.
Betún rojo #E23636 en el piso inferior y azul #2E4DA7 en el superior,
con los hilos de telaraña trazados en crema #F3F0EA. Una vela encendida
dorada #F5C451 en la punta, con la llama pequeña. Visto ligeramente
desde arriba. Formato cuadrado 1080x1080 px.
```

### 3. globos-heroe.png

```
globos-heroe.png

Racimo de cinco globos flotando, con los cordeles sueltos colgando hacia
abajo y ligeramente curvados por el aire. Tres globos rojo #E23636 y dos
azul #2E4DA7. Uno de los globos rojos tiene un patrón sutil de telaraña
en crema #F3F0EA. Los cordeles en crema. Formato vertical 1080x1500 px.
```

### 4. mascara.png

```
mascara.png

Máscara de héroe arácnido vista de frente, sola, sin cabeza dentro.
Tela roja #E23636 con las costuras marcadas en un patrón de telaraña
sutil en rojo oscuro #9C1D1D. Dos ojos grandes en forma de gota, crema
#F3F0EA, con un borde negro definido. Sin boca ni nariz. Ligeramente
inclinada hacia un lado, como si estuviera apoyada. Formato cuadrado
1080x1080 px.
```

### 5. ciudad-nocturna.png

Pensada para el fondo de la sección de ubicación.

```
ciudad-nocturna.png

Silueta de horizonte urbano nocturno, solo los contornos de los edificios
alineados en una franja horizontal. Edificios en azul oscuro #1B2A6B con
ventanas encendidas en dorado #F5C451 salpicadas de forma irregular.
Alturas variadas, estilo simple y geométrico, sin detalle arquitectónico.
Formato panorámico 1920x700 px.
```
