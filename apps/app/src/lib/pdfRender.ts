import * as pdfjsLib from 'pdfjs-dist';
// @ts-expect-error vite asset url
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export async function loadPdfDocument(bytes: Uint8Array) {
  const loadingTask = pdfjsLib.getDocument({ data: bytes });
  return loadingTask.promise;
}
