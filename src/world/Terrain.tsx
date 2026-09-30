import React from 'react';

function Rock({ pos, scale }: { pos: [number, number, number]; scale: number }) {
  return (
    <mesh position={pos} castShadow>
      <dodecahedronGeometry args={[scale, 0]} />
      <meshLambertMaterial color="#8a8478" flatShading />
    </mesh>
  );
}

function Bush({ pos, r }: { pos: [number, number, number]; r: number }) {
  return (
    <mesh position={[pos[0], r * 0.8, pos[2]]} castShadow>
      <sphereGeometry args={[r, 6, 5]} />
      <meshLambertMaterial color="#3d7a30" flatShading />
    </mesh>
  );
}

function FlowerPatch({ pos, color }: { pos: [number, number, number]; color: string }) {
  const offsets: [number, number][] = [
    [-0.15, 0.12], [0.1, -0.1], [0.2, 0.15], [-0.05, -0.18], [0.15, 0.0],
  ];
  return (
    <group position={pos}>
      {offsets.map(([ox, oz], i) => (
        <mesh key={i} position={[ox, 0.06, oz]}>
          <sphereGeometry args={[0.055, 4, 4]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

const ROCKS: Array<{ pos: [number, number, number]; scale: number }> = [
  { pos: [5, 0.12, -2], scale: 0.35 },
  { pos: [12, 0.1, 3], scale: 0.28 },
  { pos: [-11, 0.14, -1], scale: 0.42 },
  { pos: [3, 0.12, -9], scale: 0.38 },
  { pos: [-6, 0.1, 2], scale: 0.3 },
];

const BUSHES: Array<{ pos: [number, number, number]; r: number }> = [
  { pos: [4, 0, 7], r: 0.45 },
  { pos: [-5, 0, -9], r: 0.5 },
  { pos: [10, 0, -3], r: 0.4 },
  { pos: [-12, 0, 5], r: 0.55 },
  { pos: [6, 0, -10], r: 0.35 },
  { pos: [11, 0, 8], r: 0.42 },
  { pos: [-11, 0, -8], r: 0.38 },
];

const FLOWERS: Array<{ pos: [number, number, number]; color: string }> = [
  { pos: [-5, 0, 3], color: '#E06BA0' },
  { pos: [3, 0, 7], color: '#FFD700' },
  { pos: [-10, 0, 1], color: '#D0D8FF' },
  { pos: [7, 0, 2], color: '#FF6B6B' },
  { pos: [-2, 0, -7], color: '#B088FF' },
];

const GRASS_PATCHES: Array<[number, number, string]> = [
  [4, 5, '#4d7030'],
  [-6, -3, '#638a40'],
  [8, -8, '#567a35'],
  [-10, 2, '#4a6e2e'],
  [2, -6, '#5d8338'],
  [-8, 8, '#508030'],
];

export function Terrain() {
  return (
    <>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[55, 55]} />
        <meshLambertMaterial color="#5a7a3a" />
      </mesh>

      {/* Subtle grass variation */}
      {GRASS_PATCHES.map(([x, z, color], i) => (
        <mesh key={`gp${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.04, z]}>
          <circleGeometry args={[4.5, 8]} />
          <meshLambertMaterial color={color} />
        </mesh>
      ))}

      {/* Dirt paths — main crossroads */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <planeGeometry args={[2, 22]} />
        <meshLambertMaterial color="#8B7355" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <planeGeometry args={[22, 2]} />
        <meshLambertMaterial color="#8B7355" />
      </mesh>
      {/* Path spur to tavern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.5, -0.03, 3.5]}>
        <planeGeometry args={[1.3, 5]} />
        <meshLambertMaterial color="#8B7355" />
      </mesh>
      {/* Path spur to bakery */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.5, -0.03, 3.5]}>
        <planeGeometry args={[1.3, 5]} />
        <meshLambertMaterial color="#8B7355" />
      </mesh>
      {/* Path to player house */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2, -0.03, 5]}>
        <planeGeometry args={[1.2, 6]} />
        <meshLambertMaterial color="#8B7355" />
      </mesh>

      {/* Pond with rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.5, -0.01, 10]}>
        <circleGeometry args={[2.5, 16]} />
        <meshLambertMaterial color="#3a6a8a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.5, 0.0, 10]}>
        <ringGeometry args={[2.3, 2.8, 16]} />
        <meshLambertMaterial color="#5a6a4a" />
      </mesh>

      {/* Decorative props */}
      {ROCKS.map((r, i) => (
        <Rock key={`r${i}`} pos={r.pos} scale={r.scale} />
      ))}
      {BUSHES.map((b, i) => (
        <Bush key={`b${i}`} pos={b.pos} r={b.r} />
      ))}
      {FLOWERS.map((f, i) => (
        <FlowerPatch key={`f${i}`} pos={f.pos} color={f.color} />
      ))}
    </>
  );
}
