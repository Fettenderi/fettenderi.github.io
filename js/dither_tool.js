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

// js/dither_tool.ts
var require_dither_tool = __commonJS({
  "js/dither_tool.ts"() {
    var CONFIG = {
      selector: "#dither-tool",
      defaultMaxSide: 128,
      maxSide: 4096,
      ditherBias: 0.3,
      // Approssimazioni OKLCH di #323234 e #F8F5EE
      initialDark: { l: 0.318, c: 4e-3, h: 286 },
      initialLight: { l: 0.97, c: 0.01, h: 87 }
    };
    var CHANNELS = [
      { key: "l", label: "L", min: 0, max: 1, step: 1e-3, decimals: 3 },
      { key: "c", label: "C", min: 0, max: 0.4, step: 1e-3, decimals: 3 },
      { key: "h", label: "H", min: 0, max: 360, step: 0.1, decimals: 1 }
    ];
    var GRADIENT_STOPS = 16;
    var GAMUT_EPSILON = 1e-4;
    var LUMA = [0.2125, 0.7154, 0.0721];
    var BAYER2 = [0, 0.5, 0.75, 0.25];
    var BUTTON = `
    display: inline-block;
    box-sizing: border-box;
    padding: 0.6rem 2rem;
    border: 3px solid var(--primary-color);
    border-radius: 10px;
    background-color: transparent;
    color: var(--primary-color);
    font: inherit;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;
`;
    var BUTTON_HOVER = `
    background-color: var(--primary-color);
    color: var(--hover-color);
`;
    var TRACK = `
    height: var(--track-height);
    border-radius: 6px;
    background: var(--track);
    box-shadow: inset 0 0 0 1px var(--code-border);
`;
    var THUMB = `
    box-sizing: border-box;
    width: var(--thumb-width);
    height: var(--thumb-height);
    border: 2px solid #fff;
    border-radius: 4px;
    background: transparent;
    box-shadow: 0 0 0 1px #0008, inset 0 0 0 1px #0008;
`;
    var STYLE_ID = "dither-tool-style";
    var STYLE = `
.dither-tool {
    --track-height: 24px;
    --thumb-width: 12px;
    --thumb-height: 34px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-sizing: border-box;
    width: 100%;
    aspect-ratio: 2 / 3;
    margin: 1em auto;
    padding: 1em;
    overflow: auto;
    background-color: var(--code-bg);
    border: 1px solid var(--code-border);
    border-radius: 5px;
    color: var(--text-0);
    line-height: 1.4;
}
.dither-tool [hidden] {
    display: none;
}
.dither-tool label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.85rem;
}
.dither-tool input[type=number],
.dither-tool input[type=file] {
    font: inherit;
    font-size: 0.85rem;
    color: inherit;
}
.dither-tool input[type=number] {
    box-sizing: border-box;
    padding: 0.3rem 0.5rem;
    border: 1px solid var(--code-border);
    border-radius: 5px;
    background-color: transparent;
}
.dither-tool input:focus-visible,
.dither-tool button:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}
.dither-tool input[type=file]::file-selector-button {
    ${BUTTON}
    margin-right: 0.75rem;
    padding: 0.3rem 1rem;
    font-size: 0.85rem;
}
.dither-tool input[type=file]::file-selector-button:hover {
    ${BUTTON_HOVER}
}
.dither-tool button {
    ${BUTTON}
}
.dither-tool button:hover:not(:disabled) {
    ${BUTTON_HOVER}
}
.dither-tool button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
.dither-tool__row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 1rem;
}
.dither-tool__row input[type=number] {
    width: 6rem;
}
.dither-tool__panel,
.dither-tool__picker {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    border: 1px solid var(--code-border);
    border-radius: 5px;
}
.dither-tool__picker {
    flex: 1 1 15rem;
}
.dither-tool__hex {
    all: unset;
    cursor: pointer;
    opacity: 0.7;
}
.dither-tool__hex:hover,
.dither-tool__hex:focus-visible {
    opacity: 1;
    text-decoration: underline;
}

.dither-tool__button {
    ${BUTTON}
}
.dither-tool__button:hover:not(:disabled) {
    ${BUTTON_HOVER}
}
.dither-tool__button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.dither-tool__head {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
}

.dither-tool__swatch {
    flex: none;
    height: 2.5rem;
    border: 1px solid var(--code-border);
    border-radius: 5px;
}
.dither-tool__channel {
    display: grid;
    grid-template-columns: 1rem 1fr 4.5rem;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
}
.dither-tool__channel input[type=number] {
    width: 100%;
}
.dither-tool input[type=range] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: var(--thumb-height);
    margin: 0;
    padding: 0;
    background: transparent;
    cursor: pointer;
}
.dither-tool input[type=range]::-webkit-slider-runnable-track {
    ${TRACK}
}
.dither-tool input[type=range]::-moz-range-track {
    ${TRACK}
}
.dither-tool input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    margin-top: calc((var(--track-height) - var(--thumb-height)) / 2);
    ${THUMB}
}
.dither-tool input[type=range]::-moz-range-thumb {
    ${THUMB}
}
.dither-tool__stage {
    position: relative;
    display: flex;
    flex: 1 1 0;
    align-items: center;
    justify-content: center;
    min-height: 12rem;
    overflow: hidden;
    border: 1px solid var(--code-border);
    border-radius: 5px;
}
.dither-tool__stage canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    image-rendering: pixelated;
}
.dither-tool__placeholder {
    font-size: 0.85rem;
    opacity: 0.6;
}
.dither-tool__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
}
.dither-tool__status {
    margin: 0;
    font-size: 0.85rem;
}

.dither-tool__scrub {
    touch-action: pan-y;
    -moz-appearance: textfield;
    appearance: textfield;
}
.dither-tool__scrub::-webkit-inner-spin-button,
.dither-tool__scrub::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
.dither-tool__scrub:not(:focus) {
    cursor: ew-resize;
}
`;
    function el(tag, className = "") {
      const node = document.createElement(tag);
      if (className !== "") {
        node.className = className;
      }
      return node;
    }
    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }
    function cube(value) {
      return value * value * value;
    }
    function oklchToLinear(color) {
      const hue = color.h * Math.PI / 180;
      const a = color.c * Math.cos(hue);
      const b = color.c * Math.sin(hue);
      const l = cube(color.l + 0.3963377774 * a + 0.2158037573 * b);
      const m = cube(color.l - 0.1055613458 * a - 0.0638541728 * b);
      const s = cube(color.l - 0.0894841775 * a - 1.291485548 * b);
      return [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
      ];
    }
    function isInGamut(linear) {
      return linear.every((channel) => {
        return channel >= -GAMUT_EPSILON && channel <= 1 + GAMUT_EPSILON;
      });
    }
    function encodeGamma(value) {
      return value <= 31308e-7 ? 12.92 * value : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
    }
    function oklchToRgb(color) {
      let linear = oklchToLinear(color);
      if (!isInGamut(linear)) {
        let low = 0;
        let high = color.c;
        for (let i = 0; i < 24; i++) {
          const mid = (low + high) / 2;
          if (isInGamut(oklchToLinear({ l: color.l, c: mid, h: color.h }))) {
            low = mid;
          } else {
            high = mid;
          }
        }
        linear = oklchToLinear({ l: color.l, c: low, h: color.h });
      }
      const encode = (value) => {
        return Math.round(encodeGamma(clamp(value, 0, 1)) * 255);
      };
      return [encode(linear[0]), encode(linear[1]), encode(linear[2])];
    }
    function rgbToHex(rgb) {
      const digits = rgb.map((channel) => channel.toString(16).padStart(2, "0")).join("");
      return `#${digits.toUpperCase()}`;
    }
    function withChannel(color, key, value) {
      const copy = { l: color.l, c: color.c, h: color.h };
      copy[key] = value;
      return copy;
    }
    function createContext(width, height) {
      const canvas = el("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (context === null) {
        throw new Error("Canvas 2D non disponibile");
      }
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      return context;
    }
    function resample(image, width, height) {
      let source = image;
      let sourceWidth = image.naturalWidth;
      let sourceHeight = image.naturalHeight;
      while (sourceWidth > width * 2 || sourceHeight > height * 2) {
        const nextWidth = sourceWidth > width * 2 ? Math.ceil(sourceWidth / 2) : sourceWidth;
        const nextHeight = sourceHeight > height * 2 ? Math.ceil(sourceHeight / 2) : sourceHeight;
        const step = createContext(nextWidth, nextHeight);
        step.drawImage(source, 0, 0, sourceWidth, sourceHeight, 0, 0, nextWidth, nextHeight);
        source = step.canvas;
        sourceWidth = nextWidth;
        sourceHeight = nextHeight;
      }
      const target = createContext(width, height);
      target.fillStyle = "#fff";
      target.fillRect(0, 0, width, height);
      target.drawImage(source, 0, 0, sourceWidth, sourceHeight, 0, 0, width, height);
      return target.getImageData(0, 0, width, height);
    }
    function ditherImage(source, dark, light, bias) {
      const output = new ImageData(source.width, source.height);
      const input = source.data;
      const target = output.data;
      for (let y = 0; y < source.height; y++) {
        for (let x = 0; x < source.width; x++) {
          const index = (y * source.width + x) * 4;
          const gray = (LUMA[0] * (input[index] ?? 0) + LUMA[1] * (input[index + 1] ?? 0) + LUMA[2] * (input[index + 2] ?? 0)) / 255;
          const threshold = (BAYER2[y % 2 * 2 + x % 2] ?? 0) + bias;
          const color = gray > threshold ? light : dark;
          target[index] = color[0];
          target[index + 1] = color[1];
          target[index + 2] = color[2];
          target[index + 3] = 255;
        }
      }
      return output;
    }
    function loadImage(url) {
      return new Promise(
        (resolve, reject) => {
          const image = new Image();
          image.crossOrigin = "anonymous";
          image.onload = () => {
            if (image.naturalWidth === 0 || image.naturalHeight === 0) {
              reject(new Error("Dimensioni immagine non valide"));
              return;
            }
            resolve(image);
          };
          image.onerror = () => reject(new Error("Impossibile caricare l'immagine"));
          image.src = url;
        }
      );
    }
    async function loadFile(file) {
      const url = URL.createObjectURL(file);
      try {
        return await loadImage(url);
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    var OklchPicker = class {
      constructor(title, initial, onChange) {
        __publicField(this, "element");
        __publicField(this, "color");
        __publicField(this, "onChange");
        __publicField(this, "swatch");
        __publicField(this, "hex");
        __publicField(this, "flashTimer", 0);
        __publicField(this, "controls", []);
        this.color = { l: initial.l, c: initial.c, h: initial.h };
        this.onChange = onChange;
        const head = el("div", "dither-tool__head");
        const name = el("span");
        name.textContent = title;
        this.hex = el("button", "dither-tool__hex");
        this.hex.type = "button";
        this.hex.title = "Copia negli appunti";
        this.hex.addEventListener("click", () => {
          void this.copyHex();
        });
        head.append(name, this.hex);
        this.swatch = el("div", "dither-tool__swatch");
        this.element = el("div", "dither-tool__picker");
        this.element.append(head, this.swatch);
        CHANNELS.forEach((spec) => {
          const control = this.createControl(title, spec);
          this.controls.push(control);
          this.element.append(control.row);
        });
        this.refresh(null);
      }
      async copyHex() {
        try {
          await navigator.clipboard.writeText(rgbToHex(this.getRgb()));
          this.flash("Copiato!");
        } catch (error) {
          console.warn("[dither-tool]", error);
          this.flash("Errore");
        }
      }
      flash(message) {
        window.clearTimeout(this.flashTimer);
        this.hex.textContent = message;
        this.flashTimer = window.setTimeout(() => {
          this.hex.textContent = rgbToHex(this.getRgb());
        }, 1e3);
      }
      getRgb() {
        return oklchToRgb(this.color);
      }
      createControl(title, spec) {
        const row = el("div", "dither-tool__channel");
        const name = el("span");
        name.textContent = spec.label;
        const range = el("input");
        const number = el("input");
        range.type = "range";
        number.type = "number";
        [range, number].forEach((input) => {
          input.min = String(spec.min);
          input.max = String(spec.max);
          input.step = String(spec.step);
          input.setAttribute("aria-label", `${title} ${spec.label}`);
        });
        const onInput = (source) => {
          if (source.value.trim() === "") {
            return;
          }
          const value = Number(source.value);
          if (Number.isNaN(value)) {
            return;
          }
          this.color[spec.key] = clamp(value, spec.min, spec.max);
          this.refresh(source);
          this.onChange();
        };
        range.addEventListener("input", () => onInput(range));
        number.addEventListener("input", () => onInput(number));
        number.addEventListener("change", () => this.refresh(null));
        row.append(name, range, number);
        return { spec, row, range, number };
      }
      // `active` è il campo in modifica: non va sovrascritto mentre l'utente digita
      refresh(active) {
        this.controls.forEach((control) => {
          const value = this.color[control.spec.key];
          if (control.range !== active) {
            control.range.value = String(value);
          }
          if (control.number !== active) {
            control.number.value = value.toFixed(control.spec.decimals);
          }
          this.updateTrack(control);
        });
        const hex = rgbToHex(oklchToRgb(this.color));
        this.swatch.style.backgroundColor = hex;
        this.hex.textContent = hex;
      }
      updateTrack(control) {
        const stops = [];
        for (let i = 0; i <= GRADIENT_STOPS; i++) {
          const t = i / GRADIENT_STOPS;
          const value = control.spec.min + (control.spec.max - control.spec.min) * t;
          const rgb = oklchToRgb(withChannel(this.color, control.spec.key, value));
          stops.push(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]}) ${(t * 100).toFixed(1)}%`);
        }
        control.range.style.setProperty("--track", `linear-gradient(to right, ${stops.join(", ")})`);
      }
    };
    var SCRUB_THRESHOLD = 3;
    function attachScrub(input, min, max) {
      let state = null;
      input.classList.add("dither-tool__scrub");
      input.addEventListener("mousedown", (event) => {
        if (event.button === 0 && document.activeElement !== input) {
          event.preventDefault();
        }
      });
      input.addEventListener("pointerdown", (event) => {
        if (event.button !== 0 || document.activeElement === input) {
          return;
        }
        const current = Number(input.value);
        state = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startValue: input.value.trim() === "" || Number.isNaN(current) ? min : current,
          dragging: false
        };
        input.setPointerCapture(event.pointerId);
      });
      input.addEventListener("pointermove", (event) => {
        if (state === null || event.pointerId !== state.pointerId) {
          return;
        }
        if (!state.dragging) {
          if (Math.abs(event.clientX - state.startX) < SCRUB_THRESHOLD) {
            return;
          }
          state.dragging = true;
          state.startX = event.clientX;
          return;
        }
        const value = clamp(Math.round(state.startValue + event.clientX - state.startX), min, max);
        if (input.value !== String(value)) {
          input.value = String(value);
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });
      const end = (event) => {
        if (state === null || event.pointerId !== state.pointerId) {
          return;
        }
        const wasDragging = state.dragging;
        state = null;
        if (!wasDragging && event.type === "pointerup") {
          input.focus();
          input.select();
        }
      };
      input.addEventListener("pointerup", end);
      input.addEventListener("pointercancel", end);
    }
    function createSizeField(label, max) {
      const wrapper = el("label");
      const input = el("input");
      input.type = "number";
      input.min = "1";
      input.max = String(max);
      input.step = "1";
      input.inputMode = "numeric";
      attachScrub(input, 1, max);
      wrapper.append(label, input);
      return { wrapper, input };
    }
    var DitherTool = class {
      constructor(config) {
        __publicField(this, "element");
        __publicField(this, "config");
        __publicField(this, "canvas");
        __publicField(this, "placeholder");
        __publicField(this, "context");
        __publicField(this, "status");
        __publicField(this, "widthField");
        __publicField(this, "heightField");
        __publicField(this, "darkPicker");
        __publicField(this, "lightPicker");
        __publicField(this, "downloadButton");
        __publicField(this, "image", null);
        __publicField(this, "small", null);
        __publicField(this, "baseName", "image");
        this.config = config;
        this.canvas = el("canvas");
        this.canvas.hidden = true;
        const context = this.canvas.getContext("2d");
        if (context === null) {
          throw new Error("Canvas 2D non disponibile");
        }
        this.context = context;
        this.placeholder = el("span", "dither-tool__placeholder");
        this.placeholder.textContent = "Carica un'immagine per iniziare";
        const stage = el("div", "dither-tool__stage");
        stage.append(this.placeholder, this.canvas);
        const fileInput = el("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        const fileLabel = el("label");
        fileLabel.append("Immagine", fileInput);
        this.widthField = createSizeField("Larghezza (px)", config.maxSide);
        this.heightField = createSizeField("Altezza (px)", config.maxSide);
        this.darkPicker = new OklchPicker("Colore scuro", config.initialDark, () => this.draw());
        this.lightPicker = new OklchPicker("Colore chiaro", config.initialLight, () => this.draw());
        this.status = el("p", "dither-tool__status");
        this.status.setAttribute("aria-live", "polite");
        this.downloadButton = el("button", "dither-tool__button");
        this.downloadButton.type = "button";
        this.downloadButton.textContent = "Scarica PNG";
        this.downloadButton.disabled = true;
        const actions = el("div", "dither-tool__actions");
        actions.append(this.downloadButton, this.status);
        const sizeTitle = el("span");
        sizeTitle.textContent = "Dimensioni";
        const sizeHead = el("div", "dither-tool__head");
        sizeHead.append(sizeTitle);
        const sizeFields = el("div", "dither-tool__row");
        sizeFields.append(this.widthField.wrapper, this.heightField.wrapper);
        const sizePanel = el("div", "dither-tool__panel");
        sizePanel.append(sizeHead, sizeFields);
        const colorRow = el("div", "dither-tool__row");
        colorRow.append(this.darkPicker.element, this.lightPicker.element);
        this.element = el("div", "dither-tool");
        this.element.append(fileLabel, sizePanel, colorRow, stage, actions);
        fileInput.addEventListener("change", () => {
          const file = fileInput.files?.[0];
          if (file !== void 0) {
            this.openFile(file);
          }
        });
        [this.widthField.input, this.heightField.input].forEach((input) => {
          input.addEventListener("input", () => this.resize());
          input.addEventListener("change", () => this.normalizeSize(input));
        });
        this.downloadButton.addEventListener("click", () => this.download());
      }
      openFile(file) {
        loadFile(file).then((image) => {
          this.image = image;
          this.baseName = file.name.replace(/\.[^.]+$/, "");
          const longest = Math.max(image.naturalWidth, image.naturalHeight);
          const scale = Math.min(1, this.config.defaultMaxSide / longest);
          this.widthField.input.value = String(Math.max(1, Math.round(image.naturalWidth * scale)));
          this.heightField.input.value = String(Math.max(1, Math.round(image.naturalHeight * scale)));
          this.status.textContent = "";
          this.resize();
        }).catch((error) => {
          console.warn("[dither-tool]", error);
          this.status.textContent = "Impossibile caricare l'immagine.";
        });
      }
      readSize(input) {
        const value = Number(input.value);
        if (input.value.trim() === "" || !Number.isInteger(value) || value < 1) {
          return null;
        }
        return Math.min(value, this.config.maxSide);
      }
      normalizeSize(input) {
        const size = this.readSize(input);
        if (size !== null) {
          input.value = String(size);
        }
      }
      // Ricampiona solo quando cambiano immagine o dimensioni
      resize() {
        const image = this.image;
        if (image === null) {
          return;
        }
        const width = this.readSize(this.widthField.input);
        const height = this.readSize(this.heightField.input);
        if (width === null || height === null) {
          return;
        }
        this.small = resample(image, width, height);
        this.draw();
      }
      // Ridisegna (dithering + palette) senza ricampionare
      draw() {
        const small = this.small;
        if (small === null) {
          return;
        }
        const result = ditherImage(
          small,
          this.darkPicker.getRgb(),
          this.lightPicker.getRgb(),
          this.config.ditherBias
        );
        this.canvas.width = small.width;
        this.canvas.height = small.height;
        this.context.putImageData(result, 0, 0);
        this.canvas.hidden = false;
        this.placeholder.hidden = true;
        this.downloadButton.disabled = false;
      }
      download() {
        this.canvas.toBlob((blob) => {
          if (blob === null) {
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = el("a");
          link.href = url;
          link.download = `${this.baseName}_dither.png`;
          link.click();
          window.setTimeout(() => URL.revokeObjectURL(url), 1e3);
        }, "image/png");
      }
    };
    function injectStyle() {
      if (document.getElementById(STYLE_ID) !== null) {
        return;
      }
      const style = el("style");
      style.id = STYLE_ID;
      style.textContent = STYLE;
      document.head.appendChild(style);
    }
    function init() {
      injectStyle();
      const host = document.querySelector(CONFIG.selector) ?? document.body;
      const tool = new DitherTool(CONFIG);
      host.appendChild(tool.element);
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }
});
export default require_dither_tool();
