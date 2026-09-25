import qrcode from 'qrcode-generator';

/**
 * QR en SVG. Siempre negro sobre blanco con margen: los lectores de la entrada
 * fallan con QR invertidos o de bajo contraste, sea cual sea la plantilla.
 */
export function qrSvg(texto: string, etiqueta = 'Código QR'): string {
  const qr = qrcode(0, 'M');
  qr.addData(texto);
  qr.make();

  const n = qr.getModuleCount();
  const margen = 2;
  let d = '';
  for (let fila = 0; fila < n; fila++) {
    for (let col = 0; col < n; col++) {
      if (qr.isDark(fila, col)) d += `M${col + margen},${fila + margen}h1v1h-1z`;
    }
  }
  const lado = n + margen * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lado} ${lado}" role="img" aria-label="${etiqueta}" shape-rendering="crispEdges"><rect width="${lado}" height="${lado}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}
