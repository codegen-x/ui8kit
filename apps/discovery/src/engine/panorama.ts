// The Three.js panorama: the camera sits at the centre of the sphere, every card is a textured plane facing it.
// One ShaderMaterial program draws a card: rounded rectangle (SDF), soft shadow, and a thin outline when picked.
// Textures, two tiers:
//   low  — every card has a 96×72 cell in one of two 2048×2048 atlases (588 cells each), no mipmaps: 2 × 16 MiB
//   high — a pool of POOL 400×300 textures with mipmaps (≈ 0.64 MiB each, 51 MiB for 80) for the cards nearest the view
// Rendering is on demand: a frame is drawn only while dragging, during inertia, or after a texture changed.
import * as THREE from "three";
import { cards as gridCards, cardSize, CARD_H_DEG, MAX_LAT_DEG, RADIUS, type Card } from "./grid";

export const LOW_W = 96;
export const LOW_H = 72;
export const ATLAS = 2048;
export const HIGH_W = 400;
export const HIGH_H = 300;
export const POOL = 80;
const COLS = Math.floor(ATLAS / LOW_W); // 21
const ROWS = Math.floor(ATLAS / LOW_H); // 28
const PER_ATLAS = COLS * ROWS; // 588
/** horizontal field of view kept on any window shape: about 7.7 columns of 7.5° (vertical follows the aspect) */
const H_FOV_DEG = 58;

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
varying vec2 vUv;
float sdRound(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
vec4 over(vec4 a, vec4 b) { float o = a.a + b.a * (1.0 - a.a); return o <= 0.0 ? vec4(0.0) : vec4((a.rgb * a.a + b.rgb * b.a * (1.0 - a.a)) / o, o); }
void main() {
  vec2 p = (vUv - 0.5) * plane;
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
};

type Atlas = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; tex: THREE.CanvasTexture; dirty: boolean };

export type PanoramaEvents = {
  /** the cards to rank by closeness to the view changed (the snapshot queue re-sorts on it) */
  onView?: () => void;
  onPick?: (index: number, picked: boolean) => void;
};

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
  private vel = { yaw: 0, pitch: 0 };
  private drag: { x: number; y: number; t: number; moved: number; id: number } | null = null;
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

  constructor(private host: HTMLElement, private events: PanoramaEvents = {}) {
    this.blobs = new Array(this.cards.length).fill(null);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(this.renderer.domElement);
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
      };
      const mat = new THREE.ShaderMaterial({ uniforms: u, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, depthTest: false });
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
    this.resize();
    this.bind();
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  private makeHighTexture(): THREE.Texture {
    const t = new THREE.Texture();
    t.flipY = false;
    t.colorSpace = THREE.NoColorSpace;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    return t;
  }

  // ---------------------------------------------------------------- view

  private pitchLimit(): number {
    // keep the top and bottom of the view inside the card band (±60° plus half a card)
    const half = THREE.MathUtils.radToDeg((this.camera.fov * Math.PI) / 360);
    return Math.max(0, MAX_LAT_DEG + CARD_H_DEG / 2 - half - 1);
  }

  private resize(): void {
    const w = this.host.clientWidth || window.innerWidth;
    const h = this.host.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    const hf = THREE.MathUtils.degToRad(H_FOV_DEG);
    const vf = 2 * Math.atan(Math.tan(hf / 2) / this.camera.aspect);
    this.camera.fov = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(vf), 30, 60);
    this.camera.updateProjectionMatrix();
    this.updateLineWidths();
    this.dirty = true;
  }

  /** px per world unit at the centre of the view; outline, gap and corner radius are set in screen px */
  private pxPerUnit(): number {
    const h = this.host.clientHeight || window.innerHeight;
    return h / 2 / Math.tan((this.camera.fov * Math.PI) / 360) / RADIUS;
  }

  private updateLineWidths(): void {
    const px = this.pxPerUnit();
    for (const u of this.uniforms) {
      u.line.value = 2 / px;
      u.gap.value = 3 / px;
      u.radius.value = this.radiusPx / px;
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
      u.shadow.value = this.shadowStrength;
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
    const f = this.forward();
    const score = this.cards.map((c) => c.dir[0] * f.x + c.dir[1] * f.y + c.dir[2] * f.z);
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
    const high = POOL * Math.round(HIGH_W * HIGH_H * 4 * (4 / 3));
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
  }

  private radPerPx(): number {
    return (this.camera.fov * Math.PI) / 180 / (this.host.clientHeight || window.innerHeight);
  }

  private onDown = (e: PointerEvent): void => {
    if (e.button !== 0) return;
    this.host.setPointerCapture(e.pointerId);
    this.host.dataset.dragging = "";
    this.drag = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, id: e.pointerId };
    this.vel = { yaw: 0, pitch: 0 };
  };

  private onMove = (e: PointerEvent): void => {
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
    if (!this.drag || e.pointerId !== this.drag.id) return;
    if (this.host.hasPointerCapture(e.pointerId)) this.host.releasePointerCapture(e.pointerId);
    delete this.host.dataset.dragging;
    // inertia only when the pointer was still moving at release
    if (performance.now() - this.lastMove > 60) this.vel = { yaw: 0, pitch: 0 };
    this.drag = null;
  };

  private onDbl = (e: MouseEvent): void => {
    const rect = this.host.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
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
  };

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
    const dt = Math.min(64, now - (this.lastFrame || now));
    this.lastFrame = now;
    if (!this.drag && (Math.abs(this.vel.yaw) > 1e-6 || Math.abs(this.vel.pitch) > 1e-6)) {
      this.rotate(this.vel.yaw * dt, this.vel.pitch * dt);
      const decay = Math.exp(-dt / 280);
      this.vel.yaw *= decay;
      this.vel.pitch *= decay;
      if (Math.abs(this.vel.yaw) < 2e-6 && Math.abs(this.vel.pitch) < 2e-6) this.vel = { yaw: 0, pitch: 0 };
    }
    this.camera.rotation.set(this.pitch, this.yaw, 0);
    this.updateHigh();
    if (now - this.lastAtlasUpload > 250) {
      for (const a of this.atlases) if (a.dirty) { a.tex.needsUpdate = true; a.dirty = false; this.dirty = true; }
      this.lastAtlasUpload = now;
    }
    if (this.dirty) {
      this.dirty = false;
      this.camera.updateMatrixWorld();
      this.renderer.render(this.scene, this.camera);
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
    const el = this.host;
    el.removeEventListener("pointerdown", this.onDown);
    el.removeEventListener("pointermove", this.onMove);
    el.removeEventListener("pointerup", this.onUp);
    el.removeEventListener("pointercancel", this.onUp);
    el.removeEventListener("dblclick", this.onDbl);
    for (const a of this.atlases) a.tex.dispose();
    for (const t of [...this.high.values(), ...this.free]) t.dispose();
    for (const m of this.meshes) (m.material as THREE.Material).dispose();
    this.meshes[0]?.geometry.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
