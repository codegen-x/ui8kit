// The panorama grid: cards on a sphere seen from its centre, latitude within ±60° (no polar rows).
// Rows every 6° (21 rows); a row at latitude φ holds round(48·cos φ) cards, evenly spaced in longitude, so the arc between
// neighbours stays near the equator's 7.5° on every row. A card spans 6.6° × 4.95° (4:3, the aspect of the 1440×1080
// first screens); the gaps come out at about 1° both ways (exact figures: gridStats()).

export const EQUATOR_CARDS = 48;
export const ROW_STEP_DEG = 6;
export const MAX_LAT_DEG = 60;
export const CARD_W_DEG = 6.6;
export const CARD_H_DEG = 4.95;
/** sphere radius in world units (the camera sits at the centre) */
export const RADIUS = 10;
/** the screen size a card shows (CSS px) and the snapshot sizes */
export const SCREEN_W = 1440;
export const SCREEN_H = 1080;

const rad = (d: number): number => (d * Math.PI) / 180;

export type Card = {
  index: number;
  row: number;
  col: number;
  lat: number;
  lon: number;
  /** cards in this row */
  perRow: number;
  /** unit direction from the centre */
  dir: [number, number, number];
};

export type Row = { row: number; lat: number; count: number };

/** number of rows (21) */
export const ROW_COUNT = 2 * Math.round(MAX_LAT_DEG / ROW_STEP_DEG) + 1;

/** the row as the user counts it: 1 is the top row (latitude +60°), ROW_COUNT the bottom one (−60°); `row` is Card.row */
export const rowFromTop = (row: number): number => ROW_COUNT - row;
/** Card.row of a row counted from the top */
export const rowFromBottom = (top: number): number => ROW_COUNT - top;

export function rows(): Row[] {
  const out: Row[] = [];
  const n = Math.round(MAX_LAT_DEG / ROW_STEP_DEG);
  for (let i = -n; i <= n; i++) {
    const lat = i * ROW_STEP_DEG;
    out.push({ row: i + n, lat, count: Math.round(EQUATOR_CARDS * Math.cos(rad(lat))) });
  }
  return out;
}

/** direction of (lat, lon); lon 0 looks down -Z (the camera's rest direction), lon grows to the right */
export function direction(lat: number, lon: number): [number, number, number] {
  const c = Math.cos(rad(lat));
  return [c * Math.sin(rad(lon)), Math.sin(rad(lat)), -c * Math.cos(rad(lon))];
}

/** every card, top row first, left to right; column 0 of every row sits at lon 0 so the rest view is an aligned wall */
export function cards(): Card[] {
  const out: Card[] = [];
  for (const r of rows().reverse()) {
    const step = 360 / r.count;
    for (let c = 0; c < r.count; c++) {
      let lon = c * step;
      if (lon > 180) lon -= 360;
      out.push({ index: out.length, row: r.row, col: c, lat: r.lat, lon, perRow: r.count, dir: direction(r.lat, lon) });
    }
  }
  return out;
}

/** world size of a flat card whose centre is RADIUS away and whose edges subtend CARD_W_DEG × CARD_H_DEG */
export function cardSize(): { w: number; h: number } {
  return { w: 2 * RADIUS * Math.tan(rad(CARD_W_DEG / 2)), h: 2 * RADIUS * Math.tan(rad(CARD_H_DEG / 2)) };
}

/** the figures of the grid: rows, cards per row, total, and the smallest/largest gaps between neighbours in degrees */
export function gridStats(): { rows: Row[]; total: number; hGapMin: number; hGapMax: number; vGap: number } {
  const rs = rows();
  let hGapMin = Infinity, hGapMax = -Infinity;
  for (const r of rs) {
    // angle between the centres of two neighbours on the row (great circle), minus the card width
    const half = rad(360 / r.count / 2);
    const sep = (2 * Math.asin(Math.cos(rad(r.lat)) * Math.sin(half)) * 180) / Math.PI;
    hGapMin = Math.min(hGapMin, sep - CARD_W_DEG);
    hGapMax = Math.max(hGapMax, sep - CARD_W_DEG);
  }
  return { rows: rs, total: rs.reduce((s, r) => s + r.count, 0), hGapMin, hGapMax, vGap: ROW_STEP_DEG - CARD_H_DEG };
}
