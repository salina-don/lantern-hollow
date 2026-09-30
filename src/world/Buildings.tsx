import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LOCATIONS } from './locations';
import { gameTime } from './timeState';
import { useGameStore } from '../state/gameStore';

interface MatProps { color: string; flatShading?: boolean }
function Mat({ color, flatShading = true }: MatProps) {
  return <meshLambertMaterial color={color} flatShading={flatShading} />;
}

// ── Shared decoration primitives ──────────────────────────────────────────

function Lantern({ pos }: { pos: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const hour = gameTime.current;
    const night = hour >= 20 || hour < 6;
    const t =
      hour >= 18 && hour < 20
        ? (hour - 18) / 2
        : hour >= 5 && hour < 7
          ? 1 - (hour - 5) / 2
          : night
            ? 1
            : 0;
    if (lightRef.current) {
      lightRef.current.intensity = 0.3 + t * 2.5;
      lightRef.current.distance = 5 + t * 8;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + t * 0.8);
    }
  });

  return (
    <group position={pos}>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 2.4, 5]} />
        <Mat color="#4a3a2a" />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[0.22, 0.3, 0.22]} />
        <Mat color="#4a3a2a" />
      </mesh>
      <mesh ref={glowRef} position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshBasicMaterial color="#FFB830" />
      </mesh>
      <pointLight ref={lightRef} position={[0, 2.5, 0]} color="#FFB830" intensity={0.6} distance={5} decay={2} />
    </group>
  );
}

function Barrel({ pos }: { pos: [number, number, number] }) {
  return (
    <mesh position={[pos[0], pos[1] + 0.4, pos[2]]} castShadow>
      <cylinderGeometry args={[0.28, 0.32, 0.8, 8]} />
      <Mat color="#7a5a30" />
    </mesh>
  );
}

function Crate({ pos }: { pos: [number, number, number] }) {
  return (
    <mesh position={[pos[0], pos[1] + 0.3, pos[2]]} castShadow>
      <boxGeometry args={[0.55, 0.55, 0.55]} />
      <Mat color="#8a6a40" />
    </mesh>
  );
}

// ── Generic house with windows + door ────────────────────────────────────

interface HouseProps {
  pos: [number, number, number];
  w: number; h: number; d: number;
  wall: string; roof: string;
  chimneyH?: number;
  doorId: string;
}

function AnimatedDoor({ doorId, doorX, doorZ, h }: { doorId: string; doorX: number; doorZ: number; h: number }) {
  const pivotRef = useRef<THREE.Group>(null);
  const isOpen = useGameStore((s) => s.doors[doorId] ?? false);

  useFrame(() => {
    if (!pivotRef.current) return;
    const target = isOpen ? -Math.PI / 2 : 0;
    pivotRef.current.rotation.y = THREE.MathUtils.lerp(pivotRef.current.rotation.y, target, 0.1);
  });

  const toggle = (e: THREE.Event) => {
    (e as unknown as { stopPropagation: () => void }).stopPropagation();
    useGameStore.getState().toggleDoor(doorId);
  };

  return (
    <group position={[doorX - 0.3, 0, doorZ]}>
      <group ref={pivotRef}>
        <mesh position={[0.3, h * 0.22, -0.04]} castShadow onClick={toggle}>
          <boxGeometry args={[0.6, h * 0.44, 0.08]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
        <mesh position={[0.5, h * 0.2, -0.09]} onClick={toggle}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshBasicMaterial color="#F0C040" />
        </mesh>
      </group>
    </group>
  );
}

function House({ pos, w, h, d, wall, roof, chimneyH, doorId }: HouseProps) {
  const hw = w / 2;
  const hd = d / 2;
  const wy = h * 0.55;
  const roofR = (Math.max(w, d) / 2) * 1.15;
  const doorX = -w * 0.12;
  return (
    <group position={pos}>
      {/* Walls */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <Mat color={wall} />
      </mesh>
      {/* Pyramid roof */}
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
      {/* Door frame */}
      <mesh position={[doorX, 0.55, -(hd + 0.02)]}>
        <boxGeometry args={[0.7, 1.15, 0.04]} />
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>
      {/* Animated swinging door */}
      <AnimatedDoor doorId={doorId} doorX={doorX} doorZ={-(hd + 0.04)} h={h} />
      {/* Window beside door */}
      <mesh position={[w * 0.28, wy, -(hd + 0.03)]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshBasicMaterial color="#2a4a6a" />
      </mesh>
      {/* Windows on side walls */}
      <mesh position={[-(hw + 0.03), wy, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshBasicMaterial color="#2a4a6a" />
      </mesh>
      <mesh position={[hw + 0.03, wy, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshBasicMaterial color="#2a4a6a" />
      </mesh>
    </group>
  );
}

// ── Chimney Smoke ──────────────────────────────────────────────────────

const SMOKE_COUNT = 6;

function ChimneySmoke({ position }: { position: [number, number, number] }) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const offsets = useMemo(
    () => Array.from({ length: SMOKE_COUNT }, () => Math.random() * Math.PI * 2),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < SMOKE_COUNT; i++) {
      const m = meshRefs.current[i];
      if (!m) continue;
      const phase = (t * 0.4 + offsets[i]) % (Math.PI * 2);
      const progress = ((Math.sin(phase) + 1) / 2);
      m.position.y = progress * 2.0;
      m.position.x = Math.sin(t * 0.3 + offsets[i]) * 0.15;
      m.position.z = Math.cos(t * 0.25 + offsets[i]) * 0.1;
      const s = 0.08 + progress * 0.12;
      m.scale.setScalar(s);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - progress);
    }
  });

  return (
    <group position={position}>
      {offsets.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#aaa" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// ── Town Square stone circle ────────────────────────────────────────────

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

// ── Tavern ──────────────────────────────────────────────────────────────

function Tavern() {
  const [x, y, z] = LOCATIONS.tavern.position;
  return (
    <group>
      <House pos={[x, y, z]} w={4} h={3} d={3.5} wall="#C8A96E" roof="#7B3F00" doorId="tavern" />
      {/* Sign post */}
      <mesh position={[x + 2.4, y + 1.5, z]}>
        <cylinderGeometry args={[0.05, 0.05, 3, 5]} />
        <Mat color="#5c3a1e" />
      </mesh>
      <mesh position={[x + 2.6, y + 2.7, z]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.05, 0.8, 0.45]} />
        <Mat color="#c8a056" />
      </mesh>
      {/* Barrels */}
      <Barrel pos={[x + 2.3, y, z - 1.2]} />
      <Barrel pos={[x + 2.6, y, z - 0.6]} />
    </group>
  );
}

// ── Bakery ──────────────────────────────────────────────────────────────

function Bakery() {
  const [x, y, z] = LOCATIONS.bakery.position;
  return (
    <group>
      <House pos={[x, y, z]} w={4} h={2.5} d={3} wall="#CC7A5A" roof="#8B2500" chimneyH={1.8} doorId="bakery" />
      <ChimneySmoke position={[x + 1, y + 4.3, z + 0.6]} />
      <Barrel pos={[x - 2.3, y, z - 0.8]} />
      <Crate pos={[x - 2.3, y, z + 0.2]} />
    </group>
  );
}

// ── Forge ───────────────────────────────────────────────────────────────

function Forge() {
  const [x, y, z] = LOCATIONS.forge.position;
  return (
    <group>
      <House pos={[x, y, z]} w={3} h={3} d={3} wall="#6e7780" roof="#3a4048" chimneyH={2.4} doorId="forge" />
      <ChimneySmoke position={[x + 0.75, y + 5.4, z + 0.6]} />
      {/* Anvil */}
      <mesh position={[x - 1.2, y + 0.3, z - 0.5]}>
        <boxGeometry args={[0.6, 0.6, 0.4]} />
        <Mat color="#333" />
      </mesh>
      {/* Crates */}
      <Crate pos={[x - 1.8, y, z + 1.2]} />
      <Crate pos={[x - 1.4, y, z + 1.7]} />
    </group>
  );
}

// ── Well ─────────────────────────────────────────────────────────────────

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
      {/* Bucket hint */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.2, 6]} />
        <Mat color="#6a5030" />
      </mesh>
    </group>
  );
}

// ── Orchard ──────────────────────────────────────────────────────────────

const TREE_POSITIONS: Array<[number, number, number]> = [
  [-10, 0, -4.5],
  [-8, 0, -4],
  [-6, 0, -4.5],
  [-10, 0, -6.5],
  [-7, 0, -7],
  [-9, 0, -7.5],
];

function Tree({ pos, tall }: { pos: [number, number, number]; tall?: boolean }) {
  const h = tall ? 1.6 : 1.4;
  return (
    <group position={pos}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 1.4, 5]} />
        <Mat color="#5c3a1e" />
      </mesh>
      <mesh position={[0, h + 0.5, 0]} castShadow>
        <coneGeometry args={[0.9, 1.8, 5]} />
        <Mat color="#2d6a2d" />
      </mesh>
      <mesh position={[0, h + 1.6, 0]} castShadow>
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
        <Tree key={i} pos={pos} tall={i % 2 === 0} />
      ))}
    </group>
  );
}

// ── Village Gate ────────────────────────────────────────────────────────

function Gate() {
  const [x, y, z] = LOCATIONS.gate.position;
  const pillarH = 4.5;
  const pillarW = 0.9;
  return (
    <group position={[x, y, z]}>
      <mesh position={[-1.8, pillarH / 2, 0]} castShadow>
        <boxGeometry args={[pillarW, pillarH, pillarW]} />
        <Mat color="#7a7060" />
      </mesh>
      <mesh position={[1.8, pillarH / 2, 0]} castShadow>
        <boxGeometry args={[pillarW, pillarH, pillarW]} />
        <Mat color="#7a7060" />
      </mesh>
      <mesh position={[0, pillarH - 0.3, 0]} castShadow>
        <boxGeometry args={[4.5, 0.5, 0.5]} />
        <Mat color="#5c3a1e" />
      </mesh>
      {([-1.8, 1.8] as number[]).map((ox, i) => (
        <mesh key={i} position={[ox, pillarH + 0.3, 0]}>
          <boxGeometry args={[1.1, 0.4, 1.1]} />
          <Mat color="#5a5248" />
        </mesh>
      ))}
    </group>
  );
}

// ── Village lanterns — "Lantern Hollow" needs lanterns! ─────────────────

function VillageLanterns() {
  const lanternSpots: [number, number, number][] = [
    [0, 0, -12.5 + 1.5],    // near gate
    [2.5, 0, 0.5],          // town square east
    [-2.5, 0, 0.5],         // town square west
    [5.5, 0, 3],            // near tavern path
    [-5.5, 0, 3],           // near bakery path
  ];
  return (
    <group>
      {lanternSpots.map((pos, i) => (
        <Lantern key={`l${i}`} pos={pos} />
      ))}
    </group>
  );
}

// ── Player's Shop Stall ────────────────────────────────────────────────

function PlayerShop() {
  return (
    <group position={[0, 0, 2]}>
      {/* Counter */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2.4, 1, 0.8]} />
        <Mat color="#8a6a40" />
      </mesh>
      {/* Counter top */}
      <mesh position={[0, 1.02, 0]} castShadow>
        <boxGeometry args={[2.6, 0.06, 0.9]} />
        <Mat color="#a08050" />
      </mesh>
      {/* Awning posts */}
      {([-1.2, 1.2] as number[]).map((ox, i) => (
        <mesh key={i} position={[ox, 1.5, -0.35]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 2, 5]} />
          <Mat color="#5c3a1e" />
        </mesh>
      ))}
      {/* Awning */}
      <mesh position={[0, 2.5, -0.1]} castShadow>
        <boxGeometry args={[2.8, 0.06, 1.2]} />
        <Mat color="#c04040" />
      </mesh>
      {/* Items on counter */}
      <mesh position={[-0.7, 1.2, 0]} castShadow>
        <boxGeometry args={[0.25, 0.25, 0.25]} />
        <Mat color="#8a8a8a" />
      </mesh>
      <mesh position={[-0.3, 1.15, 0.1]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.22, 6]} />
        <Mat color="#4a9a5a" />
      </mesh>
      <mesh position={[0.1, 1.2, -0.05]} castShadow>
        <boxGeometry args={[0.2, 0.28, 0.15]} />
        <Mat color="#8a5a30" />
      </mesh>
      <mesh position={[0.5, 1.15, 0.05]} castShadow>
        <boxGeometry args={[0.22, 0.18, 0.22]} />
        <Mat color="#c07830" />
      </mesh>
      <mesh position={[0.8, 1.12, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.2, 6]} />
        <Mat color="#e0d0a0" />
      </mesh>
    </group>
  );
}

// ── Player's House ────────────────────────────────────────────────────

function PlayerHouse() {
  const doorX = -4 - 3 * 0.12;
  const doorZ = 8 - 1.25 - 0.04;
  return (
    <group>
      <House pos={[-4, 0, 8]} w={3} h={2.5} d={2.5} wall="#B8956E" roof="#6B4020" doorId="player_house" />
      {/* "Home" sign above door */}
      <mesh position={[doorX, 1.4, doorZ - 0.06]}>
        <boxGeometry args={[0.6, 0.2, 0.04]} />
        <Mat color="#8a6a40" />
      </mesh>
      {/* Bed frame */}
      <mesh position={[-4.3, 0.35, 8.5]} castShadow>
        <boxGeometry args={[0.8, 0.7, 1.4]} />
        <meshLambertMaterial color="#8a5a40" flatShading />
      </mesh>
      {/* Mattress */}
      <mesh position={[-4.3, 0.72, 8.5]}>
        <boxGeometry args={[0.75, 0.1, 1.35]} />
        <meshLambertMaterial color="#e0d8c8" flatShading />
      </mesh>
      {/* Pillow */}
      <mesh position={[-4.3, 0.82, 8.95]}>
        <boxGeometry args={[0.5, 0.1, 0.3]} />
        <meshLambertMaterial color="#f0e8d8" flatShading />
      </mesh>
      {/* Small table */}
      <mesh position={[-3.1, 0.4, 8.6]} castShadow>
        <boxGeometry args={[0.4, 0.8, 0.4]} />
        <meshLambertMaterial color="#7a5a30" flatShading />
      </mesh>
    </group>
  );
}

// ── Food Stall (near Tavern) ──────────────────────────────────────────

function FoodStall() {
  return (
    <group position={[6, 0, 3.5]}>
      {/* Table */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.0, 0.9, 0.7]} />
        <Mat color="#7a5a30" />
      </mesh>
      {/* Table top */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <boxGeometry args={[1.1, 0.06, 0.8]} />
        <Mat color="#8a6a40" />
      </mesh>
      {/* Bread */}
      <mesh position={[-0.25, 1.05, 0]} castShadow>
        <boxGeometry args={[0.2, 0.15, 0.15]} />
        <Mat color="#d4a040" />
      </mesh>
      {/* Stew pot */}
      <mesh position={[0.15, 1.05, 0.1]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.15, 8]} />
        <Mat color="#8a4020" />
      </mesh>
      {/* Apple */}
      <mesh position={[0.35, 1.0, -0.1]} castShadow>
        <sphereGeometry args={[0.08, 6, 6]} />
        <Mat color="#4a8a2a" />
      </mesh>
      {/* Sign post */}
      <mesh position={[0.6, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 5]} />
        <Mat color="#5c3a1e" />
      </mesh>
      <mesh position={[0.6, 1.65, 0]}>
        <boxGeometry args={[0.5, 0.25, 0.04]} />
        <Mat color="#c8a056" />
      </mesh>
    </group>
  );
}

// ── Root export ─────────────────────────────────────────────────────────

export function Buildings() {
  return (
    <group>
      <TownSquare />
      <PlayerShop />
      <PlayerHouse />
      <FoodStall />
      <Tavern />
      <Bakery />
      <Forge />
      <Well />
      <Orchard />
      <Gate />
      <VillageLanterns />
    </group>
  );
}

export { TREE_POSITIONS };
