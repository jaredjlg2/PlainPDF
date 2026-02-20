# SimplePDF Editor Architecture

## Chosen stack
Option C: **Local web app (Vite + React + TypeScript)**.

Why for MVP:
- Fastest path to a fully offline-capable editor without desktop wrapper overhead.
- PDF parsing/rendering and writes stay in-browser (`pdfjs-dist` + `pdf-lib`) so no upload path exists.
- Easy future path to Electron/Tauri wrapper if native installer is required.

## Core modules
- `src/lib/pdfOps.ts`: page-structure operations (reorder/delete/duplicate/rotate/merge).
- `src/lib/exportPdf.ts`: annotation/whiteout flattening onto pages during export.
- `src/state/editorStore.ts`: Zustand state + command-style undo/redo snapshots.
- `src/components/ThumbnailSidebar.tsx`: virtualized page strip (`react-window`) with drag/drop reorder.
- `src/components/PageViewer.tsx`: render current page and annotation overlay.

## Performance strategy
- Virtualized thumbnails (only visible rows mount).
- Main page view renders only active page.
- Thumbnails are generated incrementally (first 40 pages eagerly).

## Tradeoffs
- Annotations are maintained in editable app state and flattened on export for compatibility.
- MVP comment tool renders note visuals/text rather than full threaded PDF comment objects.
