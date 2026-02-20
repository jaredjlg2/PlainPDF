import { useEffect, useMemo, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { loadPdfDocument } from '../lib/pdfRender';

type Props = {
  pdfBytes: Uint8Array;
  pageCount: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onReorder: (from: number, to: number) => void;
};

export function ThumbnailSidebar({ pdfBytes, pageCount, currentPage, setCurrentPage, onReorder }: Props) {
  const [thumbs, setThumbs] = useState<Record<number, string>>({});

  useEffect(() => {
    let active = true;
    setThumbs({});

    (async () => {
      const doc = await loadPdfDocument(pdfBytes);
      const firstPages = Array.from({ length: pageCount }, (_, i) => i).slice(0, 40);
      for (const i of firstPages) {
        const page = await doc.getPage(i + 1);
        const viewport = page.getViewport({ scale: 0.25 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport }).promise;
        if (!active) break;
        setThumbs((prev) => ({ ...prev, [i]: canvas.toDataURL('image/png') }));
      }
    })();

    return () => {
      active = false;
    };
  }, [pdfBytes, pageCount]);

  const items = useMemo(() => Array.from({ length: pageCount }, (_, i) => i), [pageCount]);

  return (
    <aside className="sidebar">
      <List width={180} height={window.innerHeight - 70} itemCount={items.length} itemSize={120}>
        {({ index, style }) => (
          <div
            style={style}
            className={`thumb ${currentPage === index ? 'selected' : ''}`}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', String(index))}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const from = Number(e.dataTransfer.getData('text/plain'));
              onReorder(from, index);
            }}
            onClick={() => setCurrentPage(index)}
          >
            {thumbs[index] ? <img src={thumbs[index]} alt={`Page ${index + 1}`} /> : <div className="thumb-placeholder">Page {index + 1}</div>}
            <small>{index + 1}</small>
          </div>
        )}
      </List>
    </aside>
  );
}
