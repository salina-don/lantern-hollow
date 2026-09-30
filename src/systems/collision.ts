import { useGameStore } from '../state/gameStore';

export interface Collider {
  cx: number;
  cz: number;
  hw: number;
  hd: number;
}

const T = 0.15;
const DOOR_HW = 0.6;

interface DoorCollider {
  doorId: string;
  collider: Collider;
}

function houseWalls(cx: number, cz: number, w: number, d: number): Collider[] {
  const hw = w / 2;
  const hd = d / 2;
  const doorX = cx - w * 0.12;
  return [
    { cx, cz: cz + hd, hw, hd: T },
    { cx: cx - hw, cz, hw: T, hd },
    { cx: cx + hw, cz, hw: T, hd },
    {
      cx: (cx - hw + doorX - DOOR_HW) / 2,
      cz: cz - hd,
      hw: (doorX - DOOR_HW - cx + hw) / 2,
      hd: T,
    },
    {
      cx: (cx + hw + doorX + DOOR_HW) / 2,
      cz: cz - hd,
      hw: (cx + hw - doorX - DOOR_HW) / 2,
      hd: T,
    },
  ];
}

function doorCollider(cx: number, cz: number, w: number, d: number): Collider {
  const hd = d / 2;
  const doorX = cx - w * 0.12;
  return { cx: doorX, cz: cz - hd, hw: DOOR_HW, hd: T };
}

const DOOR_COLLIDERS: DoorCollider[] = [
  { doorId: 'tavern', collider: doorCollider(8, 5, 4, 3.5) },
  { doorId: 'bakery', collider: doorCollider(-8, 5, 4, 3) },
  { doorId: 'forge', collider: doorCollider(8, -6, 3, 3) },
  { doorId: 'player_house', collider: doorCollider(-4, 8, 3, 2.5) },
];

const TAVERN_WALLS = houseWalls(8, 5, 4, 3.5);
const BAKERY_WALLS = houseWalls(-8, 5, 4, 3);
const FORGE_WALLS = houseWalls(8, -6, 3, 3);
const PLAYER_HOUSE_WALLS = houseWalls(-4, 8, 3, 2.5);

const PROPS: Collider[] = [
  { cx: -3, cz: -4, hw: 0.7, hd: 0.7 },
  { cx: -1.8, cz: -12, hw: 0.5, hd: 0.5 },
  { cx: 1.8, cz: -12, hw: 0.5, hd: 0.5 },
  { cx: 6.8, cz: -6.5, hw: 0.35, hd: 0.25 },
  { cx: 10.3, cz: 3.8, hw: 0.35, hd: 0.35 },
  { cx: 10.6, cz: 4.4, hw: 0.35, hd: 0.35 },
  { cx: -10.3, cz: 4.2, hw: 0.35, hd: 0.35 },
  { cx: -10.3, cz: 5.2, hw: 0.3, hd: 0.3 },
  { cx: 6.2, cz: -4.8, hw: 0.3, hd: 0.3 },
  { cx: 6.6, cz: -4.3, hw: 0.3, hd: 0.3 },
  { cx: 5.5, cz: 10, hw: 2.5, hd: 2.5 },
  { cx: 0, cz: 2, hw: 1.3, hd: 0.45 },
  { cx: 6, cz: 3.5, hw: 0.6, hd: 0.4 },
];

const TREES: Collider[] = [
  { cx: -10, cz: -4.5, hw: 0.3, hd: 0.3 },
  { cx: -8, cz: -4, hw: 0.3, hd: 0.3 },
  { cx: -6, cz: -4.5, hw: 0.3, hd: 0.3 },
  { cx: -10, cz: -6.5, hw: 0.3, hd: 0.3 },
  { cx: -7, cz: -7, hw: 0.3, hd: 0.3 },
  { cx: -9, cz: -7.5, hw: 0.3, hd: 0.3 },
];

const ROCKS: Collider[] = [
  { cx: 5, cz: -2, hw: 0.35, hd: 0.35 },
  { cx: 12, cz: 3, hw: 0.28, hd: 0.28 },
  { cx: -11, cz: -1, hw: 0.42, hd: 0.42 },
  { cx: 3, cz: -9, hw: 0.38, hd: 0.38 },
  { cx: -6, cz: 2, hw: 0.3, hd: 0.3 },
];

const BUSHES: Collider[] = [
  { cx: 4, cz: 7, hw: 0.45, hd: 0.45 },
  { cx: -5, cz: -9, hw: 0.5, hd: 0.5 },
  { cx: 10, cz: -3, hw: 0.4, hd: 0.4 },
  { cx: -12, cz: 5, hw: 0.55, hd: 0.55 },
  { cx: 6, cz: -10, hw: 0.35, hd: 0.35 },
  { cx: 11, cz: 8, hw: 0.42, hd: 0.42 },
  { cx: -11, cz: -8, hw: 0.38, hd: 0.38 },
];

export const ALL_COLLIDERS: Collider[] = [
  ...TAVERN_WALLS,
  ...BAKERY_WALLS,
  ...FORGE_WALLS,
  ...PLAYER_HOUSE_WALLS,
  ...PROPS,
  ...TREES,
  ...ROCKS,
  ...BUSHES,
];

function hitBox(nx: number, nz: number, c: Collider, radius: number): boolean {
  return Math.abs(nx - c.cx) < c.hw + radius && Math.abs(nz - c.cz) < c.hd + radius;
}

export function wouldCollide(nx: number, nz: number, radius = 0.45, skipDoors = false): boolean {
  for (const c of ALL_COLLIDERS) {
    if (hitBox(nx, nz, c, radius)) return true;
  }
  if (!skipDoors) {
    const doors = useGameStore.getState().doors;
    for (const dc of DOOR_COLLIDERS) {
      if (!doors[dc.doorId] && hitBox(nx, nz, dc.collider, radius)) return true;
    }
  }
  return false;
}
