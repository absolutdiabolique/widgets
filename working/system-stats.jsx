// system-stats.jsx
// Übersicht widget — draggable + two-page vertical scroll with indicator dots (like shortcuts.jsx)

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

  const parseNum = (val) => parseFloat(val.replace("%", "")) || 0;

  const colorize = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "white";
    if (num < 50) return "#00FF7F";
    if (num < 80) return "#FFD700";
    return "#FF5555";
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
    overflow: 'hidden',
    cursor: dragging ? 'grabbing' : 'grab',
    willChange: 'transform',
    transform: `translate(${dragPosition.x + CELL_WIDTH * 0.1}px, ${dragPosition.y + CELL_HEIGHT * 0.1}px)`,
    transition: dragging ? 'none' : 'transform 0.2s ease-out',
  };

  const scrollContainerStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'scroll',
    scrollSnapType: 'y mandatory',
    scrollBehavior: 'smooth',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  };

  const pageStyle = {
    flex: '0 0 100%',
    scrollSnapAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: '100%',
  };

  const statBox = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
  const label = { opacity: 0.6, fontSize: '11px' };
  const value = (color) => ({ fontWeight: 'bold', fontSize: '14px', color });

  const barContainer = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    gap: '10px',
  };

  const barWrapper = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '80%',
  };

  const barLabel = { fontSize: '12px', opacity: 0.6, marginBottom: '2px' };
  const barBase = {
    width: '100%',
    height: '8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  };

  const makeBarFill = (color, val) => ({
    width: `${parseNum(val)}%`,
    height: '100%',
    backgroundColor: color,
    borderRadius: '6px',
    transition: 'width 0.4s ease',
  });

  const indicatorContainer = {
    position: 'absolute',
    right: '6px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
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
    const pageHeight = el.clientHeight;
    const index = Math.round(el.scrollTop / pageHeight);
    const dots = el.parentElement.querySelectorAll('.dot');
    dots.forEach((d, i) => {
      d.style.backgroundColor = i === index ? 'white' : 'rgba(255,255,255,0.3)';
      d.style.transform = i === index ? 'scale(1.2)' : 'scale(1)';
    });
  };

  return (
    <div
      ref={(el) => (element = el)}
      style={containerStyle}
      onPointerDown={onPointerDown}
    >
      <div style={scrollContainerStyle} onScroll={onScroll}>
        {/* Top Page — Text Stats */}
        <div style={pageStyle}>
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

        {/* Bottom Page — Bars */}
        <div style={pageStyle}>
          <div style={barContainer}>
            <div style={barWrapper}>
              <div style={barLabel}>CPU</div>
              <div style={barBase}>
                <div style={makeBarFill(cpuColor, cpu)} />
              </div>
            </div>
            <div style={barWrapper}>
              <div style={barLabel}>MEM</div>
              <div style={barBase}>
                <div style={makeBarFill(memColor, mem)} />
              </div>
            </div>
            <div style={barWrapper}>
              <div style={barLabel}>BAT</div>
              <div style={barBase}>
                <div style={makeBarFill(battColor, batt)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right-side scroll dots */}
      <div style={indicatorContainer}>
        {[0, 1].map((i) => (
          <div key={i} className="dot" style={dotBase}></div>
        ))}
      </div>

      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};
