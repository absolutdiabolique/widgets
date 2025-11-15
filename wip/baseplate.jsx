# baseplate.jsx
# baseplate for others

const GRID_COLS = 10;
const GRID_ROWS = 6;
const GRID_WIDTH = 1512;
const GRID_HEIGHT = 948;
const CELL_WIDTH = GRID_WIDTH / GRID_COLS;
const CELL_HEIGHT = GRID_HEIGHT / GRID_ROWS;

// Widget size
const WIDGET_COLS = 1;
const WIDGET_ROWS = 1;

// Drag state
let dragging = false;
let dragOffset = { x: 0, y: 0 };
let dragPosition = { x: 0, y: CELL_HEIGHT * 5 };
let element = null;

export const command = () => "";
export const refreshFrequency = 10000;

export const render = () => {
  const fontFamily = '"Courier New", monospace';
  let currentPage = 0;

  const containerStyle = {
    position: 'absolute',
    width: `${CELL_WIDTH * (WIDGET_COLS - 0.2)}px`,
    height: `${CELL_HEIGHT * (WIDGET_ROWS - 0.2)}px`,
    borderRadius: '25px',
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(6px) saturate(160%)',
    WebkitBackdropFilter: 'blur(6px) saturate(160%)',
    boxShadow: '0 0 12px rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    overflow: 'hidden',
    cursor: dragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    willChange: 'transform',
    transform: `translate(${dragPosition.x + CELL_WIDTH * 0.1}px, ${dragPosition.y + CELL_HEIGHT * 0.1}px)`,
    transition: dragging ? 'none' : 'transform 0.2s ease-out',
  };

  const updateTransform = () => {
    if (element)
      element.style.transform = `translate(${dragPosition.x + CELL_WIDTH * 0.1}px, ${dragPosition.y + CELL_HEIGHT * 0.1}px)`;
  };

  const onPointerDown = (e) => {
    if (e.target.tagName === "A" || e.target.tagName === "IMG") return;
    dragging = true;
    dragOffset = { x: e.clientX - dragPosition.x, y: e.clientY - dragPosition.y };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    dragPosition.x = e.clientX - dragOffset.x;
    dragPosition.y = e.clientY - dragOffset.y;
    requestAnimationFrame(updateTransform);
  };

  const onPointerUp = () => {
    if (dragging) {
      dragPosition.x = Math.round(dragPosition.x / CELL_WIDTH) * CELL_WIDTH;
      dragPosition.y = Math.round(dragPosition.y / CELL_HEIGHT) * CELL_HEIGHT;
      updateTransform();
    }
    dragging = false;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  };

  return (
    <div
      ref={(el) => (element = el)}
      style={containerStyle}
      onPointerDown={onPointerDown}
    >
    </div>
  );
};
