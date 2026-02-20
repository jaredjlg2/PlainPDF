import type { Tool } from '../types/editor';

type Props = {
  onOpen: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onRotate: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onInsert: () => void;
  onMerge: () => void;
  activeTool: Tool;
  setTool: (tool: Tool) => void;
};

const tools: Tool[] = ['select', 'text', 'highlight', 'underline', 'strike', 'rectangle', 'arrow', 'pen', 'comment', 'whiteout'];

export function Toolbar(props: Props) {
  return (
    <header className="toolbar">
      <button onClick={props.onOpen}>Open PDF</button>
      <button onClick={props.onSave}>Save As</button>
      <button onClick={props.onUndo}>Undo</button>
      <button onClick={props.onRedo}>Redo</button>
      <button onClick={props.onRotate}>Rotate</button>
      <button onClick={props.onDelete}>Delete</button>
      <button onClick={props.onDuplicate}>Duplicate</button>
      <button onClick={props.onInsert}>Insert from PDF</button>
      <button onClick={props.onMerge}>Merge PDF</button>
      <div className="tools">
        {tools.map((tool) => (
          <button key={tool} className={tool === props.activeTool ? 'active' : ''} onClick={() => props.setTool(tool)}>
            {tool}
          </button>
        ))}
      </div>
    </header>
  );
}
