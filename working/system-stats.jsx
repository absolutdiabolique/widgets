// system-stats.jsx
// Übersicht widget — smooth draggable version (GPU transform + rAF)

const GRID_COLS = 10;
const GRID_ROWS = 6;
const GRID_WIDTH = 1512;
const GRID_HEIGHT = 948;
const CELL_WIDTH = GRID_WIDTH / GRID_COLS;
const CELL_HEIGHT = GRID_HEIGHT / GRID_ROWS;

// Widget size
const WIDGET_COLS = 2;
const WIDGET_ROWS = 1;

let dragging = false;
let dragOffset = { x: 0, y: 0 };
let dragPosition = { x: CELL_WIDTH, y: CELL_HEIGHT * 3 };
let element = null;

export const command = `
top -l 1 | grep "CPU usage" && \
memory_pressure | grep "System-wide memory free percentage" && \
pmset -g batt | grep -Eo "\\d+%";
`;

export const refreshFrequency = 3000;

export const render = ({ output }) => {
  const lines = (output || "").split("\n");

  let cpu = "–";
  let mem = "–";
  let batt = "–";

  if (lines[0]) {
    const match = lines[0].match(/CPU usage:\s*(\d+\.\d+)% user,\s*(\d+\.\d+)% sys/);
    if (match) cpu = (parseFloat(match[1]) + parseFloat(match[2])).toFixed(1) + "%";
  }

  if (lines[1]) {
    const match = lines[1].match(/(\d+)%/);
    if (match) mem = `${100 - parseInt(match[1])}%`;
  }

  if (lines[2]) batt = lines[2].trim();

  // Color coding helper
  const colorize = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "white";
    if (num < 50) return "#00FF7F"; // green
    if (num < 80) return "#FFD700"; // yellow
    return "#FF5555"; // red
  };

  const cpuColor = colorize(cpu);
  const memColor = colorize(mem);
  const battNum = parseInt(batt);
  const battColor =
    isNaN(battNum) ? "white" :
    battNum > 60 ? "#00FF7F" :
    battNum > 20 ? "#FFD700" : "#FF5555";

  const fontFamily = '"Courier New", monospace';

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
    color: 'white',
    fontFamily,
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    userSelect: 'none',
    cursor: dragging ? 'grabbing' : 'grab',
    willChange: 'transform',
    transform: `translate(${dragPosition.x + CELL_WIDTH * 0.1}px, ${dragPosition.y + CELL_HEIGHT * 0.1}px)`,
    transition: dragging ? 'none' : 'transform 0.2s ease-out',
  };

  const statBox = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
  const label = { opacity: 0.6, fontSize: '11px' };
  const value = (color) => ({ fontWeight: 'bold', fontSize: '14px', color });

  const updateTransform = () => {
    if (element)
      element.style.transform = `translate(${dragPosition.x + CELL_WIDTH * 0.1}px, ${dragPosition.y + CELL_HEIGHT * 0.1}px)`;
  };

  const onPointerDown = (e) => {
    if (e.target.tagName === "A") return;
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
      <div style={statBox}>
        <div style={label}>CPU</div>
        <div style={value(cpuColor)}>{cpu}</div>
      </div>
      <div style={statBox}>
        <div style={label}>MEM</div>
        <div style={value(memColor)}>{mem}</div>
      </div>
      <div style={statBox}>
        <div style={label}>BAT</div>
        <div style={value(battColor)}>{batt}</div>
      </div>
    </div>
  );
};
