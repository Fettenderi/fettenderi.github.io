var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// js/babel_ascent_shader_embed.ts
var require_babel_ascent_shader_embed = __commonJS({
  "js/babel_ascent_shader_embed.ts"() {
    var STAGE_LABELS = [
      "Frame originale",
      "Downsampling",
      "Edge detection",
      "1-bit posterization",
      "Ordered Dithering",
      "Paletteswapped"
    ];
    function hexToRgb(hex) {
      const value = parseInt(hex.replace("#", ""), 16);
      return [(value >> 16 & 255) / 255, (value >> 8 & 255) / 255, (value & 255) / 255];
    }
    var CONFIG = {
      selector: ".gallery#shader",
      downscale: 3,
      edgeThickness: 2e-3,
      edgeGain: 1,
      threshold: 0.5,
      ditherBias: 0.3,
      blackColor: hexToRgb("#323234"),
      whiteColor: hexToRgb("#F8F5EE")
    };
    var VERT_SRC = `#version 300 es
void main() {
    vec2 pos = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
    gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}`;
    var FRAG_SRC = `#version 300 es
precision highp float;
precision highp int;

uniform sampler2D uImage;
uniform int uStage;
uniform vec2 uSize;
uniform int uDownscale;
uniform float uEdgeThickness;
uniform float uEdgeGain;
uniform float uThreshold;
uniform float uDitherBias;
uniform vec3 uBlackColor;
uniform vec3 uWhiteColor;

out vec4 fragColor;

const float BAYER2[4] = float[4](0.0, 0.5, 0.75, 0.25);

float luminance(vec3 color) {
    return dot(color, vec3(0.2125, 0.7154, 0.0721));
}

float luminanceAt(vec2 uv) {
    return luminance(texture(uImage, uv).rgb);
}

// Laplaciano sulla luminanza (nell'originale era sulla depth)
float getBorder(float thickness, vec2 uv) {
    float laplacian = luminanceAt(uv + vec2(thickness, 0.0)) +
        luminanceAt(uv - vec2(thickness, 0.0)) +
        luminanceAt(uv + vec2(0.0, thickness)) +
        luminanceAt(uv - vec2(0.0, thickness)) -
        4.0 * luminanceAt(uv);
    return abs(laplacian) * uEdgeGain;
}

float getBayer2Value(ivec2 pixel) {
    int index = (pixel.y % 2) * 2 + (pixel.x % 2);
    return BAYER2[index];
}
vec2 lowUv(ivec2 low) {
    return (vec2(low * uDownscale) + 0.5) / uSize;
}

float getEdge(ivec2 low) {
    return clamp(getBorder(uEdgeThickness, lowUv(low)), 0.0, 1.0);
}

float getGray(ivec2 low) {
    float gray = luminance(texelFetch(uImage, low * uDownscale, 0).rgb);
    return clamp(getEdge(low) + gray, 0.0, 1.0);
}

// Fase 0
vec3 stageOriginal(ivec2 px) {
    return texelFetch(uImage, px, 0).rgb;
}

// Fase 1
vec3 stageDownsample(ivec2 px) {
    return texelFetch(uImage, (px / uDownscale) * uDownscale, 0).rgb;
}

// Fase 2: solo i bordi
vec3 stageEdges(ivec2 px) {
    return vec3(getEdge(px / uDownscale));
}

// Fase 3: soglia fissa su gray + bordo
vec3 stagePosterize(ivec2 px) {
    float gray = getGray(px / uDownscale);
    return vec3(gray > uThreshold ? 1.0 : 0.0);
}

// Fase 4: soglia con matrice di Bayer 2x2
vec3 stageDither(ivec2 px) {
    ivec2 low = px / uDownscale;
    float gray = getGray(low);
    return vec3(gray > getBayer2Value(low) + uDitherBias ? 1.0 : 0.0);
}

// Fase 5: palette swap
vec3 stagePalette(ivec2 px) {
    return stageDither(px).r > 0.5 ? uWhiteColor : uBlackColor;
}

void main() {
    ivec2 px = ivec2(int(gl_FragCoord.x), int(uSize.y - gl_FragCoord.y));
    vec3 color;

    if (uStage == 0) {
        color = stageOriginal(px);
    } else if (uStage == 1) {
        color = stageDownsample(px);
    } else if (uStage == 2) {
        color = stageEdges(px);
    } else if (uStage == 3) {
        color = stagePosterize(px);
    } else if (uStage == 4) {
        color = stageDither(px);
    } else {
        color = stagePalette(px);
    }

    fragColor = vec4(color, 1.0);
}`;
    var STYLE_ID = "shader-embed-style";
    var STYLE = `
.shader-embed { --thumb: 18px; display: flex; flex-direction: column; gap: .75rem; width: 100%; }
.shader-embed canvas { display: block; width: 100%; height: auto; image-rendering: pixelated; }
.shader-embed input[type=range] {
    -webkit-appearance: none; appearance: none; display: block; box-sizing: content-box;
    width: calc(100% - 100% / var(--n) + var(--thumb));
    margin: 0 0 0 calc(50% / var(--n) - var(--thumb) / 2);
    padding: 0; height: var(--thumb); background: transparent; cursor: pointer;
}
.shader-embed input[type=range]::-webkit-slider-runnable-track {
    height: 4px; border-radius: 2px; background: color-mix(in srgb, currentColor 30%, transparent);
}
.shader-embed input[type=range]::-moz-range-track {
    height: 4px; border-radius: 2px; background: color-mix(in srgb, currentColor 30%, transparent);
}
.shader-embed input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none; width: var(--thumb); height: var(--thumb);
    margin-top: calc((4px - var(--thumb)) / 2); border: 0; border-radius: 50%; background: currentColor;
}
.shader-embed input[type=range]::-moz-range-thumb {
    width: var(--thumb); height: var(--thumb); border: 0; border-radius: 50%; background: currentColor;
}
.shader-embed__labels { display: grid; grid-template-columns: repeat(var(--n), 1fr); }
.shader-embed__labels button {
    background: none; border: 0; padding: .25rem; font: inherit; font-size: .8rem;
    color: inherit; opacity: .55; cursor: pointer;
}
.shader-embed__labels button[aria-pressed="true"] { opacity: 1; font-weight: 600; }
`;
    function compileShader(gl, type, source) {
      const shader = gl.createShader(type);
      if (shader === null) {
        throw new Error("createShader fallita");
      }
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) !== true) {
        const log = gl.getShaderInfoLog(shader) ?? "";
        gl.deleteShader(shader);
        throw new Error(`Compilazione shader fallita:
${log}`);
      }
      return shader;
    }
    function createProgram(gl, vertSrc, fragSrc) {
      const program = gl.createProgram();
      if (program === null) {
        throw new Error("createProgram fallita");
      }
      gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vertSrc));
      gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fragSrc));
      gl.linkProgram(program);
      if (gl.getProgramParameter(program, gl.LINK_STATUS) !== true) {
        throw new Error(`Link fallito:
${gl.getProgramInfoLog(program) ?? ""}`);
      }
      return program;
    }
    function getUniform(gl, program, name) {
      const location = gl.getUniformLocation(program, name);
      if (location === null) {
        throw new Error(`Uniform mancante: ${name}`);
      }
      return location;
    }
    var ShaderPipeline = class {
      constructor(canvas, image, config) {
        __publicField(this, "gl");
        __publicField(this, "uniforms");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const gl = canvas.getContext("webgl2", {
          alpha: false,
          preserveDrawingBuffer: true
        });
        if (gl === null) {
          throw new Error("WebGL2 non disponibile");
        }
        this.gl = gl;
        const program = createProgram(gl, VERT_SRC, FRAG_SRC);
        gl.useProgram(program);
        this.uniforms = {
          image: getUniform(gl, program, "uImage"),
          stage: getUniform(gl, program, "uStage"),
          size: getUniform(gl, program, "uSize"),
          downscale: getUniform(gl, program, "uDownscale"),
          edgeThickness: getUniform(gl, program, "uEdgeThickness"),
          edgeGain: getUniform(gl, program, "uEdgeGain"),
          threshold: getUniform(gl, program, "uThreshold"),
          ditherBias: getUniform(gl, program, "uDitherBias"),
          blackColor: getUniform(gl, program, "uBlackColor"),
          whiteColor: getUniform(gl, program, "uWhiteColor")
        };
        const texture = gl.createTexture();
        if (texture === null) {
          throw new Error("createTexture fallita");
        }
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.uniform1i(this.uniforms.image, 0);
        gl.uniform2f(this.uniforms.size, canvas.width, canvas.height);
        gl.uniform1i(this.uniforms.downscale, config.downscale);
        gl.uniform1f(this.uniforms.edgeThickness, config.edgeThickness);
        gl.uniform1f(this.uniforms.edgeGain, config.edgeGain);
        gl.uniform1f(this.uniforms.threshold, config.threshold);
        gl.uniform1f(this.uniforms.ditherBias, config.ditherBias);
        gl.uniform3f(this.uniforms.blackColor, ...config.blackColor);
        gl.uniform3f(this.uniforms.whiteColor, ...config.whiteColor);
      }
      render(stage) {
        this.gl.uniform1i(this.uniforms.stage, stage);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
      }
    };
    function loadImage(url) {
      return new Promise(
        (resolve, reject) => {
          const image = new Image();
          image.crossOrigin = "anonymous";
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error(`Impossibile caricare ${url}`));
          image.src = url;
        }
      );
    }
    function topLevelChild(root, node) {
      let current = node;
      while (current.parentElement !== null && current.parentElement !== root) {
        current = current.parentElement;
      }
      return current;
    }
    function toStage(value) {
      const clamped = Math.min(Math.max(Math.round(value), 0), STAGE_LABELS.length - 1);
      return clamped;
    }
    function createPipeline(canvas, image, config) {
      try {
        return new ShaderPipeline(canvas, image, config);
      } catch (error) {
        console.warn("[shader-embed]", error);
        return null;
      }
    }
    async function mount(gallery, config) {
      const original = gallery.querySelector("img");
      if (original === null) {
        return;
      }
      const url = original.currentSrc !== "" ? original.currentSrc : original.src;
      const loaded = await loadImage(url);
      const canvas = document.createElement("canvas");
      const pipeline = createPipeline(canvas, loaded, config);
      if (pipeline === null) {
        return;
      }
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", original.alt);
      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = "0";
      slider.max = String(STAGE_LABELS.length - 1);
      slider.step = "1";
      slider.value = "0";
      slider.setAttribute("aria-label", "Fase della pipeline");
      const labels = document.createElement("div");
      labels.className = "shader-embed__labels";
      const buttons = [];
      const setStage = (stage) => {
        pipeline.render(stage);
        slider.value = String(stage);
        slider.setAttribute("aria-valuetext", STAGE_LABELS[stage] ?? "");
        buttons.forEach((button, index) => {
          button.setAttribute("aria-pressed", String(index === stage));
        });
      };
      STAGE_LABELS.forEach((label, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.addEventListener("click", () => setStage(toStage(index)));
        buttons.push(button);
        labels.appendChild(button);
      });
      slider.addEventListener("input", () => setStage(toStage(Number(slider.value))));
      const widget = document.createElement("div");
      widget.className = "shader-embed";
      widget.style.setProperty("--n", String(STAGE_LABELS.length));
      widget.append(canvas, slider, labels);
      const anchor = topLevelChild(gallery, original);
      anchor.style.display = "none";
      anchor.insertAdjacentElement("afterend", widget);
      setStage(0);
    }
    function injectStyle() {
      if (document.getElementById(STYLE_ID) !== null) {
        return;
      }
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = STYLE;
      document.head.appendChild(style);
    }
    function init() {
      injectStyle();
      const galleries = document.querySelectorAll(CONFIG.selector);
      galleries.forEach((gallery) => {
        mount(gallery, CONFIG).catch((error) => {
          console.warn("[shader-embed]", error);
        });
      });
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }
});
export default require_babel_ascent_shader_embed();
