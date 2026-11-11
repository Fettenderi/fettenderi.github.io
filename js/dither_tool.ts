type RGB = readonly [number, number, number];
type Vec3 = readonly [number, number, number];

interface Oklch {
    l: number;
    c: number;
    h: number;
}

interface Config {
    readonly selector: string;
    readonly defaultMaxSide: number;
    readonly maxSide: number;
    readonly ditherBias: number;
    readonly initialDark: Oklch;
    readonly initialLight: Oklch;
}

interface ChannelSpec {
    readonly key: keyof Oklch;
    readonly label: string;
    readonly min: number;
    readonly max: number;
    readonly step: number;
    readonly decimals: number;
}

interface ChannelControl {
    readonly spec: ChannelSpec;
    readonly row: HTMLDivElement;
    readonly range: HTMLInputElement;
    readonly number: HTMLInputElement;
}

interface SizeField {
    readonly wrapper: HTMLLabelElement;
    readonly input: HTMLInputElement;
}

const CONFIG: Config = {
    selector: "#dither-tool",
    defaultMaxSide: 128,
    maxSide: 4096,
    ditherBias: 0.3,
    // Approssimazioni OKLCH di #323234 e #F8F5EE
    initialDark: { l: 0.318, c: 0.004, h: 286 },
    initialLight: { l: 0.97, c: 0.01, h: 87 },
};

const CHANNELS: readonly ChannelSpec[] = [
    { key: "l", label: "L", min: 0, max: 1, step: 0.001, decimals: 3 },
    { key: "c", label: "C", min: 0, max: 0.4, step: 0.001, decimals: 3 },
    { key: "h", label: "H", min: 0, max: 360, step: 0.1, decimals: 1 },
];

const GRADIENT_STOPS: number = 16;
const GAMUT_EPSILON: number = 1e-4;
const LUMA: Vec3 = [0.2125, 0.7154, 0.0721];
const BAYER2: readonly number[] = [0.0, 0.5, 0.75, 0.25];

const BUTTON: string = `
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

const BUTTON_HOVER: string = `
    background-color: var(--primary-color);
    color: var(--hover-color);
`;

const TRACK: string = `
    height: var(--track-height);
    border-radius: 6px;
    background: var(--track);
    box-shadow: inset 0 0 0 1px var(--code-border);
`;

const THUMB: string = `
    box-sizing: border-box;
    width: var(--thumb-width);
    height: var(--thumb-height);
    border: 2px solid #fff;
    border-radius: 4px;
    background: transparent;
    box-shadow: 0 0 0 1px #0008, inset 0 0 0 1px #0008;
`;

const STYLE_ID: string = "dither-tool-style";
const STYLE: string = `
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

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string = ""): HTMLElementTagNameMap[K] {
    const node: HTMLElementTagNameMap[K] = document.createElement(tag);
    if (className !== "") {
        node.className = className;
    }
    return node;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function cube(value: number): number {
    return value * value * value;
}

// ---------- OKLCH -> sRGB ----------

function oklchToLinear(color: Oklch): Vec3 {
    const hue: number = (color.h * Math.PI) / 180;
    const a: number = color.c * Math.cos(hue);
    const b: number = color.c * Math.sin(hue);
    const l: number = cube(color.l + 0.3963377774 * a + 0.2158037573 * b);
    const m: number = cube(color.l - 0.1055613458 * a - 0.0638541728 * b);
    const s: number = cube(color.l - 0.0894841775 * a - 1.291485548 * b);
    return [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
}

function isInGamut(linear: Vec3): boolean {
    return linear.every((channel: number): boolean => {
        return channel >= -GAMUT_EPSILON && channel <= 1 + GAMUT_EPSILON;
    });
}

function encodeGamma(value: number): number {
    return value <= 0.0031308 ? 12.92 * value : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
}

// Se fuori gamut sRGB, riduce la chroma (bisezione) mantenendo L e H
function oklchToRgb(color: Oklch): RGB {
    let linear: Vec3 = oklchToLinear(color);
    if (!isInGamut(linear)) {
        let low: number = 0;
        let high: number = color.c;
        for (let i: number = 0; i < 24; i++) {
            const mid: number = (low + high) / 2;
            if (isInGamut(oklchToLinear({ l: color.l, c: mid, h: color.h }))) {
                low = mid;
            } else {
                high = mid;
            }
        }
        linear = oklchToLinear({ l: color.l, c: low, h: color.h });
    }
    const encode: (value: number) => number = (value: number): number => {
        return Math.round(encodeGamma(clamp(value, 0, 1)) * 255);
    };
    return [encode(linear[0]), encode(linear[1]), encode(linear[2])];
}

function rgbToHex(rgb: RGB): string {
    const digits: string = rgb
        .map((channel: number): string => channel.toString(16).padStart(2, "0"))
        .join("");
    return `#${digits.toUpperCase()}`;
}

function withChannel(color: Oklch, key: keyof Oklch, value: number): Oklch {
    const copy: Oklch = { l: color.l, c: color.c, h: color.h };
    copy[key] = value;
    return copy;
}

// ---------- Pipeline immagine ----------

function createContext(width: number, height: number): CanvasRenderingContext2D {
    const canvas: HTMLCanvasElement = el("canvas");
    canvas.width = width;
    canvas.height = height;
    const context: CanvasRenderingContext2D | null = canvas.getContext("2d", { willReadFrequently: true });
    if (context === null) {
        throw new Error("Canvas 2D non disponibile");
    }
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    return context;
}

// Downscale a dimezzamenti successivi, poi un'ultima riduzione alla dimensione richiesta
function resample(image: HTMLImageElement, width: number, height: number): ImageData {
    let source: CanvasImageSource = image;
    let sourceWidth: number = image.naturalWidth;
    let sourceHeight: number = image.naturalHeight;

    while (sourceWidth > width * 2 || sourceHeight > height * 2) {
        const nextWidth: number = sourceWidth > width * 2 ? Math.ceil(sourceWidth / 2) : sourceWidth;
        const nextHeight: number = sourceHeight > height * 2 ? Math.ceil(sourceHeight / 2) : sourceHeight;
        const step: CanvasRenderingContext2D = createContext(nextWidth, nextHeight);
        step.drawImage(source, 0, 0, sourceWidth, sourceHeight, 0, 0, nextWidth, nextHeight);
        source = step.canvas;
        sourceWidth = nextWidth;
        sourceHeight = nextHeight;
    }

    const target: CanvasRenderingContext2D = createContext(width, height);
    // Le zone trasparenti diventano bianche
    target.fillStyle = "#fff";
    target.fillRect(0, 0, width, height);
    target.drawImage(source, 0, 0, sourceWidth, sourceHeight, 0, 0, width, height);
    return target.getImageData(0, 0, width, height);
}

// Grigio -> soglia Bayer 2x2 + bias -> palette swap
function ditherImage(source: ImageData, dark: RGB, light: RGB, bias: number): ImageData {
    const output: ImageData = new ImageData(source.width, source.height);
    const input: Uint8ClampedArray = source.data;
    const target: Uint8ClampedArray = output.data;

    for (let y: number = 0; y < source.height; y++) {
        for (let x: number = 0; x < source.width; x++) {
            const index: number = (y * source.width + x) * 4;
            const gray: number = (
                LUMA[0] * (input[index] ?? 0) +
                LUMA[1] * (input[index + 1] ?? 0) +
                LUMA[2] * (input[index + 2] ?? 0)
            ) / 255;
            const threshold: number = (BAYER2[(y % 2) * 2 + (x % 2)] ?? 0) + bias;
            const color: RGB = gray > threshold ? light : dark;
            target[index] = color[0];
            target[index + 1] = color[1];
            target[index + 2] = color[2];
            target[index + 3] = 255;
        }
    }
    return output;
}

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>(
        (resolve: (image: HTMLImageElement) => void, reject: (reason: Error) => void): void => {
            const image: HTMLImageElement = new Image();
            image.crossOrigin = "anonymous";
            image.onload = (): void => {
                if (image.naturalWidth === 0 || image.naturalHeight === 0) {
                    reject(new Error("Dimensioni immagine non valide"));
                    return;
                }
                resolve(image);
            };
            image.onerror = (): void => reject(new Error("Impossibile caricare l'immagine"));
            image.src = url;
        },
    );
}

async function loadFile(file: File): Promise<HTMLImageElement> {
    const url: string = URL.createObjectURL(file);
    try {
        return await loadImage(url);
    } finally {
        URL.revokeObjectURL(url);
    }
}

// ---------- Color picker OKLCH ----------

class OklchPicker {
    public readonly element: HTMLDivElement;
    private readonly color: Oklch;
    private readonly onChange: () => void;
    private readonly swatch: HTMLDivElement;
    private readonly hex: HTMLButtonElement;
    private flashTimer: number = 0;
    private readonly controls: ChannelControl[] = [];

    public constructor(title: string, initial: Oklch, onChange: () => void) {
        this.color = { l: initial.l, c: initial.c, h: initial.h };
        this.onChange = onChange;

        const head: HTMLDivElement = el("div", "dither-tool__head");
        const name: HTMLSpanElement = el("span");
        name.textContent = title;
        this.hex = el("button", "dither-tool__hex");
        this.hex.type = "button";
        this.hex.title = "Copia negli appunti";
        this.hex.addEventListener("click", (): void => {
            void this.copyHex();
        });
        head.append(name, this.hex);

        this.swatch = el("div", "dither-tool__swatch");

        this.element = el("div", "dither-tool__picker");
        this.element.append(head, this.swatch);

        CHANNELS.forEach((spec: ChannelSpec): void => {
            const control: ChannelControl = this.createControl(title, spec);
            this.controls.push(control);
            this.element.append(control.row);
        });

        this.refresh(null);
    }

    private async copyHex(): Promise<void> {
        try {
            await navigator.clipboard.writeText(rgbToHex(this.getRgb()));
            this.flash("Copiato!");
        } catch (error: unknown) {
            console.warn("[dither-tool]", error);
            this.flash("Errore");
        }
    }

    private flash(message: string): void {
        window.clearTimeout(this.flashTimer);
        this.hex.textContent = message;
        this.flashTimer = window.setTimeout((): void => {
            this.hex.textContent = rgbToHex(this.getRgb());
        }, 1000);
    }

    public getRgb(): RGB {
        return oklchToRgb(this.color);
    }

    private createControl(title: string, spec: ChannelSpec): ChannelControl {
        const row: HTMLDivElement = el("div", "dither-tool__channel");
        const name: HTMLSpanElement = el("span");
        name.textContent = spec.label;
        const range: HTMLInputElement = el("input");
        const number: HTMLInputElement = el("input");
        range.type = "range";
        number.type = "number";

        [range, number].forEach((input: HTMLInputElement): void => {
            input.min = String(spec.min);
            input.max = String(spec.max);
            input.step = String(spec.step);
            input.setAttribute("aria-label", `${title} ${spec.label}`);
        });

        const onInput: (source: HTMLInputElement) => void = (source: HTMLInputElement): void => {
            if (source.value.trim() === "") {
                return;
            }
            const value: number = Number(source.value);
            if (Number.isNaN(value)) {
                return;
            }
            this.color[spec.key] = clamp(value, spec.min, spec.max);
            this.refresh(source);
            this.onChange();
        };
        range.addEventListener("input", (): void => onInput(range));
        number.addEventListener("input", (): void => onInput(number));
        // A fine modifica riallinea il testo del campo numerico al valore effettivo
        number.addEventListener("change", (): void => this.refresh(null));

        row.append(name, range, number);
        return { spec, row, range, number };
    }

    // `active` è il campo in modifica: non va sovrascritto mentre l'utente digita
    private refresh(active: HTMLInputElement | null): void {
        this.controls.forEach((control: ChannelControl): void => {
            const value: number = this.color[control.spec.key];
            if (control.range !== active) {
                control.range.value = String(value);
            }
            if (control.number !== active) {
                control.number.value = value.toFixed(control.spec.decimals);
            }
            this.updateTrack(control);
        });
        const hex: string = rgbToHex(oklchToRgb(this.color));
        this.swatch.style.backgroundColor = hex;
        this.hex.textContent = hex;
    }

    private updateTrack(control: ChannelControl): void {
        const stops: string[] = [];
        for (let i: number = 0; i <= GRADIENT_STOPS; i++) {
            const t: number = i / GRADIENT_STOPS;
            const value: number = control.spec.min + (control.spec.max - control.spec.min) * t;
            const rgb: RGB = oklchToRgb(withChannel(this.color, control.spec.key, value));
            stops.push(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]}) ${(t * 100).toFixed(1)}%`);
        }
        control.range.style.setProperty("--track", `linear-gradient(to right, ${stops.join(", ")})`);
    }
}

// ---------- Tool ----------

const SCRUB_THRESHOLD: number = 3;

interface ScrubState {
    pointerId: number;
    startX: number;
    startValue: number;
    dragging: boolean;
}

// Trascinando orizzontalmente un campo senza focus il valore cambia di 1 per pixel.
// Un click senza trascinamento entra in modifica con il testo selezionato.
function attachScrub(input: HTMLInputElement, min: number, max: number): void {
    let state: ScrubState | null = null;
    input.classList.add("dither-tool__scrub");

    // Senza focus, il drag sostituisce focus e selezione del testo
    input.addEventListener("mousedown", (event: MouseEvent): void => {
        if (event.button === 0 && document.activeElement !== input) {
            event.preventDefault();
        }
    });

    input.addEventListener("pointerdown", (event: PointerEvent): void => {
        if (event.button !== 0 || document.activeElement === input) {
            return;
        }
        const current: number = Number(input.value);
        state = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startValue: input.value.trim() === "" || Number.isNaN(current) ? min : current,
            dragging: false,
        };
        input.setPointerCapture(event.pointerId);
    });

    input.addEventListener("pointermove", (event: PointerEvent): void => {
        if (state === null || event.pointerId !== state.pointerId) {
            return;
        }
        if (!state.dragging) {
            if (Math.abs(event.clientX - state.startX) < SCRUB_THRESHOLD) {
                return;
            }
            // Riparte da qui, così il valore non salta della soglia
            state.dragging = true;
            state.startX = event.clientX;
            return;
        }
        const value: number = clamp(Math.round(state.startValue + event.clientX - state.startX), min, max);
        if (input.value !== String(value)) {
            input.value = String(value);
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    });

    const end: (event: PointerEvent) => void = (event: PointerEvent): void => {
        if (state === null || event.pointerId !== state.pointerId) {
            return;
        }
        const wasDragging: boolean = state.dragging;
        state = null;
        if (!wasDragging && event.type === "pointerup") {
            input.focus();
            input.select();
        }
    };
    input.addEventListener("pointerup", end);
    input.addEventListener("pointercancel", end);
}

function createSizeField(label: string, max: number): SizeField {
    const wrapper: HTMLLabelElement = el("label");
    const input: HTMLInputElement = el("input");
    input.type = "number";
    input.min = "1";
    input.max = String(max);
    input.step = "1";
    input.inputMode = "numeric";
    attachScrub(input, 1, max);
    wrapper.append(label, input);
    return { wrapper, input };
}

class DitherTool {
    public readonly element: HTMLDivElement;
    private readonly config: Config;
    private readonly canvas: HTMLCanvasElement;
    private readonly placeholder: HTMLSpanElement;
    private readonly context: CanvasRenderingContext2D;
    private readonly status: HTMLParagraphElement;
    private readonly widthField: SizeField;
    private readonly heightField: SizeField;
    private readonly darkPicker: OklchPicker;
    private readonly lightPicker: OklchPicker;
    private readonly downloadButton: HTMLButtonElement;
    private image: HTMLImageElement | null = null;
    private small: ImageData | null = null;
    private baseName: string = "image";

    public constructor(config: Config) {
        this.config = config;

        this.canvas = el("canvas");
        this.canvas.hidden = true;
        const context: CanvasRenderingContext2D | null = this.canvas.getContext("2d");
        if (context === null) {
            throw new Error("Canvas 2D non disponibile");
        }
        this.context = context;

        this.placeholder = el("span", "dither-tool__placeholder");
        this.placeholder.textContent = "Carica un'immagine per iniziare";

        const stage: HTMLDivElement = el("div", "dither-tool__stage");
        stage.append(this.placeholder, this.canvas);

        const fileInput: HTMLInputElement = el("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        const fileLabel: HTMLLabelElement = el("label");
        fileLabel.append("Immagine", fileInput);

        this.widthField = createSizeField("Larghezza (px)", config.maxSide);
        this.heightField = createSizeField("Altezza (px)", config.maxSide);

        this.darkPicker = new OklchPicker("Colore scuro", config.initialDark, (): void => this.draw());
        this.lightPicker = new OklchPicker("Colore chiaro", config.initialLight, (): void => this.draw());

        this.status = el("p", "dither-tool__status");
        this.status.setAttribute("aria-live", "polite");

        this.downloadButton = el("button", "dither-tool__button");
        this.downloadButton.type = "button";
        this.downloadButton.textContent = "Scarica PNG";
        this.downloadButton.disabled = true;

        const actions: HTMLDivElement = el("div", "dither-tool__actions");
        actions.append(this.downloadButton, this.status);

        const sizeTitle: HTMLSpanElement = el("span");
        sizeTitle.textContent = "Dimensioni";
        const sizeHead: HTMLDivElement = el("div", "dither-tool__head");
        sizeHead.append(sizeTitle);
        const sizeFields: HTMLDivElement = el("div", "dither-tool__row");
        sizeFields.append(this.widthField.wrapper, this.heightField.wrapper);
        const sizePanel: HTMLDivElement = el("div", "dither-tool__panel");
        sizePanel.append(sizeHead, sizeFields);

        const colorRow: HTMLDivElement = el("div", "dither-tool__row");
        colorRow.append(this.darkPicker.element, this.lightPicker.element);

        this.element = el("div", "dither-tool");
        this.element.append(fileLabel, sizePanel, colorRow, stage, actions);

        fileInput.addEventListener("change", (): void => {
            const file: File | undefined = fileInput.files?.[0];
            if (file !== undefined) {
                this.openFile(file);
            }
        });

        [this.widthField.input, this.heightField.input].forEach((input: HTMLInputElement): void => {
            input.addEventListener("input", (): void => this.resize());
            input.addEventListener("change", (): void => this.normalizeSize(input));
        });

        this.downloadButton.addEventListener("click", (): void => this.download());
    }

    private openFile(file: File): void {
        loadFile(file)
            .then((image: HTMLImageElement): void => {
                this.image = image;
                this.baseName = file.name.replace(/\.[^.]+$/, "");
                const longest: number = Math.max(image.naturalWidth, image.naturalHeight);
                const scale: number = Math.min(1, this.config.defaultMaxSide / longest);
                this.widthField.input.value = String(Math.max(1, Math.round(image.naturalWidth * scale)));
                this.heightField.input.value = String(Math.max(1, Math.round(image.naturalHeight * scale)));
                this.status.textContent = "";
                this.resize();
            })
            .catch((error: unknown): void => {
                console.warn("[dither-tool]", error);
                this.status.textContent = "Impossibile caricare l'immagine.";
            });
    }

    private readSize(input: HTMLInputElement): number | null {
        const value: number = Number(input.value);
        if (input.value.trim() === "" || !Number.isInteger(value) || value < 1) {
            return null;
        }
        return Math.min(value, this.config.maxSide);
    }

    private normalizeSize(input: HTMLInputElement): void {
        const size: number | null = this.readSize(input);
        if (size !== null) {
            input.value = String(size);
        }
    }

    // Ricampiona solo quando cambiano immagine o dimensioni
    private resize(): void {
        const image: HTMLImageElement | null = this.image;
        if (image === null) {
            return;
        }
        const width: number | null = this.readSize(this.widthField.input);
        const height: number | null = this.readSize(this.heightField.input);
        if (width === null || height === null) {
            return;
        }
        this.small = resample(image, width, height);
        this.draw();
    }

    // Ridisegna (dithering + palette) senza ricampionare
    private draw(): void {
        const small: ImageData | null = this.small;
        if (small === null) {
            return;
        }
        const result: ImageData = ditherImage(
            small,
            this.darkPicker.getRgb(),
            this.lightPicker.getRgb(),
            this.config.ditherBias,
        );
        this.canvas.width = small.width;
        this.canvas.height = small.height;
        this.context.putImageData(result, 0, 0);
        this.canvas.hidden = false;
        this.placeholder.hidden = true;
        this.downloadButton.disabled = false;
    }

    private download(): void {
        this.canvas.toBlob((blob: Blob | null): void => {
            if (blob === null) {
                return;
            }
            const url: string = URL.createObjectURL(blob);
            const link: HTMLAnchorElement = el("a");
            link.href = url;
            link.download = `${this.baseName}_dither.png`;
            link.click();
            window.setTimeout((): void => URL.revokeObjectURL(url), 1000);
        }, "image/png");
    }
}

function injectStyle(): void {
    if (document.getElementById(STYLE_ID) !== null) {
        return;
    }
    const style: HTMLStyleElement = el("style");
    style.id = STYLE_ID;
    style.textContent = STYLE;
    document.head.appendChild(style);
}

function init(): void {
    injectStyle();
    const host: HTMLElement = document.querySelector<HTMLElement>(CONFIG.selector) ?? document.body;
    const tool: DitherTool = new DitherTool(CONFIG);
    host.appendChild(tool.element);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}