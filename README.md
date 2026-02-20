# SimplePDF Editor (MVP)

Offline-first, non-subscription PDF editor focused on fast common edits.

## Tech choice
Implemented as **Option C: local web app (Vite + React + TypeScript)** using `pdfjs-dist` (rendering) + `pdf-lib` (PDF write/page operations).

## Project structure
- `apps/app` — React + TypeScript app
- `docs` — architecture and tradeoffs
- `test-assets` — sample PDFs (small + large + merge sample)

## MVP checklist (what works)
- [x] Open local PDF
- [x] Reorder pages (drag/drop in thumbnail strip)
- [x] Delete / duplicate / rotate pages (structural PDF edits)
- [x] Insert/Merge another PDF at current position
- [x] Annotation tools: text, highlight, underline, strike, rectangle, arrow, pen, comment
- [x] Whiteout tool (solid filled rectangle)
- [x] Undo/Redo for page operations + annotation add/delete
- [x] Save As export with flattened annotations (clean PDF, no watermark)
- [x] Incremental rendering + virtualized thumbnails for large files

## Non-goals (intentionally not in MVP)
- OCR/scanned-text editing
- Collaboration/accounts/cloud sync
- E-signature workflows
- PDF-to-Word conversion

## Run
```bash
npm install
npm run dev
```
App runs locally only.

## Build
```bash
npm run build
```

## Tests
```bash
npm run test:run
```
Includes:
- Unit tests for page operations (`merge`, `reorder`, `delete`, `rotate`, `duplicate`)
- Smoke test: load PDF -> add text annotation via export pipeline -> reopen

## Security / privacy
- All processing is local in browser runtime.
- No API calls required for core use.
- To verify no network usage during normal editing, open DevTools Network tab and confirm zero requests after initial app load while opening/editing/saving local files.
