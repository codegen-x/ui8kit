// The Three.js panorama: the camera sits at the centre of the sphere, every card is a textured plane facing it.
// One ShaderMaterial program draws a card: rounded rectangle (SDF), soft shadow, a thin outline when picked,
// and (on a curated row) a small dot in the top-right corner. The dot is drawn here, not into the snapshot.
// Textures, two tiers:
//   low  — every card has a 96×72 cell in one of two 2048×2048 atlases (588 cells each), no mipmaps: 2 × 16 MiB
//   high — a pool of POOL 400×300 textures with mipmaps (≈ 0.64 MiB each, 51 MiB for 80) for the cards nearest the view
// (full profile; tablets and phones use the light one of profile.ts: 64×48 cells in a single atlas, 320×240 without mipmaps)
// Rendering is on demand: a frame is drawn only while dragging, during inertia, after a zoom, or after a texture changed.
// Zoom: the camera stays at the centre (there is no distance to move), so the wheel narrows or widens the field of view;
// the apparent scale of the cards is clamped to ZOOM_MIN..ZOOM_MAX of the default view.
import * as THREE from "three";
import { cards as gridCards, cardSize, CARD_H_DEG, MAX_LAT_DEG, RADIUS, rowFromTop, type Card } from "./grid";

import { profile } from "./profile";

// sizes come from the device profile (profile.ts); the numbers below are the full (desktop) profile
const P = profile();
export const LOW_W = P.lowW; // 96
export const LOW_H = P.lowH; // 72
export const HIGH_W = P.highW; // 400
export const HIGH_H = P.highH; // 300
export const POOL = P.pool;
const NCARDS = gridCards().length;
/** atlas side: 2048 for the full profile; for the light one the smallest multiple of 128 that holds every cell */
function atlasSide(): number {
  if (!P.singleAtlas) return P.atlas;
  for (let s = 512; s < P.atlas; s += 128) if (Math.floor(s / LOW_W) * Math.floor(s / LOW_H) >= NCARDS) return s;
  return P.atlas;
}
export const ATLAS = atlasSide();
const COLS = Math.floor(ATLAS / LOW_W); // 21
const ROWS = Math.floor(ATLAS / LOW_H); // 28
const PER_ATLAS = COLS * ROWS; // 588
/** horizontal field of view kept on any window shape: about 7.7 columns of 7.5° (vertical follows the aspect) */
const H_FOV_DEG = 58;
/** apparent card scale relative to the default view: 0.75 is the farthest (smaller cards), 1.25 the closest */
export const ZOOM_MIN = 0.75;
export const ZOOM_MAX = 1.25;
/** scale change per wheel pixel (one 100 px notch is about 14 %) */
const ZOOM_PER_PX = 0.0015;
/** the ball: camera distance from the centre, its field of view (the sphere fills about 0.875 of the stage height) and a slight tilt */
const BALL_DIST = 40;
const BALL_FOV = 35;
const BALL_PITCH = 0.28;

const VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const FRAG = /* glsl */ `
uniform sampler2D map;
uniform vec4 rect;
uniform float hasMap;
uniform vec3 base;
uniform vec2 size;
uniform vec2 plane;
uniform float radius;
uniform float picked;
uniform vec3 ink;
uniform float shadow;
uniform float line;
uniform float gap;
uniform float mark;
uniform float dotR;
uniform float dotE;
varying vec2 vUv;
float sdRound(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
vec4 over(vec4 a, vec4 b) { float o = a.a + b.a * (1.0 - a.a); return o <= 0.0 ? vec4(0.0) : vec4((a.rgb * a.a + b.rgb * b.a * (1.0 - a.a)) / o, o); }
void main() {
  vec2 p = (vUv - 0.5) * plane;
  if (!gl_FrontFacing) p.x = -p.x; // the ball shows the cards from outside: the back of a card reads the right way round
  float d = sdRound(p, size * 0.5, radius);
  float aa = fwidth(d);
  float inside = 1.0 - smoothstep(-aa, aa, d);
  float ds = sdRound(p - vec2(0.0, -size.y * 0.025), size * 0.5, radius);
  float sh = shadow * (1.0 - smoothstep(-size.y * 0.03, size.y * 0.07, ds));
  vec2 uv = clamp(vec2(p.x / size.x + 0.5, 0.5 - p.y / size.y), 0.0, 1.0);
  vec3 col = hasMap > 0.5 ? texture2D(map, rect.xy + uv * rect.zw).rgb : base;
  float ring = picked * (1.0 - smoothstep(line * 0.5 - aa, line * 0.5 + aa, abs(d - gap - line * 0.5)));
  vec4 c = over(vec4(col, inside), vec4(0.0, 0.0, 0.0, sh));
  c = over(vec4(ink, ring), c);
  // curated row: a few pixels, light core with a thin dark edge, tucked inside the top-right corner
  float need = dotR + dotE;
  vec2 corner = size * 0.5;
  vec2 arc = corner - vec2(radius);
  vec2 dotC = min(arc + vec2(0.70710678) * max(radius - need, 0.0), corner - vec2(need));
  float dd = length(p - dotC);
  float w = max(aa, 1e-5);
  float core = 1.0 - smoothstep(dotR - w, dotR + w, dd);
  float edge = 1.0 - smoothstep(dotR + dotE - w, dotR + dotE + w, dd);
  vec4 badge = over(vec4(0.96, 0.96, 0.94, core), vec4(0.12, 0.12, 0.13, edge));
  c = over(vec4(badge.rgb, badge.a * mark * inside), c);
  if (c.a < 0.003) discard;
  gl_FragColor = c;
}`;

type Uniforms = {
  map: { value: THREE.Texture | null };
  rect: { value: THREE.Vector4 };
  hasMap: { value: number };
  base: { value: THREE.Color };
  size: { value: THREE.Vector2 };
  plane: { value: THREE.Vector2 };
  radius: { value: number };
  picked: { value: number };
  ink: { value: THREE.Color };
  shadow: { value: number };
  line: { value: number };
  gap: { value: number };
  /** 1 when this card's row is listed in curated.ts */
  mark: { value: number };
  /** light-core radius and dark-edge thickness, world units (a few screen px) */
  dotR: { value: number };
  dotE: { value: number };
};

type Atlas = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; tex: THREE.CanvasTexture; dirty: boolean };

export type PanoramaEvents = {
  /** the cards to rank by closeness to the view changed (the snapshot queue re-sorts on it) */
  onView?: () => void;
  onPick?: (index: number, picked: boolean) => void;
};

const dotOf = (c: { dir: [number, number, number] }, f: THREE.Vector3, sign: number): number => sign * (c.dir[0] * f.x + c.dir[1] * f.y + c.dir[2] * f.z);

export class Panorama {
  readonly cards: Card[] = gridCards();
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(34, 16 / 9, 0.1, 100);
  private meshes: THREE.Mesh[] = [];
  private uniforms: Uniforms[] = [];
  private atlases: Atlas[] = [];
  private yaw = 0;
  private pitch = 0;
  /** apparent scale, ZOOM_MIN..ZOOM_MAX; 1 is the default view */
  private zoom = 1;
  /** the vertical field of view of the default view (degrees), set on resize */
  private baseFov = 34;
  private vel = { yaw: 0, pitch: 0 };
  /** a constant slow turn about the vertical axis (radians per ms) while nothing is dragged and no inertia is left; 0 = off (Discovery) */
  private drift = 0;
  private drag: { x: number; y: number; t: number; moved: number; id: number; t0: number } | null = null;
  private lastMove = 0;
  private dirty = true;
  private raf = 0;
  private lastFrame = 0;
  private lastAtlasUpload = 0;
  private lastRank = { yaw: NaN, pitch: NaN };
  private ranked: number[] = [];
  /** high tier: card -> texture; free textures; pending decodes */
  private high = new Map<number, THREE.Texture>();
  private free: THREE.Texture[] = [];
  private decoding = new Set<number>();
  private highStale = new Set<number>();
  private blobs: (Blob | null)[];
  private picked = new Set<number>();
  private ro: ResizeObserver;
  private radiusPx = 10;
  private shadowStrength = 0.5;
  private disposed = false;
  // the ball (magazine header): 0 = seen from the centre (the sphere), 1 = seen from outside (a ball of screens)
  private ballT = 0;
  private renderScale = 1;
  private minFrameMs = 0;
  private lastTick = 0;
  private interactive = true;
  /** frames actually drawn (tests: the ball idles at about 15 per second) */
  frames = 0;

  constructor(private host: HTMLElement, private events: PanoramaEvents = {}) {
    this.blobs = new Array(this.cards.length).fill(null);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: false });
    this.renderer.setPixelRatio(this.pixelRatio() * this.renderScale);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(this.renderer.domElement);
    // iOS Safari: 100vh is the tall viewport (toolbars hidden), so size the stage with dvh where it exists; and keep the page
    // itself from scrolling or rubber-banding under the panorama
    if (typeof CSS !== "undefined" && CSS.supports("height", "100dvh")) host.style.height = "100dvh";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overscrollBehavior = "none";
    this.camera.rotation.order = "YXZ";

    for (let a = 0; a * PER_ATLAS < this.cards.length; a++) {
      const canvas = document.createElement("canvas");
      canvas.width = ATLAS;
      canvas.height = ATLAS;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      const tex = new THREE.CanvasTexture(canvas);
      tex.flipY = false;
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.colorSpace = THREE.NoColorSpace;
      this.atlases.push({ canvas, ctx, tex, dirty: false });
    }

    const { w, h } = cardSize();
    const margin = h * 0.12;
    const geo = new THREE.PlaneGeometry(w + 2 * margin, h + 2 * margin);
    for (const card of this.cards) {
      const u: Uniforms = {
        map: { value: null },
        rect: { value: new THREE.Vector4(0, 0, 1, 1) },
        hasMap: { value: 0 },
        base: { value: new THREE.Color(0.12, 0.12, 0.12) },
        size: { value: new THREE.Vector2(w, h) },
        plane: { value: new THREE.Vector2(w + 2 * margin, h + 2 * margin) },
        radius: { value: 0.06 },
        picked: { value: 0 },
        ink: { value: new THREE.Color(1, 1, 1) },
        shadow: { value: 0.5 },
        line: { value: 0.01 },
        gap: { value: 0.02 },
        mark: { value: 0 },
        dotR: { value: 0.02 },
        dotE: { value: 0.008 },
      };
      const mat = new THREE.ShaderMaterial({ uniforms: u, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      const [x, y, z] = card.dir;
      mesh.position.set(x * RADIUS, y * RADIUS, z * RADIUS);
      mesh.lookAt(0, 0, 0);
      mesh.userData.index = card.index;
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      this.scene.add(mesh);
      this.meshes.push(mesh);
      this.uniforms.push(u);
    }
    for (let i = 0; i < POOL; i++) this.free.push(this.makeHighTexture());

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    // ResizeObserver alone is not enough on tablets: iOS Safari reports the old size right after a rotation and moves the
    // visual viewport (toolbars) without resizing the layout; DevTools device mode changes devicePixelRatio too
    window.addEventListener("resize", this.onWindowResize);
    window.addEventListener("orientationchange", this.onWindowResize);
    window.visualViewport?.addEventListener("resize", this.onWindowResize);
    this.watchPixelRatio();
    this.resize();
    this.bind();
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  private makeHighTexture(): THREE.Texture {
    const t = new THREE.Texture();
    t.flipY = false;
    t.colorSpace = THREE.NoColorSpace;
    t.generateMipmaps = P.mipmaps;
    t.minFilter = P.mipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    return t;
  }

  // ---------------------------------------------------------------- view

  private pitchLimit(): number {
    // keep the top and bottom of the view inside the card band (±60° plus half a card)
    const half = THREE.MathUtils.radToDeg((this.camera.fov * Math.PI) / 360);
    return Math.max(0, MAX_LAT_DEG + CARD_H_DEG / 2 - half - 1);
  }

  /** device pixel ratio, capped at 2 (a 3x phone/tablet panel would cost 2.25x the fill for no visible gain) */
  private pixelRatio(): number {
    return Math.min(window.devicePixelRatio || 1, 2);
  }

  private dprMedia: MediaQueryList | null = null;
  private watchPixelRatio(): void {
    this.dprMedia?.removeEventListener("change", this.onWindowResize);
    this.dprMedia = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    this.dprMedia.addEventListener("change", this.onWindowResize);
  }

  private resizeTimer = 0;
  /** window resize, rotation, visual viewport, pixel ratio change: resize now and once more after the browser settled */
  private onWindowResize = (): void => {
    if (this.disposed) return;
    this.watchPixelRatio();
    this.resize();
    clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => this.resize(), 250);
  };

  private resize(): void {
    const r = this.host.getBoundingClientRect();
    const w = Math.round(r.width) || this.host.clientWidth || window.innerWidth;
    const h = Math.round(r.height) || this.host.clientHeight || window.innerHeight;
    this.renderer.setPixelRatio(this.pixelRatio() * this.renderScale);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    const hf = THREE.MathUtils.degToRad(H_FOV_DEG);
    const vf = 2 * Math.atan(Math.tan(hf / 2) / this.camera.aspect);
    this.baseFov = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(vf), 30, 60);
    this.applyZoom();
  }

  /**
   * The field of view for the current zoom. A card's size on screen goes as 1 / tan(fov / 2), so a scale s takes
   * tan(fov / 2) = tan(baseFov / 2) / s; the outlines stay in screen px and the pitch is re-clamped (a wider view
   * has less room to tilt inside the card band).
   */
  private applyZoom(): void {
    const half = THREE.MathUtils.degToRad(this.baseFov) / 2;
    const inside = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(half) / this.zoom));
    this.camera.fov = inside * (1 - this.ballT) + BALL_FOV * this.ballT;
    this.camera.updateProjectionMatrix();
    this.updateLineWidths();
    this.rotate(0, 0);
    this.dirty = true;
  }

  /** set the apparent scale (clamped to ZOOM_MIN..ZOOM_MAX); used by the wheel, tests and screenshots */
  setZoom(scale: number): void {
    const next = THREE.MathUtils.clamp(scale, ZOOM_MIN, ZOOM_MAX);
    if (next === this.zoom) return;
    this.zoom = next;
    this.applyZoom();
  }

  getZoom(): number {
    return this.zoom;
  }

  /** px per world unit at the centre of the view; outline, gap and corner radius are set in screen px */
  private pxPerUnit(): number {
    const h = this.host.clientHeight || window.innerHeight;
    return h / 2 / Math.tan((this.camera.fov * Math.PI) / 360) / (RADIUS * (1 - this.ballT) + (BALL_DIST - RADIUS) * this.ballT);
  }

  private updateLineWidths(): void {
    const px = this.pxPerUnit();
    for (const u of this.uniforms) {
      u.line.value = 2 / px;
      u.gap.value = 3 / px;
      u.radius.value = (this.radiusPx * (1 - this.ballT)) / px;
      // 4 px light core, 1 px dark edge: readable on a card, still just a dot
      u.dotR.value = 2 / px;
      u.dotE.value = 1 / px;
    }
  }

  /** the corner radius of the cards follows the page's --radius (the kit's one corner token) */
  setRadiusPx(px: number): void {
    this.radiusPx = px;
    this.updateLineWidths();
    this.dirty = true;
  }

  setTheme(dark: boolean): void {
    this.renderer.setClearColor(dark ? 0x000000 : 0xffffff, 1);
    this.shadowStrength = dark ? 0.6 : 0.22;
    for (const u of this.uniforms) {
      u.ink.value.setRGB(dark ? 0.98 : 0.04, dark ? 0.98 : 0.04, dark ? 0.98 : 0.04);
      u.shadow.value = this.shadowStrength * (1 - this.ballT);
    }
    this.dirty = true;
  }

  setPlaceholder(index: number, rgb: [number, number, number]): void {
    this.uniforms[index]!.base.value.setRGB(rgb[0], rgb[1], rgb[2]);
    this.dirty = true;
  }

  forward(): THREE.Vector3 {
    return new THREE.Vector3(0, 0, -1).applyEuler(this.camera.rotation);
  }

  /** card indices sorted by closeness to the view direction (the snapshot queue uses it) */
  rankByView(): number[] {
    // the cards on screen first (nearest the centre of the screen first), then the rest by angle. Ranking by angle alone
    // fills a disc around the centre, and on a wide or tall window the corners of the view stay empty cards the longest.
    this.camera.rotation.set(this.pitch, this.yaw, 0);
    this.camera.updateMatrixWorld();
    const f = this.forward();
    if (this.ballT > 0.3) {
      // the ball: the camera is behind the view direction, so the cards facing it (and visible) are the ones opposite to `f`
      return this.cards.map((c) => c.index).sort((a, b) => dotOf(this.cards[b]!, f, -1) - dotOf(this.cards[a]!, f, -1));
    }
    const v = new THREE.Vector3();
    const score = this.cards.map((c) => {
      const dot = c.dir[0] * f.x + c.dir[1] * f.y + c.dir[2] * f.z;
      if (dot <= 0) return -10 - (1 - dot);
      v.set(c.dir[0], c.dir[1], c.dir[2]).project(this.camera);
      const m = Math.max(Math.abs(v.x), Math.abs(v.y));
      return m <= 1.15 ? 10 - m : dot - 1;
    });
    return this.cards.map((c) => c.index).sort((a, b) => score[b]! - score[a]!);
  }

  // ---------------------------------------------------------------- textures

  /** the low tier: draw the snapshot into the card's atlas cell (uploaded at most every 250 ms) */
  setLow(index: number, source: CanvasImageSource): void {
    const a = this.atlases[Math.floor(index / PER_ATLAS)]!;
    const k = index % PER_ATLAS;
    const x = (k % COLS) * LOW_W;
    const y = Math.floor(k / COLS) * LOW_H;
    a.ctx.drawImage(source, x, y, LOW_W, LOW_H);
    a.dirty = true;
    const u = this.uniforms[index]!;
    if (!this.high.has(index)) {
      u.map.value = a.tex;
      // half a texel inside the cell so bilinear filtering never reads the neighbour
      u.rect.value.set((x + 0.5) / ATLAS, (y + 0.5) / ATLAS, (LOW_W - 1) / ATLAS, (LOW_H - 1) / ATLAS);
      u.hasMap.value = 1;
    }
  }

  /** the compressed snapshot of a card (WebP), decoded on demand for the high tier */
  setBlob(index: number, blob: Blob): void {
    this.blobs[index] = blob;
    if (this.high.has(index)) this.highStale.add(index);
    this.lastRank.yaw = NaN;
    this.dirty = true;
  }

  clearBlobs(): void {
    this.blobs.fill(null);
  }

  private updateHigh(): void {
    const moved = Math.abs(this.yaw - this.lastRank.yaw) + Math.abs(this.pitch - this.lastRank.pitch);
    if (!(moved < 0.004) || this.highStale.size) {
      this.lastRank = { yaw: this.yaw, pitch: this.pitch };
      this.ranked = this.rankByView().filter((i) => this.blobs[i]).slice(0, POOL);
      this.events.onView?.();
    }
    const want = new Set(this.ranked);
    for (const i of this.ranked) {
      if (this.decoding.size >= 4) break;
      if (this.decoding.has(i) || (this.high.has(i) && !this.highStale.has(i))) continue;
      const blob = this.blobs[i];
      if (!blob) continue;
      this.highStale.delete(i);
      this.decoding.add(i);
      createImageBitmap(blob).then((bmp) => {
        this.decoding.delete(i);
        if (this.disposed || !want.has(i) && !this.ranked.includes(i)) { bmp.close(); return; }
        let tex = this.high.get(i);
        if (!tex) {
          tex = this.free.pop();
          if (!tex) {
            // evict the assigned card farthest from the view
            const keep = new Set(this.ranked);
            const victim = [...this.high.keys()].find((k) => !keep.has(k));
            if (victim === undefined) { bmp.close(); return; }
            tex = this.high.get(victim)!;
            this.high.delete(victim);
            this.toLow(victim);
          }
          this.high.set(i, tex);
        }
        const old = tex.image as ImageBitmap | undefined;
        tex.image = bmp;
        tex.needsUpdate = true;
        old?.close?.();
        const u = this.uniforms[i]!;
        u.map.value = tex;
        u.rect.value.set(0, 0, 1, 1);
        u.hasMap.value = 1;
        this.dirty = true;
      }, () => this.decoding.delete(i));
    }
  }

  private toLow(index: number): void {
    const a = this.atlases[Math.floor(index / PER_ATLAS)]!;
    const k = index % PER_ATLAS;
    const x = (k % COLS) * LOW_W;
    const y = Math.floor(k / COLS) * LOW_H;
    const u = this.uniforms[index]!;
    u.map.value = a.tex;
    u.rect.value.set((x + 0.5) / ATLAS, (y + 0.5) / ATLAS, (LOW_W - 1) / ATLAS, (LOW_H - 1) / ATLAS);
  }

  /** GPU bytes of the textures (mip chains included), for the report */
  textureBudget(): { atlases: number; high: number; total: number } {
    const atlases = this.atlases.length * ATLAS * ATLAS * 4;
    const high = POOL * Math.round(HIGH_W * HIGH_H * 4 * (P.mipmaps ? 4 / 3 : 1));
    return { atlases, high, total: atlases + high };
  }

  // ---------------------------------------------------------------- input

  private bind(): void {
    const el = this.host;
    el.addEventListener("pointerdown", this.onDown);
    el.addEventListener("pointermove", this.onMove);
    el.addEventListener("pointerup", this.onUp);
    el.addEventListener("pointercancel", this.onUp);
    el.addEventListener("dblclick", this.onDbl);
    // iOS Safari's own page pinch (a non-standard event) must not zoom the page; our pinch zooms the panorama
    el.addEventListener("gesturestart", this.onGesture);
    // not passive: the wheel zooms the panorama and must never scroll the page
    el.addEventListener("wheel", this.onWheel, { passive: false });
  }

  private radPerPx(): number {
    return (this.camera.fov * Math.PI) / 180 / (this.host.clientHeight || window.innerHeight);
  }

  /** the pointers down now (CSS px); two of them make a pinch */
  private pointers = new Map<number, { x: number; y: number }>();
  private pinch: { dist: number; zoom: number } | null = null;
  private lastTap: { t: number; x: number; y: number } | null = null;
  private lastTouchPick = 0;

  private pinchDist(): number {
    const [a, b] = [...this.pointers.values()];
    return Math.max(1, Math.hypot(a!.x - b!.x, a!.y - b!.y));
  }

  private onDown = (e: PointerEvent): void => {
    if (!this.interactive) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    this.host.setPointerCapture(e.pointerId);
    this.host.dataset.dragging = "";
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.vel = { yaw: 0, pitch: 0 };
    if (this.pointers.size === 2) {
      // the second finger turns the drag into a pinch (zoom 75..125 %); no inertia from the first finger
      this.drag = null;
      this.pinch = { dist: this.pinchDist(), zoom: this.zoom };
    } else if (this.pointers.size === 1) {
      this.drag = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, id: e.pointerId, t0: performance.now() };
    }
  };

  private onMove = (e: PointerEvent): void => {
    if (!this.interactive) return;
    const p = this.pointers.get(e.pointerId);
    if (p) { p.x = e.clientX; p.y = e.clientY; }
    if (this.pinch) {
      if (this.pointers.size >= 2) this.setZoom(this.pinch.zoom * (this.pinchDist() / this.pinch.dist));
      return;
    }
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    const now = performance.now();
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    const k = this.radPerPx();
    this.rotate(dx * k, dy * k);
    const dt = Math.max(1, now - d.t);
    // velocity in rad/ms, smoothed over the last few moves
    this.vel.yaw = this.vel.yaw * 0.6 + ((dx * k) / dt) * 0.4;
    this.vel.pitch = this.vel.pitch * 0.6 + ((dy * k) / dt) * 0.4;
    d.x = e.clientX;
    d.y = e.clientY;
    d.t = now;
    d.moved += Math.abs(dx) + Math.abs(dy);
    this.lastMove = now;
  };

  private onUp = (e: PointerEvent): void => {
    if (!this.pointers.has(e.pointerId)) return;
    this.pointers.delete(e.pointerId);
    if (this.host.hasPointerCapture(e.pointerId)) this.host.releasePointerCapture(e.pointerId);
    if (this.pinch) {
      // one finger left: carry on dragging with it from where it is, without the old velocity
      if (this.pointers.size < 2) {
        this.pinch = null;
        const [id, rest] = [...this.pointers.entries()][0] ?? [];
        this.drag = rest ? { x: rest.x, y: rest.y, t: performance.now(), moved: 99, id: id!, t0: 0 } : null;
        this.vel = { yaw: 0, pitch: 0 };
      }
      if (!this.pointers.size) delete this.host.dataset.dragging;
      return;
    }
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    delete this.host.dataset.dragging;
    const now = performance.now();
    // inertia only when the pointer was still moving at release
    if (now - this.lastMove > 60) this.vel = { yaw: 0, pitch: 0 };
    this.drag = null;
    // double tap (touch and pen; a mouse has dblclick): two short still taps close together outline the card
    if (e.type === "pointerup" && e.pointerType !== "mouse" && d.moved < 12 && now - d.t0 < 350) {
      const t = this.lastTap;
      if (t && now - t.t < 400 && Math.hypot(e.clientX - t.x, e.clientY - t.y) < 32) {
        this.lastTap = null;
        this.lastTouchPick = now;
        this.pickAt(e.clientX, e.clientY);
      } else this.lastTap = { t: now, x: e.clientX, y: e.clientY };
    }
  };

  private onGesture = (e: Event): void => e.preventDefault();

  private onWheel = (e: WheelEvent): void => {
    if (!this.interactive) return;
    e.preventDefault();
    // deltaY in px whatever the device reports (lines or pages); wheel up (negative) zooms in
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? this.host.clientHeight || window.innerHeight : 1;
    const dy = THREE.MathUtils.clamp(e.deltaY * unit, -400, 400);
    if (dy) this.setZoom(this.zoom * Math.exp(-dy * ZOOM_PER_PX));
  };

  private onDbl = (e: MouseEvent): void => {
    if (!this.interactive) return;
    // a touch double tap is handled on pointerup; the browser's dblclick that may follow it must not toggle twice
    if (performance.now() - this.lastTouchPick < 700) return;
    this.pickAt(e.clientX, e.clientY);
  };

  private pickAt(clientX: number, clientY: number): void {
    const rect = this.host.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this.camera.rotation.set(this.pitch, this.yaw, 0);
    this.camera.updateMatrixWorld();
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const hits = ray.intersectObjects(this.meshes, false);
    const { w, h } = cardSize();
    for (const hit of hits) {
      const local = hit.object.worldToLocal(hit.point.clone());
      if (Math.abs(local.x) > w / 2 || Math.abs(local.y) > h / 2) continue;
      const i = hit.object.userData.index as number;
      this.togglePicked(i);
      return;
    }
  }

  /**
   * Put the corner dot on every card of these rows. `rowsFromTop` is counted the way curated.ts counts:
   * 1 is the top row. Rows not listed stay unmarked, so a future row gets the dot by being added there.
   */
  markCuratedRows(rowsFromTop: readonly number[]): void {
    const set = new Set(rowsFromTop);
    for (const c of this.cards) this.uniforms[c.index]!.mark.value = set.has(rowFromTop(c.row)) ? 1 : 0;
    this.dirty = true;
  }

  togglePicked(i: number, on?: boolean): void {
    const next = on ?? !this.picked.has(i);
    if (next) this.picked.add(i);
    else this.picked.delete(i);
    this.uniforms[i]!.picked.value = next ? 1 : 0;
    this.dirty = true;
    this.events.onPick?.(i, next);
  }

  pickedCards(): number[] {
    return [...this.picked].sort((a, b) => a - b);
  }

  private rotate(dYaw: number, dPitch: number): void {
    this.yaw += dYaw;
    const lim = THREE.MathUtils.degToRad(this.pitchLimit());
    this.pitch = THREE.MathUtils.clamp(this.pitch + dPitch, -lim, lim);
    this.dirty = true;
  }

  /** turn slowly by `degPerSec` about the vertical axis when idle (the magazine's resting sphere); 0 stops it */
  setDrift(degPerSec: number): void {
    this.drift = THREE.MathUtils.degToRad(degPerSec) / 1000;
  }

  /**
   * The ball: 0 is the sphere seen from its centre (everything above), 1 the same cards seen from outside as a ball that turns.
   * In between the camera backs out along its view direction and the field of view narrows to the ball's, so a tween of this
   * number is the "dolly out". The caller moves the canvas itself (CSS transform): there is one WebGL context, ever.
   */
  setBall(t: number): void {
    this.ballT = THREE.MathUtils.clamp(t, 0, 1);
    const { w, h } = cardSize();
    for (const u of this.uniforms) {
      u.shadow.value = this.shadowStrength * (1 - this.ballT); // a ball of screens has no drop shadows
      u.size.value.set(w * (1 + 0.14 * this.ballT), h * (1 + 0.14 * this.ballT)); // and its screens touch: a few px each, no gaps
    }
    this.applyZoom();
  }

  getBall(): number {
    return this.ballT;
  }

  /** draw at most `fps` frames a second (0 = every display frame); the ball uses 15 */
  setFps(fps: number): void {
    this.minFrameMs = fps > 0 ? 1000 / fps - 4 : 0;
  }

  /** pointer input on or off (the ball is only a button; the canvas ignores drag, wheel and double click) */
  setInteractive(on: boolean): void {
    this.interactive = on;
    if (!on) { this.drag = null; this.pointers.clear(); this.pinch = null; delete this.host.dataset.dragging; }
  }

  /** the drawing buffer as a share of the CSS size (the ball is shown at about 1/20 of the stage: it needs no more pixels); draws at once */
  setRenderScale(k: number): void {
    if (k === this.renderScale) return;
    this.renderScale = k;
    this.resize();
    this.renderNow();
  }

  /** draw one frame now, outside the loop (after a buffer resize the canvas would otherwise show one blank frame) */
  renderNow(): void {
    this.camera.rotation.set(this.pitch, this.yaw, 0);
    this.placeCamera();
    this.camera.updateMatrixWorld();
    this.renderer.render(this.scene, this.camera);
    this.dirty = false;
  }

  /** the camera for the current view and ball: at the centre looking out, or backed out along the view and looking at the centre */
  private placeCamera(): void {
    const t = this.ballT;
    const pitch = this.pitch * (1 - t) + BALL_PITCH * t;
    this.camera.rotation.set(pitch, this.yaw, 0);
    const f = new THREE.Vector3(0, 0, -1).applyEuler(this.camera.rotation);
    this.camera.position.copy(f.multiplyScalar(-BALL_DIST * t));
  }

  /** set the view (degrees); used by tests and screenshots */
  look(yawDeg: number, pitchDeg: number): void {
    this.yaw = THREE.MathUtils.degToRad(yawDeg);
    this.pitch = 0;
    this.rotate(0, THREE.MathUtils.degToRad(pitchDeg));
  }

  /** screen position (CSS px) of a card centre, for tests and screenshots */
  project(index: number): { x: number; y: number } {
    const v = this.meshes[index]!.position.clone().project(this.camera);
    const r = this.host.getBoundingClientRect();
    return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
  }

  // ---------------------------------------------------------------- frame

  private loop(now: number): void {
    if (this.disposed) return;
    // a hidden tab draws nothing; a capped loop (the ball) skips the display frames between its own
    if (document.hidden || (this.minFrameMs && now - this.lastTick < this.minFrameMs)) { this.raf = requestAnimationFrame(this.loop); return; }
    this.lastTick = now;
    const dt = Math.min(this.minFrameMs ? 200 : 64, now - (this.lastFrame || now));
    this.lastFrame = now;
    if (!this.drag && (Math.abs(this.vel.yaw) > 1e-6 || Math.abs(this.vel.pitch) > 1e-6)) {
      this.rotate(this.vel.yaw * dt, this.vel.pitch * dt);
      const decay = Math.exp(-dt / 280);
      this.vel.yaw *= decay;
      this.vel.pitch *= decay;
      if (Math.abs(this.vel.yaw) < 2e-6 && Math.abs(this.vel.pitch) < 2e-6) this.vel = { yaw: 0, pitch: 0 };
    } else if (!this.drag && this.drift) {
      this.rotate(this.drift * dt, 0);
    }
    this.camera.rotation.set(this.pitch, this.yaw, 0);
    if (this.ballT < 1) this.updateHigh();
    if (now - this.lastAtlasUpload > 250) {
      for (const a of this.atlases) if (a.dirty) { a.tex.needsUpdate = true; a.dirty = false; this.dirty = true; }
      this.lastAtlasUpload = now;
    }
    if (this.dirty) {
      this.dirty = false;
      this.placeCamera();
      this.camera.updateMatrixWorld();
      this.renderer.render(this.scene, this.camera);
      this.frames++;
    }
    this.raf = requestAnimationFrame(this.loop);
  }

  /** draw counts of the last frame, for the report */
  info(): { calls: number; triangles: number; textures: number } {
    const i = this.renderer.info;
    return { calls: i.render.calls, triangles: i.render.triangles, textures: i.memory.textures };
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    clearTimeout(this.resizeTimer);
    window.removeEventListener("resize", this.onWindowResize);
    window.removeEventListener("orientationchange", this.onWindowResize);
    window.visualViewport?.removeEventListener("resize", this.onWindowResize);
    this.dprMedia?.removeEventListener("change", this.onWindowResize);
    const el = this.host;
    el.removeEventListener("pointerdown", this.onDown);
    el.removeEventListener("pointermove", this.onMove);
    el.removeEventListener("pointerup", this.onUp);
    el.removeEventListener("pointercancel", this.onUp);
    el.removeEventListener("dblclick", this.onDbl);
    el.removeEventListener("gesturestart", this.onGesture);
    el.removeEventListener("wheel", this.onWheel);
    for (const a of this.atlases) a.tex.dispose();
    for (const t of [...this.high.values(), ...this.free]) t.dispose();
    for (const m of this.meshes) (m.material as THREE.Material).dispose();
    this.meshes[0]?.geometry.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
