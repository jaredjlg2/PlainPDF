import { create } from 'zustand';
import type { Annotation, Tool } from '../types/editor';

type Snapshot = {
  pdfBytes: Uint8Array | null;
  pageCount: number;
  annotations: Annotation[];
};

type EditorState = Snapshot & {
  currentPage: number;
  zoom: number;
  activeTool: Tool;
  undoStack: Snapshot[];
  redoStack: Snapshot[];
  setPdf: (bytes: Uint8Array, pageCount: number) => void;
  setCurrentPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  setTool: (tool: Tool) => void;
  updatePdf: (bytes: Uint8Array, pageCount: number) => void;
  addAnnotation: (annotation: Annotation) => void;
  deleteAnnotation: (id: string) => void;
  clearRedo: () => void;
  undo: () => void;
  redo: () => void;
};

const snapshot = (s: EditorState): Snapshot => ({ pdfBytes: s.pdfBytes, pageCount: s.pageCount, annotations: s.annotations });

export const useEditorStore = create<EditorState>((set, get) => ({
  pdfBytes: null,
  pageCount: 0,
  annotations: [],
  currentPage: 0,
  zoom: 1,
  activeTool: 'select',
  undoStack: [],
  redoStack: [],
  setPdf: (bytes, pageCount) =>
    set({ pdfBytes: bytes, pageCount, currentPage: 0, annotations: [], undoStack: [], redoStack: [] }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setZoom: (zoom) => set({ zoom }),
  setTool: (activeTool) => set({ activeTool }),
  clearRedo: () => set({ redoStack: [] }),
  updatePdf: (bytes, pageCount) => {
    const state = get();
    set({
      pdfBytes: bytes,
      pageCount,
      undoStack: [...state.undoStack, snapshot(state)],
      redoStack: [],
      currentPage: Math.min(state.currentPage, pageCount - 1),
    });
  },
  addAnnotation: (annotation) => {
    const state = get();
    set({
      annotations: [...state.annotations, annotation],
      undoStack: [...state.undoStack, snapshot(state)],
      redoStack: [],
    });
  },
  deleteAnnotation: (id) => {
    const state = get();
    set({
      annotations: state.annotations.filter((a) => a.id !== id),
      undoStack: [...state.undoStack, snapshot(state)],
      redoStack: [],
    });
  },
  undo: () => {
    const state = get();
    const previous = state.undoStack[state.undoStack.length - 1];
    if (!previous) return;
    const current = snapshot(state);
    set({
      pdfBytes: previous.pdfBytes,
      pageCount: previous.pageCount,
      annotations: previous.annotations,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, current],
      currentPage: Math.min(state.currentPage, Math.max(0, previous.pageCount - 1)),
    });
  },
  redo: () => {
    const state = get();
    const next = state.redoStack[state.redoStack.length - 1];
    if (!next) return;
    const current = snapshot(state);
    set({
      pdfBytes: next.pdfBytes,
      pageCount: next.pageCount,
      annotations: next.annotations,
      undoStack: [...state.undoStack, current],
      redoStack: state.redoStack.slice(0, -1),
      currentPage: Math.min(state.currentPage, Math.max(0, next.pageCount - 1)),
    });
  },
}));
