import React from 'react';
import { LOCATIONS } from './locations';

// ── Shared low-poly material helper ────────────────────────────────────────
interface MatProps { color: string; flatShading?: boolean }
function Mat({ color, flatShading = true }: MatProps) {
  return <meshLambertMaterial color={color} flatShading={flatShading} />;
}

// ── Generic house ──────────────────────────────────────────────────────────
interface HouseProps {
  pos: [number, number, number];
  w: number; h: number; d: number;
  wall: string; roof: string;
  chimneyH?: number;
}
function House({ pos, w, h, d, wall, roof, chimneyH }: HouseProps) {
  const roofR = (Math.max(w, d) / 2) * 1.15;
  return (
    <group position={pos}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <Mat color={wall} />
      </mesh>
      {/* pyramid roof – 4 segments */}
      <mesh position={[0, h + 0.65, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[roofR, 1.3, 4]} />
        <Mat color={roof} />
      </mesh>
      {chimneyH != null && (
        <mesh position={[w * 0.25, h + chimneyH / 2, d * 0.2]} castShadow>
          <boxGeometry args={[0.35, chimneyH, 0.35]} />
          <Mat color="#555" />
        </mesh>
      )}
    </group>
  );
}

// ── Town Square stone circle ────────────────────────────────────────────────
function TownSquare() {
  return (
    <mesh
      position={[...LOCATIONS.town_square.position] as [number, number, number]}
      rotation={[-Math.PI / 2, 0, 0]}
      position-y={0.01}
      receiveShadow
    >
      <circleGeometry args={[2.8, 12]} />
      <Mat color="#9e9e8a" />
    </mesh>
  );
}

// ── Tavern ──────────────────────────────────────────────────────────────────
function Tavern() {
  const [x, y, z] = LOCATIONS.tavern.position;
  return (
    <group>
      <House pos={[x, y, z]} w={4} h={3} d={3.5} wall="#C8A96E" roof="#7B3F00" />
      {/* sign post */}
      <mesh position={[x + 2.4, y + 1.5, z]}>
        <cylinderGeometry args={[0.05, 0.05, 3, 5]} />
        <Mat color="#5c3a1e" />
      </mesh>
      <mesh position={[x + 2.6, y + 2.7, z]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.05, 0.8, 0.45]} />
        <Mat color="#c8a056" />
      </mesh>
    </group>
  );
}

// ── Bakery ──────────────────────────────────────────────────────────────────
function Bakery() {
  const [x, y, z] = LOCATIONS.bakery.position;
  return (
    <House pos={[x, y, z]} w={4} h={2.5} d={3} wall="#CC7A5A" roof="#8B2500" chimneyH={1.8} />
  );
}

// ── Forge ───────────────────────────────────────────────────────────────────
function Forge() {
  const [x, y, z] = LOCATIONS.forge.position;
  return (
    <group>
      <House pos={[x, y, z]} w={3} h={3} d={3} wall="#6e7780" roof="#3a4048" chimneyH={2.4} />
      {/* anvil hint */}
      <mesh position={[x - 1.2, y + 0.3, z - 0.5]}>
        <boxGeometry args={[0.6, 0.6, 0.4]} />
        <Mat color="#333" />
      </mesh>
    </group>
  );
}

// ── Well ─────────────────────────────────────────────────────────────────────
function Well() {
  const [x, y, z] = LOCATIONS.well.position;
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 1.3, 8]} />
        <Mat color="#9e9e9e" />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <torusGeometry args={[0.55, 0.07, 6, 12]} />
        <Mat color="#555" />
      </mesh>
      {/* crossbeam posts */}
      {([-0.55, 0.55] as number[]).map((ox, i) => (
        <mesh key={i} position={[ox, 1.8, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.0, 5]} />
          <Mat color="#5c3a1e" />
        </mesh>
      ))}
      <mesh position={[0, 2.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 1.2, 5]} />
        <Mat color="#5c3a1e" />
      </mesh>
    </group>
  );
}

// ── Orchard ──────────────────────────────────────────────────────────────────
const TREE_POSITIONS: Array<[number, number, number]> = [
  [-10, 0, -4.5],
  [-8,  0, -4  ],
  [-6,  0, -4.5],
  [-10, 0, -6.5],
  [-7,  0, -7  ],
  [-9,  0, -7.5],
];

function Tree({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 1.4, 5]} />
        <Mat color="#5c3a1e" />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <coneGeometry args={[0.9, 1.8, 5]} />
        <Mat color="#2d6a2d" />
      </mesh>
      <mesh position={[0, 3.2, 0]} castShadow>
        <coneGeometry args={[0.6, 1.4, 5]} />
        <Mat color="#3a8a3a" />
      </mesh>
    </group>
  );
}

function Orchard() {
  return (
    <group>
      {TREE_POSITIONS.map((pos, i) => (
        <Tree key={i} pos={pos} />
      ))}
    </group>
  );
}

// ── Village Gate ──────────────────────────────────────────────────────────────
function Gate() {
  const [x, y, z] = LOCATIONS.gate.position;
  const pillarH = 4.5;
  const pillarW = 0.9;
  return (
    <group position={[x, y, z]}>
      {/* left pillar */}
      <mesh position={[-1.8, pillarH / 2, 0]} castShadow>
        <boxGeometry args={[pillarW, pillarH, pillarW]} />
        <Mat color="#7a7060" />
      </mesh>
      {/* right pillar */}
      <mesh position={[1.8, pillarH / 2, 0]} castShadow>
        <boxGeometry args={[pillarW, pillarH, pillarW]} />
        <Mat color="#7a7060" />
      </mesh>
      {/* crossbeam */}
      <mesh position={[0, pillarH - 0.3, 0]} castShadow>
        <boxGeometry args={[4.5, 0.5, 0.5]} />
        <Mat color="#5c3a1e" />
      </mesh>
      {/* cap stones */}
      {([-1.8, 1.8] as number[]).map((ox, i) => (
        <mesh key={i} position={[ox, pillarH + 0.3, 0]}>
          <boxGeometry args={[1.1, 0.4, 1.1]} />
          <Mat color="#5a5248" />
        </mesh>
      ))}
    </group>
  );
}

// ── Village fence boundary ────────────────────────────────────────────────────
function FenceSegment({ from, to }: { from: [number, number]; to: [number, number] }) {
  const mx = (from[0] + to[0]) / 2;
  const mz = (from[1] + to[1]) / 2;
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const len = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dx, dz);
  return (
    <mesh position={[mx, 0.5, mz]} rotation={[0, angle, 0]}>
      <boxGeometry args={[0.15, 1.0, len]} />
      <Mat color="#7a5c35" />
    </mesh>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────
export function Buildings() {
  return (
    <group>
      <TownSquare />
      <Tavern />
      <Bakery />
      <Forge />
      <Well />
      <Orchard />
      <Gate />
    </group>
  );
}

export { TREE_POSITIONS };
