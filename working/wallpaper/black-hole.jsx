// black-hole.jsx
// Animated black hole wallpaper for Übersicht or React-based setups

export const command = () => "";
export const refreshFrequency = false;

export const render = () => (
  <canvas
    id="black-hole-canvas"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      display: "block",
      backgroundColor: "black",
      zIndex: -1,
    }}
  ></canvas>
);

if (typeof window !== "undefined") {
  const drawBlackHole = () => {
    const canvas = document.getElementById("black-hole-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const centerX = width / 2;
    const centerY = height / 2;

    let time = 0;

    const renderFrame = () => {
      time += 0.02;

      // clear with transparent black to create fade trails
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.fillRect(0, 0, width, height);

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width / 2);
      gradient.addColorStop(0, "rgba(0,0,0,1)");
      gradient.addColorStop(0.4, "rgba(10,10,10,0.9)");
      gradient.addColorStop(0.7, "rgba(20,20,20,0.6)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Swirling particle field
      const particleCount = 250;
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + time * 0.5;
        const radius = (Math.sin(i * 0.3 + time) + 2) * 100 + 50;
        const x = centerX + Math.cos(angle) * radius * 0.8;
        const y = centerY + Math.sin(angle) * radius * 0.8;

        const alpha = 0.1 + 0.4 * Math.sin(i + time);
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // inner event horizon glow
      ctx.beginPath();
      const holeGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100);
      holeGradient.addColorStop(0, "rgba(0,0,0,1)");
      holeGradient.addColorStop(0.7, "rgba(20,20,20,0.8)");
      holeGradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = holeGradient;
      ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(renderFrame);
    };

    renderFrame();
  };

  window.addEventListener("resize", drawBlackHole);
  window.addEventListener("load", drawBlackHole);
  drawBlackHole();
}
