// wallpaper.jsx
// Animated three-body wallpaper. No React. Exports command, refreshFrequency, render.

export const command = () => "";
export const refreshFrequency = false;

export const render = () => {
  // container element returned to host. It contains canvas and simple UI hint.
  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.position = "relative";
  container.style.overflow = "hidden";
  container.style.userSelect = "none";

  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvas.style.position = "absolute";
  canvas.style.left = "0";
  canvas.style.top = "0";

  container.appendChild(canvas);

  // hint (small, unobtrusive)
  const hint = document.createElement("div");
  hint.textContent = "Three-body wallpaper — click to reset";
  hint.style.position = "absolute";
  hint.style.right = "8px";
  hint.style.bottom = "8px";
  hint.style.fontFamily = "monospace, system-ui, sans-serif";
  hint.style.fontSize = "12px";
  hint.style.padding = "6px 8px";
  hint.style.background = "rgba(0,0,0,0.35)";
  hint.style.color = "white";
  hint.style.borderRadius = "6px";
  hint.style.pointerEvents = "none";
  container.appendChild(hint);

  const ctx = canvas.getContext("2d");

  let w = 300;
  let h = 150;
  function resize() {
    const rect = container.getBoundingClientRect();
    w = Math.max(100, Math.floor(rect.width));
    h = Math.max(100, Math.floor(rect.height));
    // keep canvas pixel ratio for sharpness
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  // Simulation parameters
  const G = 1.0; // gravitational constant (tweak for visual scale)
  let timeScale = 0.7; // global speed scale (0.2..2 recommended)
  const trailLength = 160; // how many historical positions to draw (fading)
  const bodyRadius = 6; // visual radius

  // State (3 bodies)
  let bodies = [];

  function randomInitialConfig() {
    // Create three bodies with masses and initial positions/velocities.
    // Use a configuration that often produces interesting orbits.
    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h) * 0.18;

    // masses
    const m1 = 1.0;
    const m2 = 0.9;
    const m3 = 0.7;

    // positions placed in triangle
    const p1 = { x: cx + scale * Math.cos(0), y: cy + scale * Math.sin(0) };
    const p2 = {
      x: cx + scale * Math.cos((2 * Math.PI) / 3),
      y: cy + scale * Math.sin((2 * Math.PI) / 3),
    };
    const p3 = {
      x: cx + scale * Math.cos((4 * Math.PI) / 3),
      y: cy + scale * Math.sin((4 * Math.PI) / 3),
    };

    // velocities chosen to produce chaotic motion; small random perturbations
    const baseSpeed = Math.sqrt((G * (m1 + m2 + m3)) / scale) * 0.55;
    const v1 = { x: 0.0, y: -baseSpeed };
    const v2 = { x: baseSpeed * 0.6, y: baseSpeed * 0.2 };
    const v3 = { x: -baseSpeed * 0.5, y: baseSpeed * 0.5 };

    bodies = [
      makeBody(m1, p1, v1, [200, 160, 255]),
      makeBody(m2, p2, v2, [255, 190, 130]),
      makeBody(m3, p3, v3, [160, 255, 190]),
    ];

    // add small random perturbations so patterns vary on reset
    for (const b of bodies) {
      b.vx += (Math.random() - 0.5) * baseSpeed * 0.12;
      b.vy += (Math.random() - 0.5) * baseSpeed * 0.12;
      b.trail = [];
    }
  }

  function makeBody(m, p, v, colorRGB) {
    return {
      m: m,
      x: p.x,
      y: p.y,
      vx: v.x,
      vy: v.y,
      color: colorRGB,
      trail: [],
    };
  }

  // Physics helpers: compute accelerations on each body
  function accelerations(state) {
    // state: [{x,y,vx,vy,m}, ...]
    const n = state.length;
    const ax = new Array(n).fill(0);
    const ay = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const dx = state[j].x - state[i].x;
        const dy = state[j].y - state[i].y;
        const r2 = dx * dx + dy * dy + 1e-6; // softening to avoid singularities
        const invr3 = 1.0 / (Math.sqrt(r2) * r2);
        const f = G * state[j].m * invr3;
        ax[i] += dx * f;
        ay[i] += dy * f;
      }
    }
    return { ax, ay };
  }

  // RK4 integrator step for all bodies
  function rk4Step(dt) {
    const n = bodies.length;

    // capture state copies
    const s0 = bodies.map((b) => ({ x: b.x, y: b.y, vx: b.vx, vy: b.vy, m: b.m }));

    // k1
    const a1 = accelerations(s0);
    const k1 = s0.map((s, i) => ({
      dx: s.vx,
      dy: s.vy,
      dvx: a1.ax[i],
      dvy: a1.ay[i],
    }));

    // s1 = s0 + k1*dt/2
    const s1 = s0.map((s, i) => ({
      x: s.x + k1[i].dx * dt * 0.5,
      y: s.y + k1[i].dy * dt * 0.5,
      vx: s.vx + k1[i].dvx * dt * 0.5,
      vy: s.vy + k1[i].dvy * dt * 0.5,
      m: s.m,
    }));

    // k2
    const a2 = accelerations(s1);
    const k2 = s1.map((s, i) => ({
      dx: s.vx,
      dy: s.vy,
      dvx: a2.ax[i],
      dvy: a2.ay[i],
    }));

    // s2 = s0 + k2*dt/2
    const s2 = s0.map((s, i) => ({
      x: s.x + k2[i].dx * dt * 0.5,
      y: s.y + k2[i].dy * dt * 0.5,
      vx: s.vx + k2[i].dvx * dt * 0.5,
      vy: s.vy + k2[i].dvy * dt * 0.5,
      m: s.m,
    }));

    // k3
    const a3 = accelerations(s2);
    const k3 = s2.map((s, i) => ({
      dx: s.vx,
      dy: s.vy,
      dvx: a3.ax[i],
      dvy: a3.ay[i],
    }));

    // s3 = s0 + k3*dt
    const s3 = s0.map((s, i) => ({
      x: s.x + k3[i].dx * dt,
      y: s.y + k3[i].dy * dt,
      vx: s.vx + k3[i].dvx * dt,
      vy: s.vy + k3[i].dvy * dt,
      m: s.m,
    }));

    // k4
    const a4 = accelerations(s3);
    const k4 = s3.map((s, i) => ({
      dx: s.vx,
      dy: s.vy,
      dvx: a4.ax[i],
      dvy: a4.ay[i],
    }));

    // combine to update bodies
    for (let i = 0; i < n; i++) {
      const bx = bodies[i];
      bx.x += (dt / 6) * (k1[i].dx + 2 * k2[i].dx + 2 * k3[i].dx + k4[i].dx);
      bx.y += (dt / 6) * (k1[i].dy + 2 * k2[i].dy + 2 * k3[i].dy + k4[i].dy);
      bx.vx += (dt / 6) * (k1[i].dvx + 2 * k2[i].dvx + 2 * k3[i].dvx + k4[i].dvx);
      bx.vy += (dt / 6) * (k1[i].dvy + 2 * k2[i].dvy + 2 * k3[i].dvy + k4[i].dvy);

      // store to trail
      bx.trail.push({ x: bx.x, y: bx.y });
      if (bx.trail.length > trailLength) bx.trail.shift();
    }
  }

  // draw scene
  function draw() {
    // clear with slight opacity to create motion blur trails effect
    ctx.fillStyle = "rgba(8,10,18,0.22)";
    ctx.fillRect(0, 0, w, h);

    // draw faint background star field
    // For performance, we draw a few faint dots per frame
    for (let i = 0; i < 4; i++) {
      const sx = (Math.sin(frameSeed + i * 12.3) * 0.5 + 0.5) * w;
      const sy = (Math.cos(frameSeed * 1.7 + i * 7.9) * 0.5 + 0.5) * h;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.7 + ((i + frameCount) % 3) * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.fill();
    }

    // draw trails
    for (const b of bodies) {
      const cols = b.color;
      ctx.beginPath();
      for (let i = 0; i < b.trail.length; i++) {
        const p = b.trail[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      // fade alpha by length and tail
      const alpha = 0.9;
      ctx.strokeStyle = `rgba(${cols[0]},${cols[1]},${cols[2]},${0.02 * alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // draw head with stronger alpha
      const head = b.trail[b.trail.length - 1] || { x: b.x, y: b.y };
      const grd = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, bodyRadius * 3);
      grd.addColorStop(0, `rgba(${cols[0]},${cols[1]},${cols[2]},0.95)`);
      grd.addColorStop(0.6, `rgba(${cols[0]},${cols[1]},${cols[2]},0.2)`);
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(head.x, head.y, bodyRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // small core
      ctx.beginPath();
      ctx.arc(head.x, head.y, bodyRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${cols[0]},${cols[1]},${cols[2]},0.95)`;
      ctx.fill();
    }
  }

  // animation loop
  let lastTime = performance.now();
  let raf = null;
  let frameCount = 0;
  let frameSeed = Math.random() * 1000;

  function step(now) {
    raf = requestAnimationFrame(step);
    const dtMs = Math.min(60, now - lastTime);
    lastTime = now;

    // integrate with fixed small time step for stability; adapt to dtMs
    const seconds = (dtMs / 1000) * timeScale;
    // substep to keep stability: choose substeps so dt <= 0.02
    const maxStep = 0.02;
    let remaining = seconds;
    while (remaining > 1e-8) {
      const thisStep = Math.min(maxStep, remaining);
      rk4Step(thisStep);
      remaining -= thisStep;
    }

    draw();
    frameCount++;
    frameSeed += 0.002;
  }

  // start/stop helpers
  function start() {
    // reset timers
    lastTime = performance.now();
    if (raf === null) raf = requestAnimationFrame(step);
  }
  function stop() {
    if (raf !== null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
    resizeObserver.disconnect();
  }

  // allow clicking to reset the system in new randomized configuration
  container.addEventListener("click", (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    randomInitialConfig();
  });

  // expose stop method for host environment
  container.stop = stop;

  // initialize and run
  randomInitialConfig();
  start();

  // return DOM node to host
  return container;
};
