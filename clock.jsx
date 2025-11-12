// countdown.jsx
// Place in Übersicht widgets directory

const targetDate = new Date('2098-03-21T00:00:00');
const birthDate = new Date('2012-06-05T00:00:00');

// Grid configuration
const GRID_COLS = 10;
const GRID_ROWS = 6;
const GRID_WIDTH = 1512; // screen width assumption
const GRID_HEIGHT = 948; // screen height assumption
const CELL_WIDTH = GRID_WIDTH / GRID_COLS;
const CELL_HEIGHT = GRID_HEIGHT / GRID_ROWS;

// Widget size in grid units
const WIDGET_COLS = 3;
const WIDGET_ROWS = 3;

// Drag state
let dragging = false;
let dragOffset = { x: 0, y: 0 };
let dragPosition = { x: 0, y: 0 }; // start near top-left

export const command = () => "";
export const refreshFrequency = 100;

export const render = () => {
  const now = new Date();
  let diff = Math.floor((targetDate - now) / 1000);
  if (diff < 0) diff = 0;

  const years = Math.floor(diff / (365 * 24 * 3600));
  const days = Math.floor((diff % (365 * 24 * 3600)) / (24 * 3600));
  const hours = Math.floor((diff % (24 * 3600)) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  const flicker = Math.random() < 0.05 ? Math.random() * 0.5 + 0.5 : 1;
  const t = now.getTime() / 1000;
  const pulse = Math.sin(t * 2 * Math.PI / 3);
  const fontFamily = '"Courier New", monospace';

  const pulseStyle = {
    transition: 'all 0.15s ease-in-out',
    textShadow: `0 0 12px rgba(255,0,0,${0.8 + 0.2 * pulse}), 0 0 24px rgba(255,0,0,${0.4 + 0.4 * pulse})`,
    color: 'red',
  };

  const containerStyle = {
    ...pulseStyle,
    position: 'absolute',
    top: `${dragPosition.y + CELL_HEIGHT * 0.1}px`,
    left: `${dragPosition.x + CELL_WIDTH * 0.1}px`,
    width: `${CELL_WIDTH * (WIDGET_COLS - 0.2)}px`,
    height: `${CELL_HEIGHT * (WIDGET_ROWS - 0.2)}px`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    borderRadius: '25px',
    background: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(5px) saturate(150%)',
    WebkitBackdropFilter: 'blur(5px) saturate(150%)',
    boxShadow: `0 0 ${40 * pulse}px rgba(255,0,0,${0.5 * pulse})`,
    border: `2px solid rgba(255,0,0,${0.8 * pulse})`,
    cursor: dragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    overflow: 'hidden',
  };

  const blurEdgeStyle = {
    position: 'absolute',
    inset: 0,
    borderRadius: '25px',
    boxShadow: '0 0 50px 25px rgba(0,0,0,0.8)',
    filter: 'blur(20px)',
    zIndex: 0,
  };

  const labelStyle = { fontSize: '16px', margin: 0, opacity: 0.8 };
  const sectionStyle = { ...pulseStyle, textAlign: 'center', fontFamily, fontWeight: '600' };
  const numberStyle = { fontSize: '48px', fontFamily, opacity: flicker, margin: 0 };

  const totalDuration = targetDate - birthDate;
  const elapsed = totalDuration - (targetDate - now);
  const progress = Math.max(0, Math.min(1, elapsed / totalDuration));

  const progressBarContainerStyle = {
    ...pulseStyle,
    position: 'relative',
    width: '80%',
    height: '14px',
    borderRadius: '8px',
    background: 'rgba(255,0,0,0.2)',
    overflow: 'hidden',
    boxShadow: `0 0 10px rgba(255,0,0,${0.5 * pulse}) inset`,
  };

  const progressBarFillStyle = {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: `${progress * 100}%`,
    background: `linear-gradient(90deg, red, darkred)`,
    boxShadow: `0 0 15px rgba(255,0,0,${0.8 * pulse})`,
    transition: 'width 0.2s ease-out',
  };

  const analogContainerStyle = {
    ...pulseStyle,
    position: 'relative',
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    border: '4px solid red',
    boxShadow: `0 0 ${20 * pulse}px rgba(255,0,0,${0.8 * pulse})`,
    marginTop: '10px',
  };

  const totalSecondsInCycle = 12 * 3600;
  const clockSeconds = progress * totalSecondsInCycle;
  const hourDeg = ((clockSeconds / 3600) % 12) * 30;
  const minuteDeg = ((clockSeconds / 60) % 60) * 6;
  const secondDeg = (clockSeconds % 60) * 6;

  const handStyle = (width, height, rotation) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: `${width}px`,
    height: `${height}px`,
    background: 'red',
    transformOrigin: 'bottom center',
    transform: `translate(-50%, -100%) rotate(${rotation}deg)`,
    boxShadow: '0 0 10px red',
    borderRadius: '2px',
  });

  // Drag logic with snap to grid
  const onPointerDown = (e) => {
    dragging = true;
    dragOffset = {
      x: e.clientX - dragPosition.x,
      y: e.clientY - dragPosition.y,
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    dragPosition.x = e.clientX - dragOffset.x;
    dragPosition.y = e.clientY - dragOffset.y;
    window.dispatchEvent(new Event("resize"));
  };

  const onPointerUp = () => {
    if (dragging) {
      // Snap to grid
      dragPosition.x = Math.round(dragPosition.x / CELL_WIDTH) * CELL_WIDTH;
      dragPosition.y = Math.round(dragPosition.y / CELL_HEIGHT) * CELL_HEIGHT;
    }
    dragging = false;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  };

  return (
    <div style={containerStyle} onPointerDown={onPointerDown}>
      <div style={blurEdgeStyle}></div>

      <h1 style={numberStyle}>{diff.toLocaleString()}</h1>
      <p style={labelStyle}>MEMENTO MORI</p>

      <div style={{ display: 'flex', gap: '25px' }}>
        <div style={sectionStyle}><h1 style={numberStyle}>{years}</h1><p style={labelStyle}>YEARS</p></div>
        <div style={sectionStyle}><h1 style={numberStyle}>{days}</h1><p style={labelStyle}>DAYS</p></div>
        <div style={sectionStyle}><h1 style={numberStyle}>{hours}</h1><p style={labelStyle}>HOURS</p></div>
      </div>

      <div style={progressBarContainerStyle}><div style={progressBarFillStyle}></div></div>

      <div style={analogContainerStyle}>
        <div style={handStyle(6, 50, hourDeg)}></div>
        <div style={handStyle(4, 70, minuteDeg)}></div>
        <div style={handStyle(2, 80, secondDeg)}></div>
      </div>
    </div>
  );
};