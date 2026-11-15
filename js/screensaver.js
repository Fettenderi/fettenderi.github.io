var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// js/screensaver.ts
var require_screensaver = __commonJS({
  "js/screensaver.ts"() {
    var CONFIG = {
      spawn: { x: 0.5, y: 0.5, spreadX: 1, spreadY: 1 },
      direction: { angle: 0, spread: 360, speedMin: 0.5, speedMax: 3 },
      lifetime: { mean: 90, spread: 0.3 },
      colorRamp: {
        0: "#f8ea8d",
        0.3: "#ffb703",
        0.7: "#d62828",
        1: "#4e0a0a"
      },
      hueSpeed: 20,
      size: 14,
      spawnRate: 0.5,
      maxParticles: 500,
      gravity: 0,
      drag: 0.995,
      wobble: 0.8,
      opacity: 0.9,
      trail: 0.08
    };
    function getContext(c) {
      const ctx2 = c.getContext("2d");
      if (ctx2 === null) {
        throw new Error("Canvas 2D non supportato");
      }
      return ctx2;
    }
    var canvas = document.getElementById("fx");
    var ctx = getContext(canvas);
    var particles = [];
    function rand(min, max) {
      return min + Math.random() * (max - min);
    }
    function lerp(a, b, k) {
      return a + (b - a) * k;
    }
    function lerpHue(a, b, k) {
      let d = (b - a + 540) % 360 - 180;
      return a + d * k;
    }
    function normalizeHue(h) {
      return (h % 360 + 360) % 360;
    }
    function srgbToLinear(c) {
      const x = c / 255;
      return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    }
    function linearToSrgb(c) {
      const x = c <= 31308e-7 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
      return Math.min(255, Math.max(0, x * 255));
    }
    function hexToRgb(hex) {
      const n = parseInt(hex.slice(1), 16);
      return [n >> 16 & 255, n >> 8 & 255, n & 255];
    }
    function rgbToOklch(rgb) {
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
        h: normalizeHue(Math.atan2(bb, a) * 180 / Math.PI)
      };
    }
    function oklchToRgb(color) {
      const hr = color.h * Math.PI / 180;
      const a = color.C * Math.cos(hr);
      const bb = color.C * Math.sin(hr);
      const l = Math.pow(color.L + 0.3963377774 * a + 0.2158037573 * bb, 3);
      const m = Math.pow(color.L - 0.1055613458 * a - 0.0638541728 * bb, 3);
      const s = Math.pow(color.L - 0.0894841775 * a - 1.291485548 * bb, 3);
      const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
      const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
      const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
      return [linearToSrgb(r), linearToSrgb(g), linearToSrgb(b)];
    }
    function buildRamp(ramp) {
      return Object.keys(ramp).map(Number).sort((a, b) => a - b).map((t) => ({ t, color: rgbToOklch(hexToRgb(ramp[t])) }));
    }
    var RAMP = buildRamp(CONFIG.colorRamp);
    function sampleRamp(t, hueShift2) {
      const first = RAMP[0];
      const last = RAMP[RAMP.length - 1];
      let color = first.color;
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
              h: lerpHue(a.color.h, b.color.h, k)
            };
            break;
          }
        }
      }
      return oklchToRgb({ L: color.L, C: color.C, h: normalizeHue(color.h + hueShift2) });
    }
    var hueShift = 0;
    var lastTime = null;
    function createParticle() {
      const { spawn, direction, lifetime } = CONFIG;
      const x = (spawn.x + rand(-spawn.spreadX / 2, spawn.spreadX / 2)) * canvas.width;
      const y = (spawn.y + rand(-spawn.spreadY / 2, spawn.spreadY / 2)) * canvas.height;
      const angle = (direction.angle + rand(-direction.spread, direction.spread)) * Math.PI / 180;
      const speed = rand(direction.speedMin, direction.speedMax);
      const life = lifetime.mean * (1 + rand(-lifetime.spread, lifetime.spread));
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        age: 0,
        life,
        size: CONFIG.size
      };
    }
    function update(p) {
      p.vy += CONFIG.gravity;
      p.vx *= CONFIG.drag;
      p.vy *= CONFIG.drag;
      p.x += p.vx + Math.sin(p.age * 0.1 + p.life) * CONFIG.wobble;
      p.y += p.vy;
      p.age++;
    }
    function draw(p) {
      const t = p.age / p.life;
      const [r, g, b] = sampleRamp(t, hueShift);
      const alpha = CONFIG.opacity * (1 - t);
      const radius = p.size * (1 - t);
      ctx.beginPath();
      ctx.fillStyle = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
      ctx.arc(p.x, p.y, Math.max(radius, 0.1), 0, Math.PI * 2);
      ctx.fill();
    }
    function frame(now) {
      if (lastTime !== null) {
        const dt = (now - lastTime) / 1e3;
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
    function resize() {
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
        document.documentElement.requestFullscreen().catch(() => {
        });
      }
      if ("wakeLock" in navigator) {
        navigator.wakeLock.request("screen").catch(() => {
        });
      }
    });
  }
});
export default require_screensaver();
