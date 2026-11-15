interface Spawn {
  x: number;
  y: number;
  spreadX: number;
  spreadY: number;
}

interface Direction {
  angle: number;
  spread: number;
  speedMin: number;
  speedMax: number;
}

interface Lifetime {
  mean: number;
  spread: number;
}

interface Config {
  spawn: Spawn;
  direction: Direction;
  lifetime: Lifetime;
  colorRamp: Record<number, string>;
  hueSpeed: number; // gradi al secondo, negativo = senso opposto
  size: number;
  spawnRate: number;
  maxParticles: number;
  gravity: number;
  drag: number;
  wobble: number;
  opacity: number;
  trail: number;
}

type RGB = [number, number, number];

interface OKLCH {
  L: number; // luminosità 0..1
  C: number; // croma (≈0 grigio, ≈0.4 molto saturo)
  h: number; // tinta in gradi 0..360
}

interface Stop {
  t: number;
  color: OKLCH;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
}

const CONFIG: Config = {
  spawn: { x: 0.5, y: 0.5, spreadX: 1, spreadY: 1 },
  direction: { angle: 0, spread: 360, speedMin: 0.5, speedMax: 3 },
  lifetime: { mean: 90, spread: 0.3 },
  colorRamp: {
    0: "#f8ea8d",
    0.3: "#ffb703",
    0.7: "#d62828",
    1: "#4e0a0a",
  },
  hueSpeed: 20,
  size: 14,
  spawnRate: 0.5,
  maxParticles: 500,
  gravity: 0,
  drag: 0.995,
  wobble: 0.8,
  opacity: 0.9,
  trail: 0.08,
};

// ---------- utilità ----------

function getContext(c: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = c.getContext("2d");
  if (ctx === null) {
    throw new Error("Canvas 2D non supportato");
  }
  return ctx;
}

const canvas = document.getElementById("fx") as HTMLCanvasElement;
const ctx = getContext(canvas);
const particles: Particle[] = [];

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function lerp(a: number, b: number, k: number): number {
  return a + (b - a) * k;
}

// Interpola la tinta sul cammino più corto (es. 350° → 10° passa da 0°).
function lerpHue(a: number, b: number, k: number): number {
  let d = ((b - a + 540) % 360) - 180;
  return a + d * k;
}

function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

// ---------- colore: sRGB <-> OKLCH ----------

function srgbToLinear(c: number): number {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  const x = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.min(255, Math.max(0, x * 255));
}

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToOklch(rgb: RGB): OKLCH {
  const r = srgbToLinear(rgb[0]);
  const g = srgbToLinear(rgb[1]);
  const b = srgbToLinear(rgb[2]);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  return {
    L,
    C: Math.hypot(a, bb),
    h: normalizeHue((Math.atan2(bb, a) * 180) / Math.PI),
  };
}

function oklchToRgb(color: OKLCH): RGB {
  const hr = (color.h * Math.PI) / 180;
  const a = color.C * Math.cos(hr);
  const bb = color.C * Math.sin(hr);

  const l = Math.pow(color.L + 0.3963377774 * a + 0.2158037573 * bb, 3);
  const m = Math.pow(color.L - 0.1055613458 * a - 0.0638541728 * bb, 3);
  const s = Math.pow(color.L - 0.0894841775 * a - 1.291485548 * bb, 3);

  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  // Fuori dal gamut sRGB i canali vengono limitati a 0..255.
  return [linearToSrgb(r), linearToSrgb(g), linearToSrgb(b)];
}

// ---------- rampa ----------

// Converte il dizionario colorRamp in stop OKLCH ordinati per t.
function buildRamp(ramp: Record<number, string>): Stop[] {
  return Object.keys(ramp)
    .map(Number)
    .sort((a, b) => a - b)
    .map((t) => ({ t, color: rgbToOklch(hexToRgb(ramp[t])) }));
}

const RAMP: Stop[] = buildRamp(CONFIG.colorRamp);

// Colore per una frazione di lifetime t (0..1), con la tinta spostata di hueShift gradi.
function sampleRamp(t: number, hueShift: number): RGB {
  const first = RAMP[0];
  const last = RAMP[RAMP.length - 1];

  let color: OKLCH = first.color;

  if (t <= first.t) {
    color = first.color;
  } else if (t >= last.t) {
    color = last.color;
  } else {
    for (let i = 0; i < RAMP.length - 1; i++) {
      const a = RAMP[i];
      const b = RAMP[i + 1];
      if (t >= a.t && t <= b.t) {
        const k = (t - a.t) / (b.t - a.t);
        color = {
          L: lerp(a.color.L, b.color.L, k),
          C: lerp(a.color.C, b.color.C, k),
          h: lerpHue(a.color.h, b.color.h, k),
        };
        break;
      }
    }
  }

  return oklchToRgb({ L: color.L, C: color.C, h: normalizeHue(color.h + hueShift) });
}

// ---------- particelle ----------

// Tinta comune a tutti gli stadi, aggiornata nel tempo.
let hueShift = 0;
let lastTime: number | null = null;

function createParticle(): Particle {
  const { spawn, direction, lifetime } = CONFIG;

  const x = (spawn.x + rand(-spawn.spreadX / 2, spawn.spreadX / 2)) * canvas.width;
  const y = (spawn.y + rand(-spawn.spreadY / 2, spawn.spreadY / 2)) * canvas.height;

  const angle = ((direction.angle + rand(-direction.spread, direction.spread)) * Math.PI) / 180;
  const speed = rand(direction.speedMin, direction.speedMax);

  const life = lifetime.mean * (1 + rand(-lifetime.spread, lifetime.spread));

  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    age: 0,
    life,
    size: CONFIG.size,
  };
}

function update(p: Particle): void {
  p.vy += CONFIG.gravity;
  p.vx *= CONFIG.drag;
  p.vy *= CONFIG.drag;
  p.x += p.vx + Math.sin(p.age * 0.1 + p.life) * CONFIG.wobble;
  p.y += p.vy;
  p.age++;
}

function draw(p: Particle): void {
  const t = p.age / p.life;
  const [r, g, b] = sampleRamp(t, hueShift);
  const alpha = CONFIG.opacity * (1 - t);
  const radius = p.size * (1 - t);

  ctx.beginPath();
  ctx.fillStyle = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
  ctx.arc(p.x, p.y, Math.max(radius, 0.1), 0, Math.PI * 2);
  ctx.fill();
}

// ---------- loop ----------

function frame(now: number): void {
  if (lastTime !== null) {
    const dt = (now - lastTime) / 1000;
    hueShift = normalizeHue(hueShift + CONFIG.hueSpeed * dt);
  }
  lastTime = now;

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = `rgba(0, 0, 0, ${CONFIG.trail})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "lighter";

  for (let i = 0; i < CONFIG.spawnRate; i++) {
    if (particles.length < CONFIG.maxParticles) {
      particles.push(createParticle());
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    update(p);
    if (p.age >= p.life) {
      particles.splice(i, 1);
      continue;
    }
    draw(p);
  }

  ctx.globalCompositeOperation = "source-over";
  requestAnimationFrame(frame);
}

function resize(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();
ctx.fillStyle = "#000";
ctx.fillRect(0, 0, canvas.width, canvas.height);
requestAnimationFrame(frame);

document.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
  if ("wakeLock" in navigator) {
    navigator.wakeLock.request("screen").catch(() => {});
  }
});