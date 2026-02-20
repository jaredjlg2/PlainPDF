import { rgb, PDFDocument, StandardFonts } from 'pdf-lib';
import type { Annotation } from '../types/editor';

function hexToRgb(hex: string) {
  const value = hex.replace('#', '');
  const bigint = Number.parseInt(value, 16);
  return rgb(((bigint >> 16) & 255) / 255, ((bigint >> 8) & 255) / 255, (bigint & 255) / 255);
}

export async function exportWithAnnotations(pdfBytes: Uint8Array, annotations: Annotation[]): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);

  for (const ann of annotations) {
    const page = doc.getPage(ann.pageIndex);
    if (!page) continue;
    const color = hexToRgb(ann.color ?? '#ffcc00');
    const s = ann.start;
    const e = ann.end ?? ann.start;
    const x = Math.min(s.x, e.x);
    const y = Math.min(s.y, e.y);
    const w = Math.abs(e.x - s.x);
    const h = Math.abs(e.y - s.y);

    if (ann.kind === 'text') {
      page.drawText(ann.text || 'Text', { x: s.x, y: s.y, size: 14, font, color });
    } else if (ann.kind === 'highlight') {
      page.drawRectangle({ x, y, width: w || 80, height: h || 14, color, opacity: 0.35 });
    } else if (ann.kind === 'underline') {
      page.drawLine({ start: { x: s.x, y: s.y }, end: { x: e.x || s.x + 80, y: s.y }, thickness: 2, color });
    } else if (ann.kind === 'strike') {
      page.drawLine({ start: { x: s.x, y: s.y }, end: { x: e.x || s.x + 80, y: s.y }, thickness: 2, color });
    } else if (ann.kind === 'rectangle' || ann.kind === 'whiteout') {
      page.drawRectangle({
        x,
        y,
        width: w || 80,
        height: h || 50,
        color: ann.kind === 'whiteout' ? rgb(1, 1, 1) : undefined,
        borderColor: ann.kind === 'whiteout' ? rgb(0.8, 0.8, 0.8) : color,
        borderWidth: 1,
        opacity: ann.kind === 'whiteout' ? 1 : 0.15,
      });
    } else if (ann.kind === 'arrow') {
      page.drawLine({ start: { x: s.x, y: s.y }, end: { x: e.x, y: e.y }, thickness: 2, color });
      page.drawLine({ start: { x: e.x, y: e.y }, end: { x: e.x - 8, y: e.y + 4 }, thickness: 2, color });
      page.drawLine({ start: { x: e.x, y: e.y }, end: { x: e.x - 8, y: e.y - 4 }, thickness: 2, color });
    } else if (ann.kind === 'pen' && ann.points && ann.points.length > 1) {
      for (let i = 1; i < ann.points.length; i += 1) {
        page.drawLine({ start: ann.points[i - 1], end: ann.points[i], thickness: 2, color });
      }
    } else if (ann.kind === 'comment') {
      page.drawRectangle({ x: s.x, y: s.y, width: 14, height: 14, color: rgb(1, 0.95, 0.4), borderColor: rgb(0.2, 0.2, 0.2), borderWidth: 1 });
      page.drawText(ann.text || 'Comment', { x: s.x + 18, y: s.y + 3, size: 10, font, color: rgb(0.1, 0.1, 0.1) });
    }
  }

  return doc.save();
}
