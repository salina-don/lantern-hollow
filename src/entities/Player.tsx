import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Platform } from 'react-native';
import * as THREE from 'three';
import { useGameStore } from '../state/gameStore';
import { NPC_CONFIG_MAP } from './npcConfig';
import { cameraYaw } from '../world/cameraState';
import { joystickInput } from './joystickState';
import { wouldCollide } from '../systems/collision';

const SPEED = 5;
const INTERACT_DIST = 3.2;
const held: Record<string, boolean> = {};

function findNearestNpc(px: number, pz: number): string | null {
  const npcs = useGameStore.getState().npcs;
  let nearest: string | null = null;
  let best = INTERACT_DIST;
  for (const npc of npcs) {
    const d = Math.sqrt((px - npc.position[0]) ** 2 + (pz - npc.position[2]) ** 2);
    if (d < best) { best = d; nearest = npc.id; }
  }
  return nearest;
}

export function PlayerMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const initPos = useGameStore.getState().playerPosition;
  const posRef = useRef<[number, number, number]>([...initPos] as [number, number, number]);
  const facingRef = useRef(0);
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const onDown = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      held[key] = true;

      // E key: select the nearest NPC
      if (key === 'e') {
        const [px, , pz] = posRef.current;
        const id = findNearestNpc(px, pz);
        if (id) {
          const store = useGameStore.getState();
          store.setActiveConversation(id);
          const cfg = NPC_CONFIG_MAP[id];
          store.addLog(`You approach ${cfg?.name ?? id} the ${cfg?.role ?? ''}.`);
        }
      }
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
    const yaw = cameraYaw.current;
    let dx = 0;
    let dz = 0;

    if (Platform.OS === 'web') {
      if (held['w'] || held['arrowup'])    { dx -= Math.sin(yaw); dz -= Math.cos(yaw); }
      if (held['s'] || held['arrowdown'])  { dx += Math.sin(yaw); dz += Math.cos(yaw); }
      if (held['a'] || held['arrowleft'])  { dx -= Math.cos(yaw); dz += Math.sin(yaw); }
      if (held['d'] || held['arrowright']) { dx += Math.cos(yaw); dz -= Math.sin(yaw); }
    } else {
      const { x: jx, y: jy } = joystickInput.current;
      dx = jy * Math.sin(yaw) + jx * Math.cos(yaw);
      dz = jy * Math.cos(yaw) - jx * Math.sin(yaw);
    }

    const rawLen = Math.sqrt(dx * dx + dz * dz);
    if (rawLen > 0) {
      const move = Math.min(rawLen, 1) * SPEED * delta;
      dx = (dx / rawLen) * move;
      dz = (dz / rawLen) * move;

      let nx = x + dx;
      let nz = z + dz;
      if (wouldCollide(nx, nz)) {
        nx = wouldCollide(x + dx, z) ? x : x + dx;
        nz = wouldCollide(nx, z + dz) ? z : z + dz;
      }

      if (nx !== x || nz !== z) {
        posRef.current = [nx, y, nz];
        setPlayerPosition([nx, y, nz]);
        facingRef.current = Math.atan2(nx - x, nz - z);
      }
    }

    // Update nearby NPC (only writes to store when the value changes)
    const [cx, , cz] = posRef.current;
    const nearId = findNearestNpc(cx, cz);
    const store = useGameStore.getState();
    if (nearId !== store.nearbyNpcId) store.setNearbyNpc(nearId);

    if (meshRef.current) {
      const [nx, , nz] = posRef.current;
      meshRef.current.position.set(nx, y + 0.75, nz);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        facingRef.current,
        0.2,
      );
    }
  });

  return (
    <mesh ref={meshRef} position={[initPos[0], initPos[1] + 0.75, initPos[2]]} castShadow>
      <capsuleGeometry args={[0.3, 0.9, 4, 8]} />
      <meshLambertMaterial color="#3355CC" />
    </mesh>
  );
}
