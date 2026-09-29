interface Box { cx: number; cz: number; hw: number; hd: number }

// Orchard tree trunks (absolute positions)
const TREE_TRUNKS: Box[] = [
  { cx: -10,  cz: -4.5, hw: 0.35, hd: 0.35 },
  { cx: -8,   cz: -4,   hw: 0.35, hd: 0.35 },
  { cx: -6,   cz: -4.5, hw: 0.35, hd: 0.35 },
  { cx: -10,  cz: -6.5, hw: 0.35, hd: 0.35 },
  { cx: -7,   cz: -7,   hw: 0.35, hd: 0.35 },
  { cx: -9,   cz: -7.5, hw: 0.35, hd: 0.35 },
];

const BUILDING_BOXES: Box[] = [
  { cx: 8,    cz: 5,    hw: 2.2,  hd: 2.0  }, // tavern
  { cx: -8,   cz: 5,    hw: 2.2,  hd: 1.8  }, // bakery
  { cx: 8,    cz: -6,   hw: 1.7,  hd: 1.7  }, // forge
  { cx: -3,   cz: -4,   hw: 0.75, hd: 0.75 }, // well
  { cx: -1.8, cz: -14,  hw: 0.55, hd: 0.55 }, // gate pillar L
  { cx: 1.8,  cz: -14,  hw: 0.55, hd: 0.55 }, // gate pillar R
];

const ALL_BOXES: Box[] = [...BUILDING_BOXES, ...TREE_TRUNKS];

const PLAYER_R = 0.45;

/** Returns true if the player centre at (nx, nz) overlaps any collision box. */
export function wouldCollide(nx: number, nz: number): boolean {
  for (const b of ALL_BOXES) {
    if (
      Math.abs(nx - b.cx) < b.hw + PLAYER_R &&
      Math.abs(nz - b.cz) < b.hd + PLAYER_R
    ) {
      return true;
    }
  }
  return false;
}

export { TREE_TRUNKS };
