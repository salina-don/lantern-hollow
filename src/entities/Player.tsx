import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Platform } from 'react-native';
import * as THREE from 'three';
import { useGameStore } from '../state/gameStore';

const SPEED = 5;
const held: Record<string, boolean> = {};

export function PlayerMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const playerPos = useGameStore((s) => s.playerPosition);
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition);
  const posRef = useRef<[number, number, number]>([...playerPos] as [number, number, number]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onDown = (e: KeyboardEvent) => {
      // Don't move when typing in an input
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
      held[e.key.toLowerCase()] = true;
    };
    const onUp = (e: KeyboardEvent) => { held[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  useFrame((_, delta) => {
    const [x, y, z] = posRef.current;
    let nx = x;
    let nz = z;
    if (held['w'] || held['arrowup'])    nz -= SPEED * delta;
    if (held['s'] || held['arrowdown'])  nz += SPEED * delta;
    if (held['a'] || held['arrowleft'])  nx -= SPEED * delta;
    if (held['d'] || held['arrowright']) nx += SPEED * delta;

    if (nx !== x || nz !== z) {
      posRef.current = [nx, y, nz];
      setPlayerPosition([nx, y, nz]);
    }

    if (meshRef.current) {
      meshRef.current.position.set(nx, y + 0.75, nz);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[playerPos[0], playerPos[1] + 0.75, playerPos[2]]}
      castShadow
    >
      <capsuleGeometry args={[0.3, 0.9, 4, 8]} />
      <meshLambertMaterial color="#4169E1" />
    </mesh>
  );
}
