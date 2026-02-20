import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { deletePage, duplicatePage, getPageCount, mergePdfAt, reorderPages, rotatePage } from './pdfOps';

const small = new Uint8Array(readFileSync(resolve(__dirname, '../../../../test-assets/sample-small.pdf')));
const merge = new Uint8Array(readFileSync(resolve(__dirname, '../../../../test-assets/sample-merge.pdf')));

describe('page operations', () => {
  it('reorders pages', async () => {
    const result = await reorderPages(small, 0, 2);
    expect(await getPageCount(result)).toBe(3);
  });

  it('deletes pages', async () => {
    const result = await deletePage(small, 1);
    expect(await getPageCount(result)).toBe(2);
  });

  it('duplicates page', async () => {
    const result = await duplicatePage(small, 1);
    expect(await getPageCount(result)).toBe(4);
  });

  it('rotates page', async () => {
    const result = await rotatePage(small, 0, 90);
    const doc = await PDFDocument.load(result);
    expect(doc.getPage(0).getRotation().angle).toBe(90);
  });

  it('merges at insertion index', async () => {
    const result = await mergePdfAt(small, merge, 1);
    expect(await getPageCount(result)).toBe(5);
  });
});
