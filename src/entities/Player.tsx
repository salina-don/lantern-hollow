import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Platform } from 'react-native';
import * as THREE from 'three';
import { useGameStore } from '../state/gameStore';
import { cameraYaw } from '../world/cameraState';
import { joystickInput } from './joystickState';
import { wouldCollide } from '../systems/collision';

const SPEED = 5;
const held: Record<string, boolean> = {};

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
    const yaw = cameraYaw.current;
    let dx = 0;
    let dz = 0;

    if (Platform.OS === 'web') {
      // Camera-relative WASD / arrow keys
      if (held['w'] || held['arrowup'])    { dx -= Math.sin(yaw); dz -= Math.cos(yaw); }
      if (held['s'] || held['arrowdown'])  { dx += Math.sin(yaw); dz += Math.cos(yaw); }
      if (held['a'] || held['arrowleft'])  { dx -= Math.cos(yaw); dz += Math.sin(yaw); }
      if (held['d'] || held['arrowright']) { dx += Math.cos(yaw); dz -= Math.sin(yaw); }
    } else {
      // Camera-relative joystick (jy < 0 = forward)
      const { x: jx, y: jy } = joystickInput.current;
      dx = jy * Math.sin(yaw) + jx * Math.cos(yaw);
      dz = jy * Math.cos(yaw) - jx * Math.sin(yaw);
    }

    // Normalise diagonal speed
    const rawLen = Math.sqrt(dx * dx + dz * dz);
    if (rawLen > 0) {
      const move = Math.min(rawLen, 1) * SPEED * delta;
      dx = (dx / rawLen) * move;
      dz = (dz / rawLen) * move;

      // Slide-collision: try full move, then axes separately
      let nx = x + dx;
      let nz = z + dz;
      if (wouldCollide(nx, nz)) {
        nx = wouldCollide(x + dx, z) ? x : x + dx;
        nz = wouldCollide(nx, z + dz) ? z : z + dz;
      }

      const moved = nx !== x || nz !== z;
      if (moved) {
        posRef.current = [nx, y, nz];
        setPlayerPosition([nx, y, nz]);
        facingRef.current = Math.atan2(nx - x, nz - z);
      }
    }

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
