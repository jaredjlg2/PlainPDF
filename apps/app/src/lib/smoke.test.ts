import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { exportWithAnnotations } from './exportPdf';

describe('smoke export flow', () => {
  it('loads pdf, adds text annotation, exports and reopens', async () => {
    const base = new Uint8Array(readFileSync(resolve(__dirname, '../../../../test-assets/sample-small.pdf')));
    const out = await exportWithAnnotations(base, [
      {
        id: '1',
        kind: 'text',
        pageIndex: 0,
        start: { x: 50, y: 700 },
        text: 'Hello MVP',
        color: '#000000',
      },
    ]);

    expect(out.byteLength).toBeGreaterThan(base.byteLength);
    const reopened = await PDFDocument.load(out);
    expect(reopened.getPageCount()).toBe(3);
  });
});
