// karma.jsx
// Draggable Reddit karma widget built on baseplate.jsx logic

const GRID_COLS = 10;
const GRID_ROWS = 6;
const GRID_WIDTH = 1512;
const GRID_HEIGHT = 948;
const CELL_WIDTH = GRID_WIDTH / GRID_COLS;
const CELL_HEIGHT = GRID_HEIGHT / GRID_ROWS;

const WIDGET_COLS = 3;
const WIDGET_ROWS = 1;

// Drag state
let dragging = false;
let dragOffset = { x: 0, y: 0 };
let dragPosition = { x: 0, y: CELL_HEIGHT * 4 };
let element = null;

const username = "United_Pace2109"; // <-- change this to the Reddit username you want
const profile = `https://www.reddit.com/user/${username}/`;

export const command = async () => {
  const url = `https://www.reddit.com/user/${username}/about.json`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const user = data.data;
    return JSON.stringify({
      name: user.name,
      icon_img: user.icon_img.split("?")[0],
      total_karma: user.total_karma,
    });
  } catch {
    return JSON.stringify({ error: true });
  }
};

export const refreshFrequency = 60 * 1000; // every 60 seconds

export const render = ({ output }) => {
  if (!output) return null;
  let info;
  try {
    info = JSON.parse(output);
  } catch {
    return null;
  }
  if (info.error) return <div style={{ color: "white" }}>Error loading Reddit data</div>;

  const fontFamily = '"Courier New", monospace';
  const updateTransform = () => {
    if (element)
      element.style.transform = `translate(${dragPosition.x + CELL_WIDTH * 0.1}px, ${dragPosition.y + CELL_HEIGHT * 0.1}px)`;
  };

  const onPointerDown = (e) => {
    if (e.target.tagName === "A") return;
    dragging = true;
    dragOffset = { x: e.clientX - dragPosition.x, y: e.clientY - dragPosition.y };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
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
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };

  const containerStyle = {
    position: "absolute",
    width: `${CELL_WIDTH * (WIDGET_COLS - 0.2)}px`,
    height: `${CELL_HEIGHT * (WIDGET_ROWS - 0.2)}px`,
    borderRadius: "25px",
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(6px) saturate(160%)",
    WebkitBackdropFilter: "blur(6px) saturate(160%)",
    boxShadow: "0 0 12px rgba(255,255,255,0.2)",
    border: "1px solid rgba(255,255,255,0.3)",
    overflow: "hidden",
    cursor: dragging ? "grabbing" : "grab",
    userSelect: "none",
    willChange: "transform",
    transform: `translate(${dragPosition.x + CELL_WIDTH * 0.1}px, ${dragPosition.y + CELL_HEIGHT * 0.1}px)`,
    transition: dragging ? "none" : "transform 0.2s ease-out",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "white",
    fontFamily,
  };

  const imgStyle = {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    padding: "50px",
    objectFit: "cover",
  };

  const textStyle = {
    fontSize: "22px",
    fontWeight: "bold",
    letterSpacing: "1px",
    padding: "50px",
  };

  return (
    <div ref={(el) => (element = el)} style={containerStyle} onPointerDown={onPointerDown}>
      <a href={profile}><img src={info.icon_img} style={imgStyle} /></a>
      <div style={textStyle}>{info.total_karma.toLocaleString()} karma</div>
    </div>
  );
};
