import { wouldCollide } from './collision';

export const GRID_MIN = -20;
export const GRID_MAX = 20;
export const CELL_SIZE = 0.5;
export const GRID_SIZE = Math.round((GRID_MAX - GRID_MIN) / CELL_SIZE);
const NPC_RADIUS = 0.3;

type Vec3 = [number, number, number];

let grid: Uint8Array | null = null;

export function worldToGrid(wx: number, wz: number): [number, number] {
  return [
    Math.max(0, Math.min(GRID_SIZE - 1, Math.floor((wx - GRID_MIN) / CELL_SIZE))),
    Math.max(0, Math.min(GRID_SIZE - 1, Math.floor((wz - GRID_MIN) / CELL_SIZE))),
  ];
}

export function gridToWorld(gx: number, gz: number): [number, number] {
  return [GRID_MIN + (gx + 0.5) * CELL_SIZE, GRID_MIN + (gz + 0.5) * CELL_SIZE];
}

function idx(gx: number, gz: number) {
  return gz * GRID_SIZE + gx;
}

function blocked(gx: number, gz: number): boolean {
  if (gx < 0 || gx >= GRID_SIZE || gz < 0 || gz >= GRID_SIZE) return true;
  return grid![idx(gx, gz)] === 1;
}

export function buildNavGrid(): void {
  grid = new Uint8Array(GRID_SIZE * GRID_SIZE);
  for (let gz = 0; gz < GRID_SIZE; gz++) {
    for (let gx = 0; gx < GRID_SIZE; gx++) {
      const [wx, wz] = gridToWorld(gx, gz);
      if (wouldCollide(wx, wz, NPC_RADIUS, true)) {
        grid[idx(gx, gz)] = 1;
      }
    }
  }
}

export function resetNavGrid(): void {
  grid = null;
}

function nearestWalkable(gx: number, gz: number): [number, number] | null {
  if (!blocked(gx, gz)) return [gx, gz];
  for (let r = 1; r <= 8; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dz = -r; dz <= r; dz++) {
        if (Math.abs(dx) !== r && Math.abs(dz) !== r) continue;
        if (!blocked(gx + dx, gz + dz)) return [gx + dx, gz + dz];
      }
    }
  }
  return null;
}

function simplify(path: Vec3[]): Vec3[] {
  if (path.length <= 2) return path;
  const out: Vec3[] = [path[0]];
  for (let i = 1; i < path.length - 1; i++) {
    const p = out[out.length - 1];
    const n = path[i + 1];
    const cross = (path[i][0] - p[0]) * (n[2] - p[2]) - (path[i][2] - p[2]) * (n[0] - p[0]);
    if (Math.abs(cross) > 0.001) out.push(path[i]);
  }
  out.push(path[path.length - 1]);
  return out;
}

const DIRS: [number, number, number][] = [
  [-1, 0, 1], [1, 0, 1], [0, -1, 1], [0, 1, 1],
  [-1, -1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [1, 1, 1.414],
];

export function findPath(
  sx: number, sz: number,
  ex: number, ez: number,
): Vec3[] | null {
  if (!grid) buildNavGrid();

  let [sgx, sgz] = worldToGrid(sx, sz);
  let [egx, egz] = worldToGrid(ex, ez);

  const ws = nearestWalkable(sgx, sgz);
  if (!ws) return null;
  [sgx, sgz] = ws;

  const we = nearestWalkable(egx, egz);
  if (!we) return null;
  [egx, egz] = we;

  if (sgx === egx && sgz === egz) return [[ex, 0, ez]];

  const gScores = new Map<number, number>();
  const cameFrom = new Map<number, number>();
  const openF = new Map<number, number>();

  function h(gx: number, gz: number) {
    return Math.sqrt((gx - egx) ** 2 + (gz - egz) ** 2);
  }

  const si = idx(sgx, sgz);
  gScores.set(si, 0);
  openF.set(si, h(sgx, sgz));

  while (openF.size > 0) {
    let bestI = -1;
    let bestF = Infinity;
    for (const [i, f] of openF) {
      if (f < bestF) { bestF = f; bestI = i; }
    }
    openF.delete(bestI);

    const cgx = bestI % GRID_SIZE;
    const cgz = (bestI - cgx) / GRID_SIZE;

    if (cgx === egx && cgz === egz) {
      const raw: Vec3[] = [];
      let ci = bestI;
      while (ci !== si) {
        const rx = ci % GRID_SIZE;
        const rz = (ci - rx) / GRID_SIZE;
        const [wx, wz] = gridToWorld(rx, rz);
        raw.unshift([wx, 0, wz]);
        ci = cameFrom.get(ci)!;
      }
      if (raw.length > 0) {
        raw[raw.length - 1] = [ex, 0, ez];
      } else {
        raw.push([ex, 0, ez]);
      }
      return simplify(raw);
    }

    const cg = gScores.get(bestI)!;

    for (const [ddx, ddz, cost] of DIRS) {
      const nx = cgx + ddx;
      const nz = cgz + ddz;
      if (blocked(nx, nz)) continue;
      if (ddx !== 0 && ddz !== 0) {
        if (blocked(cgx + ddx, cgz) || blocked(cgx, cgz + ddz)) continue;
      }
      const ni = idx(nx, nz);
      const ng = cg + cost;
      const pg = gScores.get(ni);
      if (pg !== undefined && ng >= pg) continue;
      gScores.set(ni, ng);
      cameFrom.set(ni, bestI);
      openF.set(ni, ng + h(nx, nz));
    }
  }

  return null;
}

export function getBlockedCells(): [number, number][] {
  if (!grid) buildNavGrid();
  const cells: [number, number][] = [];
  for (let gz = 0; gz < GRID_SIZE; gz++) {
    for (let gx = 0; gx < GRID_SIZE; gx++) {
      if (grid![idx(gx, gz)] === 1) {
        const [wx, wz] = gridToWorld(gx, gz);
        cells.push([wx, wz]);
      }
    }
  }
  return cells;
}
