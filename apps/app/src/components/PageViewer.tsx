import { useEffect, useMemo, useRef, useState } from 'react';
import { loadPdfDocument } from '../lib/pdfRender';
import type { Annotation, Point, Tool } from '../types/editor';

type Props = {
  pdfBytes: Uint8Array;
  currentPage: number;
  zoom: number;
  annotations: Annotation[];
  activeTool: Tool;
  onAddAnnotation: (annotation: Annotation) => void;
};

function toPdfPoint(p: Point, height: number) {
  return { x: p.x, y: height - p.y };
}

export function PageViewer({ pdfBytes, currentPage, zoom, annotations, activeTool, onAddAnnotation }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [penPoints, setPenPoints] = useState<Point[]>([]);

  useEffect(() => {
    (async () => {
      const doc = await loadPdfDocument(pdfBytes);
      const page = await doc.getPage(currentPage + 1);
      const viewport = page.getViewport({ scale: zoom });
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setSize({ width: viewport.width, height: viewport.height });
      await page.render({ canvasContext: ctx, viewport }).promise;
    })();
  }, [pdfBytes, currentPage, zoom]);

  const pageAnnotations = useMemo(() => annotations.filter((a) => a.pageIndex === currentPage), [annotations, currentPage]);

  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, size.width, size.height);

    for (const ann of pageAnnotations) {
      ctx.strokeStyle = ann.color ?? '#ffcc00';
      ctx.fillStyle = ann.kind === 'whiteout' ? '#fff' : ann.color ?? '#ffcc00';
      const s = ann.start;
      const e = ann.end ?? ann.start;
      if (ann.kind === 'text') {
        ctx.fillText(ann.text || 'Text', s.x, s.y);
      } else if (ann.kind === 'highlight') {
        ctx.globalAlpha = 0.35;
        ctx.fillRect(Math.min(s.x, e.x), Math.min(s.y, e.y), Math.abs(e.x - s.x) || 80, Math.abs(e.y - s.y) || 14);
        ctx.globalAlpha = 1;
      } else if (ann.kind === 'underline' || ann.kind === 'strike' || ann.kind === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
      } else if (ann.kind === 'rectangle' || ann.kind === 'whiteout') {
        ctx.fillRect(Math.min(s.x, e.x), Math.min(s.y, e.y), Math.abs(e.x - s.x), Math.abs(e.y - s.y));
        ctx.strokeRect(Math.min(s.x, e.x), Math.min(s.y, e.y), Math.abs(e.x - s.x), Math.abs(e.y - s.y));
      } else if (ann.kind === 'pen' && ann.points) {
        ctx.beginPath();
        ann.points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.stroke();
      } else if (ann.kind === 'comment') {
        ctx.fillStyle = '#fff27a';
        ctx.fillRect(s.x, s.y - 14, 14, 14);
        ctx.strokeRect(s.x, s.y - 14, 14, 14);
      }
    }
  }, [pageAnnotations, size]);

  const pointer = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const create = (start: Point, end: Point, points?: Point[]) => {
    const id = crypto.randomUUID();
    const note = activeTool === 'text' || activeTool === 'comment' ? window.prompt('Enter text', activeTool === 'comment' ? 'Comment' : 'Text') || undefined : undefined;
    onAddAnnotation({
      id,
      kind: activeTool as Annotation['kind'],
      pageIndex: currentPage,
      start: toPdfPoint(start, size.height),
      end: toPdfPoint(end, size.height),
      points: points?.map((p) => toPdfPoint(p, size.height)),
      text: note,
      color: activeTool === 'whiteout' ? '#ffffff' : '#ffcc00',
    });
  };

  return (
    <div className="viewer">
      <canvas ref={canvasRef} />
      <canvas
        className="overlay"
        ref={overlayRef}
        onMouseDown={(e) => {
          const p = pointer(e);
          setDragStart(p);
          if (activeTool === 'pen') setPenPoints([p]);
        }}
        onMouseMove={(e) => {
          if (activeTool === 'pen' && dragStart) {
            setPenPoints((prev) => [...prev, pointer(e)]);
          }
        }}
        onMouseUp={(e) => {
          const end = pointer(e);
          if (!dragStart || activeTool === 'select') return;
          if (activeTool === 'pen') {
            create(dragStart, end, [...penPoints, end]);
            setPenPoints([]);
          } else {
            create(dragStart, end);
          }
          setDragStart(null);
        }}
      />
    </div>
  );
}
