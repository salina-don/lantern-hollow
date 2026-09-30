import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../state/gameStore';
import { ALL_COLLIDERS } from '../systems/collision';
import { getBlockedCells, CELL_SIZE } from '../systems/pathfinding';

const greenMat = new THREE.MeshBasicMaterial({ color: '#00ff00', wireframe: true });
const redMat = new THREE.MeshBasicMaterial({
  color: '#ff0000',
  transparent: true,
  opacity: 0.25,
  side: THREE.DoubleSide,
});

export function DebugOverlay() {
  const debugMode = useGameStore((s) => s.debugMode);

  const blocked = useMemo(() => {
    if (!debugMode) return [];
    return getBlockedCells();
  }, [debugMode]);

  if (!debugMode) return null;

  return (
    <group>
      {ALL_COLLIDERS.map((c, i) => (
        <mesh key={`c${i}`} position={[c.cx, 0.15, c.cz]} material={greenMat}>
          <boxGeometry args={[c.hw * 2, 0.3, c.hd * 2]} />
        </mesh>
      ))}
      {blocked.map(([wx, wz], i) => (
        <mesh
          key={`b${i}`}
          position={[wx, 0.06, wz]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={redMat}
        >
          <planeGeometry args={[CELL_SIZE * 0.9, CELL_SIZE * 0.9]} />
        </mesh>
      ))}
    </group>
  );
}
