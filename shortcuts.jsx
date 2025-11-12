// shortcuts.jsx
// Übersicht widget — smooth draggable version (GPU transform + rAF)

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
let dragPosition = { x: 0, y: CELL_HEIGHT * 3 };
let element = null;

export const command = () => "";
export const refreshFrequency = 10000;

// Pages of shortcuts
const pages = [
  [
    { label: "Torn", url: "https://torn.com" },
    { label: "PolyTrack", url: "https://kodub.com/apps/polytrack" },
    { label: "ChatGPT", url: "https://chatgpt.com" },
  ],
  [
    { label: "YouTube", url: "https://youtube.com" },
    { label: "Discord", url: "https://discord.com" },
    { label: "Reddit", url: "https://reddit.com" },
  ],
];

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

  const scrollContainerStyle = {
    display: 'flex',
    width: '100%',
    height: '100%',
    overflowX: 'scroll',
    scrollSnapType: 'x mandatory',
    scrollBehavior: 'smooth',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  };

  const pageStyle = {
    flex: '0 0 100%',
    scrollSnapAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  };

  const indicatorContainer = {
    position: 'absolute',
    bottom: '6px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  };

  const dotBase = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    transition: 'background-color 0.3s, transform 0.3s',
  };

  const linkStyle = {
    fontFamily,
    fontSize: '13px',
    color: 'white',
    textDecoration: 'none',
    opacity: 0.8,
    transition: 'opacity 0.2s, transform 0.2s',
  };

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

  const onScroll = (e) => {
    const el = e.target;
    const pageWidth = el.clientWidth;
    const index = Math.round(el.scrollLeft / pageWidth);
    currentPage = index;
    const dots = el.parentElement.querySelectorAll('.dot');
    dots.forEach((d, i) => {
      d.style.backgroundColor = i === currentPage ? 'white' : 'rgba(255,255,255,0.3)';
      d.style.transform = i === currentPage ? 'scale(1.2)' : 'scale(1)';
    });
  };

  return (
    <div
      ref={(el) => (element = el)}
      style={containerStyle}
      onPointerDown={onPointerDown}
    >
      <div style={scrollContainerStyle} onScroll={onScroll}>
        {pages.map((links, i) => (
          <div key={i} style={pageStyle}>
            {links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                style={linkStyle}
                onMouseEnter={(e) => {
                  e.target.style.opacity = 1;
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = 0.8;
                  e.target.style.transform = 'scale(1.0)';
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div style={indicatorContainer}>
        {pages.map((_, i) => (
          <div key={i} className="dot" style={dotBase}></div>
        ))}
      </div>
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};
