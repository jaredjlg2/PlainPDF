import { degrees, PDFDocument } from 'pdf-lib';

export async function getPageCount(pdfBytes: Uint8Array): Promise<number> {
  const pdf = await PDFDocument.load(pdfBytes);
  return pdf.getPageCount();
}

export async function reorderPages(pdfBytes: Uint8Array, fromIndex: number, toIndex: number): Promise<Uint8Array> {
  const src = await PDFDocument.load(pdfBytes);
  const out = await PDFDocument.create();
  const count = src.getPageCount();
  const order = Array.from({ length: count }, (_, i) => i);
  const [item] = order.splice(fromIndex, 1);
  order.splice(toIndex, 0, item);
  const copied = await out.copyPages(src, order);
  copied.forEach((p) => out.addPage(p));
  return out.save();
}

export async function deletePage(pdfBytes: Uint8Array, index: number): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);
  doc.removePage(index);
  return doc.save();
}

export async function duplicatePage(pdfBytes: Uint8Array, index: number): Promise<Uint8Array> {
  const src = await PDFDocument.load(pdfBytes);
  const out = await PDFDocument.create();
  const order = Array.from({ length: src.getPageCount() }, (_, i) => i);
  order.splice(index + 1, 0, index);
  const copied = await out.copyPages(src, order);
  copied.forEach((p) => out.addPage(p));
  return out.save();
}

export async function rotatePage(pdfBytes: Uint8Array, index: number, delta: number): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);
  const page = doc.getPage(index);
  const current = page.getRotation().angle;
  page.setRotation(degrees((current + delta + 360) % 360));
  return doc.save();
}

export async function mergePdfAt(baseBytes: Uint8Array, insertBytes: Uint8Array, atIndex: number): Promise<Uint8Array> {
  const base = await PDFDocument.load(baseBytes);
  const insert = await PDFDocument.load(insertBytes);
  const out = await PDFDocument.create();

  const before = Array.from({ length: atIndex }, (_, i) => i);
  const after = Array.from({ length: base.getPageCount() - atIndex }, (_, i) => atIndex + i);
  const beforePages = await out.copyPages(base, before);
  beforePages.forEach((p) => out.addPage(p));
  const insertedPages = await out.copyPages(insert, insert.getPageIndices());
  insertedPages.forEach((p) => out.addPage(p));
  const afterPages = await out.copyPages(base, after);
  afterPages.forEach((p) => out.addPage(p));

  return out.save();
}
