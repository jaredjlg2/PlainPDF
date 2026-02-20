export type Tool =
  | 'select'
  | 'text'
  | 'highlight'
  | 'underline'
  | 'strike'
  | 'rectangle'
  | 'arrow'
  | 'pen'
  | 'comment'
  | 'whiteout';

export type Point = { x: number; y: number };

export type AnnotationKind = Exclude<Tool, 'select'>;

export type Annotation = {
  id: string;
  kind: AnnotationKind;
  pageIndex: number;
  start: Point;
  end?: Point;
  points?: Point[];
  text?: string;
  color?: string;
};
