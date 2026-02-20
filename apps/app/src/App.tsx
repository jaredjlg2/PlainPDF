import { useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { ThumbnailSidebar } from './components/ThumbnailSidebar';
import { PageViewer } from './components/PageViewer';
import { useEditorStore } from './state/editorStore';
import { deletePage, duplicatePage, getPageCount, mergePdfAt, reorderPages, rotatePage } from './lib/pdfOps';
import { exportWithAnnotations } from './lib/exportPdf';

export default function App() {
  const fileRef = useRef<HTMLInputElement>(null);
  const mergeRef = useRef<HTMLInputElement>(null);
  const {
    pdfBytes,
    pageCount,
    currentPage,
    setCurrentPage,
    zoom,
    setZoom,
    activeTool,
    setTool,
    annotations,
    setPdf,
    updatePdf,
    addAnnotation,
    undo,
    redo,
  } = useEditorStore();

  const loadFile = async (file: File | undefined | null) => {
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const count = await getPageCount(bytes);
    setPdf(bytes, count);
  };

  const saveAs = async () => {
    if (!pdfBytes) return;
    const out = await exportWithAnnotations(pdfBytes, annotations);
    const blob = new Blob([out], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const apply = async (fn: (bytes: Uint8Array) => Promise<Uint8Array>) => {
    if (!pdfBytes) return;
    const out = await fn(pdfBytes);
    const count = await getPageCount(out);
    updatePdf(out, count);
  };

  return (
    <div className="app">
      <Toolbar
        onOpen={() => fileRef.current?.click()}
        onSave={saveAs}
        onUndo={undo}
        onRedo={redo}
        onRotate={() => apply((b) => rotatePage(b, currentPage, 90))}
        onDelete={() => apply((b) => deletePage(b, currentPage))}
        onDuplicate={() => apply((b) => duplicatePage(b, currentPage))}
        onInsert={() => mergeRef.current?.click()}
        onMerge={() => mergeRef.current?.click()}
        activeTool={activeTool}
        setTool={setTool}
      />
      <input ref={fileRef} type="file" accept="application/pdf" hidden onChange={(e) => loadFile(e.target.files?.[0])} />
      <input
        ref={mergeRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={async (e) => {
          if (!pdfBytes || !e.target.files?.[0]) return;
          const insertBytes = new Uint8Array(await e.target.files[0].arrayBuffer());
          await apply((b) => mergePdfAt(b, insertBytes, currentPage + 1));
        }}
      />
      {!pdfBytes ? (
        <main className="empty">Open a PDF to start editing.</main>
      ) : (
        <main className="workspace">
          <ThumbnailSidebar
            pdfBytes={pdfBytes}
            pageCount={pageCount}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onReorder={(from, to) => apply((b) => reorderPages(b, from, to))}
          />
          <section className="main-pane">
            <div className="zoom-row">
              <button onClick={() => setZoom(Math.max(0.4, zoom - 0.1))}>-</button>
              <span>{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(Math.min(3, zoom + 0.1))}>+</button>
              <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}>Prev</button>
              <button onClick={() => setCurrentPage(Math.min(pageCount - 1, currentPage + 1))}>Next</button>
            </div>
            <PageViewer
              pdfBytes={pdfBytes}
              currentPage={currentPage}
              zoom={zoom}
              annotations={annotations}
              activeTool={activeTool}
              onAddAnnotation={addAnnotation}
            />
          </section>
        </main>
      )}
    </div>
  );
}
